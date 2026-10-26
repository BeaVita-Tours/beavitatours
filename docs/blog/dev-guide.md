# Blog — Developer Implementation Guide

How the Sanity-powered blog works under the hood, so you (or a future
maintainer) can extend it with confidence. It assumes familiarity with Next.js
App Router and Tailwind; the unusual parts here are **Sanity** and the app's
**Cache Components** configuration.

Quick links:
- [Architecture](#architecture)
- [File map](#file-map)
- [Data flow](#data-flow)
- [Caching & revalidation](#caching--revalidation)
- [The (site) route group](#the-site-route-group)
- [How to extend](#how-to-extend)
- [Common gotchas](#common-gotchas)

---

## Architecture

```
Sanity CMS (hosted)                    Next.js app
 ┌──────────────────┐                 ┌──────────────────────────────────────┐
 │  Documents:      │   GROQ via       │  Server Components / Pages           │
 │  post, author,   │  @sanity/client  │   /blog, /blog/[slug],               │
 │  category        │ ───────────────▶ │   /blog/category/[slug]              │
 │  + Studio UI     │  "use cache"     │                                      │
 └──────────────────┘                  │  /studio  ◀─ embedded Sanity Studio  │
        │  webhook on publish          │    (NextStudio, full-screen)         │
        └──────────▶ /api/revalidate ─▶│  revalidateTag("blog")               │
                                       └──────────────────────────────────────┘
```

- **One deployable app.** The Studio is embedded at `/studio`; content is
  authored there and the same app renders the public blog. No separate studio
  deployment.
- **Server-rendered pages.** All blog pages are Server Components that query
  Sanity directly. The only client JavaScript is the navbar's active-link
  state (see below).
- **Sanity is the source of truth.** The site has no cached copy of content
  beyond Next's built-in data cache, which the webhook busts.

## File map

| Path | Purpose |
|---|---|
| `sanity.config.ts` | Studio configuration (project, plugins, structure, starter template). `"use client"` — browser-only. |
| `sanity.cli.ts` | Sanity CLI config (used by `sanity init`, `sanity deploy`, etc.). |
| `sanity/schemas/post.ts` | Post document schema (title, slug, excerpt, cover, portable-text body, categories, author, publishedAt, SEO group). |
| `sanity/schemas/author.ts` | Author schema (name, slug, portrait, bio). |
| `sanity/schemas/category.ts` | Category schema (title, slug, description). |
| `sanity/schemas/index.ts` | Registers the three schemas. |
| `lib/sanity/client.ts` | Reads env vars, instantiates the typed `@sanity/client` (or `null` when unconfigured). `server-only`. |
| `lib/sanity/queries.ts` | All GROQ queries + `"use cache"` accessors (`getPosts`, `getPost`, `getPostSlugs`, `getCategories`, `getCategory`). **The heart of the feature.** |
| `lib/sanity/types.ts` | Hand-written result types matching the GROQ projections. |
| `lib/sanity/image.ts` | `urlFor()` builder for `@sanity/image-url`. |
| `lib/sanity/format-date.ts` | Date formatting via `date-fns`. |
| `components/blog/post-card.tsx` | Card for the list grid (cover, title, excerpt, author, date, categories). |
| `components/blog/post-list.tsx` | Grid of cards + empty state. |
| `components/blog/pagination.tsx` | Server-rendered pager, preserves `?category=`. |
| `components/blog/category-filter.tsx` | Plain-link filter chips (no client state). |
| `components/blog/portable-text.tsx` | `@portabletext/react` renderer (headings, links, images, code). |
| `components/blog/post-article.tsx` | Full article layout, wraps body in `prose`. |
| `components/blog/post-detail-skeleton.tsx` | Suspense fallback for post pages. |
| `app/(site)/blog/page.tsx` | Blog index (paginated, category filter). |
| `app/(site)/blog/[slug]/page.tsx` | Post detail — statically adopted + `generateMetadata`. |
| `app/(site)/blog/category/[slug]/page.tsx` | Category archive (paginated). |
| `app/studio/[[...tool]]/page.tsx` | Embedded Studio route. |
| `app/api/revalidate/route.ts` | Webhook → `revalidateTag("blog")`. |
| `next.config.ts` | `cacheLife.blog` profile + `cdn.sanity.io` `remotePatterns`. |
| `app/globals.css` | `@plugin "@tailwindcss/typography"` + `@utility prose-blog`. |

## Data flow

1. **GROQ queries** live in `lib/sanity/queries.ts`. Example (the list query):

   ```groq
   *[_type == "post"
     && defined(slug.current)
     && publishedAt <= now()
     && (!defined($category) || $category in categories[]->slug.current)
   ] | order(publishedAt desc)[$start...$end] { ...projection... }
   ```

   Every query filters on `defined(slug.current)` and `publishedAt <= now()`
   so drafts and scheduled posts never leak to the public site.

2. **Typed accessors** wrap each query in `"use cache"` and call
   `cacheLife("blog")` + `cacheTag("blog")`:

   ```ts
   export async function getPosts(opts: { page: number; category?: string }): Promise<PostListResult> {
     "use cache";
     cacheLife("blog");
     cacheTag("blog");
     if (!client) return { posts: [], total: 0 };   // unconfigured → empty
     // ...fetch posts + count in parallel
   }
   ```

3. **Pages** call the accessors. The index page reads `searchParams`
   (`?page=` / `?category=`), the detail page uses `params.slug`, and
   `generateStaticParams` pre-renders every published post slug.

## Caching & revalidation

The app runs with **`cacheComponents: true`** (Next 16 Cache Components), so
old segment exports like `export const dynamic` / `revalidate` are rejected.
The strategy:

| Route | What it does | Segment config |
|---|---|---|
| `/blog` | Reads `searchParams` → pagination/filtering | `export const instant = false` |
| `/blog/category/[slug]` | Reads params + `searchParams` | `export const instant = false` |
| `/blog/[slug]` | Static-friendly; `await params` inside a Suspense leaf | *(adopted — no opt-out)* |
| `/studio` | Fully client-side app | `export const instant = false` |

- The **`blog` cache-life profile** in `next.config.ts` sets: serve stale for
  **1 h**, background-revalidate at most every **1 d**, hard-expire after
  **30 d**. That's the no-webhook fallback.
- The **webhook** (`app/api/revalidate`) calls `revalidateTag("blog")` on
  publish, which invalidates every `"use cache"` blog entry immediately.
- **New posts appear without a redeploy** because `/blog/[slug]` is adopted:
  the cached queries re-resolve, new slugs get generated, and the index page
  is dynamic so it always reflects the freshest cached data.

## The (site) route group

To give `/studio` a full-screen, standalone layout, all public pages were moved
into `app/(site)/` (route groups don't change URLs). The split:

- `app/layout.tsx` — bare shell: `<html>`, fonts, tracking, cookie-consent
  *provider*, global metadata.
- `app/(site)/layout.tsx` — site chrome: `<Navigation/>`, `<Footer/>`,
  consent banner/dialog.
- `app/studio/...` — inherits only the bare shell.

**Why the navbar was refactored:** `Navigation` is a client component that
calls `usePathname()`. Once `/blog/[slug]` became a statically-adopted route
under the `(site)` layout, the nav's `usePathname` would trip
`blocking-prerender-client-hook`. The fix: the pathname is read only inside
small `DesktopNavActive` / `MobileNavActive` leaves, each wrapped in
`<Suspense>` with a fallback that renders the same rows with inactive styling
(color-only — no layout shift). The header shell itself stays static.

## How to extend

- **Add a schema field** → edit `sanity/schemas/post.ts`, add the same field to
  the GROQ projection in `queries.ts`, and extend the type in `types.ts`.
- **Add a new list variant** (e.g. "related posts") → new query + accessor in
  `queries.ts`, render `<PostCard>`s from it.
- **Enable draft previews** → the pieces to add are a `SANITY_API_TOKEN`, a
  `draftMode()` route, and a `perspective: "previewDrafts"` client. Deliberately
  left out of the core build to keep the cache story simple.
- **Change pagination size** → `POSTS_PER_PAGE` in `queries.ts`.
- **Add a search box** → extend the index page with a `?q=` param and a GROQ
  `title match $q` filter, mirroring how `?category=` works.

## Common gotchas

- **GROQ slices are inclusive** (`[$start...$end]` includes both ends) — hence
  `end = start + POSTS_PER_PAGE - 1` in `getPosts`.
- **Don't append `.auto("format")`** in `urlFor` — `next/image` re-encodes;
  the CDN URLs already allow `?w/&q` params, and `remotePatterns` for
  `cdn.sanity.io` is set in `next.config.ts`.
- **`lib/sanity/*` is `server-only`** — never import it from a `"use client"`
  module or the Studio config; `sanity.config.ts` reads env directly.
- **Builds must pass with zero env vars.** `client` is `null` when the project
  isn't configured, so every accessor returns empty, `generateStaticParams`
  returns `[]`, and `/studio` renders a "not configured" notice.
- **Biome** (not ESLint) lints the repo — run `pnpm lint` before committing.
- **Unknown slugs return a soft 404.** `/blog/[slug]` is statically adopted, so
  `await params` lives below a `<Suspense>` boundary. `notFound()` thrown there
  (or in `generateMetadata`) renders the correct 404 page, but because the shell
  is already streaming, the HTTP status is 200 rather than 404. `dynamicParams`
  stays `true` on purpose so newly-published slugs render without a redeploy.
  If a hard 404 status ever matters for unknown slugs, that trade-off is where
  it happens.
