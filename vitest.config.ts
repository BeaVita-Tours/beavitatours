import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Unit/integration tests only — no browser environment. The Regiondo layer is
 * server-only, so `node` is the right environment and keeps the suite fast.
 * End-to-end coverage of the booking flow lives in Playwright, not here.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // `server-only` throws on import outside the react-server condition, which
      // Vitest does not set. Aliasing to the package's own empty stub keeps the
      // guard meaningful in the app while letting the modules load under test.
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url)
      ),
      // cacheLife/cacheTag throw outside a Next build. The stub makes the
      // cached wrappers behave as plain async functions under test.
      "next/cache": fileURLToPath(
        new URL("./lib/regiondo/__tests__/next-cache-stub.ts", import.meta.url)
      ),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/__tests__/**/*.test.ts", "lib/**/*.test.ts"],
    // Live round trips hit the real API; give them room.
    testTimeout: 30_000,
    // The wrapper reads env at module load; give every test the same baseline
    // so a developer's real .env.local can never change a test outcome.
    env: {
      REGIONDO_PUBLIC_KEY: "TEST_PUBLIC_KEY",
      REGIONDO_PRIVATE_KEY: "TEST_PRIVATE_KEY",
      REGIONDO_API_ENV: "live",
      REGIONDO_VENDOR_ID: "46886",
      REGIONDO_DEFAULT_LOCALE: "en-US",
      REGIONDO_CURRENCY: "EUR",
      REGIONDO_PAYMENT_MODE: "hosted",
      REGIONDO_NATIVE_BOOKING: "true",
    },
  },
});
