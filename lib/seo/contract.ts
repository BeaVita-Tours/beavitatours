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
const imageSchema = z
  .object({
    url: z
      .string()
      .url()
      .max(2000)
      .refine((value) => {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password;
      }),
    alt: z.string().max(300),
  })
  .strict();
const blogSchema = z
  .object({
    author: z
      .object({
        name: z.string().min(1).max(120),
        bio: z.string().max(3000),
        image: imageSchema.optional(),
      })
      .strict(),
    categories: z
      .array(
        z
          .object({
            slug: z
              .string()
              .max(100)
              .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
            title: z.string().min(1).max(100),
          })
          .strict(),
      )
      .min(1)
      .max(8),
    inlineImages: z
      .array(
        imageSchema.extend({
          width: z.number().int().positive().max(20000),
          height: z.number().int().positive().max(20000),
        }),
      )
      .max(30),
  })
  .strict();
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
    blog: blogSchema.optional(),
    modifiedAt: z.string().datetime().optional(),
    aliases: z.array(z.string().url().max(700)).max(20).optional(),
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
const shape = z
  .object({
    protocol: z.literal(1),
    mode: z.enum(["preview", "live"]),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    siteUrl: z.string().url(),
    articles: z.array(articleSchema).max(500),
    pages: z.array(pageSchema).max(300),
  })
  .strict();
export type Snapshot = z.infer<typeof shape>;
export type PublishedArticle = Snapshot["articles"][number];

/** Validate the original bytes' field order before returning the typed payload. */
export function validateSnapshot(
  raw: unknown,
  siteUrl = workspaceSiteUrl,
): Snapshot {
  const snapshot = shape.parse(raw);
  const reject = () => {
    throw new Error("Invalid website publication snapshot");
  };
  if (snapshot.siteUrl !== siteUrl) reject();
  const original = raw as Snapshot;
  const hash = createHash("sha256")
    .update(
      JSON.stringify({
        siteUrl: original.siteUrl,
        articles: original.articles,
        pages: original.pages,
      }),
    )
    .digest("hex");
  if (hash !== snapshot.contentHash) reject();
  const owned = (address: string) => {
    const url = new URL(address);
    return (
      url.origin === siteUrl &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
    );
  };
  const route = (address: string) =>
    new URL(address).pathname.replace(/^\/en\//, "/");
  const routes = new Set<string>();
  for (const article of snapshot.articles) {
    const canonical = new URL(article.canonical).pathname;
    const accepted = [
      `/${article.language}/guides/${article.slug}`,
      ...(article.language === "en"
        ? [`/guides/${article.slug}`, `/blog/${article.slug}`]
        : []),
    ];
    if (!owned(article.canonical) || !accepted.includes(canonical)) reject();
    const ownRoutes = new Set<string>();
    for (const address of [article.canonical, ...(article.aliases ?? [])]) {
      if (
        !owned(address) ||
        !/^\/(?:en\/|it\/)?(?:guides|blog)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
          new URL(address).pathname,
        )
      )
        reject();
      ownRoutes.add(route(address));
    }
    for (const path of ownRoutes) {
      if (routes.has(path)) reject();
      routes.add(path);
    }
  }
  if (
    new Set(snapshot.articles.map((a) => `${a.language}/${a.slug}`)).size !==
      snapshot.articles.length ||
    new Set(snapshot.pages.map((p) => p.path)).size !== snapshot.pages.length
  )
    reject();
  for (const page of snapshot.pages) {
    if (
      !owned(page.canonical) ||
      !publishablePaths.includes(new URL(page.canonical).pathname)
    )
      reject();
    if (
      new Set(page.alternates.map((a) => a.language)).size !==
      page.alternates.length
    )
      reject();
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
  return snapshot;
}
export const snapshotSchema = z.unknown().transform((value, context) => {
  try {
    return validateSnapshot(value);
  } catch {
    context.addIssue({
      code: "custom",
      message: "Invalid website publication snapshot",
    });
    return z.NEVER;
  }
});
