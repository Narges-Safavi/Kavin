import json
import uuid
from datetime import time, timedelta
from pathlib import Path
from secrets import token_urlsafe

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from reservations import services
from reservations.models import Booking, OccupiedSlot, Space


class Command(BaseCommand):
    help = "Populate the local database with four spaces and demo bookings."

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("seed_demo requires KAVIN_DEBUG=1.")
        fixture = Path(__file__).resolve().parents[2] / "fixtures" / "spaces.json"
        for entry in json.loads(fixture.read_text(encoding="utf-8")):
            Space.objects.get_or_create(pk=entry["pk"], defaults=entry["fields"])
        user, created = get_user_model().objects.get_or_create(username="kavin-demo", defaults={"email": "demo@example.test"})
        if not created and (user.is_staff or user.is_superuser or user.email != "demo@example.test"):
            raise CommandError("Username kavin-demo is in use by a non-demo account.")
        if created:
            password = token_urlsafe(18)
            user.set_password(password)
            user.save(update_fields=("password",))

        # Stable IDs make the command safe to rerun, even on a different day.
        for label, days, space_id, start, end, state in (
            ("future", 1, 1, time(10), time(11, 30), Booking.Status.CONFIRMED),
            ("past", -2, 2, time(13), time(14), Booking.Status.CONFIRMED),
            ("cancelled", 2, 4, time(15), time(16), Booking.Status.CANCELLED),
        ):
            date = services.today() + timedelta(days=days)
            space = Space.objects.select_for_update().get(pk=space_id)
            booking_id = uuid.uuid5(uuid.NAMESPACE_URL, f"kavin-local-demo/{label}")
            if Booking.objects.filter(pk=booking_id).exists():
                continue
            if state == Booking.Status.CONFIRMED and OccupiedSlot.objects.filter(
                space=space, date=date, start_time__gte=start, start_time__lt=end,
            ).exists():
                self.stdout.write(self.style.WARNING(f"Skipped occupied demo window: {label}."))
                continue
            booking = Booking.objects.create(
                id=booking_id, user=user, space=space, date=date, start_time=start, end_time=end,
                guests=1, status=state, total=services.calculate_total(space.price, start, end),
                cancelled_at=timezone.now() if state == Booking.Status.CANCELLED else None,
            )
            if state == Booking.Status.CONFIRMED:
                OccupiedSlot.objects.bulk_create([
                    OccupiedSlot(booking=booking, space=space, date=date, start_time=slot.time())
                    for slot in services.slot_starts(date, start, end)
                ])
        if created:
            transaction.on_commit(lambda: self.stdout.write(f"Demo login: kavin-demo / {password}"))
        else:
            self.stdout.write("Demo user already exists. For a new password: python manage.py changepassword kavin-demo")
        self.stdout.write(self.style.SUCCESS("Demo data is ready."))
