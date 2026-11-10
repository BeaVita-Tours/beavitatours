/**
 * Regiondo's hosted booking widget: the shared, client-safe half.
 *
 * Regiondo asked for tour pages to book through the widget they host and
 * manage rather than through our API-driven panel. The widget replaces only
 * the booking box on the tour page; the rest of the page stays ours.
 *
 * Embed code, as the dashboard (Shop -> Website integration -> Booking
 * widget) hands it out, is a custom element plus Regiondo's loader script:
 *
 *   <booking-widget widget-id="<uuid>"></booking-widget>
 *   <script src="https://widgets.regiondo.net/booking/v1/booking-widget.min.js"></script>
 *
 * The same element also takes an account code and a product id instead of a
 * widget id (`customer-code="BE116" product="298190"`), which is how
 * Regiondo's own catalog widget opens the booking box for a product. That
 * form needs nothing created in the dashboard, so every tour has a widget
 * from day one.
 *
 * The API cannot create widgets, but `GET /products/{id}/widgets` lists the
 * ones connected to a product, so the site discovers each tour's dashboard
 * widget by itself (`lib/regiondo/widgets.ts`). One created in the dashboard
 * takes over from the product-id form on its tour page with no code change:
 * within an hour, or straight away after a POST to /api/regiondo/revalidate.
 *
 * This file is deliberately not `server-only`. Widget ids, the account code
 * and product ids are public: they sit in the page source of any site that
 * embeds a widget.
 */

/** Regiondo's loader. It picks the widget version and loads the rest itself. */
export const BOOKING_WIDGET_SCRIPT_URL =
  "https://widgets.regiondo.net/booking/v1/booking-widget.min.js";

/** Same-origin page that hosts one widget, framed by the tour page. */
export const BOOKING_WIDGET_EMBED_PATH = "/embed/regiondo-booking";

/**
 * The postMessage channel between the embed page and the tour page. Both
 * documents are on our origin; the tour page checks origin and source anyway.
 */
export const BOOKING_WIDGET_MESSAGE = "beavita:regiondo-booking-widget";

export type BookingWidgetMessage =
  | { readonly type: typeof BOOKING_WIDGET_MESSAGE; readonly status: "ready" }
  | { readonly type: typeof BOOKING_WIDGET_MESSAGE; readonly status: "failed"; readonly reason: string }
  | { readonly type: typeof BOOKING_WIDGET_MESSAGE; readonly status: "height"; readonly height: number };

/** Parent -> frame: "I am listening now, tell me where you are". */
export const BOOKING_WIDGET_HELLO = { type: BOOKING_WIDGET_MESSAGE, status: "hello" } as const;

/**
 * Widget ids are UUIDs today. The pattern is a little wider than that so a
 * format change on Regiondo's side does not silently drop every widget, but
 * narrow enough that the id is always safe inside an HTML attribute and a URL.
 */
const WIDGET_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{7,63}$/;
/** Regiondo account codes look like "BE116". */
const PROVIDER_PATTERN = /^[A-Za-z0-9]{2,16}$/;
/** Regiondo product ids, e.g. "298190". Not the SKU: the widget 404s on that. */
const PRODUCT_ID_PATTERN = /^\d{1,12}$/;
/** The widget's locale format, e.g. "en_US". */
const LOCALE_PATTERN = /^[a-z]{2}_[A-Z]{2}$/;

export const DEFAULT_WIDGET_LOCALE = "en_US";

export function isValidWidgetId(value: unknown): value is string {
  return typeof value === "string" && WIDGET_ID_PATTERN.test(value);
}

/**
 * What the embed page renders: a dashboard widget, or the account code plus a
 * product id. A dashboard widget wins when there is one, because it carries
 * the styling and settings chosen there.
 */
export type BookingWidgetTarget =
  | { readonly kind: "widget"; readonly widgetId: string }
  | {
      readonly kind: "product";
      readonly provider: string;
      readonly productId: string;
      readonly locale: string;
    };

/** The account code inside a SKU: "T-BE116-321530" -> "BE116". */
export function providerFromSku(sku: string | null | undefined): string | null {
  const match = /^[A-Z]+-([A-Za-z0-9]{2,16})-[A-Za-z0-9]+$/.exec(sku ?? "");
  return match?.[1] ?? null;
}

function productTarget(
  provider: string | null | undefined,
  productId: string | null | undefined,
  locale: string
): BookingWidgetTarget | null {
  if (
    provider &&
    productId &&
    PROVIDER_PATTERN.test(provider) &&
    PRODUCT_ID_PATTERN.test(productId) &&
    LOCALE_PATTERN.test(locale)
  ) {
    return { kind: "product", provider, productId, locale };
  }
  return null;
}

/**
 * The widget for a tour: its dashboard widget when it has one, otherwise the
 * product form. Null only when the account code is unknown, which leaves the
 * API panel.
 */
export function bookingWidgetTargetFor(input: {
  readonly widgetId: string | null;
  readonly productId: string;
  /** The account code, e.g. "BE116". Read from the SKU when missing. */
  readonly provider: string | null;
  readonly sku?: string | null;
  readonly locale?: string;
}): BookingWidgetTarget | null {
  if (isValidWidgetId(input.widgetId)) return { kind: "widget", widgetId: input.widgetId };
  const provider = input.provider?.trim() || providerFromSku(input.sku);
  return productTarget(provider, input.productId.trim(), input.locale ?? DEFAULT_WIDGET_LOCALE);
}

export function bookingWidgetEmbedHref(target: BookingWidgetTarget): string {
  const params =
    target.kind === "widget"
      ? new URLSearchParams({ widget: target.widgetId })
      : new URLSearchParams({
          provider: target.provider,
          product: target.productId,
          locale: target.locale,
        });
  return `${BOOKING_WIDGET_EMBED_PATH}?${params.toString()}`;
}

/** The inverse of `bookingWidgetEmbedHref`, and strict: anything odd is null. */
export function parseBookingWidgetTarget(params: URLSearchParams): BookingWidgetTarget | null {
  const widgetId = params.get("widget");
  if (widgetId !== null) return isValidWidgetId(widgetId) ? { kind: "widget", widgetId } : null;
  return productTarget(
    params.get("provider"),
    params.get("product"),
    params.get("locale") ?? DEFAULT_WIDGET_LOCALE
  );
}

export interface WidgetCandidate {
  readonly widget_id: string;
  readonly type: string;
  readonly product_id?: number;
  readonly created_at: string;
}

/**
 * Choose the booking widget for a product from the API's list.
 *
 * Only "Booking" widgets qualify: "Product" and "Button" widgets do not carry
 * the calendar. When a product has several (a test copy, or one per language),
 * the newest wins, since a widget is usually re-created to replace an old one.
 * Pin a specific one in `BOOKING_WIDGET_PINS` when that guess is wrong.
 */
export function pickBookingWidgetId(
  widgets: readonly WidgetCandidate[],
  productId: string
): string | null {
  const candidates = widgets
    .filter((w) => w.type.trim().toLowerCase() === "booking")
    .filter((w) => w.product_id === undefined || String(w.product_id) === productId)
    .filter((w) => isValidWidgetId(w.widget_id))
    .sort((a, b) => timestamp(b.created_at) - timestamp(a.created_at));

  return candidates[0]?.widget_id ?? null;
}

function timestamp(value: string): number {
  const parsed = Date.parse(value.includes("T") ? value : value.replace(" ", "T"));
  return Number.isFinite(parsed) ? parsed : 0;
}
