# Regiondo native booking — build log

Running decision log for the replacement of the Regiondo iframe/widget embeds with a
native, API-driven booking experience. Appended to as work proceeds; each phase ends
with a self-check block and its results.

Ground rule for this file: **no key material, ever.** Public identifiers (product IDs,
tag IDs, supplier ID, widget IDs) are fine — they are visible in page source today.

---

## Phase 1 — Recon

### 1a. The API

Source of truth: `https://sandbox-api.regiondo.com/api.json` (OpenAPI 3, v1.26.02.23,
47 paths). The same document is served from the live host. Read in full; the PDF and
support article were not reachable (support.regiondo.com returns 403 to non-browser
clients), so the spec plus the `regiondo-dev/api` reference client are the basis.

#### Auth — verified against live, first attempt

```
X-API-ID:   <public key>
X-API-TIME: <unix seconds, UTC>
X-API-HASH: hex HMAC-SHA256( key = private key,
                             message = time + publicKey + http_build_query(params) )
Accept-Language: <locale, e.g. en-US>
```

The brief's description was correct. The subtlety is real and worth restating: the
string that is **signed** must be byte-identical to the query string that is **sent**,
and PHP's `http_build_query` is not `URLSearchParams`:

| Input | PHP `http_build_query` | JS `encodeURIComponent` |
|---|---|---|
| space | `+` | `%20` |
| `~` | `%7E` | `~` (unescaped) |
| `!` `*` `'` `(` `)` | percent-encoded | unescaped |
| `{a:{b:1}}` | `a%5Bb%5D=1` | n/a |

Working encoder (verified live):

```js
const enc = (s) =>
  encodeURIComponent(String(s))
    .replace(/[!'()*~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+');
```

Insertion order is preserved and is part of the signature, so the param object's key
order matters. This is the single highest-risk piece of the integration and is being
built with unit tests first.

#### Confirmed by live probe

- Base URLs: `https://api.regiondo.com/v1/` (live), `https://sandbox-api.regiondo.com/v1/`.
- `GET /account/currency` → base currency **EUR**.
- `GET /account/locale` → 13 locales; **en-US** is present and is our default.
- Bad signature → HTTP **401** with a German message body. Do not string-match on it.
- `suppress_response_code=true` → HTTP **200** carrying `{"code":404,"message":"..."}`.
  Both shapes must be handled.
- Rate limits (from the spec preamble): **50,000/24h, 2,083/hour, 157/5min**; breach
  blocks for at least 5 minutes. **No rate-limit headers are returned** — we track locally.
- Pagination: `{data: [...], page: {first,before,previous,current,last,next,total_pages,total_items,limit}}`.
  `limit` max 250, default 10; `offset` for the start.
- `sandboxauth` is a global query param that lets the *sandbox* host authenticate on the
  public key alone. Irrelevant to us (see below) and must never be sent to live.

#### No sandbox account

`REGIONDO_SANDBOX_PUBLIC_KEY` / `REGIONDO_SANDBOX_PRIVATE_KEY` are empty, and the live
key pair is rejected by `sandbox-api.regiondo.com` with **403**. Treating this as the
brief's "no sandbox" branch: build the checkout to spec, exercise everything up to but
not including a purchase, mock the purchase/checkout-link responses from the documented
schema, leave live verification to the cutover checklist. **No booking will be created.**

#### Account facts derived from the API (written into `.env.local`)

| Var | Value | Source |
|---|---|---|
| `REGIONDO_VENDOR_ID` | `46886` | `product_supplier_id` on every product; matches the `46886-…` prefix in the old calendar-widget embed in git history |
| `REGIONDO_CURRENCY` | `EUR` | `GET /account/currency` (`is_base: 1`) |
| `REGIONDO_DEFAULT_LOCALE` | `en-US` | `GET /account/locale`; the site is English-only |
| `REGIONDO_WIDGET_OFFER_IDS` | the 11 live product IDs | `GET /products?limit=250` |

Vendor categories are **tags**, not `/categories`: `GET /tags` returns exactly two —
`45420` "Shared Tours from Venice" and `45421` "Private Tours from Venice".
`GET /categories` is Regiondo's global marketplace taxonomy (Leisure Activities, Sport,
Culinary, …) and is not ours to browse by.

#### Catalog snapshot (11 products, all active, all EUR)

