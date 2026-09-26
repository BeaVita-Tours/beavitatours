import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { seoConfig } from "./config";
import { fetchSnapshot } from "./transport";

export const publicationTag = "seo-studio-publications-v1";

/**
 * The validated publication snapshot, or null when the connector is off.
 * For the guides and the connection route, which run at request time.
 *
 * Only data that passed validation is cached: a failed fetch (or a connector
 * misconfiguration) throws, and a throw is never cached, so an outage cannot be
 * stored as "no guides". The `seo` cache-life profile is in next.config.ts;
 * POST /api/seo/connection expires the tag when SEO Workspace publishes.
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
 * For page metadata, the nav and the sitemap: if SEO Workspace can't be
 * reached, or the connector is misconfigured for this deployment (live mode on
 * a preview), pages keep their own metadata.
 *
 * These are prerendered, so nothing may throw out of here: an error escaping a
 * cache during prerender fails the build. That is also why this reads the
 * config and fetches itself rather than calling `getSnapshot`. A failure is
 * kept for minutes rather than the profile's lifetime, so a page built during
 * an outage picks up the published metadata soon after SEO Workspace is back.
 */
export async function getOptionalSnapshot() {
  "use cache";
  cacheTag(publicationTag);

  try {
    const config = seoConfig();
    if (!config) {
      cacheLife("max");
      return null;
    }
    const snapshot = await fetchSnapshot(config);
    cacheLife("seo");
    return snapshot;
  } catch {
    console.error("SEO delivery unavailable; using existing website metadata.");
    cacheLife("minutes");
    return null;
  }
}
