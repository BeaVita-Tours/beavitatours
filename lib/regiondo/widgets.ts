import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import {
  type BookingWidgetTarget,
  bookingWidgetTargetFor,
  isValidWidgetId,
  pickBookingWidgetId,
} from "./booking-widget";
import { TOUR_CATALOG_TAG, tourCacheTag } from "./cache";
import { tryRequest } from "./client";
import { widgetListSchema } from "./schemas";
import type { TourDetail } from "./types";

/**
 * Which Regiondo booking widget a tour page embeds.
 *
 * Resolution order:
 *
 *   1. `REGIONDO_BOOKING_WIDGETS=off`: none, so every tour uses the API panel.
 *      The kill switch, for when the hosted widget misbehaves.
 *   2. `BOOKING_WIDGET_PINS` below: a checked-in override per product.
 *   3. `GET /products/{id}/widgets`: the newest "Booking" widget connected to
 *      the product in the Regiondo dashboard.
 *   4. None: the API panel, exactly as before.
 *
 * Whatever is chosen, the API panel stays the fallback in the browser: if the
 * widget does not render, the tour page swaps it in.
 *
 * Widget lists are catalog data: they change when someone edits the dashboard,
 * not when a seat sells. So they are cached under the tour's own tag, and the
 * existing revalidation endpoint picks up a new widget straight away.
 */

/**
 * product id -> widget id, for when discovery picks the wrong widget (say a
 * product has a test widget newer than the real one). Leave empty otherwise:
 * discovery keeps it in step with the dashboard without a deploy.
 */
export const BOOKING_WIDGET_PINS: Readonly<Record<string, string>> = {};

export function bookingWidgetsEnabled(): boolean {
  const raw = process.env.REGIONDO_BOOKING_WIDGETS?.trim().toLowerCase();
  return !(raw === "off" || raw === "false" || raw === "0");
}

/** The widget a tour page embeds, or null for the API panel. */
export async function getBookingWidgetTarget(tour: TourDetail): Promise<BookingWidgetTarget | null> {
  if (!bookingWidgetsEnabled()) return null;
  return bookingWidgetTargetFor(await getBookingWidgetId(tour.id));
}

export async function getBookingWidgetId(productId: string): Promise<string | null> {
  if (!bookingWidgetsEnabled()) return null;

  const pinned = BOOKING_WIDGET_PINS[productId];
  if (isValidWidgetId(pinned)) return pinned;

  return discoverBookingWidgetId(productId);
}

async function discoverBookingWidgetId(productId: string): Promise<string | null> {
  "use cache";
  cacheLife("catalog");
  cacheTag(TOUR_CATALOG_TAG, tourCacheTag(productId));

  // tryRequest: a Regiondo hiccup here must not cost the visitor the page.
  // It just means this render books through the API panel instead.
  const { data } = await tryRequest(
    `/products/${encodeURIComponent(productId)}/widgets`,
    { schema: widgetListSchema },
    []
  );

  return pickBookingWidgetId(data, productId);
}