| ID | url_key | Tag | Duration | Rating | Reviews | base_price |
|---|---|---|---|---|---|---|
| 298188 | dolomites-and-prosecco-hills-day-trip-with-wine | private | 10h | 100% | 1 | 999.00 |
| 298190 | dolomites-day-trip | shared | 9h | 100% | 2 | 159.00 |
| 300877 | the-best-of-the-dolomites-mountains-day-trip | shared | 10h | 90% | 7 | 115.00 |
| 307882 | from-venice-tour-of-the-prosecco-hills-with-wine-food | shared | 7h | — | 0 | 149.00 |
| 326843 | from-jesolo-cavallino-best-dolomites-day-trip | *(untagged)* | 10h | — | 0 | 1,600.00 |
| 326844 | from-jesolo-cavallino-prosecco-hills-tour-with-wine | *(untagged)* | 5h | — | 0 | 1,200.00 |
| 326845 | from-venice-best-prosecco-hills-and-wine-tasting | shared | 5h | — | 0 | 129.00 |
| 339660 | from-venice-via-ferrata-…-with-alpine-guide | private | 12h | — | 0 | 2,000.00 |
| 341596 | from-venice-via-ferrata-…-with-alpine-guide | private | 12h | — | 0 | 2,200.00 |
| 341597 | from-venice-dolomites-lake-braies-and-tre-cime-di-lavaredo | shared | 9h | — | 0 | 179.00 |
| 341599 | from-venice-trip-to-medieval-hill-towns-with-wine-spritz | shared | 5h | — | 0 | 700.00 |

Two things fall out of this table and drive design decisions:

1. **`url_key` is not a safe slug source.** 339660 and 341596 report the *identical*
   `url_key`, and it is stale on 339660 (that product is the Lake Sorapis hike, not a
   via ferrata). `url_key` is also editable in the Regiondo dashboard, so an indexed
   URL could disappear without a deploy. → checked-in slug registry (see D-003).
2. **`base_price` is a formatted string with a thousands separator** (`"1,600.00"`).
   Naive `Number()` yields `NaN`; naive `parseFloat` yields `1`. The zod boundary has
   to strip separators explicitly. Same for `original_price` and `regiondo_price`.

Two products (326843, 326844 — the Jesolo/Cavallino pair) carry **no tag**, so a
tag-only catalog would silently hide them. The catalog index queries untagged.

#### Response shapes worth recording

- `GET /products/{id}` embeds the full availability calendar inline
  (`variations[].available_dates`, ~84 dates for one product). That makes the detail
  payload large *and* mixes live data into an otherwise cacheable response. Decision:
  cache the product, **discard the embedded dates**, and read availability from the
  uncached `GET /products/availabilities/{variationId}`.
- `GET /products/availoptions/{variationId}` returns an **object keyed by option id**,
  not an array. Requires `time` as `HH:MM`; `HH:MM:SS` returns
  `400 "Parameter(s) has wrong format. Please check time."` — easy to get wrong given
  that `availabilities` hands back `08:00:00`.
- Options are the participant tiers, and carry live stock:
  `{option_id, variation_id, name, original_price, regiondo_price, vat_percentage_val,
  min_qty_to_sell, max_qty_to_sell, capacity, qty_left, duration_value, duration_type,
  booking_notice_period}`. `qty_left` genuinely moves with the date/time filter.
- `GET /reviews?product_id=` returns real reviews — title, detail, nickname, created_at,
  and `vote_details[]` with both `percent` (0–100) and `value` (1–5), plus supplier
  `responses[]`. **`AggregateRating` JSON-LD is therefore legitimate** for the three
  products that have reviews, and must be omitted for the eight that do not.
- Product detail is rich enough for real SEO: `meta_title`, `meta_description`,
  `ticket_highlights` (newline-separated), `faq_included` / `faq_not_included` /
  `faq_customer_requirements` / `faq_other_info` (HTML), `location_name`,
  `location_specific_info`, `geo_lat`/`geo_lon`, `timezone`, `booking_notice_period`,
  `duration_type`/`duration_values`, `image_sort_order[]` (url + thumbnail + position).
- HTML arrives in `short_description`, `description`, `meta_description` and every
  `faq_*` field. Must be sanitised before rendering, and stripped before use in
  `<meta>` tags.

#### Checkout surface

