import "server-only";
import type { Metadata } from "next";
import { getOptionalSnapshot } from "./client";
import { isSeoPreview, siteUrl } from "./config";
import type { PublishedArticle } from "./contract";

export async function pageMetadata(
  path: string,
  fallback: Metadata = {},
): Promise<Metadata> {
  const snapshot = await getOptionalSnapshot();
  const page = snapshot?.pages.find((p) => p.path === path);
  const metadata: Metadata = page
    ? {
        title: page.title,
        description: page.description,
        alternates: {
          canonical: page.canonical,
          languages: Object.fromEntries(
            page.alternates.map((a) => [a.language, `${siteUrl}${a.path}`]),
          ),
        },
        robots: { index: page.indexable, follow: page.follow },
        openGraph: {
          title: page.title,
          description: page.description,
          url: page.canonical,
        },
      }
    : fallback;
  return isSeoPreview()
    ? { ...metadata, robots: { index: false, follow: false } }
    : metadata;
}
export function articleMetadata(article: PublishedArticle): Metadata {
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: article.canonical },
    robots: { index: !isSeoPreview(), follow: !isSeoPreview() },
    openGraph: {
      type: "article",
      title: article.metaTitle,
      description: article.metaDescription,
      url: article.canonical,
      publishedTime: article.publishedAt,
      locale: article.language,
      ...(article.coverImage
        ? {
            images: [
              { url: article.coverImage.url, alt: article.coverImage.alt },
            ],
          }
        : {}),
    },
    ...(article.coverImage
      ? {
          twitter: {
            card: "summary_large_image" as const,
            title: article.metaTitle,
            description: article.metaDescription,
            images: [
              { url: article.coverImage.url, alt: article.coverImage.alt },
            ],
          },
        }
      : {}),
  };
}
