import { isOTAId, type OTAId } from "@/lib/ota-wordmarks";
import type { PlatformStat, Review } from "./types";

/**
 * # Static platform badges (hardcoded by design — NOT fetched)
 *
 * These ratings are the same hardcoded values that used to live in the
 * homepage (`app/(site)/page.tsx` OTAS array). They were entered by hand and
 * will NOT auto-update — TripAdvisor and GetYourGuide don't expose accessible
 * review APIs, so we show their known ratings statically instead. The Google
 * badge is the only *live* stat, rendered separately from `getGoogleReviews()`.
 *
 * To update a number, edit it here and redeploy.
 */

/** Headline stat cards shown next to the live Google stat. */
export const headlineStats: PlatformStat[] = [
  {
    platform: "tripadvisor",
    name: "TripAdvisor",
    href: "https://www.tripadvisor.it/Attraction_Review-g187870-d28238909-Reviews-Bea_Vita_Tours-Venice_Veneto.html",
    rating: 4.9,
    count: 99,
  },
  {
    platform: "getyourguide",
    name: "GetYourGuide",
    href: "https://www.getyourguide.com/bea-vita-tours-s340119/",
    rating: 4.86,
    count: 2256,
  },
];

/**
 * Compact "also rated on" cluster. Ratings preserved verbatim; non-numeric
 * values (e.g. "NEW") render as text with no star, exactly as before.
 */
export const alsoRatedOnStats: PlatformStat[] = [
  {
    platform: "viator",
    name: "Viator",
    rating: 4.86,
    count: 314,
  },
  {
    platform: "klook",
    name: "Klook",
    rating: 5,
    count: 13,
  },
  {
    platform: "civitatis",
    name: "Civitatis",
    rating: 4,
    count: 21,
  },
  {
    platform: "musement",
    name: "Musement",
    rating: 4.75,
    count: 2,
  },
  {
    platform: "booking",
    name: "Booking",
    rating: 4.3,
    count: 4,
  },
];

/** Display names for review cards, keyed by review `source` / platform id. */
export const PLATFORM_META: Record<string, { name: string }> = {
  google: { name: "Google" },
  tripadvisor: { name: "TripAdvisor" },
  getyourguide: { name: "GetYourGuide" },
  viator: { name: "Viator" },
  klook: { name: "Klook" },
  civitatis: { name: "Civitatis" },
  musement: { name: "Musement" },
  booking: { name: "Booking" },
};

/** The platform label shown on a review card. */
export function reviewPlatformName(
  source: Review["source"],
  platformLabel?: string,
): string {
  if (source === "manual") return platformLabel ?? "Guest";
  return PLATFORM_META[source]?.name ?? source;
}

/**
 * The OTA a review's platform maps to (for rendering its wordmark), or `null`
 * when the project has no logo for it (e.g. a manual review from Facebook or
 * Yelp). The review card shows `from <logo>` when one exists and falls back
 * to `from <name>` otherwise.
 */
export function reviewPlatformLogo(
  source: Review["source"],
  platformLabel?: string,
): OTAId | null {
  const key =
    source === "manual"
      ? (platformLabel ?? "").toLowerCase().replace(/\s+/g, "")
      : source;
  return isOTAId(key) ? key : null;
}
