import "server-only";

import { getConfig } from "./config";
import { getAvailability, getSlot } from "./products";
import type { TourAvailability, TourDetail, TourOption, TourPrice, TourVariation } from "./types";

/**
 * Everything the API-driven booking panel needs to open, fetched live.
 *
 * Used in two places: the tour page, when a tour has no Regiondo booking
 * widget, and the `loadFallbackBooking` action, when the widget is there but
 * fails to load in the visitor's browser. Same data, same panel, either way.
 *
 * Plain serialisable data, so it can cross the Server Action boundary.
 */
export type BookingPanelData =
  | { readonly kind: "unbookable" }
  | { readonly kind: "no-dates"; readonly priceFrom: TourPrice }
  | {
      readonly kind: "ready";
      readonly slug: string;
      readonly tour: { readonly id: string; readonly title: string; readonly category?: string };
      readonly variations: readonly TourVariation[];
      readonly availability: TourAvailability;
      readonly initialOptions: readonly TourOption[];
      readonly initialSeatsLeft: number | null;
      readonly initialDate: string | null;
      readonly initialTime: string | null;
      readonly currency: string;
      readonly bookingNoticeHours: number;
    };

/** Must run at request time: it reads the clock and live stock. */
export async function loadBookingPanelData(tour: TourDetail): Promise<BookingPanelData> {
  const variation = tour.variations[0];
  if (!variation) return { kind: "unbookable" };

  const today = new Date();
  const from = toDateKey(addDays(today, Math.ceil(tour.bookingNoticeHours / 24)));
  // Three months covers the overwhelming majority of bookings; the panel can
  // fetch further out on demand.
  const to = toDateKey(addDays(today, 100));

  const availability = await getAvailability(variation.id, from, to);
  if (Object.keys(availability).length === 0) {
    return { kind: "no-dates", priceFrom: tour.priceFrom };
  }

  const firstDate = Object.keys(availability).sort()[0] ?? null;
  const firstTime = firstDate ? (availability[firstDate]?.[0] ?? null) : null;

  const slot =
    firstDate && firstTime
      ? await getSlot(variation.id, firstDate, firstTime)
      : { options: [], seatsLeft: null };

  return {
    kind: "ready",
    slug: tour.slug,
    tour: { id: tour.id, title: tour.title, category: tour.collections[0] },
    variations: tour.variations,
    availability,
    initialOptions: slot.options,
    initialSeatsLeft: slot.seatsLeft,
    initialDate: firstDate,
    initialTime: firstTime,
    currency: getConfig().currency,
    bookingNoticeHours: tour.bookingNoticeHours,
  };
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + Math.max(0, days));
  return next;
}

function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
