import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { seoConfig } from "./config";
import { fetchSnapshot } from "./transport";

export const publicationTag = "seo-studio-publications-v1";

/**
 * The validated publication snapshot, or null when the connector is off.
 *
 * Only data that passed validation is cached: a failed fetch throws, and a
 * throw is never cached, so an outage cannot be stored as "no guides". The
 * `seo` cache-life profile is in next.config.ts; POST /api/seo/connection
 * expires the tag when SEO Workspace publishes. With the connector off nothing
 * can change without a redeploy, so pages are not revalidated for it.
 */
export async function getSnapshot() {
  "use cache";
  cacheTag(publicationTag);

  const config = seoConfig();
  if (!config) {
    cacheLife("max");
    return null;
  }
  cacheLife("seo");
  return fetchSnapshot(config);
}

/**
 * For page metadata and the nav: if SEO Workspace can't be reached, pages keep
 * their own metadata. Guides use `getSnapshot` directly so a connection
 * failure does not look like a 404.
 *
 * Cached too, because pages prerender: a failure is kept for minutes rather
 * than the profile's lifetime, so a page built during an outage picks up the
 * published metadata soon after SEO Workspace is back.
 */
export async function getOptionalSnapshot() {
  "use cache";
  cacheTag(publicationTag);

  try {
    const snapshot = await getSnapshot();
    if (snapshot) cacheLife("seo");
    else cacheLife("max");
    return snapshot;
  } catch {
    console.error("SEO delivery unavailable; using existing website metadata.");
    cacheLife("minutes");
    return null;
  }
}
