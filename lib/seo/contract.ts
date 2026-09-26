import { createHash } from "node:crypto";
import { z } from "zod";
import { publishablePaths } from "./routes";
import { workspaceSiteUrl } from "./config";

const path = z
  .string()
  .max(500)
  .refine(
    (value) => publishablePaths.includes(value),
    "Unsupported website page",
  );
const articleSchema = z
  .object({
    id: z.string().min(1).max(100),
    version: z.number().int().positive(),
    title: z.string().min(1).max(200),
    slug: z
      .string()
      .max(150)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    language: z.enum(["en", "it"]),
    summary: z.string().min(1).max(1000),
    body: z.string().max(60000),
    metaTitle: z.string().min(1).max(200),
    metaDescription: z.string().min(1).max(500),
    tourPath: path,
    publishedAt: z.string().datetime(),
    canonical: z.string().url().max(700),
    coverImage: z
      .object({
        url: z
          .string()
          .url()
          .max(2000)
          .refine((value) => {
            try {
              const url = new URL(value);
              return (
                url.protocol === "https:" && !url.username && !url.password
              );
            } catch {
              return false;
            }
          }, "Use an HTTPS image address without credentials"),
        alt: z.string().trim().min(1).max(300),
      })
      .strict()
      .optional(),
  })
  .strict();
const pageSchema = z
  .object({
    path,
    version: z.number().int().positive(),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(500),
    canonical: z.string().url().max(700),
    indexable: z.boolean(),
    follow: z.boolean(),
    alternates: z
      .array(
        z
          .object({ language: z.enum(["en", "it", "x-default"]), path })
          .strict(),
      )
      .max(3),
  })
  .strict();
export const snapshotSchema = z
  .object({
    protocol: z.literal(1),
    mode: z.enum(["preview", "live"]),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    siteUrl: z.literal(workspaceSiteUrl),
    articles: z.array(articleSchema).max(500),
    pages: z.array(pageSchema).max(300),
  })
  .strict()
  .superRefine((snapshot, context) => {
    const reject = () =>
      context.addIssue({
        code: "custom",
        message: "Invalid website publication snapshot",
      });
    if (
      new Set(snapshot.articles.map((a) => `${a.language}/${a.slug}`)).size !==
        snapshot.articles.length ||
      new Set(snapshot.pages.map((p) => p.path)).size !== snapshot.pages.length
    )
      reject();
    // Legacy (/en/guides/...) or English-only (/guides/...) addresses.
    for (const article of snapshot.articles)
      if (
        article.canonical !==
          `${workspaceSiteUrl}/${article.language}/guides/${article.slug}` &&
        !(
          article.language === "en" &&
          article.canonical === `${workspaceSiteUrl}/guides/${article.slug}`
        )
      )
        reject();
    for (const page of snapshot.pages) {
      const canonical = new URL(page.canonical);
      if (
        canonical.origin !== workspaceSiteUrl ||
        canonical.search ||
        canonical.hash ||
        !publishablePaths.includes(canonical.pathname)
      )
        reject();
      if (
        new Set(page.alternates.map((a) => a.language)).size !==
        page.alternates.length
      )
        reject();
      // A locale-prefixed alternate must be in its own language; unprefixed
      // (English-only site) paths can only be English.
      if (
        page.alternates.some((a) => {
          const prefix = /^\/(en|it|zh|ja)(?:\/|$)/.exec(a.path)?.[1];
          return prefix
            ? a.language !== "x-default" && a.language !== prefix
            : a.language === "it";
        })
      )
        reject();
    }
    const hash = createHash("sha256")
      .update(
        JSON.stringify({
          siteUrl: snapshot.siteUrl,
          articles: snapshot.articles,
          pages: snapshot.pages,
        }),
      )
      .digest("hex");
    if (hash !== snapshot.contentHash) reject();
  });
export type Snapshot = z.infer<typeof snapshotSchema>;
export type PublishedArticle = Snapshot["articles"][number];
