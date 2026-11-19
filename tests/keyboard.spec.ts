import { test, expect, type Page, type Locator } from "@playwright/test";
import { mockBookings } from "./mock-bookings";

async function tabTo(page: Page, target: Locator) {
  for (let index = 0; index < 80; index++) {
    if (await target.evaluate((element) => element === document.activeElement))
      return;
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
}

test("mobile menu supports keyboard opening, traversal and Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ json: { user: null } }),
  );
  await page.goto("/about");
  const toggle = page.getByRole("button", { name: "باز کردن منو" });
  await tabTo(page, toggle);
  expect(
    await toggle.evaluate((element) => getComputedStyle(element).outlineStyle),
  ).not.toBe("none");
  await page.keyboard.press("Enter");
  const nav = page.getByRole("navigation", { name: "ناوبری اصلی" });
  await expect(
    nav.getByRole("link", { name: "خانه", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "فضاهای کاری" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    nav.getByRole("link", { name: "خانه", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/spaces$/);
  await expect(nav).toBeHidden();
});

test("login field errors are associated and keyboard focus reaches the first error", async ({
  page,
}) => {
  await page.goto("/login");
  const username = page.getByLabel("نام کاربری");
  await tabTo(page, username);
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("رمز عبور", { exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(username).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(username).toHaveAttribute("aria-invalid", "true");
  await expect(username).toBeFocused();
  for (const id of ["username", "password"]) {
    await expect(page.locator(`#${id}`)).toHaveAttribute(
      "aria-describedby",
      `${id}-error`,
    );
    await expect(page.locator(`#${id}-error`)).toBeVisible();
  }
});

test("booking pickers support keyboard selection, Escape and associated errors", async ({
  page,
  context,
}) => {
  await mockBookings(context);
  await page.clock.install({ time: new Date("2027-05-09T06:00:00Z") });
  await page.goto("/spaces/1");
  const date = page.getByRole("button", { name: /تاریخ حضورت/ });
  await tabTo(page, page.getByRole("button", { name: "تأیید و ثبت رزرو" }));
  await page.keyboard.press("Enter");
  const error = await date.getAttribute("aria-describedby");
  await expect(page.locator(`[id="${error}"]`)).toBeVisible();
  await tabTo(page, date);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(date).toBeFocused();
  await page.keyboard.press("Space");
  await tabTo(
    page,
    page.getByRole("button", { name: "انتخاب امروز", exact: true }),
  );
  await page.keyboard.press("Enter");
  await expect(date).toBeFocused();
    await expect(date).not.toHaveAttribute("aria-describedby");
  const start = page.getByRole("button", { name: "از ساعت", exact: true });
  await tabTo(page, start);
  await page.keyboard.press("Enter");
  await tabTo(
    page,
    page
      .getByRole("dialog")
      .getByRole("button", { name: "۱۰:۰۰", exact: true }),
  );
  await page.keyboard.press("Enter");
  await expect(start).toBeFocused();
  await expect(start).toContainText("۱۰:۰۰");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await expect(start).toBeFocused();
});
