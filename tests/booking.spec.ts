import { test, expect, type Page } from "@playwright/test";
import { createReservationSchema } from "../lib/schemas";
import { isSpaceAvailable } from "../lib/availability";
import { isValidDateString, getBookingTotal } from "../lib/date";
import type { Booking } from "../lib/data";

async function chooseDate(page: Page) {
  await page.getByRole("button", { name: /تاریخ حضورت/ }).click();
  await page.getByRole("button", { name: "انتخاب امروز", exact: true }).click();
}
async function chooseTime(page: Page, label: string, time: string) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: time, exact: true })
    .click();
}
async function reserve(page: Page) {
  await page.goto("/spaces/1");
  await chooseDate(page);
  await chooseTime(page, "از ساعت", "۱۰:۰۰");
  await chooseTime(page, "تا ساعت", "۱۱:۳۰");
  await page.getByRole("button", { name: "افزایش تعداد نفرات" }).click();
  await expect(page.locator(".total-row")).toContainText("۵۲۵٬۰۰۰");
  await page.getByRole("button", { name: "تأیید و ثبت رزرو" }).click();
  await expect(
    page.getByRole("heading", { name: "رزروت ثبت شد!" }),
  ).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2027-05-09T06:00:00Z") });
});
test("list, search, capacity and type filters", async ({ page }) => {
  await page.goto("/spaces");
  await expect(page.locator(".space-card")).toHaveCount(4);
  await page.getByLabel("دنبال چه فضایی هستی؟").fill("آفتاب");
  await expect(page.locator(".space-card")).toHaveCount(1);
  await page.getByLabel("دنبال چه فضایی هستی؟").fill("پیدانشدنی");
  await expect(
    page.getByRole("heading", { name: "این بار فضایی پیدا نشد" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "نمایش همه فضاها" }).click();
  await page.getByLabel("حداقل ظرفیت").selectOption("10");
  await expect(page.locator(".space-card")).toHaveCount(1);
  await expect(page.locator(".space-card")).toContainText("افق");
  await page.getByRole("button", { name: "پاک کردن" }).click();
  await page.getByRole("radio", { name: /دفتر خصوصی/ }).check();
  await expect(page.locator(".space-card")).toHaveCount(1);
  await page.getByRole("button", { name: "پاک کردن" }).click();
  await page.getByLabel("مرتب‌سازی", { exact: true }).selectOption("low");
  await expect(page.locator(".space-card").first()).toContainText("هم‌نشین");
});
test("calendar is Persian, past days disabled, Escape restores focus", async ({
  page,
}) => {
  await page.goto("/spaces/1");
  const trigger = page.getByRole("button", { name: /تاریخ حضورت/ });
  await trigger.click();
  await expect(page.getByRole("dialog")).toContainText("اردیبهشت");
  await expect(page.locator(".rdp-day_button:disabled").first()).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: "رفتن به ماه بعد" }).click();
  await expect(page.getByRole("dialog")).toContainText("خرداد");
});
test("full booking persists, conflicts disabled, cancel releases slot", async ({
  page,
}) => {
  await reserve(page);
  await page.reload();
  await chooseDate(page);
  await page.getByRole("button", { name: "از ساعت", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "۱۰:۰۰", exact: true }),
  ).toBeDisabled();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "۱۱:۳۰", exact: true }),
  ).toBeEnabled();
  await page.keyboard.press("Escape");
  await page.goto("/bookings");
  await expect(page.locator(".reservation-row")).toHaveCount(1);
  await expect(page.locator(".reservation-row")).toContainText("۵۲۵٬۰۰۰");
  await page.getByRole("button", { name: "لغو رزرو", exact: true }).click();
  await page.getByRole("button", { name: "بله، لغو کن" }).click();
  await expect(page.locator(".reservation-row")).toHaveCount(0);
  await page.getByRole("button", { name: "لغو شده", exact: true }).click();
  await expect(page.locator(".reservation-row")).toHaveCount(1);
  await page.goto("/spaces/1");
  await chooseDate(page);
  await page.getByRole("button", { name: "از ساعت", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "۱۰:۰۰", exact: true }),
  ).toBeEnabled();
});
test("validation catches required fields and fractional guests", async ({
  page,
}) => {
  await page.goto("/spaces/1");
  await page.getByRole("button", { name: "تأیید و ثبت رزرو" }).click();
  await expect(
    page.getByText("یک تاریخ معتبر انتخاب کنید", { exact: true }),
  ).toBeVisible();
  await chooseDate(page);
  await chooseTime(page, "از ساعت", "۱۰:۰۰");
  await chooseTime(page, "تا ساعت", "۱۱:۳۰");
  await page.getByLabel("چند نفر هستید؟").fill("1.5");
  await page.getByRole("button", { name: "تأیید و ثبت رزرو" }).click();
  await expect(
    page.getByText("تعداد نفرات باید عدد صحیح باشد", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "رزروت ثبت شد!" }),
  ).toHaveCount(0);
});
test("past time disabled and end before start disabled", async ({ page }) => {
  await page.goto("/spaces/1");
  await chooseDate(page);
  await page.getByRole("button", { name: "از ساعت", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "۰۸:۰۰", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "۱۰:۰۰", exact: true })
    .click();
  await page.getByRole("button", { name: "تا ساعت", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "۱۰:۰۰", exact: true }),
  ).toBeDisabled();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "۱۰:۳۰", exact: true }),
  ).toBeEnabled();
});
test("storage failure shows error instead of success", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "kavin.bookings.v1")
        throw new DOMException("quota", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.goto("/spaces/1");
  await chooseDate(page);
  await chooseTime(page, "از ساعت", "۱۰:۰۰");
  await chooseTime(page, "تا ساعت", "۱۱:۳۰");
  await page.getByRole("button", { name: "تأیید و ثبت رزرو" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "ذخیره رزرو ممکن نشد" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "رزروت ثبت شد!" }),
  ).toHaveCount(0);
});
test("public routes render without console or hydration errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const route of [
    "/",
    "/spaces",
    "/spaces/4",
    "/bookings",
    "/about",
    "/contact",
    "/faq",
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("invalid space renders not-found and cannot be indexed", async ({
  page,
}) => {
  const response = await page.goto("/spaces/invalid");
  // Next.js uses 200 for a streamed notFound response and 404 before streaming.
  expect([200, 404]).toContain(response?.status());
  await expect(
    page.getByRole("heading", { name: "این فضا را پیدا نکردیم." }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    "content",
    /noindex/,
  );
});
for (const width of [320, 390, 768, 1024, 1440]) {
  test(`responsive layout and both pickers fit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/spaces", "/spaces/1"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      expect(overflow, `${route} horizontal overflow at ${width}`).toBe(false);
    }
    for (const name of [/تاریخ حضورت/, /^از ساعت$/, /^تا ساعت$/]) {
      await page.getByRole("button", { name }).click();
      const box = await page.getByRole("dialog").boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      await page.keyboard.press("Escape");
    }
    if (width < 600) {
      await page.getByRole("button", { name: "باز کردن منو" }).click();
      await expect(
        page.getByRole("navigation", { name: "ناوبری اصلی" }),
      ).toBeVisible();
    }
  });
}
test("schema rejects malformed dates, invalid times and overcapacity", () => {
  const schema = createReservationSchema(4);
  const base = {
    date: "2099-10-26",
    startTime: "10:00",
    endTime: "11:00",
    guests: 2,
  };
  expect(schema.safeParse(base).success).toBe(true);
  for (const change of [
    { date: "zzzz" },
    { date: "2099-02-31" },
    { startTime: "25:00", endTime: "26:00" },
    { guests: 1.5 },
    { guests: 5 },
    { guests: 0 },
    { endTime: "09:00" },
    { startTime: "07:00" },
    { startTime: "10:15" },
  ])
    expect(schema.safeParse({ ...base, ...change }).success).toBe(false);
  expect(isValidDateString("2028-02-29")).toBe(true);
  expect(isValidDateString("2027-02-29")).toBe(false);
  expect(getBookingTotal(350000, "10:00", "11:30")).toBe(525000);
});
test("availability handles contained, adjacent and cancelled bookings", () => {
  const fixture: Booking = {
    id: "test",
    userId: "local-guest",
    spaceId: "1",
    date: "2099-10-26",
    startTime: "10:00",
    endTime: "12:00",
    guests: 2,
    status: "confirmed",
    total: 700000,
    createdAt: "2099-10-25",
  };
  expect(isSpaceAvailable("1", fixture.date, "11:00", "13:00", [fixture])).toBe(
    false,
  );
  expect(isSpaceAvailable("1", fixture.date, "09:00", "13:00", [fixture])).toBe(
    false,
  );
  expect(isSpaceAvailable("1", fixture.date, "12:00", "13:00", [fixture])).toBe(
    true,
  );
  expect(isSpaceAvailable("2", fixture.date, "11:00", "13:00", [fixture])).toBe(
    true,
  );
  expect(
    isSpaceAvailable("1", fixture.date, "11:00", "13:00", [
      { ...fixture, status: "cancelled" },
    ]),
  ).toBe(true);
});
