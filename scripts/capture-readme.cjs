/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS screenshot script. */
const { chromium } = require("playwright");
const fs = require("node:fs");

(async () => {
  const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";
  fs.mkdirSync("docs/screenshots", { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      locale: "fa-IR",
      timezoneId: "Asia/Tehran",
    });
    await page.goto(baseURL);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.locator(".hero-visual img").evaluate((image) => image.decode());
    await page.screenshot({
      path: "docs/screenshots/home.png",
      animations: "disabled",
      caret: "initial",
    });
    await page.goto(`${baseURL}/spaces/1`);
    await page.getByRole("button", { name: /تاریخ حضورت/ }).waitFor();
    await page.getByRole("button", { name: /تاریخ حضورت/ }).click();
    await page.getByRole("dialog").waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: "docs/screenshots/reservation.png",
      fullPage: true,
      animations: "disabled",
      caret: "initial",
    });
    console.log("README screenshots saved to docs/screenshots.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
