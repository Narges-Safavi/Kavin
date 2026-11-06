from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from threading import Barrier
from unittest import mock

from django.contrib.auth import get_user_model
from django.db import close_old_connections, connection, connections
from django.test import TransactionTestCase
from django.urls import reverse
from rest_framework.test import APIClient, APITestCase

from . import services
from .models import Booking, OccupiedSlot, Space

User = get_user_model()


def window():
    return {"spaceId": "1", "date": str(services.today() + timedelta(days=1)),
            "startTime": "10:00", "endTime": "11:30", "guests": 2}


class BookingApiTests(APITestCase):
    fixtures = ["spaces.json"]

    def setUp(self):
        self.user = User.objects.create_user(username="member")
        self.client.force_authenticate(user=self.user)
        self.url = reverse("bookings")

    def post_window(self, **values):
        return self.client.post(self.url, {**window(), **values}, format="json")

    def test_public_catalog_filters_and_hides_inactive_spaces(self):
        Space.objects.filter(pk=2).update(is_active=False)
        guest = APIClient()
        response = guest.get(reverse("spaces"), {"type": "meeting-room", "minCapacity": 3, "ordering": "-price"})
        self.assertEqual([item["id"] for item in response.data], ["1"])
        self.assertEqual(guest.get(reverse("space-detail", args=[2])).status_code, 404)

    def test_quote_has_no_side_effect_and_uses_space_price(self):
        data = {key: value for key, value in window().items() if key != "spaceId"}
        response = APIClient().post(reverse("quote", args=[1]), data, format="json")
        self.assertEqual(response.data, {"available": True, "price": 350000, "total": 525000, "currency": "toman"})
        self.assertFalse(Booking.objects.exists())

    def test_reservation_price_snapshot_and_adjacent_window(self):
        response = self.post_window(total=1, userId="123")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["total"], 525000)
        self.assertEqual(response.data["userId"], str(self.user.pk))
        self.assertEqual(OccupiedSlot.objects.count(), 3)
        self.assertEqual(self.post_window(startTime="11:30", endTime="12:00").status_code, 201)

    def test_overlap_cancel_and_release(self):
        booking = self.post_window().data
        response = self.post_window(startTime="11:00", endTime="12:00")
        self.assertEqual((response.status_code, response.data["code"]), (409, "slot_taken"))
        cancel_url = reverse("cancel", args=[booking["id"]])
        first = self.client.post(cancel_url)
        second = self.client.post(cancel_url)
        self.assertEqual(first.data["status"], "cancelled")
        self.assertEqual(first.data["cancelledAt"], second.data["cancelledAt"])
        self.assertEqual(self.post_window().status_code, 201)

    def test_invalid_inputs(self):
        for key, value, field in (
            ("guests", 1.5, "guests"), ("guests", "2", "guests"), ("guests", True, "guests"),
            ("guests", 0, "guests"), ("guests", 5, "guests"),
            ("startTime", "07:30", "startTime"), ("startTime", "10:15", "startTime"),
            ("endTime", "10:00", "endTime"), ("endTime", "22:30", "endTime"),
            ("date", "2026-02-30", "date"), ("date", "2000-01-01", "date"),
        ):
            with self.subTest(key=key, value=value):
                response = self.post_window(**{key: value})
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.data["errors"])
        self.assertEqual(self.post_window(spaceId="999").status_code, 404)
        self.assertFalse(Booking.objects.exists())

    def test_public_availability_hides_personal_data(self):
        self.post_window()
        response = APIClient().get(reverse("availability", args=[1]), {"date": window()["date"]})
        self.assertEqual(response.data["timezone"], "Asia/Tehran")
        self.assertEqual(len(response.data["slots"]), 28)
        busy = [slot for slot in response.data["slots"] if slot["status"] == "booked"]
        self.assertEqual([slot["startTime"] for slot in busy], ["10:00", "10:30", "11:00"])
        self.assertEqual(set(busy[0]), {"startTime", "endTime", "status"})

    def test_auth_required_and_other_users_cannot_see_or_cancel(self):
        booking = self.post_window().data
        detail = reverse("booking-detail", args=[booking["id"]])
        stranger = APIClient()
        self.assertEqual(stranger.get(detail).status_code, 401)
        stranger.force_authenticate(User.objects.create_user(username="other"))
        self.assertEqual(stranger.get(detail).status_code, 404)
        self.assertEqual(stranger.post(reverse("cancel", args=[booking["id"]])).status_code, 404)
        self.assertEqual(stranger.get(self.url).data["count"], 0)

    def test_tehran_clock_and_group_filters(self):
        with mock.patch("django.utils.timezone.now", return_value=datetime(2026, 3, 21, 9, tzinfo=services.TEHRAN)):
            booking = self.post_window(date="2026-03-21").data
            self.assertEqual(booking["state"], "upcoming")
        with mock.patch("django.utils.timezone.now", return_value=datetime(2026, 3, 21, 10, tzinfo=services.TEHRAN)):
            self.assertEqual(self.post_window(date="2026-03-21").status_code, 400)
            self.assertEqual(self.client.get(self.url, {"state": "in_progress"}).data["count"], 1)
            self.assertEqual(self.client.get(self.url, {"state": "upcoming"}).data["count"], 0)
            response = self.client.post(reverse("cancel", args=[booking["id"]]))
            self.assertEqual((response.status_code, response.data["code"]), (409, "booking_started"))
        with mock.patch("django.utils.timezone.now", return_value=datetime(2026, 3, 21, 11, 30, tzinfo=services.TEHRAN)):
            result = self.client.get(self.url, {"state": "past"}).data["results"][0]
            self.assertEqual((result["state"], result["canCancel"]), ("past", False))


