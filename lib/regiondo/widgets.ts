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
export const BOOKING_WIDGET_PINS: Readonly<Record<string, string>> = {
  // Created 2026-11-10 in the Regiondo Widget Editor (type Booking, en_US,
  // design "Bea Vita Teal #4FA9A1"). Pinned so they apply on deploy rather
  // than on the next catalog revalidation. Products 341599, 339660, 341596,
  // 326843 and 326844 are not offered by the editor (inactive or not on this
  // sales channel), so they have no widget and keep the API panel.
  "298190": "a7b3bd01-82ad-4997-9f86-4452722c8934", // Dolomites, Cortina and 2 lakes
  "300877": "4dee03fa-6bd2-4cd0-9fc3-6ca5c264f221", // Best of the Dolomites (Tronchetto)
  "341597": "3add633d-d028-4c6e-82b7-ee01e312994d", // Lake Braies and Tre Cime
  "326845": "62698e05-12b0-4384-9565-a094b352eb6e", // Prosecco Hills and wine tasting
  "307882": "2f4bb112-a1d5-47f3-b66f-8a2663e6d4c6", // Prosecco Hills, Spritz and Asolo
  "298188": "e8e6b5df-0209-4e17-a51e-bd0a3d87951e", // Dolomites and Prosecco (private)
};

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
