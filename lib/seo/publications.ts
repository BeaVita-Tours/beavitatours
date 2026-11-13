import { workspaceSiteUrl } from "./config";
import type { PublishedArticle, Snapshot } from "./contract";
import { toSitePath } from "./routes";

/**
 * The published snapshot as this English-only site uses it: English guides
 * and blog articles, with historical aliases and page entries matched here.
 *
 * Text is rendered exactly as SEO Workspace approved it, and URLs keep its
 * origin (the live www host), as they always have.
 */

export type Guide = PublishedArticle & { url: string; tourHref: string };

export const guideUrl = (slug: string) => `${workspaceSiteUrl}/guides/${slug}`;
export const publicationPath = (article: PublishedArticle) =>
  new URL(article.canonical).pathname.replace(/^\/en\//, "/");
export const publicationUrl = (article: PublishedArticle) =>
  new URL(publicationPath(article), article.canonical).href;

export function findPublication(
  snapshot: Snapshot,
  path: string,
): PublishedArticle | null {
  return (
    snapshot.articles.find(
      (article) =>
        article.language === "en" &&
        [article.canonical, ...(article.aliases ?? [])].some(
          (url) => new URL(url).pathname.replace(/^\/en\//, "/") === path,
        ),
    ) ?? null
  );
}

export function assertNoBlogConflicts(
  snapshot: Snapshot,
  sanitySlugs: string[],
) {
  const occupied = new Set(sanitySlugs.map((slug) => `/blog/${slug}`));
  for (const article of snapshot.articles.filter((a) => a.language === "en"))
    if (
      [article.canonical, ...(article.aliases ?? [])].some((url) =>
        occupied.has(new URL(url).pathname.replace(/^\/en\//, "/")),
      )
    )
      throw new Error(
        "An SEO article conflicts with an existing Sanity post. Resolve the route ownership before publishing.",
      );
}

function toGuide(article: PublishedArticle): Guide {
  return {
    ...article,
    url: publicationUrl(article),
    tourHref: toSitePath(article.tourPath) ?? "/",
  };
}

/** English guides, newest first. */
export function listGuides(snapshot: Snapshot): Guide[] {
  return snapshot.articles
    .filter(
      (a) => a.language === "en" && publicationPath(a).startsWith("/guides/"),
    )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map(toGuide);
}

export function findGuide(snapshot: Snapshot, slug: string): Guide | null {
  const article = findPublication(snapshot, `/guides/${slug}`);
  return article ? toGuide(article) : null;
}

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
