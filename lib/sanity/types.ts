/**
 * Hand-written result types for the blog GROQ queries.
 *
 * Chosen over `sanity typegen` because this repo must build with no Sanity
 * project configured, and the GROQ projections in `queries.ts` are explicit
 * and stable. The queries and these types live side by side so drift is easy
 * to spot and fix.
 */

export interface SanityImageDimensions {
  width: number;
  height: number;
}

export interface SanityImageMetadata {
  lqip?: string;
  dimensions?: SanityImageDimensions;
}

export interface SanityImageAsset {
  _id?: string;
  url: string;
  metadata?: SanityImageMetadata;
}

export interface SanityImageHotspot {
  x: number;
  y: number;
  height: number;
  width: number;
}

export interface SanityImageCrop {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SanityImage {
  _type?: "image";
  asset?: SanityImageAsset;
  hotspot?: SanityImageHotspot;
  crop?: SanityImageCrop;
  alt?: string;
}

export interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
}

export interface Author {
  _id: string;
  name: string;
  slug: string;
  image?: SanityImage;
  bio?: unknown[];
}

export interface PostSeo {
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: SanityImage;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  mainImage?: SanityImage;
  body?: unknown[];
  categories?: Category[];
  author?: Author;
  publishedAt: string;
  seo?: PostSeo;
}

/** The fields rendered on cards and list pages. */
export type PostSummary = Pick<
  Post,
  "_id" | "title" | "slug" | "excerpt" | "mainImage" | "publishedAt" | "author" | "categories"
>;

export interface PostListResult {
  posts: PostSummary[];
  total: number;
}
