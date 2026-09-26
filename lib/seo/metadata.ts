import "server-only";
import type { Metadata } from "next";
import { getOptionalSnapshot } from "./client";
import { isSeoPreview } from "./config";
import { findPage } from "./publications";

/**
 * A page's metadata with SEO Workspace's approved title, description,
 * canonical and robots applied over the page's own. The rest of the page's
 * metadata (Open Graph images, site name) is kept.
 */
export async function pageMetadata(
  path: string,
  fallback: Metadata = {},
): Promise<Metadata> {
  const snapshot = await getOptionalSnapshot();
  const page = snapshot && findPage(snapshot, path);
  const metadata: Metadata = page
    ? {
        ...fallback,
        title: page.title,
        description: page.description,
        alternates: {
          canonical: page.canonical ?? fallback.alternates?.canonical,
        },
        robots: { index: page.indexable, follow: page.follow },
        openGraph: {
          ...fallback.openGraph,
          title: page.title,
          description: page.description,
          ...(page.canonical ? { url: page.canonical } : {}),
        },
      }
    : fallback;
  return isSeoPreview()
    ? { ...metadata, robots: { index: false, follow: false } }
    : metadata;
}
