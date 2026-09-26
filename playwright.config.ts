import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end configuration.
 *
 * All three servers are started here: a mock Regiondo on 4010, a mock SEO
 * Workspace on 4011, and the Next app on 3200 pointed at both. Pointing at a mock rather than the live API is not a
 * shortcut — sold-out and expired-hold cannot be produced on demand against
 * production without genuinely selling out a departure, and the happy path
 * against live would create and abandon a real reservation on every run.
 *
 * `next dev` rather than a production build so the suite is quick to run
 * locally; the flows under test are server-rendered either way.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false, // the mock holds one scenario at a time
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,

  use: {
    baseURL: "http://localhost:3200",
    trace: "retain-on-failure",
    // Mobile-first: it is where the bookings come from.
    ...devices["Pixel 7"],
  },

  projects: [{ name: "mobile-chrome", use: { ...devices["Pixel 7"] } }],

  webServer: [
    {
      command: "node e2e/mock-regiondo.mjs 4010",
      url: "http://localhost:4010/__scenario?name=happy",
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
    },
    {
      command: "node e2e/mock-seo-workspace.mjs 4011",
      url: "http://localhost:4011/api/website/content",
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
    },
    {
      command: "pnpm next dev -p 3200",
      url: "http://localhost:3200/tours",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      env: {
        REGIONDO_NATIVE_BOOKING: "true",
        REGIONDO_API_BASE_URL: "http://localhost:4010/v1",
        // Fakes: the mock does not verify signatures, and no test should be
        // able to reach the real API by accident.
        REGIONDO_PUBLIC_KEY: "E2E_PUBLIC_KEY",
        REGIONDO_PRIVATE_KEY: "E2E_PRIVATE_KEY",
        REGIONDO_CURRENCY: "EUR",
        REGIONDO_DEFAULT_LOCALE: "en-US",
        REGIONDO_PAYMENT_MODE: "hosted",
        // Live mode against the mock (plain http is allowed for localhost
        // outside production). Tokens match lib/seo/__tests__/fixture.ts.
        SEO_DELIVERY_MODE: "live",
        SEO_STUDIO_URL: "http://localhost:4011",
        SEO_STUDIO_READ_TOKEN: `read-test-${"a".repeat(43)}`,
        SEO_REFRESH_SECRET: `refresh-test-${"b".repeat(43)}`,
      },
    },
  ],
});
