import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test("invalid login shows the API error and stays on login", async ({
  page,
}) => {
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      status: 401,
      json: {
        code: "invalid_credentials",
        detail: "نام کاربری یا رمز عبور اشتباه است",
      },
    }),
  );
  await page.goto("/login");
  await page.getByLabel("نام کاربری").fill("test-user");
  await page.getByLabel("رمز عبور", { exact: true }).fill(randomUUID());
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({
        hasText:
          /نام کاربری یا رمز عبور اشتباه است|این بازه همین الان رزرو شد|لغو رزرو موقتاً ممکن نیست/,
      }),
  ).toContainText("نام کاربری یا رمز عبور اشتباه است");
  await expect(page).toHaveURL(/\/login$/);
});

test("successful login updates navigation and logout clears it", async ({
  page,
}) => {
  let signedIn = false;
  const user = { id: "test-user", username: "test-user", email: "" };
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ json: { user: signedIn ? user : null } }),
  );
  await page.route("**/api/auth/login", async (route) => {
    signedIn = true;
    await route.fulfill({ json: { user } });
  });
  await page.route("**/api/auth/logout", async (route) => {
    signedIn = false;
    await route.fulfill({ status: 204 });
  });
  await page.goto("/login");
  await page.getByLabel("نام کاربری").fill(user.username);
  await page.getByLabel("رمز عبور", { exact: true }).fill(randomUUID());
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(user.username, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "خروج", exact: true }).click();
  await expect(page.getByText(user.username, { exact: true })).toHaveCount(0);
});
