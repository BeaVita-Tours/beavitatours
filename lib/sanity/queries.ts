import { cacheLife, cacheTag } from "next/cache";
import { client } from "./client";
import type { Category, Post, PostListResult, PostSummary } from "./types";

/**
 * All blog data access lives here: GROQ queries + typed accessors.
 *
 * Every accessor is a `"use cache"` function tagged with the `blog` cache
 * tag, so a Sanity webhook can call `revalidateTag("blog")` (via
 * `app/api/revalidate`) and published posts appear without a redeploy. The
 * `blog` cache-life profile is configured in next.config.ts and acts as the
 * fallback TTL when no webhook is set up.
 *
 * Every query guards on the client being configured — with no Sanity env
 * vars set, all accessors return empty values and the app still builds.
 */

export const POSTS_PER_PAGE = 9;

const BLOG_TAG = "blog";

/** Paginated list of published posts, most recent first, optional category. */
const POSTS_QUERY = /* groq */ `
  *[_type == "post"
    && defined(slug.current)
    && publishedAt <= now()
    && (!defined($category) || $category in categories[]->slug.current)
  ] | order(publishedAt desc)[$start...$end] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    mainImage {
      asset->{ _id, url, metadata { lqip, dimensions } },
      hotspot,
      crop,
      alt,
    },
    author->{
      _id,
      name,
      "slug": slug.current,
      image { asset->{ _id, url }, alt },
    },
    categories[]->{ _id, title, "slug": slug.current },
    "bodyText": pt::text(coalesce(body, [])),
  }
`;

/** Total published posts matching the same filter, for pagination. */
const POSTS_COUNT_QUERY = /* groq */ `
  count(*[_type == "post"
    && defined(slug.current)
    && publishedAt <= now()
    && (!defined($category) || $category in categories[]->slug.current)
  ])
`;

/** All categories for the filter UI, alphabetical. */
const CATEGORIES_QUERY = /* groq */ `
  *[_type == "category" && defined(slug.current)] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
  }
`;

/** Full post for the detail page, with body images expanded. */
const POST_BY_SLUG_QUERY = /* groq */ `
  *[_type == "post" && slug.current == $slug && publishedAt <= now()][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    mainImage {
      asset->{ _id, url, metadata { lqip, dimensions } },
      hotspot,
      crop,
      alt,
    },
    author->{
      _id,
      name,
      "slug": slug.current,
      image { asset->{ _id, url, metadata { lqip, dimensions } }, alt },
      bio,
    },
    categories[]->{ _id, title, "slug": slug.current },
    seo {
      seoTitle,
      seoDescription,
      seoImage { asset->{ _id, url } },
    },
    "bodyText": pt::text(coalesce(body, [])),
    body[] {
      ...,
      _type == "image" => {
        asset->{ _id, url, metadata { lqip, dimensions } },
        hotspot,
        crop,
        alt,
      },
      markDefs[] {
        ...,
        _type == "internalLink" => {
          ...,
          "post": post->{ _id, "slug": slug.current },
        },
      },
    },
  }
`;

/** All published post slugs, for generateStaticParams. */
const POST_SLUGS_QUERY = /* groq */ `
  *[_type == "post" && defined(slug.current) && publishedAt <= now()].slug.current
`;

/**
 * Related posts for the article footer: posts sharing any of the current
 * post's categories sort first ("matched"), then most-recent fill the rest.
 * The `coalesce(..., [])` around the category slug array is required — a post
 * with no categories would otherwise yield `matched: null` and break the sort.
 */
const RELATED_POSTS_QUERY = /* groq */ `
  *[_type == "post"
    && defined(slug.current)
    && publishedAt <= now()
    && slug.current != $currentSlug
  ] | {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    mainImage {
      asset->{ _id, url, metadata { lqip, dimensions } },
      hotspot,
      crop,
      alt,
    },
    author->{
      _id,
      name,
      "slug": slug.current,
      image { asset->{ _id, url }, alt },
    },
    categories[]->{ _id, title, "slug": slug.current },
    "bodyText": pt::text(coalesce(body, [])),
    "matched": count(coalesce(categories[]->slug.current, [])[@ in $categorySlugs]) > 0,
  } | order(matched desc, publishedAt desc)[0...3]
`;

/** A single category by slug (for category archive pages). */
const CATEGORY_BY_SLUG_QUERY = /* groq */ `
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
  }
`;

export async function getPosts(opts: {
  page: number;
  category?: string;
}): Promise<PostListResult> {
  "use cache";
  cacheLife("blog");
  cacheTag(BLOG_TAG);

  if (!client) return { posts: [], total: 0 };

  // GROQ range slices [a...b] are inclusive on both ends.
  const start = (opts.page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE - 1;

  const [posts, total] = await Promise.all([
    client.fetch<PostSummary[]>(POSTS_QUERY, {
      start,
      end,
      category: opts.category ?? null,
    }),
    client.fetch<number>(POSTS_COUNT_QUERY, {
      category: opts.category ?? null,
    }),
  ]);

  return { posts, total };
}

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheLife("blog");
  cacheTag(BLOG_TAG);

  if (!client) return null;
  return (await client.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug })) ?? null;
}

export async function getPostSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("blog");
  cacheTag(BLOG_TAG);

  if (!client) return [];
  return await client.fetch<string[]>(POST_SLUGS_QUERY);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("blog");
  cacheTag(BLOG_TAG);

  if (!client) return [];
  return await client.fetch<Category[]>(CATEGORIES_QUERY);
}

export async function getCategory(slug: string): Promise<Category | null> {
  "use cache";
  cacheLife("blog");
  cacheTag(BLOG_TAG);

  if (!client) return null;
  return (await client.fetch<Category | null>(CATEGORY_BY_SLUG_QUERY, { slug })) ?? null;
}

export async function getRelatedPosts(opts: {
  currentSlug: string;
  categorySlugs: string[];
}): Promise<PostSummary[]> {
  "use cache";
  cacheLife("blog");
  cacheTag(BLOG_TAG);

  if (!client) return [];
  return await client.fetch<PostSummary[]>(RELATED_POSTS_QUERY, {
    currentSlug: opts.currentSlug,
    categorySlugs: opts.categorySlugs,
  });
}
