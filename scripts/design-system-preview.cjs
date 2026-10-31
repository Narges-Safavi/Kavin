/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS browser QA script. */
const { chromium } = require("playwright");
const fs = require("node:fs");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1080 },
    locale: "fa-IR",
    timezoneId: "Asia/Tehran",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  fs.mkdirSync("qa", { recursive: true });
  const response = await page.goto(
    (process.env.BASE_URL || "http://127.0.0.1:3001") + "/design-system",
  );
  assert.equal(response.status(), 200);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page
    .getByRole("button", { name: "بررسی فرم نمونه", exact: true })
    .click();
  await page
    .getByText("اسمت را وارد کن تا ادامه بدهیم.", { exact: true })
    .waitFor();
  await page.getByLabel("نام شما", { exact: true }).fill("نرگس");
  await page
    .getByRole("button", { name: "بررسی فرم نمونه", exact: true })
    .click();
  await page
    .getByText("مقدار ثبت شد. این نمونه چیزی ذخیره نمی‌کند.", { exact: true })
    .waitFor();
  // Interact before capturing: screenshot caret styling must not race hydration.
  await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "qa/design-system-desktop.png" });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Horizontal overflow at ${width}`,
    );
    await page
      .getByRole("button", { name: "تاریخ نمونه", exact: true })
      .click();
    const box = await page
      .getByRole("dialog", { name: "تاریخ نمونه" })
      .boundingBox();
    assert(
      box && box.x >= 0 && box.x + box.width <= width,
      `Calendar fits at ${width}`,
    );
    if (width === 390)
      await page.screenshot({ path: "qa/design-system-mobile-calendar.png" });
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "ساعت شروع نمونه", exact: true })
      .click();
    const timeBox = await page.getByRole("dialog").boundingBox();
    assert(
      timeBox && timeBox.x >= 0 && timeBox.x + timeBox.width <= width,
      `Time picker fits at ${width}`,
    );
    await page.keyboard.press("Escape");
    console.log(`PASS responsive guide and pickers: ${width}px`);
  }
  assert.deepEqual(errors, []);
  console.log("PASS example form validation and no console/runtime errors");
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
