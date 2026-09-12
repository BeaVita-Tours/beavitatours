# Regiondo integration

How the native booking flow works, why it is built this way, and what to do when
it misbehaves.

For the decisions and the reasoning behind them, see
[`regiondo-build-log.md`](./regiondo-build-log.md). For the numbers, see
[`regiondo-performance.md`](./regiondo-performance.md). For going live, see
[`regiondo-cutover.md`](./regiondo-cutover.md).

---

## The short version

Tours are sold through Regiondo. Until now that meant a JS catalog widget on
`/tours/group-tours` and a proxied iframe of Regiondo's whitelabel shop on both
`/lp/*` pages — none of it crawlable, all of it third-party JavaScript.

Now the site talks to Regiondo's REST API from the server, renders tours as real
pages, and hands off to Regiondo only for payment. No credential and no card
number ever touches the browser.

```
Browser  ─── Server Component ───▶ lib/regiondo ───▶ api.regiondo.com
                                    (signs, parses)
Browser  ─── Server Action ──────▶ lib/regiondo/checkout ──▶ hold / totals
Browser  ◀── 302 ───────────────── checkoutlink ──▶ prosecco-experience.regiondo.com
                                                     (payment happens here)
```

Everything is behind `REGIONDO_NATIVE_BOOKING`. With it off, every page renders
exactly what it rendered before this project existed.

---

## Authentication, and the one thing that will catch you out

Every request carries three headers:

```
X-API-ID    the public key
X-API-TIME  unix seconds
X-API-HASH  hex HMAC-SHA256 over `time + publicKey + query`, keyed with the private key
```

The trap is `query`. Regiondo's reference client is PHP and builds it with
`http_build_query()`, so the server recomputes the signature over a string
produced by **PHP's** encoding rules — which are not JavaScript's:

| value | PHP `http_build_query` | JS `encodeURIComponent` |
|---|---|---|
| `" "` (space) | `+` | `%20` |
| `~` | `%7E` | `~` |
| `!` `*` `'` `(` `)` | percent-encoded | left alone |
| `{a: {b: 1}}` | `a%5Bb%5D=1` | n/a |

PHP's default is `PHP_QUERY_RFC1738`, i.e. `urlencode()`, which escapes
everything outside `[A-Za-z0-9_.-]` and renders a space as `+`.

Two invariants follow, and both are load-bearing:

1. **The string that is signed must be byte-identical to the string that is
   sent.** `buildSignedRequest()` in [`lib/regiondo/signing.ts`](../lib/regiondo/signing.ts)
   returns both from one call for exactly this reason — there is no supported
   way to sign one string and send another.
2. **Key order is part of the signature.** Nothing sorts the params; insertion
   order is preserved as given.

### Debugging a 401

The whole procedure: log `signingMessage(timestamp, publicKey, query)` and
compare it character by character against the query string actually sent. If
they differ, the encoder is the bug. If they match, check the clock — the
timestamp is inside the signature, so clock skew looks identical to a bad key.

Note the API answers a request made in English with a German message
(`"Nicht autorisierte"`). Never branch on the text; branch on `error.kind`.

---

## Layout

```
lib/regiondo/
  signing.ts        HMAC + a faithful http_build_query port. 22 unit tests.
  config.ts         env parsing, base URL, the feature flag
  client.ts         the only place that speaks HTTP: sign, timeout, retry, parse
  errors.ts         one typed error hierarchy; the UI never string-matches
  schemas.ts        zod at the boundary; Regiondo's raw shapes stop here
  map.ts            raw shapes -> domain shapes
  types.ts          domain types (not server-only; client islands import them)
  sanitize.ts       HTML allowlist for supplier-authored copy
  products.ts       catalog reads (cached) + availability/options (never cached)
  checkout.ts       hold, totals, prolong, release, checkout link, order lookup
  cache.ts          cache tags and the revalidation vocabulary
  slugs.ts          the tour URL registry
  collections.ts    account tags, landing-page sets, theme-page upsell sets
  catalog-params.ts the catalog's URL contract
  action-state.ts   shared state shape for the Server Actions
```

