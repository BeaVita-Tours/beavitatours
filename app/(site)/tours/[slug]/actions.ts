"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { getAvailability, getOptions } from "@/lib/regiondo/products";
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
  readonly error?: string;
}

export async function loadSlotOptions(input: {
  variationId: string;
  date: string;
  time: string;
}): Promise<SlotOptionsResult> {
  if (!isNativeBookingEnabled()) return { options: [], error: "Booking is unavailable." };

  const parsed = slotSchema.safeParse(input);
  if (!parsed.success) return { options: [], error: "That date is not valid." };

  const limit = consumeRateLimit(await rateLimitKey("regiondo:options"), {
    windowMs: 60 * 1000,
    max: 40,
  });
  if (!limit.ok) {
    return { options: [], error: "Too many changes at once — give it a second." };
  }

  const options = await getOptions(parsed.data.variationId, parsed.data.date, parsed.data.time);

  if (options.length === 0) {
    return { options: [], error: "That departure is no longer bookable. Please pick another date." };
  }

  return { options };
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
