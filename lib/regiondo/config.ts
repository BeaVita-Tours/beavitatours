import "server-only";

import { z } from "zod";

/**
 * Environment parsing for the Regiondo integration.
 *
 * Validation strategy: the schema is strict, but it is only *enforced* when the
 * native booking flow is switched on. With `REGIONDO_NATIVE_BOOKING` off (the
 * default) the site renders the legacy widget embeds and never touches the API,
 * so a checkout without Regiondo credentials must still build — the same way
 * `lib/sanity/client.ts` degrades when Sanity is unconfigured. Turn the flag on
 * and a missing or malformed key fails at module load, which under Next means
 * at build time rather than at request time.
 */

const booleanish = z
  .union([z.literal("true"), z.literal("1"), z.literal("false"), z.literal("0"), z.literal("")])
  .optional()
  .transform((v) => v === "true" || v === "1");

const envSchema = z.object({
  REGIONDO_PUBLIC_KEY: z.string().min(1, "REGIONDO_PUBLIC_KEY is required"),
  REGIONDO_PRIVATE_KEY: z.string().min(1, "REGIONDO_PRIVATE_KEY is required"),
  REGIONDO_SANDBOX_PUBLIC_KEY: z.string().optional(),
  REGIONDO_SANDBOX_PRIVATE_KEY: z.string().optional(),
  REGIONDO_API_ENV: z.enum(["live", "sandbox"]).default("live"),
  REGIONDO_VENDOR_ID: z.string().regex(/^\d+$/, "REGIONDO_VENDOR_ID must be numeric").optional(),
  REGIONDO_DEFAULT_LOCALE: z.string().min(2).default("en-US"),
  REGIONDO_CURRENCY: z.string().length(3).default("EUR"),
  REGIONDO_WIDGET_OFFER_IDS: z.string().optional(),
  // Only "hosted" is implemented, deliberately. Any other value means the
  // account would require card data to pass through this origin, which this
  // integration refuses to do. See D-001 in docs/regiondo-build-log.md.
  REGIONDO_PAYMENT_MODE: z.enum(["hosted"]).default("hosted"),
  REGIONDO_NATIVE_BOOKING: booleanish,
});

export type RegiondoEnv = z.infer<typeof envSchema>;

const BASE_URLS = {
  live: "https://api.regiondo.com/v1",
  sandbox: "https://sandbox-api.regiondo.com/v1",
} as const;

/**
 * Locales the Checkout API's `store_locale` parameter accepts, per the OpenAPI
 * spec. The site is English-only today; this exists so that adding a locale is
 * a validation change rather than a debugging session.
 */
export const SUPPORTED_STORE_LOCALES = [
  "de-DE",
  "en-US",
  "de-AT",
  "fr-FR",
  "it-IT",
  "pt-PT",
  "es-ES",
  "es-MX",
  "nl-NL",
  "hu-HU",
] as const;

export type StoreLocale = (typeof SUPPORTED_STORE_LOCALES)[number];

export interface RegiondoConfig {
  readonly enabled: boolean;
  readonly baseUrl: string;
  readonly apiEnv: "live" | "sandbox";
  readonly publicKey: string;
  /** Never log, serialise, or pass this anywhere near a client component. */
  readonly privateKey: string;
  readonly vendorId: string | null;
  readonly locale: StoreLocale;
  readonly currency: string;
  readonly paymentMode: "hosted";
  readonly widgetOfferIds: readonly number[];
}

/**
 * Reservations are account-global (GET /checkout/hold lists every active hold
 * for the API key, not per-session), so hold lifetime is a real product
 * decision rather than a technical one: long enough for a customer to fill in
 * a short form and pay, short enough that abandoned carts return stock quickly.
 * The API default is 20 minutes and the maximum is 60.
 */
export const HOLD_MINUTES = 20;

/** Prolong the hold once the customer has under this many seconds left. */
export const HOLD_PROLONG_THRESHOLD_SECONDS = 5 * 60;

function isEnabled(): boolean {
  const raw = process.env.REGIONDO_NATIVE_BOOKING;
  return raw === "true" || raw === "1";
}

let cached: RegiondoConfig | null = null;

function build(): RegiondoConfig {
  const enabled = isEnabled();

  if (!enabled) {
    // Disabled: hand back an inert config rather than throwing, so that a build
    // without Regiondo credentials still succeeds. Every call site checks
    // `enabled` (or goes through `requireConfig()`) before making a request.
    return {
      enabled: false,
      baseUrl: BASE_URLS.live,
      apiEnv: "live",
      publicKey: "",
      privateKey: "",
      vendorId: process.env.REGIONDO_VENDOR_ID ?? null,
      locale: "en-US",
      currency: process.env.REGIONDO_CURRENCY ?? "EUR",
      paymentMode: "hosted",
      widgetOfferIds: [],
    };
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Report field names only. Values are secrets and zod would happily print
    // them back in `received`.
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(
      `Regiondo configuration is invalid (${fields}). REGIONDO_NATIVE_BOOKING is on, ` +
        "so these must be set. See .env.example."
    );
  }

  const env = parsed.data;
  const apiEnv = env.REGIONDO_API_ENV;

  // Sandbox is a separate account with its own key pair. Falling back to the
  // live keys against the sandbox host silently 403s, which is a confusing way
  // to spend an afternoon, so refuse it outright.
  const publicKey = apiEnv === "sandbox" ? env.REGIONDO_SANDBOX_PUBLIC_KEY : env.REGIONDO_PUBLIC_KEY;
  const privateKey =
    apiEnv === "sandbox" ? env.REGIONDO_SANDBOX_PRIVATE_KEY : env.REGIONDO_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error(
      `REGIONDO_API_ENV="${apiEnv}" but the ${apiEnv} key pair is empty. ` +
        "Live keys are rejected by the sandbox host with 403; set the sandbox pair or use live."
    );
  }

  const locale = (SUPPORTED_STORE_LOCALES as readonly string[]).includes(env.REGIONDO_DEFAULT_LOCALE)
    ? (env.REGIONDO_DEFAULT_LOCALE as StoreLocale)
    : "en-US";

  return {
    enabled: true,
    baseUrl: BASE_URLS[apiEnv],
    apiEnv,
    publicKey,
    privateKey,
    vendorId: env.REGIONDO_VENDOR_ID ?? null,
    locale,
    currency: env.REGIONDO_CURRENCY,
    paymentMode: env.REGIONDO_PAYMENT_MODE,
    widgetOfferIds: (env.REGIONDO_WIDGET_OFFER_IDS ?? "")
      .split(",")
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n)),
  };
}

export function getConfig(): RegiondoConfig {
  cached ??= build();
  return cached;
}

/** For tests only: drop the memoised config so env changes take effect. */
export function resetConfigCache(): void {
  cached = null;
}

/**
 * Config for code paths that cannot proceed without credentials. Throws with a
 * message that points at the flag rather than at the missing key, because
 * "flag is off" is by far the likelier cause.
 */
export function requireConfig(): RegiondoConfig {
  const config = getConfig();
  if (!config.enabled) {
    throw new Error(
      "The Regiondo API was called while REGIONDO_NATIVE_BOOKING is off. " +
        "Guard the call site with isNativeBookingEnabled()."
    );
  }
  return config;
}

/** Cheap check for render paths that choose between native and legacy UI. */
export function isNativeBookingEnabled(): boolean {
  return getConfig().enabled;
}