### Why `action-state.ts` is its own file

A `"use server"` module may export **async functions only**. Exporting a plain
constant from `app/(site)/book/actions.ts` fails at module evaluation with
"A `use server` file can only export async functions, found object" — which
surfaces as a 500 on the first form submission, not as a build error. The
constant lives outside the action module for that reason.

---

## Caching

Split by one question: does this represent inventory?

| Data | Cached | Why |
|---|---|---|
| `/tags`, `/products`, `/products/{id}`, `/reviews` | `"use cache"` + `cacheLife("catalog")` | changes a few times a year |
| `/products/availabilities`, `/products/availoptions` | **never** | live seat counts |
| `/checkout/*` | **never** | inventory and money |

The `catalog` profile is in `next.config.ts`:

```
stale       5 min   client-side reuse between navigations
revalidate  1 hour  background refresh
expire      1 day   hard ceiling
```

An hour is a compromise. Prices and copy are edited rarely, but when they *are*
edited it is usually because something was wrong, so a day would be too long.
An hour also keeps the catalog to a handful of API calls a day against the
50,000/24h budget.

### One trap worth knowing

`GET /products/{id}` embeds the **full availability calendar** inline
(`variations[].available_dates` — around 84 dates for one product). That is live
stock riding inside an otherwise cacheable payload. `productVariationSchema`
deliberately omits those fields, so zod strips them: the cached product can
never carry a stale calendar. Availability comes from the uncached
`/products/availabilities/{variationId}` instead.

### Invalidation

```bash
curl -X POST "https://beavitatours.com/api/regiondo/revalidate?secret=$REVALIDATE_SECRET&product_id=298190"
```

Omit `product_id` to flush the whole catalog — right after a bulk edit, wrong as
a habit, since it costs a fresh `/products` call per page on the next request.
Tags: `regiondo-catalog`, `regiondo-tour-<id>`, `regiondo-reviews-<id>`,
`regiondo-collection-<tagId>`.

---

## Errors

Two shapes, both real, both handled in `detectError()`:

- **Transport**: `{code, message}` at the HTTP status — or at HTTP **200** when
  `suppress_response_code=true` was sent.
- **Checkout**: `{data: {result, message, available_items, not_available_items}}`
  at HTTP **202**. A 202 is never a success on this API.

`result` maps onto a `kind` the UI can branch on:

| kind | from | retryable | what the UI does |
|---|---|---|---|
| `auth` | 401/403, `partner_unknown` | no | generic apology |
| `validation` | 400/406/422, `wrong_qty`, `wrong_option_id`, `missing_required_data` | no | inline field errors |
| `stock_unavailable` | `stock_not_available`, `reservation_not_possible` | **no** | "pick another date"; shows `available_items` |
| `reservation_expired` | `reservation_not_found`, `wrong_reservation_code` | no | recovery page, form input preserved |
| `not_found` | 404, `incorrect_order_number` | no | lookup form |
| `rate_limited` | 429 | yes | back off |
| `upstream` | 5xx, network | yes | retry, then cached content |
| `timeout` | abort | yes | retry |
| `schema` | zod failure | **no** | our bug, not theirs |

**Retries are on for reads and off for writes.** A retried hold takes a second
set of seats it cannot give back. `/checkout/*` opts out explicitly, and
`stock_unavailable` is marked non-retryable so a backoff loop cannot hammer a
sold-out departure.

`tryRequest()` degrades instead of throwing, so a Regiondo outage renders an
explicit "we cannot reach our booking system" rather than a 500. Anything
touching stock or money must **not** use it — silently pretending a hold
succeeded is far worse than an error page.

---

## The payment boundary

