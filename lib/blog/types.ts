/** Public website view model, supplied by the approved workspace snapshot. */
export interface BlogImage {
  asset?: { url: string; metadata?: { dimensions?: { width: number; height: number } } };
  alt?: string;
}
export interface Category { _id: string; title: string; slug: string; description?: string }
export interface Author { name: string; image?: BlogImage; bio?: string }
export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  mainImage?: BlogImage;
  body?: string;
  bodyText?: string | null;
  inlineImages?: Array<{ url: string; alt: string; width: number; height: number }>;
  categories?: Category[];
  author?: Author;
  publishedAt: string;
  modifiedAt?: string;
  canonical: string;
  seo?: { seoTitle?: string; seoDescription?: string; seoImage?: BlogImage };
}
export type PostSummary = Pick<Post, "_id" | "title" | "slug" | "excerpt" | "mainImage" | "publishedAt" | "author" | "categories" | "bodyText">;
export interface PostListResult { posts: PostSummary[]; total: number }
