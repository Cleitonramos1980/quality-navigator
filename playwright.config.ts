import { defineConfig, devices } from "@playwright/test";

const backendEnv = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "3333",
  APP_PUBLIC_URL: process.env.APP_PUBLIC_URL || "http://127.0.0.1:4173",
  JWT_SECRET_KEY:
    process.env.JWT_SECRET_KEY || "e2e-jwt-secret-key-with-32-or-more-characters-123456",
  AUTH_STATIC_PASSWORD:
    process.env.AUTH_STATIC_PASSWORD || process.env.E2E_AUTH_PASSWORD || "12345678",
  ALLOW_WEAK_AUTH_STATIC_PASSWORD:
    process.env.ALLOW_WEAK_AUTH_STATIC_PASSWORD || "true",
};

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "npm --prefix backend run dev",
      url: "http://127.0.0.1:3333/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: backendEnv,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4173",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
