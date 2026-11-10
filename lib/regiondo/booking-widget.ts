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
 * The API cannot create widgets, but `GET /products/{id}/widgets` lists the
 * ones connected to a product, so the site discovers each tour's dashboard
 * widget by itself (`lib/regiondo/widgets.ts`). Once a tour has one, its page
 * switches from the API panel to the widget with no code change: within an
 * hour, or straight away after a POST to /api/regiondo/revalidate.
 *
 * This file is deliberately not `server-only`. Widget ids are public: they
 * sit in the page source of any site that embeds a widget.
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
export function isValidWidgetId(value: unknown): value is string {
  return typeof value === "string" && WIDGET_ID_PATTERN.test(value);
}

/** What the embed page renders: one widget made in the Regiondo dashboard. */
export interface BookingWidgetTarget {
  readonly kind: "widget";
  readonly widgetId: string;
}

/**
 * The widget for a tour, or null for the API panel. Only a widget made in the
 * dashboard counts. The element's other form (account code + product id, no
 * widget id) renders Regiondo's "Unable to load: the server is unreachable"
 * for real visitors, so it is deliberately not used.
 */
export function bookingWidgetTargetFor(widgetId: string | null): BookingWidgetTarget | null {
  return isValidWidgetId(widgetId) ? { kind: "widget", widgetId } : null;
}

export function bookingWidgetEmbedHref(target: BookingWidgetTarget): string {
  return `${BOOKING_WIDGET_EMBED_PATH}?${new URLSearchParams({ widget: target.widgetId })}`;
}

/** The inverse of `bookingWidgetEmbedHref`, and strict: anything odd is null. */
export function parseBookingWidgetTarget(params: URLSearchParams): BookingWidgetTarget | null {
  return bookingWidgetTargetFor(params.get("widget"));
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