`POST /checkout/hold` takes a `CartItem` (`product_id`, `option_id`, `date_time`, `qty`)
plus `reserve_minutes` (default 20, max 60) and `collect_totals=true`, and returns the
reservation code **together with** `totals`, `contact_data_required`,
`buyer_data_required` and `attendee_data_required` — one call gives us both the stock
hold and the API-driven form definition. `POST /checkout/orderoptionfields` returns the
same field definitions without holding stock; probed live for product 298190 it returns
First name / Last name / Email / Telephone, each with
`{field_id, type, view_type, required}`. The checkout form is generated from this, not
hardcoded.

Note `GET /checkout/hold` lists **all** active holds for the account, not per-session —
reservations are account-global. Our session cookie is the only thing binding a hold to
a browser, so the cookie must be `httpOnly` and a reservation code in a URL must never
by itself grant access to the checkout.

### 1b. The codebase

Next **16.3.1** / React 19.2.8, App Router, TypeScript `strict`, pnpm, Biome, Tailwind
**v4 CSS-first** (all config in `app/globals.css`; there is no `tailwind.config`).
English-only, no i18n, no middleware, no tests, no CI. Hosting is Vercel-shaped
(Node runtime everywhere, no `export const runtime`).

**`cacheComponents: true` is on.** This is the single most important codebase fact:
PPR is the default, `export const dynamic` / `revalidate` are rejected, the opt-out
idiom is `export const instant = false`, and caching is expressed with `"use cache"` +
`cacheLife()` + `cacheTag()`. Existing `cacheLife` profiles: `blog`, `reviews`.

Regiondo touchpoints inventoried:

| # | Where | What |
|---|---|---|
| 1 | `components/group-tours-regiondo-widget.tsx` → `/tours/group-tours` | `<product-catalog-widget widget-id="7365a711-…">` + `widgets.regiondo.net/catalog/v1/catalog-widget.min.js`, injected via `dangerouslySetInnerHTML`, **ungated by cookie consent** |
| 2 | `components/landing/escape-landing-page.tsx` → `/lp/from-venice` | iframe of `prosecco-experience.regiondo.com/categories?tag=escape-venice-for-a-day` |
| 3 | same component → `/lp/from-jesolo-cavallino` | iframe, tag `escape-from-jesolo-cavallino` |
| 4 | `app/api/regiondo-proxy/route.ts` | server-side HTML rewriter the iframes load through |
| 5 | `app/globals.css` (`.rcw-*` z-index rules) | dead shims for the *old* calendar widget |
| 6 | `lib/privacy-policy.ts` | names Regiondo GmbH as a processor for embedded widgets |

Brand tokens extracted (oklch): `--primary 70.1% 0.081 189` teal · `--secondary 0.88 0.081 189`
· `--accent 66.9% 0.163 13` coral · `--background 0.99 0.005 85` · `--foreground 0.25 0.015 60`
· `--muted 0.95 0.01 85` · `--border 0.9 0.01 85` · `--radius 0.5rem`. Inter via `next/font`.
Buttons/cards `rounded-xl`, feature cards `rounded-2xl`, badges `rounded-full uppercase`,
sections `py-16`/`py-20`, `container mx-auto px-4`, grids `md:grid-cols-2 lg:grid-cols-3 gap-6`.

---

## Decisions

Format: **D-nnn** — decision · rationale · how to reverse.

### D-001 — Payment goes through Regiondo's hosted ticketshop. No card data touches us.

`REGIONDO_PAYMENT_MODE=hosted`, and the API independently confirms it: the payment code
enum on `POST /checkout/purchase` is `api_external | cashregister | invoice | no_payment`
— all of which mean "money was collected elsewhere". There is no reachable consumer
card-capture path (the legacy `PaymentDataCreditcard` schema is orphaned; no payment code
selects it). `GET /checkout/checkoutlink?reservation_code=…&store_locale=…` returns a URL
into Regiondo's own ticketshop, which takes the payment.

So the flow is: hold → collect contact data → server-recomputed totals → redirect to the
checkout link. We never call `POST /checkout/purchase` for a consumer booking, and no
card data reaches our origin, our server, or our JS. The compliance boundary in the brief
is satisfied by construction rather than by care. **No escalation needed.**

*Reverse:* nothing to reverse — this is the only compliant option the API offers.

### D-002 — No existing URL changes; therefore no redirect map.

The widgets are embeds *inside* our pages, not URLs of their own. `/tours/group-tours`,
`/lp/from-venice` and `/lp/from-jesolo-cavallino` keep their paths and their meaning;
only their contents change. New surface is additive: `/tours`, `/tours/private-tours`,
`/tours/[slug]`, `/book/*`.

