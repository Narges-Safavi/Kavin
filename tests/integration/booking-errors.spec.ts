import { test, expect, type Page } from "@playwright/test";
import { randomBytes, randomUUID } from "node:crypto";

async function prepareBooking(page: Page) {
  const future = new Date(Date.now() + 10 * 86400000);
  future.setUTCHours(0, 0, 0, 0);
  await page.clock.install({ time: future });
  await page.goto("/spaces/1");
  await page.getByRole("button", { name: /تاریخ حضورت/ }).click();
  await page.getByRole("button", { name: "انتخاب امروز", exact: true }).click();
  for (const [label, time] of [
    ["از ساعت", "۱۰:۰۰"],
    ["تا ساعت", "۱۱:۳۰"],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: time, exact: true })
      .click();
  }
  // At 00:00 UTC the Tehran calendar is on the same Gregorian date.
  return future.toISOString().slice(0, 10);
}

test("Django rejects invalid credentials and login displays the error", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await page.getByLabel("نام کاربری").fill(`missing-${randomUUID()}`);
  await page.getByLabel("رمز عبور", { exact: true }).fill(randomUUID());
  const responsePromise = page.waitForResponse("**/api/auth/login");
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(401);
  const error = await response.json();
  expect(error.code).toBe("invalid_credentials");
  await expect(
    page.getByRole("alert").filter({ hasText: error.detail }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    (await context.cookies()).some(({ name }) => name === "kavin_token"),
  ).toBe(false);
});

test("Django rejects a guest booking and the form redirects to login", async ({
  page,
}) => {
  await prepareBooking(page);
  const responsePromise = page.waitForResponse("**/api/kavin/bookings");
  await page.getByRole("button", { name: "تأیید و ثبت رزرو" }).click();
  expect((await responsePromise).status()).toBe(401);
  await expect(page).toHaveURL(/\/login$/);
});

test("another user claims the selected interval and Django returns slot_taken", async ({
  page,
  context,
  playwright,
  baseURL,
}) => {
  const first = await playwright.request.newContext({ baseURL });
  let bookingId: string | undefined;
  try {
    for (const client of [first, context.request]) {
      const registration = await client.post("/api/auth/register", {
        data: {
          username: `e2e-${randomUUID()}`,
          password: randomBytes(32).toString("base64"),
        },
      });
      expect(registration.status()).toBe(200);
    }
    // User two has already selected a free interval when user one books it.
    const date = await prepareBooking(page);
    const created = await first.post("/api/kavin/bookings", {
      data: {
        spaceId: "1",
        date,
        startTime: "10:00",
        endTime: "11:30",
        guests: 1,
      },
    });
    expect(created.ok()).toBe(true);
    bookingId = (await created.json()).id;
    const conflictPromise = page.waitForResponse("**/api/kavin/bookings");
    const refreshedPromise = page.waitForResponse((response) =>
      response.url().includes("/availability?"),
    );
    await page.getByRole("button", { name: "تأیید و ثبت رزرو" }).click();
    const conflict = await conflictPromise;
    expect(conflict.status()).toBe(409);
    expect((await conflict.json()).code).toBe("slot_taken");
    await refreshedPromise;
    await expect(
      page.getByRole("alert").filter({ hasText: "این بازه همین الان رزرو شد" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "از ساعت", exact: true }).click();
    await expect(
      page
        .getByRole("dialog")
        .getByRole("button", { name: "۱۰:۰۰", exact: true }),
    ).toBeDisabled();
    const mine = await context.request.get("/api/kavin/bookings");
    expect(mine.status()).toBe(200);
    expect((await mine.json()).count).toBe(0);
    const owner = await first.get("/api/kavin/bookings");
    expect(owner.status()).toBe(200);
    expect((await owner.json()).count).toBe(1);
  } finally {
    try {
      if (bookingId) {
        const cancelled = await first.post(
          `/api/kavin/bookings/${bookingId}/cancel`,
        );
        expect(cancelled.ok()).toBe(true);
      }
    } finally {
      await first.dispose();
    }
  }
});
