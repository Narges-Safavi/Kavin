import { test, expect } from "@playwright/test";

test("filter navigation announces loading until server results arrive", async ({
  page,
}) => {
  await page.goto("/spaces");
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/spaces?*", async (route) => {
    await held;
    await route.continue();
  });
  await page.getByLabel("حداقل ظرفیت").selectOption("10");
  await expect(
    page.getByRole("status").filter({ hasText: "در حال دریافت فضاها" }),
  ).toBeVisible();
  release();
  await expect(page.locator(".space-card")).toHaveCount(1);
  await expect(page.locator(".explorer-results")).toHaveAttribute(
    "aria-busy",
    "false",
  );
});

test("space filters survive reload and browser history", async ({ page }) => {
  await page.goto("/spaces?type=meeting-room&minCapacity=10&ordering=-price");
  await expect(page.getByLabel("حداقل ظرفیت")).toHaveValue("10");
  await expect(
    page.getByRole("radio", { name: "اتاق جلسه", exact: true }),
  ).toBeChecked();
  await expect(page.locator(".space-card")).toHaveCount(1);
  await page.reload();
  await expect(page.getByLabel("مرتب‌سازی", { exact: true })).toHaveValue(
    "high",
  );
  await page.getByRole("button", { name: "پاک کردن", exact: true }).click();
  await expect(page).toHaveURL(/\/spaces$/);
  await expect(page.locator(".space-card")).toHaveCount(4);
  await page.goBack();
  await expect(page.getByLabel("حداقل ظرفیت")).toHaveValue("10");
  await expect(page.locator(".space-card")).toHaveCount(1);
  await page.goForward();
  await expect(page.getByLabel("حداقل ظرفیت")).toHaveValue("0");
  await expect(page.locator(".space-card")).toHaveCount(4);
});

test("rapid search keeps the final text in URL and results", async ({
  page,
}) => {
  await page.goto("/spaces");
  const search = page.getByLabel("دنبال چه فضایی هستی؟");
  await search.fill("پیدانشدنی");
  await search.fill("آفتاب");
  await expect(page).toHaveURL(/search=/);
  expect(new URL(page.url()).searchParams.get("search")).toBe("آفتاب");
  await expect(page.locator(".space-card")).toHaveCount(1);
  await expect(page.locator(".space-card")).toContainText("آفتاب");
  await page.reload();
  await expect(search).toHaveValue("آفتاب");
});

test("invalid URL filters fall back safely and arbitrary valid capacity is visible", async ({
  page,
}) => {
  await page.goto("/spaces?type=invalid&minCapacity=-1&ordering=invalid");
  await expect(page.locator(".space-card")).toHaveCount(4);
  await expect(page.getByLabel("حداقل ظرفیت")).toHaveValue("0");
  await page.goto("/spaces?minCapacity=3&ordering=price");
  await expect(page.getByLabel("حداقل ظرفیت")).toHaveValue("3");
  await expect(page.locator(".space-card")).toHaveCount(3);
});
