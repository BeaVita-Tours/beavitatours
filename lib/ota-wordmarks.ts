/**
 * Wordmark logos for the online-travel-agency (OTA) platforms we surface.
 * Every logo lives in `public/ota/` as an SVG, cropped tightly to the mark.
 *
 * This is the single source of truth for which platforms we can render a real
 * logo for: `OTAWordmark` (components/ota-wordmark.tsx) renders these, and the
 * reviews code maps a platform to an `OTAId` via `isOTAId`.
 */
export type OTAId =
  | "google"
  | "tripadvisor"
  | "getyourguide"
  | "viator"
  | "klook"
  | "civitatis"
  | "musement"
  | "booking";

export const OTA_LOGO_SRC: Record<OTAId, string> = {
  google: "/ota/google.svg",
  tripadvisor: "/ota/tripadvisor.svg",
  getyourguide: "/ota/getyourguide.svg",
  viator: "/ota/viator.svg",
  klook: "/ota/klook.svg",
  civitatis: "/ota/civitatis.svg",
  musement: "/ota/musement.svg",
  booking: "/ota/booking.svg",
};

/**
 * Each logo's viewBox aspect ratio (width ÷ height). OTAWordmark applies this
 * as a CSS `aspect-ratio` so every mark is sized by height with the width
 * derived from its real proportions — NOT from the SVG's baked/intrinsic
 * dimensions, which vary per file and would otherwise letterbox marks like
 * Google (which has no width/height attributes) down to a fraction of the
 * requested height.
 */
export const OTA_WORDMARK_ASPECT: Record<OTAId, number> = {
  google: 126.25 / 41.52,
  tripadvisor: 7674.86 / 1173.72,
  getyourguide: 3204 / 283.5,
  viator: 368.78 / 91.63,
  klook: 1920 / 534,
  civitatis: 2148.8 / 475.18,
  musement: 600.17 / 86.35,
  booking: 304.1 / 50.4,
};

/** True when `value` is a known OTA id (e.g. a review's platform). */
export function isOTAId(value: string): value is OTAId {
  return value in OTA_LOGO_SRC;
}
