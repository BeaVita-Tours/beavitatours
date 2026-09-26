import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { listAllTours } from "@/lib/regiondo/products";
import { assertSlugRegistry } from "@/lib/regiondo/slugs";
import { getCategories, getPostSitemapEntries } from "@/lib/blog/queries";
import { getOptionalSnapshot } from "@/lib/seo/client";
import { isSeoPreview, workspaceSiteUrl } from "@/lib/seo/config";
import { findPage } from "@/lib/seo/publications";

type Frequency = MetadataRoute.Sitemap[number]["changeFrequency"];

/** Static routes that don't read from data (crucial pages, tours, landing pages). */
const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: Frequency;
}> = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/best-seller", priority: 0.8, changeFrequency: "weekly" },
  { path: "/tours/dolomites", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tours/wine-food", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tours/active-adventure", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tours/cultural", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tours/group-tours", priority: 0.9, changeFrequency: "weekly" },
  // Renders with the flag off too (the tailor-made offer that /rates used to
  // be), so it is a static route rather than a native one.
  { path: "/tours/private-tours", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" },
  { path: "/b2b", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/faq", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/blog", priority: 0.7, changeFrequency: "daily" },
  { path: "/lp/from-venice", priority: 0.6, changeFrequency: "monthly" },
  {
    path: "/lp/from-jesolo-cavallino",
    priority: 0.6,
    changeFrequency: "monthly",
  },
];

/**
 * Catalog routes, listed only when the native flow is on. While the flag is off
 * these pages 404, and a 404 in a sitemap is a reliable way to earn a coverage
 * warning in Search Console.
 *
 * The two collection pages are not repeated here — they are in STATIC_ROUTES
 * and keep their URLs either way, which is the point of D-002.
 */
const NATIVE_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: Frequency;
}> = [];

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  // Preview deployments are noindex and disallowed in robots.txt; an empty
  // sitemap keeps them from advertising URLs.
  if (isSeoPreview()) return [];

  const native = isNativeBookingEnabled();

  // Fetch dynamic content in parallel. With no blog connector configured, the
  // accessors return [] and the sitemap falls back to static routes only.
  const [postEntries, categories, tours, publications] = await Promise.all([
    getPostSitemapEntries(),
    getCategories(),
    native ? listAllTours() : Promise.resolve([]),
    getOptionalSnapshot(),
  ]);

  // The sitemap build is where the slug registry is checked against the live
  // catalog: a duplicate slug, or one shadowed by a static /tours/* page, fails
  // the build here rather than becoming a silent 404 someone finds in Search
  // Console six weeks later. A product with no curated slug only warns — it
  // still has a working /tours/p-<id> URL, and adding a tour in Regiondo must
  // not be able to break a production build.
  if (native) {
    assertSlugRegistry(tours.map((tour) => tour.id));
  }

  // SEO Workspace can mark a page noindex or canonicalise it elsewhere; either
  // way it no longer belongs in the sitemap.
  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.filter((route) => {
    const page = publications && findPage(publications, route.path || "/");
    return (
      !page ||
      (page.indexable &&
        page.canonical === `${workspaceSiteUrl}${route.path || "/"}`)
    );
  }).map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const postUrls: MetadataRoute.Sitemap = postEntries.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    // publishedAt is the freshest known change timestamp per post.
    lastModified: post.modifiedAt ?? post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/blog/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const nativeUrls: MetadataRoute.Sitemap = native
    ? NATIVE_ROUTES.map((route) => ({
        url: `${SITE_URL}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      }))
    : [];

  const tourUrls: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: `${SITE_URL}${tour.href}`,
    // Regiondo's own updated_at, so a re-crawl is prompted by a real edit
    // rather than by every deploy.
    lastModified: tour.updatedAt ? new Date(tour.updatedAt.replace(" ", "T") + "Z") : new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [
    ...staticUrls,
    ...nativeUrls,
    ...tourUrls,
    ...postUrls,
    ...categoryUrls,
  ];
};

export default sitemap;
