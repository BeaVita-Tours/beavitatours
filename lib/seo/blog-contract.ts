import { z } from "zod";

const https = z.string().url().max(2000).refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password;
}, "Use an HTTPS address without credentials");
export const blogImageSchema = z.object({ url: https, alt: z.string().trim().max(300) }).strict();
export const blogCategorySchema = z.object({
  slug: z.string().max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(100),
}).strict();

/** Public presentation is versioned with the writing, never read from a mutable plan. */
export const blogPresentationSchema = z.object({
  author: z.object({
    name: z.string().trim().min(1).max(120),
    bio: z.string().max(3000),
    image: blogImageSchema.optional(),
  }).strict(),
  categories: z.array(blogCategorySchema).min(1).max(8),
  inlineImages: z.array(blogImageSchema.extend({
    width: z.number().int().positive().max(20000),
    height: z.number().int().positive().max(20000),
  })).max(30),
}).strict();

