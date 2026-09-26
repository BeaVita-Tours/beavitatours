"use server";

import { headers } from "next/headers";
import { z } from "zod";

import type { ActionState } from "@/lib/regiondo/action-state";
import { createHold, getCheckoutLink, releaseHold, toRegiondoDateTime } from "@/lib/regiondo/checkout";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { isRegiondoError, userMessageFor } from "@/lib/regiondo/errors";
import { isGroupOption, parseLines } from "@/lib/regiondo/party";
import { getSlot } from "@/lib/regiondo/products";
import { productIdForSlug } from "@/lib/regiondo/slugs";
import type { BookingLineItem, TourOption } from "@/lib/regiondo/types";
import { consumeRateLimit } from "@/lib/rate-limit";

/**
 * The mutation boundary for the booking flow: one action, from "Reserve" to
 * Regiondo's hosted checkout.
 *
 * There used to be a page in between — `/book/<code>`, a "your details" form —
 * and it asked for exactly what Regiondo's checkout asks for again a moment
 * later. The checkout link takes only the reservation code (D-008: no
 * parameters, no way to pre-fill), so those details had nowhere to go and were
 * discarded. The customer typed their name twice for nothing. Now the hold and
 * the handoff happen in the same request (D-019).
 *
 * A Server Action rather than a Route Handler (D-005): Next checks the request
 * origin and the action id for us, so CSRF is handled without hand-rolling a
 * token; there is no public JSON endpoint for someone to hammer hold creation
 * against; and the form still submits with JavaScript disabled.
 *
 * A party is one or more participant tiers ("2 Adults + 2 Young"). Regiondo
 * holds one option per call, so the party becomes one hold per tier, and the
 * checkout link is fetched for all of the codes together — the ticketshop
 * opens with the whole basket. If any hold in the sequence fails, the ones
 * already placed are released before the error goes back to the customer.
 *
 * Rules that hold here:
 *  - every input is re-validated with zod, whatever the client did;
 *  - no price is ever read from the request — Regiondo's checkout shows the
 *    price of record before the customer pays;
 *  - hold creation is rate limited, because it consumes real inventory.
 */

function fail(message: string, extra: { recheckAvailability?: boolean } = {}): ActionState {
  return { status: "error", message, ...extra };
}

/**
 * Client IP for rate limiting. Vercel sets `x-forwarded-for`; the first entry
 * is the client. Falls back to a shared bucket rather than to no limit at all —
 * if we cannot tell visitors apart, one global budget is safer than none.
 */
async function clientKey(prefix: string): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerList.get("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}

const startBookingSchema = z.object({
  slug: z.string().min(1).max(120),
  variationId: z.string().regex(/^\d+$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
});

/** "Adult" -> "Adult places"; "Group" -> "groups". For the stock messages. */
function placesLabel(option: TourOption, count: number): string {
  if (isGroupOption(option)) return count === 1 ? "group" : "groups";
  return `${option.name} ${count === 1 ? "place" : "places"}`;
}

/**
 * Check one tier of the party against live stock and its own limits. Returns
 * the message to show, or null when the line is fine.
 */
function validateLine(option: TourOption, qty: number): string | null {
  if (option.seatsLeft !== null && qty > option.seatsLeft) {
    return option.seatsLeft === 0
      ? `${option.name} has just sold out for this departure. Please choose another date or adjust your party.`
      : `Only ${option.seatsLeft} ${placesLabel(option, option.seatsLeft)} ${
          option.seatsLeft === 1 ? "is" : "are"
        } left for this departure.`;
  }
  if (option.minPerOrder > 0 && qty < option.minPerOrder) {
    return `${option.name} is booked for at least ${option.minPerOrder} per booking.`;
  }
  if (option.maxPerOrder > 0 && qty > option.maxPerOrder) {
    return `${option.name} takes at most ${option.maxPerOrder} per booking.`;
  }
  return null;
}

/**
 * Reserve stock and hand the customer to Regiondo's checkout.
 *
 * Every line of the party is validated against **live** availability before
 * any hold, so a stale booking panel fails with "those places have gone"
 * rather than with a raw API error. The holds themselves are the real
 * authority — the pre-check just buys a better error message.
 *
 * On success the state carries the checkout URL and the client navigates. On a
 * failure *after* a hold (a later hold in the sequence, or the checkout link
 * could not be fetched) every hold placed so far is released straight away
 * rather than left to lapse, so a retry does not find the seats taken by its
 * own previous attempt.
 */
export async function startBooking(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isNativeBookingEnabled()) return fail("Online booking is not available right now.");

  const parsed = startBookingSchema.safeParse({
    slug: formData.get("slug"),
    variationId: formData.get("variationId"),
    date: formData.get("date"),
    time: formData.get("time"),
  });
  const lines = parseLines(formData.getAll("line"));

  if (!parsed.success || !lines) {
    return fail("Please choose a date, a time and who is coming.");
  }

  const { slug, variationId, date, time } = parsed.data;

  const productId = productIdForSlug(slug);
  if (!productId) return fail("We could not find that tour.");

  // A hold takes real seats out of the inventory, so this is the one action
  // that has to be defended against a script. Six in ten minutes is far more
  // than a person needs and far less than a script wants.
  const limit = consumeRateLimit(await clientKey("regiondo:hold"), {
    windowMs: 10 * 60 * 1000,
    max: 6,
  });
  if (!limit.ok) {
    return fail("You have started several bookings just now. Please wait a moment and retry.");
  }

  // Options come back with their stock already capped at what the departure
  // has left; the departure's own count caps the party as a whole.
  const slot = await getSlot(variationId, date, time);
  const dateTime = toRegiondoDateTime(date, time);
  const items: BookingLineItem[] = [];

  const partySize = lines.reduce((sum, line) => sum + line.qty, 0);
  if (slot.seatsLeft !== null && partySize > slot.seatsLeft) {
    return fail(
      slot.seatsLeft === 0
        ? "This departure has just sold out. Please choose another date."
        : `This departure has only ${slot.seatsLeft} ${slot.seatsLeft === 1 ? "place" : "places"} left in total. Please reduce your party or choose another date.`,
      { recheckAvailability: true }
    );
  }

  for (const line of lines) {
    const option = slot.options.find((candidate) => candidate.id === line.optionId);
    if (!option) {
      return fail("One of the ticket types is no longer available for this date.", {
        recheckAvailability: true,
      });
    }
    const problem = validateLine(option, line.qty);
    if (problem) return fail(problem, { recheckAvailability: true });
    items.push({ productId, optionId: option.id, dateTime, qty: line.qty });
  }

  // One hold per tier, in order. The first failure unwinds the rest: a party
  // that could only be half-held is not a party the customer can pay for.
  const codes: string[] = [];
  for (const item of items) {
    try {
      codes.push((await createHold({ item })).code);
    } catch (error) {
      await Promise.all(codes.map((code) => releaseHold(code)));
      return fail(userMessageFor(error), {
        recheckAvailability: isRegiondoError(error) && error.kind === "stock_unavailable",
      });
    }
  }

  try {
    return { status: "handoff", checkoutUrl: await getCheckoutLink(codes) };
  } catch (error) {
    // The seats are held but there is no way to pay for them. Give them back
    // now; the customer's retry will take fresh holds.
    await Promise.all(codes.map((code) => releaseHold(code)));
    return fail(userMessageFor(error));
  }
}
