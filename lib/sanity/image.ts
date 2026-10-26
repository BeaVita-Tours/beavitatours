import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImage } from "./types";

/**
 * Builds optimized CDN URLs for Sanity images via `@sanity/image-url`.
 * Independent of the (possibly null) query client — it only needs the project
 * id and dataset, which are public.
 *
 * Note: we intentionally do NOT call `.auto("format")` here. `next/image`
 * re-encodes and serves its own formats from these URLs, so appending an
 * explicit format would double-encode.
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImage) {
  return builder.image(source);
}
