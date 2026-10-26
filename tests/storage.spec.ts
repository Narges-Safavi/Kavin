import { test, expect } from "@playwright/test";

test("booking availability updates in another tab", async ({
  page,
  context,
}) => {
  await page.clock.install({ time: new Date("2027-05-09T06:00:00Z") });
  await page.goto("/spaces/1");
  const second = await context.newPage();
  await second.clock.install({ time: new Date("2027-05-09T06:00:00Z") });
  await second.goto("/spaces/1");
  for (const tab of [page, second]) {
    await tab.getByRole("button", { name: /تاریخ حضورت/ }).click();
    await tab
      .getByRole("button", { name: "انتخاب امروز", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "از ساعت", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "۱۰:۰۰", exact: true })
    .click();
  await page.getByRole("button", { name: "تا ساعت", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "۱۱:۰۰", exact: true })
    .click();
  await page.getByRole("button", { name: "تأیید و ثبت رزرو" }).click();
  await expect(
    page.getByRole("heading", { name: "رزروت ثبت شد!" }),
  ).toBeVisible();
  await second.getByRole("button", { name: "از ساعت", exact: true }).click();
  await expect(
    second
      .getByRole("dialog")
      .getByRole("button", { name: "۱۰:۰۰", exact: true }),
  ).toBeDisabled();
});

test("complete mobile booking with themed pickers", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install({ time: new Date("2027-05-09T06:00:00Z") });
  await page.goto("/spaces/3");
  await page.getByRole("button", { name: /تاریخ حضورت/ }).click();
  await page.getByRole("button", { name: "انتخاب امروز", exact: true }).click();
  await page.getByRole("button", { name: "از ساعت", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "۱۰:۰۰", exact: true })
    .click();
  await page.getByRole("button", { name: "تا ساعت", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "۱۱:۰۰", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "افزایش تعداد نفرات" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "تأیید و ثبت رزرو" }).click();
  await expect(
    page.getByRole("heading", { name: "رزروت ثبت شد!" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "مشاهده رزروهای من", exact: true })
    .click();
  await expect(page.locator(".reservation-row")).toContainText("هم‌نشین");
});
