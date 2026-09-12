"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { ActionState } from "@/lib/regiondo/action-state";
import { COLLECTIONS } from "@/lib/regiondo/collections";
import {
  createHold,
  getCheckoutLink,
  getTotals,
  prolongHold,
  releaseHold,
  toRegiondoDateTime,
} from "@/lib/regiondo/checkout";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { isRegiondoError, userMessageFor } from "@/lib/regiondo/errors";
import { getOptions } from "@/lib/regiondo/products";
import {
  clearBookingSession,
  getBookingSession,
  getBookingSessionFor,
  setBookingSession,
  withTrackedParams,
} from "@/lib/regiondo/session";
import { productIdForSlug, tourHref } from "@/lib/regiondo/slugs";
import { consumeRateLimit } from "@/lib/rate-limit";

/**
 * The mutation boundary for the booking flow.
 *
 * Server Actions rather than Route Handlers (D-005): Next checks the request
 * origin and the action id for us, so CSRF is handled without hand-rolling a
 * token; there is no public JSON endpoint for someone to hammer hold creation
 * against; and the forms still work with JavaScript disabled.
 *
 * Rules that hold everywhere in this file:
 *  - every input is re-validated with zod, whatever the client did;
 *  - no price, total or discount is ever read from the request — it is always
 *    recomputed from Regiondo;
 *  - hold creation is rate limited, because it consumes real inventory.
 */

function fail(message: string, extra: Partial<ActionState> = {}): ActionState {
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
 * Reserve stock and move the customer to checkout.
 *
 * The quantity, option and slot are validated against **live** availability
 * before the hold, so a stale booking panel fails with "those places have gone"
 * rather than with a raw API error. The hold itself is the real authority — the
 * pre-check just buys a better error message.
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
  let expiresAt: string;
  try {
    const hold = await createHold({ item });
    code = hold.code;
    expiresAt = hold.expiresAt ?? new Date(Date.now() + 20 * 60_000).toISOString();
  } catch (error) {
    return fail(userMessageFor(error), {
      recheckAvailability: isRegiondoError(error) && error.kind === "stock_unavailable",
    });
  }

  // Carry attribution forward. Paid traffic arrives on /lp/* with UTM tags and
  // the booking flow must not be where that chain breaks.
  const utmRaw = formData.get("utm");
  let utm: Record<string, string> | undefined;
  if (typeof utmRaw === "string" && utmRaw) {
    try {
      const decoded = JSON.parse(utmRaw);
      if (decoded && typeof decoded === "object") {
        utm = Object.fromEntries(
          Object.entries(decoded as Record<string, unknown>)
            .filter(([, v]) => typeof v === "string")
            .map(([k, v]) => [k, String(v).slice(0, 128)])
            .slice(0, 10)
        );
      }
    } catch {
      // Malformed attribution is not worth failing a booking over.
    }
  }

  await setBookingSession({ code, item, expiresAt, slug, utm });

  redirect(withTrackedParams(`/book/${encodeURIComponent(code)}`, utm));
}

/**
 * Extend the hold while the customer is still filling in the form.
 *
 * Returns the new expiry so the countdown can resync. Cheap and idempotent —
 * unlike hold creation, prolonging takes no new stock.
 */
export async function refreshHold(): Promise<{ expiresAt: string } | { error: string }> {
  if (!isNativeBookingEnabled()) return { error: "Online booking is not available right now." };

  const session = await getBookingSession();
  if (!session) return { error: "Your reservation has expired." };

  const limit = consumeRateLimit(await clientKey("regiondo:prolong"), {
    windowMs: 60 * 1000,
    max: 10,
  });
  if (!limit.ok) return { error: "Too many requests." };

  try {
    const prolonged = await prolongHold(session.code);
    await setBookingSession({ ...session, code: prolonged.code, expiresAt: prolonged.expiresAt });
    return { expiresAt: prolonged.expiresAt };
  } catch (error) {
    return { error: userMessageFor(error) };
  }
}

/** Give the seats back and return to the tour. */
export async function abandonBooking(): Promise<void> {
  const session = await getBookingSession();
  await clearBookingSession();

  if (session) {
    await releaseHold(session.code);
    redirect(tourHref(session.item.productId));
  }

  redirect(COLLECTIONS.shared.href);
}

const contactSchema = z.object({
  firstname: z.string().trim().min(1, "Please tell us your first name.").max(80),
  lastname: z.string().trim().min(1, "Please tell us your last name.").max(80),
  email: z.string().trim().email("That email address does not look right.").max(160),
  telephone: z
    .string()
    .trim()
    .min(6, "Please give a phone number we can reach you on.")
    .max(40)
    .regex(/^[+()\d\s.-]+$/, "Please use digits, spaces and + only."),
  comment: z.string().trim().max(1000).optional(),
  /** Honeypot, matching the pattern in lib/travel-agency.ts. */
  website: z.string().max(0).optional(),
});

/**
 * Validate the customer's details, recompute the total server-side, and hand
 * off to Regiondo's hosted checkout.
 *
 * The contact details are validated here so the customer gets inline errors
 * before leaving the site, but they are **not** stored and **not** sent to
 * Regiondo from here — the hosted ticketshop collects them again as part of
 * taking payment. Passing them through our server without a place to put them
 * would be data we do not need and must not keep.
 *
 * The total is recomputed as the last step before handoff. If Regiondo now says
 * a different number than the booking panel showed, that is a price change
 * mid-checkout and the customer is told rather than silently charged.
 */
export async function proceedToPayment(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isNativeBookingEnabled()) return fail("Online booking is not available right now.");

  const code = String(formData.get("code") ?? "");
  const session = await getBookingSessionFor(code);

  if (!session) {
    return fail(
      "Your reservation has expired and the places were released. Please re-check availability — your details are still here.",
      { recheckAvailability: true }
    );
  }

  const parsed = contactSchema.safeParse({
    firstname: formData.get("firstname"),
    lastname: formData.get("lastname"),
    email: formData.get("email"),
    telephone: formData.get("telephone"),
    comment: formData.get("comment") ?? undefined,
    website: formData.get("website") ?? undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return fail("Please check the highlighted fields.", { fieldErrors });
  }

  // Honeypot: a bot filled the hidden field. Behave as though it worked, to
  // avoid teaching the script what tripped it.
  if (parsed.data.website) redirect("/book/confirmation");

  const expected = Number(formData.get("expectedTotal"));

  let checkoutUrl: string;
  try {
    const totals = await getTotals([session.item], { reservationCode: session.code });

    if (Number.isFinite(expected) && Math.abs(totals.grandTotal - expected) > 0.01) {
      return fail(
        `The price for this departure has changed to ${totals.currency} ${totals.grandTotal.toFixed(2)}. Please review it before continuing.`
      );
    }

    checkoutUrl = await getCheckoutLink(session.code);
  } catch (error) {
    return fail(userMessageFor(error), {
      recheckAvailability:
        isRegiondoError(error) &&
        (error.kind === "stock_unavailable" || error.kind === "reservation_expired"),
    });
  }

  // Off to Regiondo's hosted ticketshop, which takes the payment. No card data
  // has been anywhere near this origin, and none will be.
  redirect(checkoutUrl);
}
