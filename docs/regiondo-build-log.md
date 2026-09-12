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

---

## Phase 2 — API wrapper layer

Shipped `lib/regiondo/`: `config`, `signing`, `client`, `errors`, `schemas`, `sanitize`,
`map`, `types`, `slugs`, `cache`, `products`, `checkout`, plus `__tests__/` with scrubbed
live fixtures. 114 unit tests, 5 live tests (opt-in), typecheck and lint clean.

### The spec is wrong in four places, and the live round trip is how we found out

Schemas written from `api.json` alone failed on first contact with the real API. All four
divergences are now covered by fixtures in `lib/regiondo/__tests__/fixtures/` and asserted
in `checkout-shapes.test.ts`, so a future edit cannot silently reintroduce them.

| # | Spec says | Live returns | Consequence |
|---|---|---|---|
| 1 | `reservation_data` is `array<reservationCode>` | a single **object** on POST and PUT `/checkout/hold` (GET does return an array) | the hold call threw a schema error and left a dangling reservation |
| 2 | `TaxTotals` has `{amount, percent}` | `{title, value}` | tax silently read as `null` |
| 3 | `/checkout/checkoutlink` returns an array | a single **object** | the payment handoff would have thrown |
| 4 | `fieldData` always has `view_type` | absent from `buyer_data_required` on `/checkout/hold` and `/checkout/totals` (present on `/checkout/orderoptionfields`) | no semantic hint, so no `type="email"` and no `autocomplete` |

Two more behaviours worth knowing:

- **`reservation_end` is local wall-clock time in `timezone`**, not an instant:
  `"2026-09-06 23:03"` with `"Europe/Berlin"`. Reading it as UTC puts a 20-minute hold
  one or two hours out and makes the countdown nonsense. `holdExpiryToIso()` converts it
  via `Intl.DateTimeFormat`, in two passes so it stays exact across a DST boundary.
- **`subtotal` is net and `grand_total` is gross** (144.5455 + 14.4545 = 159.00). The
  customer-facing price is `grand_total`.

### D-007 — env validation is strict, but only when the flag is on

`REGIONDO_NATIVE_BOOKING` off (the default) yields an inert config instead of throwing.
The brief asked for a schema that fails at build rather than at runtime, and it does —
but only once the feature is switched on. Failing every build that lacks Regiondo
credentials would break `next build` for anyone who has not been given the keys, a
regression against how `lib/sanity/client.ts` already behaves. With the flag on, a missing
key is a build failure, which is where the requirement actually bites.

*Reverse:* delete the `if (!enabled)` branch in `lib/regiondo/config.ts`.

### D-008 — the confirmation page cannot be reached automatically

Now settled by observation rather than inference. A real checkout link looks like:

```
https://prosecco-experience.regiondo.com/checkout/apireservation/index/keys/<code>/currency/eur
```

Path-based, **no query string at all** — so there is no return-URL parameter to set and
nowhere to smuggle one. The customer completes payment on Regiondo's whitelabel shop (the
same host the current `/lp/*` iframes point at) and lands on Regiondo's own confirmation
page.

`/book/confirmation` is still built in full and still verifies the order server-side before
rendering or firing anything. What it cannot do is guarantee it is *reached*. That depends
on a return-URL setting in the Regiondo ticketshop dashboard, which is now a cutover
checklist item rather than something code can fix.

*Reverse:* n/a — an upstream limitation, recorded so nobody re-litigates it.

### D-009 — a fixed test product for the write path

The live round trip holds one seat on product 298190 (shared Dolomites day trip, capacity
40, ~25 free) and releases it in a `finally`. High capacity means a briefly-held seat
cannot plausibly cost a real sale.

*Reverse:* two constants at the top of `live-roundtrip.test.ts`.

### Surprises

- **A schema failure left a dangling hold.** `createHold` threw *after* Regiondo had
  already reserved the seat, so the test's `finally` never ran — `reservationCode` was
  still null. Found it with `GET /checkout/hold`, released it, confirmed the account was
  clean. Worth remembering: a hold exists from the moment Regiondo answers, not from the
  moment our code accepts the answer. The account-wide hold list is the safety net and is
  the first thing to check if one ever leaks.
