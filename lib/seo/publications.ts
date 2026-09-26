import { workspaceSiteUrl } from "./config";
import type { Snapshot } from "./contract";
import { toSitePath } from "./routes";

export type PublishedPage = {
  title: string;
  description: string;
  /** Absolute URL on this site, or null when the canonical is not an English page. */
  canonical: string | null;
  indexable: boolean;
  follow: boolean;
};

/**
 * The entry for a page on this site. An entry published under the site's own
 * path wins over a legacy one that maps onto it (/en/rates → /tours/private-tours).
 */
export function findPage(
  snapshot: Snapshot,
  path: string,
): PublishedPage | null {
  const page =
    snapshot.pages.find((p) => p.path === path) ??
    snapshot.pages.find((p) => toSitePath(p.path) === path);
  if (!page) return null;
  const canonicalPath = toSitePath(new URL(page.canonical).pathname);
  return {
    title: page.title,
    description: page.description,
    canonical:
      canonicalPath === null ? null : `${workspaceSiteUrl}${canonicalPath}`,
    indexable: page.indexable,
    follow: page.follow,
  };
}