class AuthApiTests(APITestCase):
    def test_register_login_logout_and_token_revocation(self):
        credentials = {"username": "new-member", "password": "long-demo-pass!741"}
        response = self.client.post(reverse("register"), {**credentials, "email": "new@example.test"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertNotIn("password", response.data["user"])
        token = response.data["token"]
        self.assertEqual(self.client.post(reverse("register"), credentials, format="json").status_code, 400)
        denied = self.client.post(reverse("login"), {**credentials, "password": "wrong"}, format="json")
        self.assertEqual((denied.status_code, denied.data["code"]), (401, "invalid_credentials"))
        signed_in = self.client.post(reverse("login"), credentials, format="json")
        self.assertEqual(signed_in.data["token"], token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        self.assertEqual(self.client.get(reverse("me")).data["username"], credentials["username"])
        self.assertEqual(self.client.post(reverse("logout")).status_code, 204)
        self.assertEqual(self.client.get(reverse("me")).status_code, 401)

    def test_cors_is_limited_to_configured_frontend(self):
        allowed = self.client.options(reverse("spaces"), HTTP_ORIGIN="http://localhost:3000",
                                      HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET")
        self.assertEqual(allowed.headers.get("Access-Control-Allow-Origin"), "http://localhost:3000")
        denied = self.client.options(reverse("spaces"), HTTP_ORIGIN="https://untrusted.example",
                                     HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET")
        self.assertNotIn("Access-Control-Allow-Origin", denied.headers)


class RaceTests(TransactionTestCase):
    fixtures = ["spaces.json"]

    def test_same_slot_two_requests_one_booking(self):
        if connection.vendor == "sqlite" and connection.creation.is_in_memory_db(connection.settings_dict["NAME"]):
            self.skipTest("Set KAVIN_TEST_SQLITE_FILE=1 for SQLite concurrency testing.")
        user_ids = [User.objects.create_user(username=f"racer-{i}").pk for i in range(2)]
        payload = window()
        barrier = Barrier(2)

        def reserve(user_id):
            close_old_connections()
            try:
                client = APIClient()
                client.force_authenticate(User.objects.get(pk=user_id))
                barrier.wait(timeout=10)
                return client.post(reverse("bookings"), payload, format="json").status_code
            finally:
                connections.close_all()

        with ThreadPoolExecutor(max_workers=2) as pool:
            self.assertEqual(sorted(pool.map(reserve, user_ids)), [201, 409])
        self.assertEqual(Booking.objects.count(), 1)
        self.assertEqual(OccupiedSlot.objects.count(), 3)
