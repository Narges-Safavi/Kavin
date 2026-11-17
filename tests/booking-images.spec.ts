import { test, expect } from "@playwright/test";
import type { ApiBooking } from "../lib/bookings-api";
import { spaces } from "../lib/data";

test.beforeEach(async ({ page }) => {
  const booking: ApiBooking = {
    id: "image-test",
    userId: "test-user",
    spaceId: "99",
    spaceName: "فضای جدید",
    date: "2099-05-09",
    startTime: "10:00",
    endTime: "11:00",
    guests: 1,
    status: "confirmed",
    state: "upcoming",
    canCancel: true,
    total: 350000,
    createdAt: "2026-11-17T06:00:00Z",
    cancelledAt: null,
  };
  await page.route("**/api/kavin/bookings?*", (route) =>
    route.fulfill({
      json: {
        count: 1,
        next: null,
        previous: null,
        results: [booking],
      },
    }),
  );
  await page.route("**/api/kavin/bookings/image-test/cancel", async (route) => {
    booking.status = "cancelled";
    booking.state = "cancelled";
    booking.canCancel = false;
    await route.fulfill({ json: booking });
  });
});

test("new space uses its API image while a slow catalog does not block bookings", async ({
  page,
}) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requests = 0;
  await page.route("**/api/kavin/spaces", async (route) => {
    requests += 1;
    await held;
    await route.fulfill({
      json: [{ ...spaces[0], id: "99", image: "/images/meeting.jpg" }],
    });
  });
  await page.goto("/bookings");
  await expect(page.locator(".reservation-row")).toContainText("فضای جدید");
  await expect(
    page.getByRole("button", { name: "لغو رزرو", exact: true }),
  ).toBeEnabled();
  release();
  const image = page.locator(".reservation-photo img");
  await expect(image).toHaveAttribute("src", /meeting/);
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  // React Strict Mode may replay the initial effect in development.
  const initialRequests = requests;
  await page.getByRole("button", { name: "لغو رزرو", exact: true }).click();
  await page.getByRole("button", { name: "بله، لغو کن" }).click();
  await expect(page.locator(".reservation-row")).toHaveCount(0);
  expect(requests).toBe(initialRequests);
});

for (const scenario of ["missing", "empty", "broken", "unavailable"] as const) {
  test(`image fallback preserves cancellation when catalog is ${scenario}`, async ({
    page,
  }) => {
    await page.route("**/api/kavin/spaces", async (route) => {
      if (scenario === "unavailable") {
        await route.fulfill({
          status: 503,
          json: { detail: "دریافت فضاها ممکن نشد" },
        });
        return;
      }
      await route.fulfill({
        json:
          scenario === "missing"
            ? []
            : [
                {
                  ...spaces[0],
                  id: "99",
                  image:
                    scenario === "empty" ? "" : "/images/missing-booking.jpg",
                },
              ],
      });
    });
    if (scenario === "broken")
      await page.route("**/_next/image?*", (route) =>
        route.fulfill({ status: 404, body: "" }),
      );
    const catalogResponse = page.waitForResponse("**/api/kavin/spaces");
    const brokenResponse =
      scenario === "broken"
        ? page.waitForResponse("**/_next/image?*")
        : Promise.resolve();
    await page.goto("/bookings");
    await catalogResponse;
    await brokenResponse;
    await expect(page.locator(".reservation-photo svg")).toBeVisible();
    await expect(page.locator(".reservation-photo img")).toHaveCount(0);
    await page.getByRole("button", { name: "لغو رزرو", exact: true }).click();
    await page.getByRole("button", { name: "بله، لغو کن" }).click();
    await expect(page.locator(".reservation-row")).toHaveCount(0);
  });
}
