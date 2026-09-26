import "server-only";
import { getSnapshot, getOptionalSnapshot } from "@/lib/seo/client";
import { blogCategories, blogPosts, pageOfPosts } from "./projection";

/** All views share the connector cache and its verified immediate refresh. */
export const POSTS_PER_PAGE = 9;
export async function getPosts(opts: { page: number; category?: string }) {
  const posts = blogPosts(await getSnapshot());
  const category = blogCategories(posts).some((c) => c.slug === opts.category) ? opts.category : undefined;
  return pageOfPosts(posts, { ...opts, category }, POSTS_PER_PAGE);
}
export async function getPost(slug: string) {
  return blogPosts(await getSnapshot()).find((post) => post.slug === slug) ?? null;
}
export async function getPostSlugs() { return blogPosts(await getSnapshot()).map((post) => post.slug); }
export async function getPostSitemapEntries() {
  return blogPosts(await getSnapshot()).map(({ slug, publishedAt, modifiedAt }) => ({ slug, publishedAt, modifiedAt }));
}
export async function getCategories() { return blogCategories(blogPosts(await getSnapshot())); }
export async function getCategory(slug: string) { return (await getCategories()).find((category) => category.slug === slug) ?? null; }
export async function getRelatedPosts(opts: { currentSlug: string; categorySlugs: string[] }) {
  return blogPosts(await getSnapshot()).filter((post) => post.slug !== opts.currentSlug)
    .map((post) => ({ post, matched: (post.categories ?? []).filter((c) => opts.categorySlugs.includes(c.slug)).length }))
    .sort((a, b) => b.matched - a.matched || b.post.publishedAt.localeCompare(a.post.publishedAt))
    .slice(0, 3).map(({ post }) => post);
}

/** Homepage remains available if the article service is temporarily unavailable. */
export async function getHomePosts() { return blogPosts(await getOptionalSnapshot()).slice(0, 3); }
