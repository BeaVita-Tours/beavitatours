import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createHash } from "node:crypto";
import { seoConfig } from "./config";
import { fetchSnapshot } from "./transport";

export const publicationTag = "seo-studio-publications-v1";
// Only cache data that passed validation. If a refresh fails, Next keeps the
// last good copy. If there is no cached copy yet, throw instead of caching
// an empty result.
export const getSnapshot = cache(async () => {
  const config = seoConfig();
  if (!config) return null;
  const fingerprint = createHash("sha256")
    .update(`${config.studioUrl}:${config.readToken}:${config.mode}`)
    .digest("hex");
  // Using bind keeps the callback text the same in Next's route and page bundles.
  // If the settings change, the fingerprint selects a different cache entry.
  return unstable_cache(
    fetchSnapshot.bind(null, config),
    [publicationTag, fingerprint],
    {
      tags: [publicationTag],
      revalidate: 60,
    },
  )();
});

// If the first fetch fails, existing pages can use their usual metadata.
// Guides use getSnapshot directly so a connection failure does not look like a 404.
export const getOptionalSnapshot = cache(async () => {
  try {
    return await getSnapshot();
  } catch {
    console.error("SEO delivery unavailable; using existing website metadata.");
    return null;
  }
});
