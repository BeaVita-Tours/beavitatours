# Going live: cutover checklist and known gaps

Everything is behind `REGIONDO_NATIVE_BOOKING`, off by default. Nothing in this
project affects the live site until that flag is turned on.

**No test booking has been made.** The one real booking below is yours to place —
it is the only thing that cannot be verified without spending money.

---

## Before you flip the flag

### 1. Deploy with the flag still off

Confirm nothing moved. Every page should render exactly as it does today.

- [ ] `/tours/group-tours` shows the Regiondo catalog widget
- [ ] `/lp/from-venice` and `/lp/from-jesolo-cavallino` show the iframe
- [ ] `/tours`, `/tours/private-tours` and `/tours/<slug>` return **404**
- [ ] the sitemap contains no tour URLs

If any of that is wrong, stop — the flag is not doing its job.

### 2. Turn it on in a preview deployment only

Set `REGIONDO_NATIVE_BOOKING=true` on a Vercel **Preview** environment, not
Production. Preview and Production read separate environment variables, so this
is safe.

- [ ] `/tours` lists 11 tours with prices and ratings
- [ ] `/tours/group-tours` shows the 6 shared departures, `/tours/private-tours` the 3 private ones
- [ ] every tour page loads and its booking panel shows a real date and price
- [ ] `/lp/from-venice` shows 7 tours, `/lp/from-jesolo-cavallino` shows 2
- [ ] each theme page (`/tours/dolomites`, `/prosecco`, `/wine-food`,
      `/active-adventure`, `/cultural`) shows a bookable section between the copy
      and the CTA, and its "see all" link lands on a filtered catalog
- [ ] filters change the URL and the results, and survive a page refresh
- [ ] `/book/confirmation` shows the "find your booking" form

### 3. Structured data, on the preview URL

Rich Results Test cannot run against localhost, so this is the first thing that
genuinely needs a deployment. <https://search.google.com/test/rich-results>

- [ ] a tour page reports **Product** (or Merchant listing) with price and currency
- [ ] the same page reports **Breadcrumbs**
- [ ] `/tours` reports **Breadcrumbs**; `ItemList` is valid but Google shows no
      rich result for it, so "no items detected" there is expected, not a fault
- [ ] a tour **with** reviews shows a review snippet; one **without** shows none
      — if a tour with no reviews reports a rating, something is fabricating data
      and the deploy should be stopped

### 4. The one real test booking

Use the cheapest shared departure (`/tours/venice-best-of-the-dolomites-day-trip`,
€115) on a date far enough out to cancel comfortably.

- [ ] pick a date, one guest, press **Reserve your places**
- [ ] the checkout page shows the countdown, the right tour, date, guests and total
- [ ] fill the form and press **Continue to secure payment**
- [ ] you land on `prosecco-experience.regiondo.com` — **confirm the URL bar** —
      and complete payment there
- [ ] note the order number from the confirmation email
- [ ] visit `/book/confirmation?order=<order number>` and check the details match
- [ ] **cancel the booking in the Regiondo dashboard**
- [ ] confirm `GET /checkout/hold` shows no leftover reservations —
      `REGIONDO_LIVE_TESTS=1 pnpm test` prints them, or check the dashboard

### 5. Analytics

With cookies accepted, in GTM Preview or the browser console:

- [ ] `begin_checkout` fires on `/book/[code]` with the right value and currency
- [ ] `add_payment_info` fires when you press Continue
- [ ] `purchase` fires **once** on the confirmation page, with the server-verified
      total and the order number as `transaction_id`
- [ ] refreshing the confirmation page does **not** fire `purchase` again
- [ ] with cookies rejected, none of them fire

You will need GTM triggers for `begin_checkout`, `add_payment_info` and
`purchase`; the events reach `dataLayer` but nothing forwards them yet.

### 6. Ticketshop return URL — the one thing worth doing in the dashboard

`GET /checkout/checkoutlink` accepts no return-URL parameter (the link is
path-based with no query string at all), so Regiondo does not send customers
back to us after payment. If the ticketshop settings allow a post-purchase
redirect, point it at:

```
https://beavitatours.com/book/confirmation?order={ORDER_NUMBER}
```

- [ ] set it, if the setting exists
- [ ] re-run the test booking and confirm you land back on our confirmation page

Without this, `/book/confirmation` is only reachable through its lookup form,
and the `purchase` event fires only for customers who find their way back. It is
the single biggest lever on conversion measurement and it lives in a dashboard,
not in this codebase.

### 7. Flip it

- [ ] set `REGIONDO_NATIVE_BOOKING=true` in **Production** and redeploy
- [ ] `pnpm check:secrets` on the production build
- [ ] re-submit the sitemap in Search Console
- [ ] watch Search Console coverage for a week — the 11 new tour URLs should
      appear and nothing existing should start 404ing

### Rolling back

Set `REGIONDO_NATIVE_BOOKING=false` and redeploy. The legacy widget and iframe
come straight back; nothing was deleted. If tours have been indexed by then,
`/tours/*` will start returning 404 — so once the new URLs are indexed, prefer
fixing forward.

---

## Known gaps, limitations and compromises

Honest list. Nothing here is a surprise waiting to be found.

### Regiondo API limitations

1. **No return URL on the hosted checkout.** Path-based link, no query string.
   Item 6 above is the only mitigation, and it is a dashboard setting.