*Reverse:* flip `REGIONDO_NATIVE_BOOKING` off — every page renders exactly as today.

### D-003 — Tour slugs come from a checked-in registry, not from `url_key`.

`lib/regiondo/slugs.ts` maps hand-written slug → product ID. Driven by the two facts in
the catalog table above: `url_key` collides today, and it is dashboard-editable, so an
indexed URL could break without a deploy. A build-time assertion fails on a missing slug,
a duplicate slug, or a slug that collides with an existing static `/tours/*` segment.
Unknown products fall back to `/tours/p-<id>` so a newly added tour never 404s.

*Reverse:* the registry is one file; swapping it for `url_key` is a one-function change.
Reversing it *after indexing* is not cheap, which is exactly why it is a reviewed
decision rather than a derived one.

### D-004 — `/tours/group-tours` becomes the "Shared Tours from Venice" collection.

The page's own copy, its `<h1>` and the nav label all say group/shared tours, and tag
45420 is literally named that. The widget currently shows a wider set, so this narrows
the page — deliberately, and with links out to `/tours` (everything) and
`/tours/private-tours`.

*Reverse:* one constant in the page's config selects the tag, or `null` for "all".

### D-005 — Mutations are Server Actions, not Route Handlers.

The repo's one existing form posts to a route handler (`app/api/travel-agency/route.ts`),
so this is a deliberate departure. Reasons: Server Actions get Next's origin/action-ID
checking for free (CSRF is otherwise ours to build), they expose no public JSON endpoint
for someone to hammer hold-creation against, and they degrade without JS. Catalog reads
stay in Server Components with no action layer at all. The one Route Handler added is
`/api/regiondo/revalidate`, which is machine-called and needs a shared secret rather than
an origin check.

*Reverse:* each action is a thin wrapper over `lib/regiondo/checkout.ts`; re-exposing
them as route handlers is mechanical.

### D-006 — Availability, options, totals and holds are never cached.

Catalog data (`/products`, `/products/{id}`, `/tags`, `/reviews`) gets `"use cache"` with
a new `catalog` `cacheLife` profile and per-product/per-tag `cacheTag`s. Everything that
represents live stock or money is fetched fresh on every request and rendered inside
`<Suspense>` so it never blocks the static shell. The embedded `available_dates` in the
product detail response is discarded rather than cached, for the same reason.

*Reverse:* per-function; each cached wrapper is separate from its uncached counterpart.

---

## Open items carried into later phases

- **The hosted checkout has no return URL.** `GET /checkout/checkoutlink` accepts only
  `reservation_code`, `store_locale`, `currency`. The customer therefore finishes on
  Regiondo's domain and is not returned to `/book/confirmation`, so a client-side
  `purchase` event cannot be guaranteed. `/book/confirmation` is still built in full and
  still server-verifies the order before rendering or firing anything; whether it is
  *reached* automatically depends on a ticketshop return-URL setting in the Regiondo
  dashboard, which becomes a cutover checklist item. To be re-tested in Phase 2 by
  inspecting a real checkout link.
- **Regiondo's image CDN caps at 600×400** (`-cropped600-400`; `-thumbnail-360x240` for
  thumbs; `-cropped1200-800` and the bare filename both 404). Fine for cards, soft for a
  full-bleed hero. Detail-page heroes will be laid out to respect that ceiling.
- **`/products` has no duration filter or sort.** Duration is a product field, so that one
  facet is a server-side post-filter over the fetched page. Trivial at 11 products;
  documented so it is not mistaken for an oversight.
- **The `/lp/*` iframe tags are not API tags.** `escape-venice-for-a-day` and
  `escape-from-jesolo-cavallino` are whitelabel-shop categories; `GET /tags` knows
  nothing of them. LP product sets will be explicit ID lists in config.
- **`GET /supplier/bookings` exposes 12,146 bookings with full customer PII** (name,
  email, phone) and signed receipt-PDF links. Server-only, queried by order number, and
  only the fields the confirmation page renders are ever passed to a component.
- `app/api/regiondo-proxy/route.ts` fetches an arbitrary caller-supplied `url` with no
  host allowlist and serves the result from our origin — an open proxy / SSRF surface.
  Out of scope to fix here; it is on the deletion list once the iframes are gone, and is
  flagged separately so it does not get lost if this project stalls.

## Housekeeping

- `.gitignore` already carries `.env*` with `!.env.example` — verified, no change needed.
- No key material appears in this log, in fixtures, in commit messages or in code.
