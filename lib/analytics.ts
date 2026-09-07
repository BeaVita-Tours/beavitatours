/**
 * Ecommerce events for the booking funnel.
 *
 * The site had no `track()` layer before this — GTM loads with Consent Mode
 * defaults and the only `dataLayer` pushes were the consent updates themselves.
 * This adds the funnel events, in GA4's ecommerce shape, and nothing else.
 *
 * Three constraints shape it, all discovered in the existing code:
 *
 *  1. **`clearTrackingArtifacts()` in `lib/cookie-consent.ts` sets
 *     `window.dataLayer = []`** on every consent change and whenever consent is
 *     absent. So anything queued before consent is destroyed, not replayed —
 *     which means an event pushed optimistically "in case consent arrives" is
 *     simply lost. Events are therefore pushed only when analytics consent is
 *     already granted, and the caller is told when one was suppressed.
 *  2. **Purchase must not double-count.** A confirmation page is refreshed,
 *     bookmarked and shared, so the transaction id is recorded in
 *     `sessionStorage` and a repeat push is skipped.
 *  3. **No PII.** Names, emails and phone numbers never enter the dataLayer,
 *     which matches what the existing tracking already sends (nothing).
 */

const PURCHASE_DEDUPE_KEY = "bv_purchase_events";

export interface AnalyticsItem {
  readonly item_id: string;
  readonly item_name: string;
  readonly item_category?: string;
  readonly price: number;
  readonly quantity: number;
}

export interface EcommercePayload {
  readonly currency: string;
  readonly value: number;
  readonly items: readonly AnalyticsItem[];
  readonly transaction_id?: string;
  readonly coupon?: string;
}

type DataLayerEvent = Record<string, unknown>;

function canPush(): boolean {
  return typeof window !== "undefined" && Array.isArray(window.dataLayer);
}

/**
 * Push a GA4 ecommerce event.
 *
 * `ecommerce: null` first is Google's documented way to stop the previous
 * event's item array bleeding into this one — without it, a `purchase` fired
 * after a `view_item` can inherit the earlier items.
 */
function push(event: string, ecommerce: EcommercePayload): boolean {
  if (!canPush()) return false;

  window.dataLayer?.push({ ecommerce: null } satisfies DataLayerEvent);
  window.dataLayer?.push({
    event,
    ecommerce: {
      currency: ecommerce.currency,
      value: Number(ecommerce.value.toFixed(2)),
      ...(ecommerce.transaction_id ? { transaction_id: ecommerce.transaction_id } : {}),
      ...(ecommerce.coupon ? { coupon: ecommerce.coupon } : {}),
      items: ecommerce.items.map((item) => ({
        ...item,
        price: Number(item.price.toFixed(2)),
      })),
    },
  } satisfies DataLayerEvent);

  return true;
}

export function trackViewItem(payload: EcommercePayload, hasConsent: boolean): void {
  if (!hasConsent) return;
  push("view_item", payload);
}

export function trackBeginCheckout(payload: EcommercePayload, hasConsent: boolean): void {
  if (!hasConsent) return;
  push("begin_checkout", payload);
}

/**
 * `add_payment_info` at the handoff to Regiondo's hosted checkout.
 *
 * This is the last event we can observe ourselves: payment happens on
 * Regiondo's domain, and — since `GET /checkout/checkoutlink` accepts no
 * return URL — the customer is not necessarily sent back here afterwards. Until
 * a ticketshop return URL is configured, this is the closest thing the funnel
 * has to a reliable conversion signal, and it is worth a GTM trigger of its own.
 */
export function trackPaymentHandoff(payload: EcommercePayload, hasConsent: boolean): void {
  if (!hasConsent) return;
  push("add_payment_info", payload);
}

export interface PurchaseResult {
  readonly pushed: boolean;
  readonly reason?: "no-consent" | "duplicate" | "unavailable";
}

/**
 * Fire the purchase event, once per transaction id.
 *
 * Values must come from a server-verified order — see
 * `app/(site)/book/confirmation/page.tsx`, which looks the order up against
 * Regiondo before rendering anything. Never call this with numbers that came
 * from a URL parameter.
 */
export function trackPurchase(payload: EcommercePayload, hasConsent: boolean): PurchaseResult {
  if (!hasConsent) return { pushed: false, reason: "no-consent" };
  if (!payload.transaction_id) return { pushed: false, reason: "unavailable" };
  if (hasTracked(payload.transaction_id)) return { pushed: false, reason: "duplicate" };

  const pushed = push("purchase", payload);
  if (pushed) rememberTracked(payload.transaction_id);

  return pushed ? { pushed: true } : { pushed: false, reason: "unavailable" };
}

/**
 * `sessionStorage`, not `localStorage`: deduplication only needs to survive a
 * refresh and a back-button, and a transaction id that lingers for months on a
 * shared machine is a small privacy cost for no benefit.
 */
function readTracked(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(PURCHASE_DEDUPE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    // Private browsing, or storage disabled. Falling through means a refresh
    // could double-count; GA4 also dedupes on transaction_id server-side, so
    // this is a second line of defence rather than the only one.
    return [];
  }
}

function hasTracked(transactionId: string): boolean {
  return readTracked().includes(transactionId);
}

function rememberTracked(transactionId: string): void {
  if (typeof window === "undefined") return;
  try {
    const next = [...readTracked(), transactionId].slice(-20);
    window.sessionStorage.setItem(PURCHASE_DEDUPE_KEY, JSON.stringify(next));
  } catch {
    // Nothing to do; see readTracked.
  }
}
