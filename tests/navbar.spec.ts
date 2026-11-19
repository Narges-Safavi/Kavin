import { test, expect } from "@playwright/test";

const user = {
  id: "navbar-user",
  username: "very_long_username_".repeat(6),
  email: "",
};

test("slow account check and retry never show a false guest state", async ({
  page,
}) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let fails = true;
  await page.route("**/api/auth/me", async (route) => {
    await held;
    await route.fulfill(
      fails
        ? { status: 503, json: { detail: "Unavailable" } }
        : { json: { user } },
    );
  });
  try {
    await page.goto("/about");
    const header = page.locator("header");
    await expect(header.getByRole("status")).toContainText("در حال بررسی حساب");
    await expect(
      header.getByRole("link", { name: "ورود", exact: true }),
    ).toHaveCount(0);
    release();
    await expect(header.getByRole("alert")).toContainText(
      "وضعیت حساب دریافت نشد",
    );
    await expect(
      header.getByRole("link", { name: "ورود", exact: true }),
    ).toHaveCount(0);
    fails = false;
    await header.getByRole("button", { name: "تلاش دوباره" }).click();
    await expect(
      header.getByText(user.username, { exact: true }),
    ).toBeVisible();
    fails = true;
    await header.getByRole("link", { name: "سؤال‌های شما" }).click();
    await expect(header.getByRole("alert")).toBeVisible();
    await expect(
      header.getByText(user.username, { exact: true }),
    ).toBeVisible();
    fails = false;
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ json: { user: null } }),
    );
    await header.getByRole("button", { name: "تلاش دوباره" }).click();
    await expect(
      header.getByRole("link", { name: "ورود", exact: true }),
    ).toBeVisible();
    await expect(header.getByText(user.username, { exact: true })).toHaveCount(
      0,
    );
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
});

test("signed-in navbar fits narrow screens and its menu stays usable", async ({
  page,
}) => {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ json: { user } }),
  );
  await page.goto("/about");
  await expect(page.locator(".nav-user")).toHaveText(user.username);
  for (const width of [320, 390, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(
      page.getByRole("button", { name: "خروج", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width <= 600) {
      await page.getByRole("button", { name: "باز کردن منو" }).click();
      await expect(
        page.getByRole("navigation", { name: "ناوبری اصلی" }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("navigation", { name: "ناوبری اصلی" })
          .getByRole("link", { name: "داستان کاوین" }),
      ).toBeInViewport();
      await page.getByRole("button", { name: "بستن منو" }).click();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/navbar-mobile.png",
    fullPage: false,
  });
});

test("failed logout preserves account and can be retried", async ({ page }) => {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ json: { user } }),
  );
  let fails = true;
  await page.route("**/api/auth/logout", (route) =>
    route.fulfill(fails ? { status: 503, json: {} } : { status: 204 }),
  );
  await page.goto("/");
  const logout = page.getByRole("button", { name: "خروج", exact: true });
  await logout.click();
  await expect(page.locator("header").getByRole("alert")).toContainText(
    "خروج انجام نشد",
  );
  await expect(page.locator(".nav-user")).toHaveText(user.username);
  fails = false;
  await logout.click();
  await expect(page.locator(".nav-user")).toHaveCount(0);
});
