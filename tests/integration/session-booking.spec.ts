import { test, expect } from "@playwright/test";
import { randomBytes, randomUUID } from "node:crypto";

test("real Django login, HttpOnly session, booking, cancellation and logout", async ({
  page,
  context,
}) => {
  const username = `e2e-${randomUUID()}`;
  const password = randomBytes(32).toString("base64");
  const registration = await context.request.post("/api/auth/register", {
    data: { username, password },
  });
  expect(registration.status()).toBe(200);
  await context.request.post("/api/auth/logout");
  await page.goto("/login");
  await page.getByLabel("نام کاربری").fill(username);
  await page.getByLabel("رمز عبور", { exact: true }).fill(password);
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  const cookie = (await context.cookies()).find(
    (item) => item.name === "kavin_token",
  );
  expect(Boolean(cookie?.httpOnly)).toBe(true);
  expect(
    await page.evaluate(() => document.cookie.includes("kavin_token")),
  ).toBe(false);
  await expect(page.getByText(username, { exact: true })).toBeVisible();

  const future = new Date(Date.now() + 7 * 86400000);
  future.setUTCHours(0, 0, 0, 0);
  await page.clock.install({ time: future });
  await page.goto("/spaces/1");
  await page.getByRole("button", { name: /تاریخ حضورت/ }).click();
  await page.getByRole("button", { name: "انتخاب امروز", exact: true }).click();
  const quoteResponse = page.waitForResponse("**/api/kavin/spaces/1/quote");
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
  const priced = await quoteResponse;
  expect(priced.status()).toBe(200);
  const quote = await priced.json();
  expect(quote.available).toBe(true);
  expect(quote.total).toBe(525000);
  await expect(page.locator(".total-row")).toContainText("۵۲۵٬۰۰۰");
  await page.getByRole("button", { name: "تأیید و ثبت رزرو" }).click();
  await expect(
    page.getByRole("heading", { name: "رزروت ثبت شد!" }),
  ).toBeVisible();
  await page.goto("/bookings");
  await page.reload();
  await expect(page.locator(".reservation-row")).toHaveCount(1);
  await expect
    .poll(() =>
      page
        .locator(".reservation-photo img")
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "لغو رزرو", exact: true }).click();
  await page.getByRole("button", { name: "بله، لغو کن" }).click();
  await expect(page.locator(".reservation-row")).toHaveCount(0);
  await page.getByRole("button", { name: "لغو شده", exact: true }).click();
  await expect(page.locator(".reservation-row")).toHaveCount(1);
  await page.getByRole("button", { name: "خروج", exact: true }).click();
  await expect
    .poll(async () =>
      (await context.cookies()).some((item) => item.name === "kavin_token"),
    )
    .toBe(false);
  const denied = await context.request.get("/api/kavin/bookings");
  expect(denied.status()).toBe(401);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".hero h1")).toBeVisible();
  await expect(
    page.locator("header").getByRole("link", { name: "ورود", exact: true }),
  ).toBeVisible();
});
