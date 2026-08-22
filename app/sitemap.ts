import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getCategories, getPostSitemapEntries } from "@/lib/sanity/queries";

type Frequency = MetadataRoute.Sitemap[number]["changeFrequency"];

/** Static routes that don't read from data (crucial pages, tours, landing pages). */
const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: Frequency;
}> = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/rates", priority: 0.8, changeFrequency: "weekly" },
  { path: "/best-seller", priority: 0.8, changeFrequency: "weekly" },
  { path: "/tours/dolomites", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tours/prosecco", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tours/wine-food", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tours/active-adventure", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tours/cultural", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tours/group-tours", priority: 0.9, changeFrequency: "weekly" },
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

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  // Fetch dynamic content in parallel. With no Sanity configured, the
  // accessors return [] and the sitemap falls back to static routes only.
  const [postEntries, categories] = await Promise.all([
    getPostSitemapEntries(),
    getCategories(),
  ]);

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const postUrls: MetadataRoute.Sitemap = postEntries.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    // publishedAt is the freshest known change timestamp per post.
    lastModified: post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/blog/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticUrls, ...postUrls, ...categoryUrls];
};

export default sitemap;