The API's payment codes are `api_external`, `cashregister`, `invoice`,
`no_payment` — all of which mean "money was collected elsewhere". There is no
reachable consumer card-capture path; the `PaymentDataCreditcard` schema in the
OpenAPI document is orphaned, and `payments_available` on a live totals call
returns `reservation`, `cashregister`, `invoice`, `api_external` with the only
card-shaped entry being `paid_cc`, a bookkeeping label for a card taken in
person on a terminal.

So the flow is:

```
POST /checkout/hold?collect_totals=true   reserve stock, get the required fields
POST /checkout/totals                     recompute the price server-side
GET  /checkout/checkoutlink               -> https://prosecco-experience.regiondo.com/...
                                             redirect the customer there
```

**`POST /checkout/purchase` is deliberately not wrapped.** Using it for a
consumer booking would mean taking the card ourselves. No card data reaches this
origin, this server or this JavaScript — not by care, but by construction.

`getCheckoutLink()` additionally refuses to return a URL whose host is not
`*.regiondo.com` or `*.regiondo.de`.

---

## Sessions

There are none. The booking panel's one action holds the places and returns
Regiondo's checkout URL in the same request, and the customer enters their
details on Regiondo's page (D-019). Nothing about a reservation is stored on
our side, and no customer data ever reaches this origin.

Reservations are **account-global** on the API (`GET /checkout/hold` lists
every active hold on the key), which is exactly why no page of ours takes a
reservation code as input any more.

Its signing key is derived from the Regiondo private key with a distinct `info`
string, rather than adding another secret to manage. Rotating the API key
invalidates in-flight booking sessions, which last twenty minutes — a fair trade.

---

## Environment

| Variable | Purpose |
|---|---|
| `REGIONDO_PUBLIC_KEY` / `REGIONDO_PRIVATE_KEY` | HMAC key pair. **Server-only.** |
| `REGIONDO_SANDBOX_PUBLIC_KEY` / `..._PRIVATE_KEY` | Optional. No sandbox account exists for this pair. |
| `REGIONDO_API_ENV` | `live` (default) or `sandbox` |
| `REGIONDO_VENDOR_ID` | `46886` — supplier id, informational |
| `REGIONDO_DEFAULT_LOCALE` | `en-US` |
| `REGIONDO_CURRENCY` | `EUR` |
| `REGIONDO_WIDGET_OFFER_IDS` | the live product ids |
| `REGIONDO_PAYMENT_MODE` | `hosted` — the only value implemented |
| `REGIONDO_NATIVE_BOOKING` | the feature flag. Off by default. |
| `REGIONDO_API_BASE_URL` | **test only.** Refuses non-localhost outside `NODE_ENV=test`. |

Validation is strict but only *enforced* when the flag is on, so a build without
Regiondo credentials still succeeds — matching how `lib/sanity/client.ts`
already behaves. With the flag on, a missing key fails at module load, which
under Next means at build time.

Two guards on the private key:

- `import "server-only"` at the top of every module that can see it, so an
  accidental client import is a build error rather than a shipped secret.
- `pnpm check:secrets` greps the build output for every non-public value in
  `.env.local`. `server-only` catches a bad import; this catches a value pasted
  into a client component by hand.

For local development, put `REGIONDO_NATIVE_BOOKING=true` in
`.env.development.local` — Next loads it ahead of `.env.local` for `next dev`
only, so production and `next build` keep the flag off.

### Key rotation

1. Generate a new pair in the Regiondo dashboard (Settings → API).
2. Update `REGIONDO_PUBLIC_KEY` / `REGIONDO_PRIVATE_KEY` in the host's
   environment (Vercel → Settings → Environment Variables) and redeploy.
3. Verify with a read: `REGIONDO_LIVE_TESTS=1 pnpm test` runs a full round trip
   including one hold that it releases again.
4. Run `pnpm check:secrets` against the new build.
5. Revoke the old pair.

In-flight booking sessions are invalidated by a rotation (see above), so prefer
a quiet hour. Nothing else is affected: reservations live on Regiondo's side and
expire on their own.

