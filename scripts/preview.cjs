/* eslint-disable @typescript-eslint/no-require-imports -- This standalone Node.js QA entry point uses CommonJS. */
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || "playwright");
const path = require("node:path");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    locale: "fa-IR",
    timezoneId: "Asia/Tehran",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  fs.mkdirSync(path.resolve("qa"), { recursive: true });
  await page.goto(process.env.BASE_URL || "http://127.0.0.1:3001");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.screenshot({ path: "qa/home-desktop.png", fullPage: true });
  await page.goto(
    (process.env.BASE_URL || "http://127.0.0.1:3001") + "/spaces/1",
  );
  await page.getByRole("button", { name: /تاریخ حضورت/ }).click();
  await page.getByRole("dialog").waitFor();
  console.log("CALENDAR", await page.getByRole("dialog").innerText());
  console.log(
    "CALENDAR_BUTTONS",
    await page
      .getByRole("dialog")
      .getByRole("button")
      .evaluateAll((buttons) =>
        buttons.map((button) => ({
          text: button.textContent,
          label: button.getAttribute("aria-label"),
          disabled: button.disabled,
        })),
      ),
  );
  await page.screenshot({ path: "qa/calendar-desktop.png", fullPage: true });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /از ساعت/ }).click();
  await page.screenshot({ path: "qa/time-desktop.png", fullPage: true });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: /تاریخ حضورت/ }).click();
  await page.screenshot({ path: "qa/calendar-mobile.png", fullPage: true });
  console.log("ERRORS", errors);
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
