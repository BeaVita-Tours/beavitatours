/**
 * Shared types for the Reviews section.
 *
 * `Review` is the single normalized shape used by all three sources:
 *   - live Google Reviews (fetched in `google-reviews.ts`)
 *   - hand-curated manual reviews (`manual-reviews.ts`)
 *   - (static platform badges use `PlatformStat`, not `Review`)
 */

import type { OTAId } from "@/lib/ota-wordmarks";

/** Platforms that can appear on a stat badge. */
export type PlatformId = OTAId;

/**
 * A single review, regardless of where it came from.
 *
 * `source` is *how the review got into the system*: "google" (live fetch) or
 * "manual" (hand-added in `manual-reviews.ts`). The platform is carried
 * separately by `platformLabel` for manual reviews — e.g. "TripAdvisor",
 * "GetYourGuide", "Facebook". That label is matched against the OTA wordmark
 * set to render the platform's logo, falling back to plain text when there's
 * no logo for it.
 *
 * `date` must be a full ISO timestamp (e.g. "2026-05-14T10:00:00.000Z") so
 * reviews sort correctly by date — ISO strings compare lexicographically.
 */
export type Review = {
  /** Stable React key, e.g. "google:Author:1690000000" or "manual-1". */
  id: string;
  source: "google" | "manual";
  /** Real platform name for manual reviews (e.g. "Facebook", "TripAdvisor"). */
  platformLabel?: string;
  authorName: string;
  authorPhotoUrl?: string;
  /** 1–5. */
  rating: number;
  text: string;
  /** Full ISO timestamp (see note above). */
  date: string;
  /** Optional deep link to the original review. */
  sourceUrl?: string;
};

/** A static platform badge (rating may be a number or a label like "NEW"). */
export type PlatformStat = {
  platform: PlatformId;
  name: string;
  href?: string;
  rating: number | string;
  count?: number | undefined;
};