2. **No sandbox account.** `sandbox-api.regiondo.com` rejects the live key pair
   with 403. The write path was verified with real holds that were released
   immediately; `POST /checkout/purchase` was never called and is not wrapped.
3. **The OpenAPI document is wrong in four places** — `reservation_data` is an
   object not an array on POST/PUT hold, `totals.tax` is `{title, value}`,
   `checkoutlink` returns an object, and `buyer_data_required` has no
   `view_type`. All handled and covered by fixture tests, but expect more of the
   same when adding endpoints. Probe before you code.
4. **Images cap at 600×400.** `cdn.regiondo.net` serves `-cropped600-400` and
   `-thumbnail-360x240`; larger crops 404. Tour heroes are laid out around that
   ceiling rather than upscaled. Better photography would need to be hosted
   elsewhere.
5. **No duration filter or sort on `/products`.** Applied server-side over the
   fetched page. Free at 11 products; revisit if the catalog outgrows one page.
6. **`/products` has an undocumented `price` parameter.** Not used — guessing at
   an undocumented parameter is exactly the kind of thing that breaks quietly.
   Price banding filters on the parsed `base_price` instead, which is exact.
7. **The `/lp/*` product sets are pinned by id** in `lib/regiondo/collections.ts`.
   The iframes filtered by ticketshop categories (`escape-venice-for-a-day`,
   `escape-from-jesolo-cavallino`) that `GET /tags` does not expose. **If a tour
   is added to one of those shop categories, add its id there too** — nothing
   will warn you.
8. **Two products carry no tag** (326843, 326844 — the Jesolo/Cavallino pair), so
   they appear on `/tours` and on their landing page but on neither collection
   page. Tagging them in the dashboard is a one-minute fix.
8b. **Theme upsell sets are curated by product id** in
   `lib/regiondo/collections.ts` (`THEME_UPSELLS`). A tour added in Regiondo will
   not appear on a theme page until it is listed there. A unit test asserts every
   listed id exists, so a typo fails the build, but nothing can tell you about a
   tour you forgot to add. The "see all" links use the API's keyword search, so
   they *do* pick up new tours — which is the safety net.

### Performance

9. **LCP < 2.0 s and INP < 200 ms are not met**, on any page, including ones this
   project did not touch. ~1 MB of shared script and 872 KB of third-party
   tracking dominate. See [`regiondo-performance.md`](./regiondo-performance.md)
   for the numbers and the recommended fix, which is a separate piece of work.
10. **`/lp/from-venice` LCP is ~320 ms slower** — real tour photographs now render
    where an empty iframe box used to be. A content-for-placeholder trade, with
    −1280 KB and −65 requests on the same page.

### Accessibility

11. **The shared `Button` default fails AA.** White on `--primary` is 2.50:1.
    Fixing it means changing `--primary` and restyling every page. The new
    booking CTAs use `--primary-strong` (4.53:1); the nav "Book Now" and the
    consent banner still do not.
12. **`ReviewsSection` on the homepage** fails contrast (`text-muted-foreground/70`,
    3.13:1) and label-in-name on its OTA badge links. Pre-existing, untouched.
12b. **Metadata and two accessibility fixes on the theme pages apply with the
    flag off.** Everything else is gated, but titles, descriptions and canonicals
    for `/tours/dolomites` and its four siblings, the AA contrast fix in
    `TourCTA`, and the carousel dot tap-target fix are unconditional — they are
    improvements independent of booking, and gating a page title behind a
    booking flag would be strange. The flag-off state is therefore *better* than
    before rather than byte-identical to it.
13. **The consent banner covers the booking CTA on a phone.** It is
    `fixed bottom-0 z-50`, and on a 393 px viewport it sits over the button —
    every click-based e2e test failed on it before they pre-accepted consent. It
    dismisses on first interaction, so a real visitor is not stuck, but it is a
    real friction point at the top of the funnel. Site-wide behaviour, not
    introduced here.

### Scope deliberately left out

14. **`POST /checkout/purchase` is not wrapped**, on purpose. Its payment codes
    all mean "money collected elsewhere", so using it for a consumer booking
    would mean taking the card ourselves.
15. **No Regiondo webhooks are configured.** `/api/regiondo/revalidate` exists and
    is ready; pointing a product webhook at it would replace the hourly
    background refresh with instant invalidation.
16. **`app/api/regiondo-proxy/route.ts` is still an open proxy.** No host
    allowlist, arbitrary URL fetched and served from our origin. Left running
    only so the flag can be switched back. **Delete it in the same change that
    removes the iframe.**
17. **No CI.** The repo has no workflows. `pnpm test`, `pnpm test:e2e`,
    `pnpm typecheck`, `pnpm lint` and `pnpm check:secrets` all run clean and are
    ready to be wired up; nothing currently runs them automatically.
18. **Cancellation policy text is not shown on tour pages.** Regiondo returns no
    structured cancellation field, and the copy in `faq_other_info` varies by
    product. The confirmation page points at the confirmation email, which does
    carry the terms.
19. **Coupon codes are supported by the wrapper but not exposed in the UI.**
    `getTotals()` accepts `couponCode`; no input is rendered. The hosted checkout
    has its own voucher field, which is where customers will look anyway.
