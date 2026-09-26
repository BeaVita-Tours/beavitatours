# Blog integration

The public blog uses `/blog` and `/blog/{slug}`. Alex's layout and components are retained; published content comes from the SEO workspace instead of Sanity. The client edits, reviews and publishes from **SEO Articles** in the Bea Vita operations app. The SEO workspace is the internal editorial engine.

## Delivery

`lib/seo/client.ts` caches the authenticated, validated publication snapshot. `lib/blog/projection.ts` maps published revisions onto the existing card and article view models. Index, category, article, related stories and sitemap use that same snapshot. Drafts, approval notes and factual sources are never exported.

Publication calls `POST /api/seo/connection`, which validates the new snapshot before expiring its cache tag. The following authenticated GET confirms the content hash. Repeated client requests reuse their idempotency key; updates retain the article URL and original publication date. The homepage falls back if the feed is unavailable; failed blog fetches are not cached as empty content.

## Configuration

Use the existing server-only variables `SEO_DELIVERY_MODE=live`, `SEO_STUDIO_URL`, `SEO_STUDIO_READ_TOKEN` and `SEO_REFRESH_SECRET` in production. Read and refresh tokens must be different. No Sanity variables, dataset, webhook or Studio login are used by the app.

An isolated Railway website preview uses `SEO_DELIVERY_MODE=preview` and `SEO_PREVIEW_SITE_URL` set to its staging origin. The matching SEO staging service uses `STAGING_WEBSITE_URL`, `STAGING_WEBSITE_READ_TOKEN` and `STAGING_WEBSITE_REFRESH_SECRET`. Its staging entry point pins a separate staging database and rejects production publisher credentials. Preview pages are noindex and robots disallow crawling.

## Content and images

The approved revision includes its author, biography, categories and trusted inline image registry. Body and biography render as Markdown with raw HTML omitted. Only images in the revision's registry render in the body. Uploaded photos live in the SEO workspace photo bucket; they do not depend on Sanity. The client app delivers its private preview images through its authenticated image proxy.

The original publication timestamp determines display order and the date shown to readers. Each later publish supplies a separate modified timestamp. Canonical URLs, Open Graph, BlogPosting data and sitemap entries use `/blog`. `/guides` redirects to `/blog`; an individual old guide redirects only if the feed records that address as a previous publication alias. Unknown articles return 404. `/studio` and the old Sanity revalidation route are removed.

## Migration

Export the published stories before cutover. The engine's `server/blog-import.ts` converts known Portable Text blocks without rewriting text; unsupported blocks or unmigrated images stop the import. `article.import-blog` requires an administrator and creates a private, reviewable draft. Stable source IDs make retries idempotent and prevent overwriting subsequent edits. Enable `/blog` through `website.blog.enable` only when the website release and matching client proxy are ready.

Otti and Miami keep their original slugs, September 23 and 25, 2026 publication dates, public bylines, photos and formatting. Keep the export and prior deployments for rollback. Test both stories in staging through the client app before migrating the already public originals into the production feed.

## Checks

Run `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm check:secrets`. The build needs the site's existing Resend configuration; use a deliberately invalid preview-only key for isolated builds, never real outbound email credentials in tests. `pnpm exec playwright test e2e/seo.spec.ts` tests publication, immediate refresh, withdrawal, redirect and outage behavior against local fixtures.
