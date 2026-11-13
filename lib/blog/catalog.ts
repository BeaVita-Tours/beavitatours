import "server-only";
import * as sanity from "../sanity/queries";
import type { Category, Post, PostSummary } from "../sanity/types";
import { getSnapshot, getOptionalSnapshot } from "../seo/client";
import { seoConfig } from "../seo/config";
import type { PublishedArticle } from "../seo/contract";
import {
  assertNoBlogConflicts,
  findPublication,
  publicationPath,
} from "../seo/publications";

export const POSTS_PER_PAGE = sanity.POSTS_PER_PAGE;
export type BlogPost = Post & { seoPublication?: PublishedArticle };
export function articlePost(article: PublishedArticle): BlogPost {
  const blog = article.blog;
  return {
    _id: `seo:${article.id}`,
    title: article.title,
    slug: article.slug,
    excerpt: article.summary,
    bodyText: article.body,
    publishedAt: article.publishedAt,
    mainImage: article.coverImage && {
      asset: { url: article.coverImage.url },
      alt: article.coverImage.alt,
    },
    categories:
      blog?.categories.map((c) => ({ ...c, _id: `seo:${c.slug}` })) ?? [],
    author: blog && {
      _id: `seo:${article.id}:author`,
      name: blog.author.name,
      slug: "editorial-team",
      image: blog.author.image && {
        asset: { url: blog.author.image.url },
        alt: blog.author.image.alt,
      },
      bio: [
        {
          _type: "block",
          _key: "bio",
          style: "normal",
          markDefs: [],
          children: [
            { _type: "span", _key: "text", text: blog.author.bio, marks: [] },
          ],
        },
      ],
    },
    seo: {
      seoTitle: article.metaTitle,
      seoDescription: article.metaDescription,
    },
    seoPublication: article,
  };
}
async function catalogue() {
  const [posts, snapshot] = await Promise.all([
    sanity.getAllPosts(),
    getOptionalSnapshot(),
  ]);
  if (snapshot)
    assertNoBlogConflicts(
      snapshot,
      posts.map((p) => p.slug),
    );
  const articles =
    snapshot?.articles.filter(
      (a) => a.language === "en" && publicationPath(a).startsWith("/blog/"),
    ) ?? [];
  return [...posts, ...articles.map(articlePost)].sort(
    (a, b) =>
      b.publishedAt.localeCompare(a.publishedAt) ||
      a.slug.localeCompare(b.slug),
  );
}
export async function getPosts({
  page,
  category,
}: {
  page: number;
  category?: string;
}) {
  const posts = (await catalogue()).filter(
    (p) => !category || p.categories?.some((c) => c.slug === category),
  );
  const current = Math.min(
    Math.max(1, page),
    Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE)),
  );
  return {
    posts: posts.slice(
      (current - 1) * POSTS_PER_PAGE,
      current * POSTS_PER_PAGE,
    ),
    total: posts.length,
  };
}
export async function getPost(slug: string): Promise<BlogPost | null> {
  const config = seoConfig();
  // Keep the existing Sanity blog available while the legacy service is being
  // replaced. The scoped connection requires a valid snapshot for ownership.
  const legacy = config && new URL(config.studioUrl).pathname === "/";
  const [post, snapshot] = await Promise.all([
    sanity.getPost(slug),
    legacy ? getOptionalSnapshot() : getSnapshot(),
  ]);
  const article = snapshot && findPublication(snapshot, `/blog/${slug}`);
  if (article && post) throw new Error("Conflicting blog publication.");
  return article ? articlePost(article) : post;
}
export async function getCategories(): Promise<Category[]> {
  const [existing, posts] = await Promise.all([
    sanity.getCategories(),
    catalogue(),
  ]);
  const categories = new Map(existing.map((c) => [c.slug, c]));
  for (const post of posts)
    for (const category of post.categories ?? [])
      if (!categories.has(category.slug))
        categories.set(category.slug, category);
  return [...categories.values()].sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}
export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}
export async function getRelatedPosts({
  currentSlug,
  categorySlugs,
}: {
  currentSlug: string;
  categorySlugs: string[];
}): Promise<PostSummary[]> {
  const posts = (await catalogue()).filter((p) => p.slug !== currentSlug);
  const related = (post: PostSummary) =>
    Number(
      post.categories?.some((c) => categorySlugs.includes(c.slug)) ?? false,
    );
  return posts.sort((a, b) => related(b) - related(a)).slice(0, 3);
}
export async function getPostSitemapEntries() {
  return (await catalogue()).map((p) => ({
    slug: p.slug,
    publishedAt: (p as BlogPost).seoPublication?.modifiedAt ?? p.publishedAt,
  }));
}
