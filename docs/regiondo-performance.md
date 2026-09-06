# Performance and SEO: before and after

Measured, not estimated. Raw Lighthouse output is in
[`perf/before.json`](./perf/before.json) and [`perf/after.json`](./perf/after.json).

## Method

Lighthouse 12.8.2, default **mobile** preset — Moto G Power, 4× CPU throttle,
simulated slow 4G — against a local production build (`next build && next start`).
Same commit both times; the only difference is `REGIONDO_NATIVE_BOOKING`.

Each page was measured **three times and the median reported**, because a single
run on a developer machine is noisy enough to invent a result. Reproduce with:

```bash
REGIONDO_NATIVE_BOOKING=false pnpm build && pnpm start -p 3100 &
node scripts/measure-lighthouse.mjs before
# then rebuild with the flag on and:
node scripts/measure-lighthouse.mjs after
```

**`/` is the control.** Nothing about the homepage changed, so whatever it moves
by is the noise floor for everything else. It moved by **0 on every byte metric**
and −7 ms on LCP, which is what makes the rest of the table worth reading.

---

## Results

| Page | Metric | Before | After | Δ |
|---|---|---|---|---|
| **`/` (control)** | Performance | 71 | 71 | 0 |
| | LCP | 3403 ms | 3396 ms | −7 ms |
| | Total transfer | 1804 KB | 1804 KB | 0 |
| | Third-party | 872 KB | 872 KB | 0 |
| **`/tours/group-tours`** | Performance | 68 | **74** | **+6** |
| | LCP | 2946 ms | 3027 ms | +81 ms |
| | Total Blocking Time | 1232 ms | **874 ms** | **−358 ms** |
| | CLS | 0.004 | **0** | −0.004 |
| | Total transfer | 2834 KB | **1470 KB** | **−1364 KB (−48%)** |
| | Script | 1766 KB | **1004 KB** | **−762 KB (−43%)** |
| | Third-party | 2339 KB | **798 KB** | **−1541 KB (−66%)** |
| | Requests | 89 | **52** | **−37** |
| | Accessibility | 94 | **96** | +2 |
| **`/lp/from-venice`** | Performance | 69 | **72** | **+3** |
| | LCP | 3000 ms | 3320 ms | +320 ms |
| | Total Blocking Time | 1064 ms | **878 ms** | **−186 ms** |
| | Total transfer | 2756 KB | **1604 KB** | **−1152 KB (−42%)** |
| | Script | 1336 KB | **1013 KB** | −323 KB |
| | Third-party | 2078 KB | **798 KB** | **−1280 KB (−62%)** |
| | Requests | 115 | **50** | **−65 (−57%)** |

New pages (no "before" — they did not exist):

| Page | Perf | LCP | TBT | CLS | Third-party |
|---|---|---|---|---|---|
| `/tours` | 71 | 3245 ms | 907 ms | 0 | 798 KB |
| `/tours/venice-dolomites-cortina-misurina-day-trip` | 72 | 2944 ms | 975 ms | 0 | 799 KB |

Both `/lp/*` pages also changed from client-rendered to **fully static**
(`○` in the build output) because they are no longer `"use client"` wrappers.

---

## What the numbers actually say

**The win is weight and main-thread time, not LCP.** Roughly 1.3 MB of
third-party payload and 37–65 requests per page are gone, and Total Blocking
Time dropped 186–358 ms. That is the honest headline.

**LCP is flat, and the < 2.0 s target is not met anywhere.** Two reasons, both
worth stating plainly rather than hiding:

1. *The widget and the iframe were never the LCP element.* Both loaded below the
   fold and lazily. They cost bytes, requests and main-thread time — exactly what
   improved — but the largest paint was always the hero image, which this change
   does not touch. Expecting an LCP win from removing them was the wrong
   expectation.
2. *LCP here is dominated by shared, pre-existing cost.* Every page, control
   included, carries ~1 MB of script and 872 KB of third-party tracking: GTM
   (`GTM-N5H2N2VZ`), Meta Pixel, Google Ads, Umami. TBT sits near 850–900 ms on
   the untouched homepage too. Until that budget is addressed, no page on this
   site will hit LCP < 2.0 s or INP < 200 ms, and nothing in this project could
   have changed that.

`/lp/from-venice` LCP moved +320 ms, which is outside the noise floor and worth
being straight about: the native grid renders real tour photographs in the
viewport where an empty 800 px iframe box used to sit. That is a genuine
trade — content arriving instead of a placeholder — and the −1280 KB and −65
requests on the same page are the compensation.

**INP was not measured.** It needs real interaction and cannot be produced by a
lab run. Total Blocking Time is Lighthouse's own proxy and is reported instead;
inventing an INP figure would have been worse than admitting the gap. Real INP
should be read from field data (CrUX / Vercel Analytics) after the flag is on.

### If the targets matter

The single highest-value change is not in this project: **defer the marketing
tags until interaction or consent.** 872 KB of third-party script loading during
the initial page load is most of the TBT on every page, and Consent Mode already
makes them conditional in behaviour — just not in load. That is a separate piece
of work with its own attribution risks, which is why it was not bundled in here.

