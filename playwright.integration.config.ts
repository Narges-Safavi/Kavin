import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/integration",
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3001",
    locale: "fa-IR",
    timezoneId: "Asia/Tehran",
    ...devices["Desktop Chrome"],
    channel: "chrome",
    // Authentication requests contain credentials. Keep them out of traces.
    trace: "off",
  },
  webServer: [
    {
      command: "backend\\.venv\\Scripts\\python.exe tests/django-server.py",
      url: "http://127.0.0.1:8011/api/v1/spaces/",
      timeout: 120000,
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3001",
      url: "http://127.0.0.1:3001",
      env: { NEXT_PUBLIC_KAVIN_API_URL: "http://127.0.0.1:8011/api/v1" },
      timeout: 120000,
    },
  ],
});
