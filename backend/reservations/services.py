from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, ValidationError

from .errors import BookingConflict, CancellationClosed
from .models import Booking, OccupiedSlot, Space

TEHRAN = ZoneInfo("Asia/Tehran")
OPENING = time(8)
CLOSING = time(22)
SLOT_MINUTES = 30
STEP = timedelta(minutes=SLOT_MINUTES)


def today():
    return timezone.localdate(timezone=TEHRAN)


def starts_at(date, start_time):
    return datetime.combine(date, start_time, TEHRAN)


def slot_starts(date, start=OPENING, end=CLOSING):
    current = datetime.combine(date, start)
    limit = datetime.combine(date, end)
    while current < limit:
        yield current
        current += STEP


def calculate_total(price, start, end):
    minutes = (end.hour * 60 + end.minute) - (start.hour * 60 + start.minute)
    return (price * minutes + 30) // 60


def validate_booking(space, data):
    date, start, end, guests = (data[k] for k in ("date", "start_time", "end_time", "guests"))
    errors = {}
    if guests > space.capacity:
        errors["guests"] = f"ظرفیت این فضا {space.capacity} نفر است."
    if date < today():
        errors["date"] = "تاریخ نمی‌تواند در گذشته باشد."
    elif starts_at(date, start) <= timezone.now():
        errors["startTime"] = "زمان شروع باید در آینده باشد."
    if start >= end:
        errors["endTime"] = "ساعت پایان باید بعد از شروع باشد."
    if start < OPENING or start >= CLOSING:
        errors["startTime"] = "شروع باید در ساعت کاری باشد."
    if end <= OPENING or end > CLOSING:
        errors["endTime"] = "پایان باید در ساعت کاری باشد."
    for field, value in (("startTime", start), ("endTime", end)):
        if value.minute % SLOT_MINUTES or value.second or value.microsecond:
            errors[field] = "ساعت را روی دقیقهٔ ۰۰ یا ۳۰ بگذارید."
    if errors:
        raise ValidationError(errors)


def quote(space, data):
    validate_booking(space, data)
    start, end = data["start_time"], data["end_time"]
    occupied = OccupiedSlot.objects.filter(
        space=space, date=data["date"], start_time__gte=start, start_time__lt=end,
    ).exists()
    return {"available": not occupied, "price": space.price, "total": calculate_total(space.price, start, end),
            "currency": "toman"}


@transaction.atomic
def create_booking(user, data):
    try:
        # Serialize changes for this space on PostgreSQL; SQLite takes a write
        # reservation at BEGIN IMMEDIATE. The unique constraint is a backstop.
        space = Space.objects.select_for_update().get(pk=data["space_id"], is_active=True)
    except Space.DoesNotExist as exc:
        raise NotFound("فضای انتخاب‌شده پیدا نشد.") from exc
    values = {key: value for key, value in data.items() if key != "space_id"}
    priced = quote(space, values)
    if not priced["available"]:
        raise BookingConflict()
    booking = Booking.objects.create(user=user, space=space, total=priced["total"], **values)
    OccupiedSlot.objects.bulk_create([
        OccupiedSlot(booking=booking, space=space, date=booking.date, start_time=slot.time())
        for slot in slot_starts(booking.date, booking.start_time, booking.end_time)
    ])
    return booking


@transaction.atomic
def cancel_booking(user, booking_id):
    try:
        booking = Booking.objects.select_for_update().get(pk=booking_id, user=user)
    except Booking.DoesNotExist as exc:
        raise NotFound("رزرو پیدا نشد.") from exc
    if booking.status == Booking.Status.CANCELLED:
        return booking
    now = timezone.now()
    if starts_at(booking.date, booking.start_time) <= now:
        raise CancellationClosed()
    booking.status = Booking.Status.CANCELLED
    booking.cancelled_at = now
    booking.save(update_fields=("status", "cancelled_at"))
    booking.slots.all().delete()
    return booking


def availability(space, date):
    taken = set(OccupiedSlot.objects.filter(space=space, date=date).values_list("start_time", flat=True))
    now = timezone.now()
    return {
        "spaceId": str(space.pk), "date": date, "timezone": str(TEHRAN),
        "openingTime": OPENING, "closingTime": CLOSING, "slotMinutes": SLOT_MINUTES,
        "slots": [{
            "startTime": slot.time(), "endTime": (slot + STEP).time(),
            "status": "past" if slot.replace(tzinfo=TEHRAN) <= now else ("booked" if slot.time() in taken else "available"),
        } for slot in slot_starts(date)],
    }