- **`head -N` on a probe script kills it via SIGPIPE**, which is how the *second* dangling
  hold happened — the release never ran. Probes that create state now write to a file and
  are read afterwards.
- **`cacheLife()` throws outside a Next build** ("only available with the `cacheComponents`
  config"), so every `"use cache"` wrapper was untestable under Vitest. Aliased
  `next/cache` to a stub; `"use cache"` is just a string literal to Vitest, so the cached
  functions run as ordinary async functions and the request/parse/map path is still what
  gets tested.
- **`fromHttpStatus` conflated two different numbers.** It overwrote the transport status
  with the code it was classifying on, so a `suppress_response_code=true` response logged
  as HTTP 404 when the wire status was 200. Caught by a test written against the real
  fixture. Now `status` is the wire status and `code` is Regiondo's.
- **`payments_available` settles D-001 beyond doubt**: `reservation`, `cashregister`,
  `invoice`, `api_external`. The one card-shaped entry is `paid_cc` — a bookkeeping label
  *under* `cashregister`, for recording a card taken in person on a terminal. Nothing in
  the API accepts a card number.
- **`/products/availoptions` wants `time` as `HH:MM`.** Passing the `HH:MM:SS` that
  `/products/availabilities` returns gives
  `400 "Parameter(s) has wrong format. Please check time."` The wrapper trims it centrally.

### Self-check results

| Check | Result |
|---|---|
| Signing unit tests against PHP `http_build_query` vectors | **pass** — 22 tests; the live API accepted the first signed request |
| Live round trip: collections → products → product + variations + options + availability → hold → totals → prolong → checkout link → release | **pass** — `REGIONDO_LIVE_TESTS=1 pnpm test`, 5 tests, ~4.4s |
| Every consumed endpoint has a zod schema and a fixture test | **pass** — 22 fixtures, all scrubbed |
| Error mapping: stock unavailable, expired reservation, invalid signature, 429 | **pass** — 38 tests, including the real 401 and both suppressed-status bodies |
| No private key in the build output | **pass** — `pnpm check:secrets`: 8 secrets checked against 611 build files, none present |
| `tsc --noEmit`, `biome check`, `next build` | **clean** |
| Holds left open on the account afterwards | **none** — `GET /checkout/hold` returns `{"data": []}` |

No booking was created. `POST /checkout/purchase` was never called, and it is not wrapped.

---

## Phase 3 — Server boundary

### D-010 — Catalog reads in Server Components, mutations in Server Actions

Catalog data is read directly in Server Components with no action layer: there
is no round trip for something the server can already render. Every mutation —
create hold, prolong, release, proceed to payment — is a Server Action.

The repo's one existing form posts to a Route Handler
(`app/api/travel-agency/route.ts`), so this is a deliberate departure. Reasons:
Next checks the request origin and the action id, so CSRF is handled without
hand-rolling a token; there is no public JSON endpoint for someone to hammer
hold creation against; and the forms degrade without JavaScript. The one Route
Handler added is `/api/regiondo/revalidate`, which is machine-called with a
shared secret — an origin check is not the control that applies there.

*Reverse:* each action is a thin wrapper over `lib/regiondo/checkout.ts`.

### D-011 — Booking state in a signed httpOnly cookie

> Superseded by D-019: there is no longer a page of ours between the hold and
> Regiondo's checkout, so there is no session to bind. Kept for the record.

Reservations are account-global on this API (`GET /checkout/hold` lists every
hold on the key), so the cookie is the only thing binding a reservation to a
browser. It is `httpOnly`, `sameSite=lax`, and HMAC-signed, and `/book/[code]`
refuses any code that does not match it. A pasted reservation code opens nothing.

It carries a reservation code, a line item and captured UTM tags — opaque
references only, no customer data. Contact details are validated server-side and
then posted nowhere: Regiondo's hosted checkout collects them again as part of
taking payment, so keeping them here would be data we do not need and must not
store.

The signing key is derived from the Regiondo private key with a distinct info
string rather than adding another secret to manage. Rotating the API key
invalidates in-flight sessions, which last twenty minutes.

*Reverse:* swap `signingKey()` for a dedicated `BOOKING_SESSION_SECRET`.

---

## Phase 4 — Pages and components

Built: `/tours`, `/tours/[slug]`, `/tours/private-tours`, the native
`/tours/group-tours`, `/book/[code]`, `/book/confirmation`, and the `/lp/*` swap.
Components under `components/tours/`. Full route and component inventory is in
`docs/regiondo-integration.md`.

### Cache Components shaped this more than any design preference

Three rules had to be respected explicitly, and each one changed the code:

1. **`generateStaticParams` must return at least one entry.** A live call cannot
   promise that, so the params come from the slug registry instead — which also
   means the build no longer depends on Regiondo being reachable.
2. **Awaiting `searchParams` outside `<Suspense>` makes a whole route
   unprerenderable.** `CatalogView` therefore takes the *promise* and awaits it
   inside the boundary. Awaiting it in the page component cost the entire static
   shell.
3. **`new Date()` in a prerendered path is rejected.** `LiveBookingPanel` calls
   `connection()` first, which is what puts it behind Suspense rather than
   blocking the build.

Result: every tour page and both collection pages build as PPR — static HTML plus
a streamed availability panel. Both `/lp/*` pages became fully static.

### D-012 — `/book/*` is blocking, not streamed

`export const instant = false` on both. Every part of those pages depends on who
is asking — the session cookie, the reservation code, a live totals call — so
there is no meaningful static shell, and streaming a skeleton of a checkout is
worse than waiting a beat for the real thing.

### D-013 — The `/lp/*` pages became Server Components

They were `"use client"` only so they could render the landing shell, which meant
they could not export metadata and inherited the site-wide title verbatim — on
the pages paid traffic lands on. The shell keeps its own `"use client"`; the page
wrappers are now Server Components that pass a server-rendered catalog in as a
`bookingSlot` prop. Hero copy is unchanged, deliberately: A/B and attribution
should not shift underneath a performance change.

### Surprises

- **A `"use server"` file may only export async functions.** `export const IDLE`
  failed at module evaluation, which surfaced as a 500 on the first form
  submission rather than as a build error. Moved to `lib/regiondo/action-state.ts`.
- **The checkout form asked for every field twice.** `/checkout/hold` and
  `/checkout/totals` both return `contact_data_required` (bare names) *and*
  `buyer_data_required` (titled), and for this account they describe the same
  four fields. `mergeFields()` dedupes on the inferred semantic type, keeping any
  field whose type could not be inferred — two unlabelled custom fields are
  genuinely two fields.
- **Order verification was looking up the wrong key.** `/supplier/bookings`
  filters `order_ids` on the *internal* order id, not the public order number, so
  the confirmation page could never find a real order. The right endpoint is
  `GET /checkout/purchase?order_number=` — which, despite an OpenAPI description
  saying it only covers orders placed via the API, resolves any order on the
  account (verified against a live Viator-channel order). It also returns one
  order instead of every booking on the account with full PII attached, and the
  boundary drops the signed ticket-PDF links: the page is reachable with an order
  number alone, and that should not unlock someone's ticket.
- **A pre-existing crash on both `/lp/*` pages.** Commit `bbc3bc4` switched
  `components/ui/dialog.tsx` to the `radix-ui` meta-package and left
  `direct-booking-popups.tsx` importing `@radix-ui/react-dialog` directly. Two
  module instances, two contexts, so `DialogContent` could not see its `Dialog`
  and the page died client-side. Unrelated to this work but blocking it; fixed.
- **`TourCard`'s click overlay escaped its card.** `after:absolute inset-0` with
  no positioned ancestor resolved against the page and covered the filter chips,
  making them unclickable. Found by Playwright, not by reading the JSX.
- **The consent banner covers the booking CTA on a phone.** `fixed bottom-0
  z-50`, directly over the button. Site-wide, pre-existing; the e2e tests
  pre-accept consent and it is on the known-gaps list rather than being quietly
  restyled here.

### Self-check results

| Check | Result |
|---|---|
| `next build` with the flag off | **clean** — every route as before, `/tours*` 404 |
| `next build` with the flag on | **clean** — 11 tour pages + 2 collections as PPR |
| Live flow in a browser | **pass** — hold → checkout → redirect to `prosecco-experience.regiondo.com`, which opens on its Contact step |
| Holds left open afterwards | **none** — released, `GET /checkout/hold` returns `{"data": []}` |
| Real booking created | **none.** `POST /checkout/purchase` never called |
| Confirmation verified against a real order | **pass** — server-side lookup, email masked, PDF links dropped |

---

## Phase 5 — SEO, accessibility, measurement

Numbers and the full analysis live in `docs/regiondo-performance.md`; the honest
gaps are in `docs/regiondo-cutover.md`. Short version:

- Third-party payload down **66%** on the collection page and **62%** on the
  landing page; total transfer down 48% / 42%; requests down 37 / 65. TBT down
  358 ms / 186 ms. The unchanged homepage control moved **0 on every byte
  metric**, which is what makes the rest trustworthy.
- **LCP targets are not met**, and the reason is worth stating rather than
  hiding: the widget and the iframe both loaded below the fold, so they were
  never the LCP element. They cost weight and main-thread time, which is exactly
  what improved. LCP is dominated by ~1 MB of shared script and 872 KB of
  third-party tracking that this project does not touch.
- Accessibility 96 on every new page (the tour page started at 88). Four real
  defects fixed — contrast, an invalid `<dl>`, a label-in-name mismatch, and a
  heading-order jump — plus a site-wide logo `alt` that duplicated its link name.

### D-014 — A second brand teal rather than changing the first

`--primary` (`#5dafa9`) measures 2.57:1 on white and gives white text 2.50:1;
both fail AA. Rather than darken `--primary` — which would restyle every page on
the site — a `--primary-strong` stop (`#2b817b`, 4.66:1 and 4.53:1) was added and
used for small text and the booking CTAs. Recognisably the same brand colour,
just deeper, and nothing already on the site moved.

The shared `Button` default still fails, on every page including ones this
project did not touch. Fixing that is a site-wide restyle and is listed as a gap
rather than smuggled in here.

*Reverse:* delete the token and the handful of class names using it.

### D-015 — E2E runs against a mock, not against live

The two failure modes that cost the most when wrong — sold out mid-checkout and
an expired hold — cannot be produced on demand against the real API without
genuinely selling out a departure, and there is no sandbox. `e2e/mock-regiondo.mjs`
replays captured responses, including all four places the OpenAPI document is
wrong, so the suite fails if the wrapper stops handling them. Thirteen specs,
phone viewport.

`REGIONDO_API_BASE_URL` exists for this and refuses any non-localhost value
outside `NODE_ENV=test`, so it cannot become a way to point production traffic
elsewhere.

*Reverse:* delete `e2e/` and the env var.

### Final self-check

| Check | Result |
|---|---|
| `pnpm test` | **115 passed**, 5 live tests skipped by default |
| `REGIONDO_LIVE_TESTS=1 pnpm test` | **120 passed** — full live round trip, hold released |
| `pnpm test:e2e` | **13 passed** |
| `pnpm typecheck` | clean |
| `pnpm lint` | clean |
| `pnpm build`, flag off and on | clean both ways |
| `pnpm check:secrets` | **no key material in the build output** |
| Rich Results Test | **not run** — needs a public URL. First item on the cutover checklist. |
| Structured data, verified locally | `TravelAgency` site-wide; `Product`+`TouristTrip` with `Offer` on tour pages; `BreadcrumbList` on nested routes; `ItemList` on catalog and landing pages; `AggregateRating` **only** on the three tours with real reviews |

---

## Follow-up — booking upsells on the theme pages

The five hand-written pages under `/tours/*` describe a subject and then hand
the reader to `/rates`, which is a price list rather than something you can
book. Each now carries the departures that actually deliver its subject, between
the editorial copy and the existing CTA.

### D-016 — Curated product ids, not a keyword query

The API's `kwd` search does work — verified live, `dolomites` returns 8 products,
`prosecco` 5, `wine` 6, `medieval` exactly the two hill-town tours. (An earlier
probe reported zero for everything; that probe was malformed, not the API.)

But it matches on descriptions, so it is approximate in both directions: a search
for "dolomites" pulls in the Medieval Hill Towns tour because its copy mentions
them, and misses the Jesolo Prosecco departure. On a conversion surface the
membership and the ordering are editorial judgements, so `THEME_UPSELLS` writes
them down — shared and lower-priced departures first, because they are the easier
yes.

The **"see all" link** does use the keyword filter (`/tours?q=dolomites`), so it
keeps working as the catalog grows. Two themes whose curated set is already the
complete set link to `/tours` instead, rather than to a filter that could quietly
return nothing later.

*Reverse:* one exported constant.

### D-017 — The theme pages became Server Components

Required, not incidental: the upsell is server-rendered. They were `"use client"`
only to host `TourTemplate`, which keeps its own directive. The side effect is
that they can finally export metadata — all five had been inheriting the
site-wide title. That metadata applies **with the flag off too**, deliberately;
gating a page title behind a booking flag would be strange.

*Reverse:* the pages are thin wrappers; re-adding `"use client"` and dropping the
`<ThemeUpsell />` line restores them exactly.

### D-018 — Two accessibility fixes in `TourTemplate`, unconditional

`TourCTA`'s teal band gave its near-white text 2.5:1 and its paragraph 2.3:1;
the hero badge measured 3.16:1. All below AA, all pre-existing, all on pages
being edited anyway. Switched to the `--primary-strong` stop introduced in D-014.
The carousel dots were 10×10 px tap targets; the dot still looks the same and the
button around it is now 24 px.

`TourTemplate` and `TourCTA` are used **only** by these five pages, so neither
change touches anything else on the site. Result: 92 → 96 on all five, with only
the known site-wide nav button left failing.

*Reverse:* three class names.

### Surprises

- **The mock's product fixture had only three tours**, so two themes would have
  rendered an empty section under test and nobody would have noticed. Expanded to
  the full catalog of 11, with the live-only fields the wrapper never reads
  stripped out — 6 KB to 16 KB, and several other assertions got stronger for it.
- **`TourGrid` rendered a duplicate heading.** Its screen-reader `h2` repeated a
  visible `h2` wherever a caller already had one — the upsell and the
  related-tours row both did. It now accepts a `headingId` and reuses the
  caller's heading instead.

### Self-check results

| Check | Result |
|---|---|
| `pnpm test` | **125 passed** (was 115) — new invariants: every curated product id exists, no duplicates, no empty theme, every theme resolves to a curated slug, no overlap between the two landing sets |
| `pnpm test:e2e` | **17 passed** (was 13) — upsell renders, "see all" lands on a filtered catalog, a card leads into the booking flow, the content is in the HTML |
| Accessibility, all five theme pages | **96** (was 92–96); only the site-wide nav button remains |
| `next build`, flag on | all five pages **fully static** with the `catalog` profile |
| `next build`, flag off | upsell absent, no tour links, editorial copy unchanged |
| typecheck, lint, `check:secrets` | clean |

---

## Follow-up — one step from "Reserve" to Regiondo (2026-09-12)

### D-019 — No checkout page of our own; the booking panel hands off directly

The flow was hold → `/book/<code>` ("your details": name, email, phone) →
Regiondo's hosted checkout. The client tried it and pointed out the obvious:
Regiondo's page asks for the same details again. It has to — `GET
/checkout/checkoutlink` takes only the reservation code (D-008), so there is no
way to pass what was typed along, and the action was validating the fields and
then discarding them. A form whose only output is the bin is friction.

Now `startBooking` does everything in one request: validate, rate-limit, check
live stock, `POST /checkout/hold`, `GET /checkout/checkoutlink`, and return the
URL. The panel fires `begin_checkout` on submit and `add_payment_info` when the
URL comes back, then navigates — the client navigates rather than the action
redirecting, because a server redirect leaves the page before any event can
be sent. If the checkout link cannot be fetched after the hold, the hold is
released immediately so the retry does not find its own seats taken.

Removed with it: `/book/[code]`, `CheckoutForm`, `HoldCountdown`,
`proceedToPayment`, `refreshHold`, `abandonBooking`, and the signed booking
cookie (`lib/regiondo/session.ts`, D-011) — with no page to guard there is
nothing for it to bind. UTM forwarding to the checkout page went too; the
events fire from the landing page itself now, which is where the tags are.
`/book/confirmation` is unchanged.

Also in this pass, the calendar: always open inline rather than behind a
toggle, opening on the first month that has a departure, available days shown
as filled discs instead of every unavailable day struck through, month changes
animated, and the caption/arrow row laid out on purpose (the arrows had been
absolutely positioned against an ancestor that was not `relative`).

*Reverse:* `git revert` — the removed page and cookie were self-contained.