---

## SEO

### Before

- Tour content lived inside a widget or a cross-origin iframe, so **none of it
  was in the HTML**. A crawler saw a heading, a hero image and an empty box.
- `/tours` did not exist — six hand-written children, no parent.
- Both `/lp/*` pages were `"use client"`, so they **could not export metadata**
  and inherited the site-wide title verbatim. On paid-traffic landing pages.
- No `Product`, `Offer`, `ItemList` or `BreadcrumbList` markup anywhere.
- The sitemap listed 17 static routes plus blog posts. No tours.

### After

Structured data, verified against the production build:

| Page | Emitted |
|---|---|
| `/` | `TravelAgency` |
| `/tours` | `TravelAgency`, `BreadcrumbList` (2), `ItemList` (11 tours) |
| `/tours/group-tours` | `TravelAgency`, `BreadcrumbList` (3), `ItemList` (6) |
| `/tours/[slug]` | `TravelAgency`, `BreadcrumbList` (3), `Product`+`TouristTrip` with `Offer` and `duration` |
| `/lp/from-venice` | `TravelAgency`, `ItemList` (7) |
| `/book/*` | none — `noindex`, and disallowed in `robots.txt` |

**`AggregateRating` is emitted only where Regiondo returns real reviews.**
Verified both ways: the Dolomites day trip carries
`AggregateRating 5.0 (2)` plus two `Review` objects; the Prosecco tour, which has
no reviews, carries an `Offer` and **no rating markup at all**. Three of eleven
tours qualify. Nothing is fabricated to win a star.

Also now in place:

- `generateMetadata` / `metadata` on every new public route: unique title,
  description, canonical, OG and Twitter cards with real images.
- Dynamic sitemap covering all 11 tours plus `/tours` and `/tours/private-tours`,
  with `lastModified` from each product's own `updated_at` — so a re-crawl is
  prompted by a real edit rather than by every deploy.
- `robots.ts` disallows `/book/`.
- Filter state in `searchParams`, so every filtered view is a real, shareable,
  crawlable URL. All filter controls are links; the catalog needs no client
  JavaScript at all.
- Semantic HTML with one heading hierarchy per page (see accessibility below).

Lighthouse SEO scores are unchanged at 92–100 — but that category only checks
mechanics (title, meta description, crawlability, tap targets), all of which
already passed. It has no opinion about whether the page contains any content,
which is the entire substance of this change.

**Not verified here:** Google's Rich Results Test needs a publicly reachable URL
and cannot run against localhost. It is the first item on the cutover checklist.

### hreflang

The site is English-only with no i18n and no locale routing. `next.config.ts`
permanently redirects the legacy `/en|/it|/zh|/ja` prefixes to their locale-less
paths. The new pages follow the same strategy — a single self-canonical URL
each, no `alternates.languages` — which matches the rest of the site. Regiondo
can serve 13 locales, so multilingual tour pages are possible later, but that is
a site-wide decision rather than something to introduce on eleven pages.

---

## Accessibility

Lighthouse, mobile, same build:

| Page | Before | After |
|---|---|---|
| `/` | 95 | **96** |
| `/tours/group-tours` | 94 | **96** |
| `/lp/from-venice` | 96 | **96** |
| `/tours/[slug]` | — | **96** (88 at first pass) |
| `/tours` | — | **96** |

Four real defects found and fixed, all by running axe rather than by reading the
code:

1. **Contrast.** `--primary` (`#5dafa9`) is 2.57:1 on white and gives white text
   2.50:1 — both below AA. Added `--primary-strong` (`#2b817b`): 4.66:1 on white,
   4.53:1 for white text on it. Used for small text and the booking CTAs;
   `--primary` keeps its existing role so nothing already on the site moves.
2. **Invalid `<dl>`.** `TourFacts` nested `dt`/`dd` two `div`s deep. The icon
   moved inside the `<dt>`.
3. **Label-in-name mismatch.** The date button was labelled "Date" via
   `aria-labelledby` while visibly reading "Mon, 7 September 2026", which breaks
   voice control. Now `aria-describedby`.
4. **Heading order.** Catalog pages jumped `h1` → `h3`; `TourGrid` gained a
   visually-hidden `h2`.

Plus a site-wide fix: the logo's `alt` duplicated its own link's accessible name
on every page.

Keyboard and screen-reader behaviour is covered by e2e specs — the booking panel
is operable without a mouse, the hold countdown announces politely every 30 s
rather than every second, and every form error is associated with its field.

**Remaining, and pre-existing:** every page still reports one `color-contrast`
failure from the shared `Button` default (white on `--primary`, 2.50:1) used by
the nav "Book Now" and the consent banner, and `/` additionally fails on
`ReviewsSection`'s `text-muted-foreground/70` (3.13:1) and its OTA badge links.
Fixing those means changing `--primary` itself, which restyles every page on the
site — out of scope here, listed in the cutover doc's known gaps.
