import type { BrowserContext } from "@playwright/test";
import type { ApiBooking } from "../lib/bookings-api";
import { spaces } from "../lib/data";
import { TIME_SLOTS } from "../lib/date";

export async function mockBookings(context: BrowserContext) {
  const bookings: ApiBooking[] = [];

  await context.route("**/api/kavin/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace("/api/kavin", "");
    const availability = path.match(/^\/spaces\/([^/]+)\/availability$/);
    if (availability) {
      const spaceId = availability[1];
      const date = url.searchParams.get("date");
      const slots = TIME_SLOTS.slice(0, -1).map((startTime, index) => ({
        startTime,
        endTime: TIME_SLOTS[index + 1],
        status: bookings.some(
          (booking) =>
            booking.spaceId === spaceId &&
            booking.date === date &&
            booking.status === "confirmed" &&
            startTime >= booking.startTime &&
            startTime < booking.endTime,
        )
          ? "booked"
          : startTime < "09:30"
            ? "past"
            : "available",
      }));
      await route.fulfill({ json: { spaceId, date, slots } });
      return;
    }

    if (path === "/bookings" && route.request().method() === "GET") {
      await route.fulfill({
        json: {
          count: bookings.length,
          next: null,
          previous: null,
          results: bookings,
        },
      });
      return;
    }

    if (path === "/bookings" && route.request().method() === "POST") {
      const input = route.request().postDataJSON() as Pick<
        ApiBooking,
        "spaceId" | "date" | "startTime" | "endTime" | "guests"
      >;
      const space = spaces.find(({ id }) => id === input.spaceId);
      if (space) {
        const booking: ApiBooking = {
          ...input,
          id: String(bookings.length + 1),
          userId: "test-user",
          spaceName: space.name,
          total: 525000,
          status: "confirmed",
          state: "upcoming",
          canCancel: true,
          createdAt: "2027-05-09T06:00:00Z",
          cancelledAt: null,
        };
        bookings.push(booking);
        await route.fulfill({ status: 201, json: booking });
        return;
      }
    }

    const booking = bookings.find(
      ({ id }) => path === `/bookings/${id}/cancel`,
    );
    if (booking && route.request().method() === "POST") {
      booking.status = "cancelled";
      booking.state = "cancelled";
      booking.canCancel = false;
      booking.cancelledAt = "2027-05-09T06:00:00Z";
      await route.fulfill({ json: booking });
      return;
    }

    await route.fulfill({ status: 404, json: { code: "not_found" } });
  });
}