---

## Testing

| Suite | Command | Covers |
|---|---|---|
| Unit | `pnpm test` | signing vectors, zod schemas against scrubbed live fixtures, error mapping, slug-registry invariants — 115 tests |
| Live round trip | `REGIONDO_LIVE_TESTS=1 pnpm test` | the real API: catalog → availability → hold → totals → prolong → checkout link → release. Creates and releases **one** hold; never purchases. |
| End-to-end | `pnpm test:e2e` | the booking flow in a phone-sized browser against `e2e/mock-regiondo.mjs` — 13 specs |

The e2e mock exists because sold-out and expired-hold cannot be produced on
demand against the real API without genuinely selling out a departure. Its
responses are copied from captured live ones, including all four places the
OpenAPI document is wrong, so the suite fails if the wrapper stops handling them.

---

## Migration: what replaced what

| # | Legacy | Replaced by | Safe to delete when |
|---|---|---|---|
| 1 | `components/group-tours-regiondo-widget.tsx` — the `<product-catalog-widget>` element and `widgets.regiondo.net/catalog/v1/catalog-widget.min.js` | `CollectionPage` on `/tours/group-tours` | the flag has been on in production and verified |
| 2 | `app/(site)/tours/group-tours/legacy-widget-page.tsx` | same | same |
| 3 | iframe branch in `components/landing/escape-landing-page.tsx` (the `widgetUrl` prop, `iframeKey`, `iframeLoaded`, `showBackButton`, `goBackToMain`) | `LandingCatalog` passed in as `bookingSlot` | same |
| 4 | `app/api/regiondo-proxy/route.ts` | nothing — no iframe, no proxy | **delete with #3.** See the warning below. |
| 5 | `.rcw-*` z-index rules at the bottom of `app/globals.css` | nothing — those classes belong to Regiondo's *old* calendar widget and are already dead | any time |
| 6 | Regiondo clause in `lib/privacy-policy.ts` | already rewritten to describe the native integration | done |

> **`app/api/regiondo-proxy/route.ts` deserves its own line.** It fetches an
> arbitrary caller-supplied `url` with **no host allowlist** and serves the
> response from our own origin — an open proxy and an SSRF surface. It predates
> this work and is left running only so the flag can be switched back. Delete it
> in the same change that removes the iframe, and do not extend it meanwhile.

Nothing on this list is deleted yet, deliberately: while the flag can be turned
off, the legacy path has to keep working.

### URLs

No existing URL changed and no redirect was needed. The widgets were embeds
*inside* pages, not URLs of their own, so every path keeps its meaning:

```
UNCHANGED   /tours/group-tours          widget  -> native "Shared Tours from Venice"
            /lp/from-venice             iframe  -> native tour grid
            /lp/from-jesolo-cavallino   iframe  -> native tour grid
            /tours/{dolomites,prosecco,wine-food,active-adventure,cultural}
                                        editorial copy unchanged; each gains a
                                        bookable upsell between the copy and the
                                        existing CTA, plus real page metadata

REDIRECTED  /rates                      301 -> /tours/private-tours; its rates and
                                        inclusions now sit under the private catalog

NEW         /tours                      catalog index, filters in ?searchParams
            /tours/private-tours        collection for tag 45421, plus the
                                        tailor-made offer (renders with the flag
                                        off too, without the catalog)
            /tours/[slug]               tour detail
            /book/confirmation          confirmation    (noindex)
```

Tour slugs come from a checked-in registry in `lib/regiondo/slugs.ts`, not from
Regiondo's `url_key`. Two live products share an identical `url_key` today, and
it is stale on one of them; it is also dashboard-editable, so an indexed URL
could vanish without a deploy. `assertSlugRegistry()` runs during the sitemap
build and fails on a duplicate slug or one shadowed by a static `/tours/*` page.
A product with no curated slug only warns — it still has a working
`/tours/p-<id>` URL, and adding a tour in Regiondo must not break a build.
