import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BlogBody } from "@/components/blog/blog-body";
import { snapshotSchema } from "@/lib/seo/contract";
import { sampleSnapshot, rehash, fixtureSite } from "@/lib/seo/__tests__/fixture";
import { publicationOrigin } from "@/lib/seo/config";
import { blogPosts, blogCategories, pageOfPosts } from "../projection";

function snapshot() {
  const value = sampleSnapshot();
  const { coverImage, ...article } = value.articles[0];
  value.articles[0] = { ...article, canonical: `${fixtureSite}/blog/${article.slug}`,
    blog: { author: { name: "Cristiano", bio: "Founder of beaVita." }, categories: [{ slug: "our-story", title: "Our Story" }], inlineImages: [] },
    modifiedAt: "2026-09-26T09:00:00.000Z", aliases: [article.canonical], coverImage };
  return rehash(value);
}
describe("published blog feed", () => {
  it("validates the engine's presentation fields, author, original dates and known aliases", () => {
    const feed = snapshotSchema.parse(snapshot());
    const post = blogPosts(feed)[0];
    expect(post).toMatchObject({ publishedAt: "2026-09-19T12:00:00.000Z", modifiedAt: "2026-09-26T09:00:00.000Z", canonical: `${fixtureSite}/blog/planning-dolomites`, author: { name: "Cristiano" } });
    expect(blogCategories([post])).toEqual([{ _id: "our-story", slug: "our-story", title: "Our Story" }]);
    for (const alias of ["https://outside.example/guides/old", `${fixtureSite}/about`, `${fixtureSite}/blog/old?x=1`]) {
      const invalid = snapshot(); invalid.articles[0].aliases = [alias];
      expect(snapshotSchema.safeParse(rehash(invalid)).success).toBe(false);
    }
  });
  it("paginates without omitting posts and clamps pages after a publication is removed", () => {
    const p = blogPosts(snapshot())[0];
    const posts = Array.from({ length: 20 }, (_, i) => ({ ...p, _id: `post-${i}`, slug: `post-${i}` }));
    const pages = [1, 2, 3].flatMap((page) => pageOfPosts(posts, { page }, 9).posts);
    expect(pages.map((p) => p._id)).toEqual(posts.map((p) => p._id));
    expect(pageOfPosts(posts, { page: 100 }, 9).posts).toHaveLength(2);
    expect(pageOfPosts(posts, { page: 1, category: "other" }, 9).posts).toHaveLength(0);
  });
  it("preserves inline photos while refusing unknown images and raw executable HTML", () => {
    const url = "https://images.example/photo.webp";
    const html = renderToStaticMarkup(createElement(BlogBody, {
      value: `Text.\n\n![Photo](${url})\n\n![Unknown](https://evil.example/pixel)\n\n<script>alert(1)</script>`,
      images: [{ url, alt: "Photo", width: 800, height: 600 }],
    }));
    expect(html).toContain("<figure"); expect(html).toContain("Photo</figcaption>");
    expect(html).not.toContain("<p><figure"); expect(html).not.toContain("evil.example"); expect(html).not.toContain("<script");
  });
  it("pins production canonicals and allows an isolated preview origin only in preview mode", () => {
    expect(publicationOrigin({})).toBe(fixtureSite);
    const env = { SEO_DELIVERY_MODE: "preview", SEO_PREVIEW_SITE_URL: "https://blog-staging.up.railway.app" };
    expect(publicationOrigin(env)).toBe(env.SEO_PREVIEW_SITE_URL);
    expect(() => publicationOrigin({ ...env, SEO_DELIVERY_MODE: "live" })).toThrow();
    expect(() => publicationOrigin({ ...env, VERCEL_ENV: "production" })).toThrow();
    expect(() => publicationOrigin({ ...env, SEO_PREVIEW_SITE_URL: fixtureSite })).toThrow();
  });
});
