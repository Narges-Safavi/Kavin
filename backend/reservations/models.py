import uuid

from django.conf import settings
from django.db import models
from django.db.models import F, Q


class Space(models.Model):
    class Type(models.TextChoices):
        MEETING = "meeting-room", "اتاق جلسه"
        DESK = "shared-desk", "میز اشتراکی"
        OFFICE = "private-office", "دفتر خصوصی"

    name = models.CharField(max_length=150)
    type = models.CharField(max_length=20, choices=Type.choices, db_index=True)
    capacity = models.PositiveSmallIntegerField()
    price = models.PositiveIntegerField(help_text="Hourly price in toman")
    description = models.TextField()
    image = models.CharField(max_length=500, blank=True)
    location = models.CharField(max_length=150)
    area = models.PositiveSmallIntegerField()
    amenities = models.JSONField(default=list, blank=True)
    tag = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ("id",)
        constraints = [models.CheckConstraint(condition=Q(capacity__gte=1), name="space_positive_capacity")]

    def __str__(self):
        return self.name


class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="bookings")
    space = models.ForeignKey(Space, on_delete=models.PROTECT, related_name="bookings")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    guests = models.PositiveSmallIntegerField()
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.CONFIRMED)
    total = models.PositiveBigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-date", "-start_time", "-created_at", "id")
        indexes = [models.Index(fields=("space", "date", "status"))]
        constraints = [
            models.CheckConstraint(condition=Q(guests__gte=1), name="booking_positive_guests"),
            models.CheckConstraint(condition=Q(end_time__gt=F("start_time")), name="booking_ordered_times"),
        ]


class OccupiedSlot(models.Model):
    """One row for each reserved half hour. Cancellation deletes these rows."""

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="slots")
    space = models.ForeignKey(Space, on_delete=models.PROTECT)
    date = models.DateField()
    start_time = models.TimeField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("space", "date", "start_time"), name="one_booking_per_space_slot"),
        ]
