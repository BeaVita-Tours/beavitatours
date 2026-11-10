"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { type BookingPanelData, loadBookingPanelData } from "@/lib/regiondo/booking-panel-data";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { getAvailability, getSlot, getTourBySlug } from "@/lib/regiondo/products";
import type { TourOption } from "@/lib/regiondo/types";
import { consumeRateLimit } from "@/lib/rate-limit";

/**
 * Live reads for the booking panel.
 *
 * Availability and seat counts change while a visitor is looking at the page,
 * so the panel refetches them when the date changes rather than shipping a
 * snapshot to the browser and hoping. These are Server Functions for the same
 * reasons the mutations are (D-005): no public endpoint, no credential in the
 * browser, and the response is already the shape the component renders.
 *
 * They are reads, so unlike the booking mutations they are safe to repeat —
 * but they are still rate limited, because each one costs a Regiondo request
 * against a 157-per-5-minutes budget.
 */

async function rateLimitKey(prefix: string): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${prefix}:${forwarded || headerList.get("x-real-ip") || "unknown"}`;
}

const slotSchema = z.object({
  variationId: z.string().regex(/^\d+$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
});

export interface SlotOptionsResult {
  readonly options: readonly TourOption[];
  /** Places the departure has left across every tier; null when unknown. */
  readonly seatsLeft: number | null;
  readonly error?: string;
}

export async function loadSlotOptions(input: {
  variationId: string;
  date: string;
  time: string;
}): Promise<SlotOptionsResult> {
  if (!isNativeBookingEnabled()) {
    return { options: [], seatsLeft: null, error: "Booking is unavailable." };
  }

  const parsed = slotSchema.safeParse(input);
  if (!parsed.success) return { options: [], seatsLeft: null, error: "That date is not valid." };

  const limit = consumeRateLimit(await rateLimitKey("regiondo:options"), {
    windowMs: 60 * 1000,
    max: 40,
  });
  if (!limit.ok) {
    return { options: [], seatsLeft: null, error: "Too many changes at once — give it a second." };
  }

  const slot = await getSlot(parsed.data.variationId, parsed.data.date, parsed.data.time);

  if (slot.options.length === 0) {
    return {
      options: [],
      seatsLeft: null,
      error: "That departure is no longer bookable. Please pick another date.",
    };
  }

  return { options: slot.options, seatsLeft: slot.seatsLeft };
}

const rangeSchema = z.object({
  variationId: z.string().regex(/^\d+$/),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/**
 * Availability for a different variation, or for a month the initial window did
 * not cover. The page ships roughly three months up front, which covers almost
 * every booking; this is the escape hatch for the rest.
 */
export async function loadAvailability(input: {
  variationId: string;
  from: string;
  to: string;
}): Promise<{ availability: Record<string, readonly string[]>; error?: string }> {
  if (!isNativeBookingEnabled()) return { availability: {}, error: "Booking is unavailable." };

  const parsed = rangeSchema.safeParse(input);
  if (!parsed.success) return { availability: {}, error: "That date range is not valid." };

  const limit = consumeRateLimit(await rateLimitKey("regiondo:availability"), {
    windowMs: 60 * 1000,
    max: 20,
  });
  if (!limit.ok) return { availability: {}, error: "Too many requests." };

  const availability = await getAvailability(
    parsed.data.variationId,
    parsed.data.from,
    parsed.data.to
  );

  return { availability };
}

const slugSchema = z.string().regex(/^[a-z0-9-]{1,120}$/);

export type FallbackBookingResult = BookingPanelData | { readonly kind: "error"; readonly message: string };

/**
 * The API booking panel, on demand.
 *
 * Tour pages book through Regiondo's hosted widget. When that widget fails to
 * load in the visitor's browser (blocked script, Regiondo outage, timeout), the
 * page calls this to open the API-driven panel in its place. It is only ever
 * called on failure, so a working widget costs no API requests at all.
 */
export async function loadFallbackBooking(slug: string): Promise<FallbackBookingResult> {
  if (!isNativeBookingEnabled()) return { kind: "error", message: "Booking is unavailable." };

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return { kind: "error", message: "Unknown tour." };

  // Each call costs two or three Regiondo requests. Before the widget, every
  // tour page view cost the same with no limit at all, so this only has to
  // stop a loop, not ration normal use. Same ceiling as loadSlotOptions.
  const limit = consumeRateLimit(await rateLimitKey("regiondo:fallback"), {
    windowMs: 60 * 1000,
    max: 40,
  });
  if (!limit.ok) return { kind: "error", message: "Too many requests — try again in a minute." };

  const tour = await getTourBySlug(parsed.data);
  if (!tour) return { kind: "error", message: "We cannot reach our booking system right now." };

  try {
    return await loadBookingPanelData(tour);
  } catch {
    return { kind: "error", message: "We cannot reach our booking system right now." };
  }
}
