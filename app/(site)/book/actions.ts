"use server";

import { headers } from "next/headers";
import { z } from "zod";

import type { ActionState } from "@/lib/regiondo/action-state";
import { createHold, getCheckoutLink, releaseHold, toRegiondoDateTime } from "@/lib/regiondo/checkout";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { isRegiondoError, userMessageFor } from "@/lib/regiondo/errors";
import { getOptions } from "@/lib/regiondo/products";
import { productIdForSlug } from "@/lib/regiondo/slugs";
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
  optionId: z.string().regex(/^\d+$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  qty: z.coerce.number().int().min(1).max(50),
});

/**
 * Reserve stock and hand the customer to Regiondo's checkout.
 *
 * The quantity, option and slot are validated against **live** availability
 * before the hold, so a stale booking panel fails with "those places have gone"
 * rather than with a raw API error. The hold itself is the real authority — the
 * pre-check just buys a better error message.
 *
 * On success the state carries the checkout URL and the client navigates. On a
 * failure *after* the hold (the checkout link could not be fetched) the hold is
 * released straight away rather than left to lapse, so a retry does not find
 * the seats taken by its own previous attempt.
 */
export async function startBooking(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isNativeBookingEnabled()) return fail("Online booking is not available right now.");

  const parsed = startBookingSchema.safeParse({
    slug: formData.get("slug"),
    variationId: formData.get("variationId"),
    optionId: formData.get("optionId"),
    date: formData.get("date"),
    time: formData.get("time"),
    qty: formData.get("qty"),
  });

  if (!parsed.success) {
    return fail("Please choose a date, a time and how many of you are coming.");
  }

  const { slug, variationId, optionId, date, time, qty } = parsed.data;

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

  const options = await getOptions(variationId, date, time);
  const option = options.find((candidate) => candidate.id === optionId);

  if (!option) {
    return fail("That option is no longer available for this date.", {
      recheckAvailability: true,
    });
  }

  if (option.seatsLeft !== null && qty > option.seatsLeft) {
    return fail(
      option.seatsLeft === 0
        ? "This departure has just sold out. Please choose another date."
        : `Only ${option.seatsLeft} ${option.seatsLeft === 1 ? "place is" : "places are"} left for this departure.`,
      { recheckAvailability: true }
    );
  }

  if (option.minPerOrder > 0 && qty < option.minPerOrder) {
    return fail(`This option is booked for at least ${option.minPerOrder} people.`);
  }
  if (option.maxPerOrder > 0 && qty > option.maxPerOrder) {
    return fail(`This option takes at most ${option.maxPerOrder} people per booking.`);
  }

  const item = {
    productId,
    optionId,
    dateTime: toRegiondoDateTime(date, time),
    qty,
  };

  let code: string;
  try {
    code = (await createHold({ item })).code;
  } catch (error) {
    return fail(userMessageFor(error), {
      recheckAvailability: isRegiondoError(error) && error.kind === "stock_unavailable",
    });
  }

  try {
    return { status: "handoff", checkoutUrl: await getCheckoutLink(code) };
  } catch (error) {
    // The seats are held but there is no way to pay for them. Give them back
    // now; the customer's retry will take a fresh hold.
    await releaseHold(code);
    return fail(userMessageFor(error));
  }
}
