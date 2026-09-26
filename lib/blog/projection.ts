import type { PublishedArticle, Snapshot } from "@/lib/seo/contract";
import type { Post, Category } from "./types";

function toPost(article: PublishedArticle): Post {
  const blog = article.blog;
  return {
    _id: article.id, title: article.title, slug: article.slug, excerpt: article.summary,
    body: article.body,
    // Match Portable Text's reading-time input: image captions and Markdown marks are not words.
    bodyText: article.body.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_#`>]/g, ""),
    publishedAt: article.publishedAt, modifiedAt: article.modifiedAt, canonical: article.canonical,
    ...(article.coverImage ? { mainImage: { asset: { url: article.coverImage.url }, alt: article.coverImage.alt } } : {}),
    ...(blog ? {
      author: { name: blog.author.name, bio: blog.author.bio,
        ...(blog.author.image ? { image: { asset: { url: blog.author.image.url }, alt: blog.author.image.alt } } : {}) },
      categories: blog.categories.map((category) => ({ ...category, _id: category.slug })),
      inlineImages: blog.inlineImages,
    } : {}),
    seo: { seoTitle: article.metaTitle, seoDescription: article.metaDescription },
  };
}
export function blogPosts(snapshot: Snapshot | null): Post[] {
  return (snapshot?.articles ?? []).filter((article) => article.language === "en")
    .map(toPost).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));
}
export function blogCategories(posts: Post[]): Category[] {
  return [...new Map(posts.flatMap((post) => post.categories ?? []).map((c) => [c.slug, c])).values()]
    .sort((a, b) => a.title.localeCompare(b.title));
}
export function pageOfPosts(posts: Post[], opts: { page: number; category?: string }, perPage: number) {
  const selected = opts.category ? posts.filter((post) => post.categories?.some((c) => c.slug === opts.category)) : posts;
  const page = Math.min(Math.max(1, opts.page), Math.max(1, Math.ceil(selected.length / perPage)));
  return { posts: selected.slice((page - 1) * perPage, page * perPage), total: selected.length };
}
