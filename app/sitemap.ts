import type { MetadataRoute } from "next";
import { getSnapshot } from "@/lib/seo/client";
import { isSeoPreview, siteUrl } from "@/lib/seo/config";
import { pagePaths } from "@/lib/seo/routes";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isSeoPreview()) return [];
  const snapshot = await getSnapshot();
  const entries: MetadataRoute.Sitemap = pagePaths.flatMap((path) => {
    const page = snapshot?.pages.find((p) => p.path === path);
    if (page && (!page.indexable || page.canonical !== `${siteUrl}${path}`))
      return [];
    return [
      {
        url: `${siteUrl}${path}`,
        ...(page?.alternates.length
          ? {
              alternates: {
                languages: Object.fromEntries(
                  page.alternates.map((a) => [
                    a.language,
                    `${siteUrl}${a.path}`,
                  ]),
                ),
              },
            }
          : {}),
      },
    ];
  });
  entries.push({ url: `${siteUrl}/landing` });
  for (const locale of ["en", "it"]) {
    const articles =
      snapshot?.articles.filter((a) => a.language === locale) || [];
    if (articles.length) entries.push({ url: `${siteUrl}/${locale}/guides` });
    entries.push(
      ...articles.map((a) => ({
        url: a.canonical,
        lastModified: a.publishedAt,
      })),
    );
  }
  return entries;
}
