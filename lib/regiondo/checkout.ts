import "server-only";

import { request } from "./client";
import { getConfig, HOLD_MINUTES, requireConfig } from "./config";
import { RegiondoError } from "./errors";
import { toConfirmedBooking } from "./map";
import {
  checkoutLinkSchema,
  checkoutTotalsSchema,
  type FieldDefinition,
  orderOptionFieldsSchema,
  purchaseSchema,
  type RegiondoTotals,
  reservationSchema,
  reservationUpdateSchema,
  totalsSchema,
} from "./schemas";
import type {
  BookingLineItem,
  CheckoutField,
  CheckoutTotalsView,
  ConfirmedBooking,
  HeldReservation,
} from "./types";

/**
 * Checkout API wrapper.
 *
 * Nothing in this file is cached, and nothing in it retries. Both are
 * deliberate: every call here either consumes inventory or reads money, and a
 * transparently retried hold books seats twice.
 *
 * The flow this supports, end to end:
 *
 *   createHold      POST   /checkout/hold?collect_totals=true
 *   getTotals       POST   /checkout/totals            (recomputed server-side)
 *   prolongHold     PUT    /checkout/hold
 *   releaseHold     DELETE /checkout/hold
 *   getCheckoutLink GET    /checkout/checkoutlink      -> hosted payment page
 *
 * `POST /checkout/purchase` is intentionally NOT wrapped. Its payment codes are
 * api_external / cashregister / invoice / no_payment — all of which assert that
 * money was collected somewhere else. Using it for a consumer booking would
 * mean taking the card ourselves, which is the one thing this integration
 * refuses to do. See D-001 in docs/regiondo-build-log.md.
 */

/** Regiondo wants "YYYY-MM-DD HH:MM" — not ISO, and not with seconds. */
export function toRegiondoDateTime(date: string, time: string): string {
  return `${date} ${time.slice(0, 5)}`;
}

/**
 * The offset of a time zone at a given instant, in milliseconds.
 * `Intl.DateTimeFormat` is the only DST-correct way to do this without a date
 * library, and `date-fns` (already a dependency) has no tz support without
 * `date-fns-tz`.
 */
function timeZoneOffsetMs(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(new Date(utcMs))
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second)
  );
  return asUtc - utcMs;
}

/**
 * Regiondo reports `reservation_end` as local wall-clock time in the booking's
 * time zone ("2026-09-06 23:03", Europe/Berlin) rather than as an instant.
 * Reading it as UTC would put the countdown off by one or two hours, which for
 * a 20-minute hold means the timer is simply wrong.
 *
 * Two passes: guess the instant treating the wall clock as UTC, look up the
 * real offset at that guess, then correct. The second pass makes it exact
 * across a DST transition.
 */
export function holdExpiryToIso(local: string | null, timeZone: string | null): string | null {
  if (!local) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(local);
  if (!match) return null;

  const [, y, mo, d, h, mi, sec] = match;
  const wallClock = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(sec ?? 0));
  if (!timeZone) return new Date(wallClock).toISOString();

  try {
    let instant = wallClock - timeZoneOffsetMs(wallClock, timeZone);
    instant = wallClock - timeZoneOffsetMs(instant, timeZone);
    return new Date(instant).toISOString();
  } catch {
    // Unknown zone identifier: fall back to treating it as UTC rather than
    // throwing on a checkout page.
    return new Date(wallClock).toISOString();
  }
}

/**
 * `view_type` is present on /checkout/orderoptionfields but absent from the
 * `buyer_data_required` entries returned by /checkout/hold and
 * /checkout/totals, which give only a title. Without a semantic hint the form
 * cannot set `type="email"` or the right `autocomplete`, so derive one from the
 * title when the API omits it.
 */
const TITLE_TO_VIEW_TYPE: readonly (readonly [RegExp, string])[] = [
  [/first\s*name|vorname|nome/i, "first_name"],
  [/last\s*name|surname|nachname|cognome/i, "last_name"],
  [/e-?mail/i, "email"],
  [/tele(phone|fon)|phone|mobile|cell/i, "phone"],
  [/company|organisation|organization/i, "company"],
  [/street|address|strasse/i, "street"],
  [/post(al)?\s*code|zip|plz/i, "postcode"],
  [/city|stadt|citt/i, "city"],
  [/country|land|paese/i, "country"],
  [/birth|geburt/i, "birthdate"],
];

function inferViewType(title: string, declared: string): string {
  if (declared) return declared;
  for (const [pattern, viewType] of TITLE_TO_VIEW_TYPE) {
    if (pattern.test(title)) return viewType;
  }
  return "text";
}

function toCheckoutField(field: FieldDefinition): CheckoutField {
  return {
    id: String(field.field_id),
    label: field.title,
    required: field.required,
    type: field.type,
    viewType: inferViewType(field.title, field.view_type),
    options: field.available_value_ids.map((option) => ({
      value: String(option.id),
      label: option.title ?? String(option.id),
    })),
  };
}

/**
 * `contact_data_required` is a bare list of field names (firstname, lastname,
 * email, telephone). Turn it into the same shape as the richer
 * `buyer_data_required` entries so the form renders one uniform list.
 */
const CONTACT_FIELD_LABELS: Record<string, { label: string; viewType: string }> = {
  firstname: { label: "First name", viewType: "first_name" },
  lastname: { label: "Last name", viewType: "last_name" },
  email: { label: "Email", viewType: "email" },
  telephone: { label: "Phone", viewType: "phone" },
  comment: { label: "Anything we should know?", viewType: "comment" },
};

function toContactFields(names: readonly string[]): CheckoutField[] {
  return names.map((name) => {
    const known = CONTACT_FIELD_LABELS[name];
    return {
      id: name,
      label: known?.label ?? name,
      // The API lists these because they are required; `comment` never is.
      required: name !== "comment",
      type: name === "comment" ? "textarea" : "text",
      viewType: known?.viewType ?? name,
      options: [],
    };
  });
}

function toTotalsView(totals: RegiondoTotals | null | undefined): CheckoutTotalsView | null {
  if (!totals) return null;
  return {
    subtotal: totals.subtotal,
    grandTotal: totals.grand_total,
    currency: totals.currency || getConfig().currency,
    taxAmount: totals.tax?.amount ?? null,
  };
}

/**
 * Merge the two field lists the API returns for the same form.
 *
 * `/checkout/hold` and `/checkout/totals` both return `contact_data_required`
 * (bare names: firstname, lastname, email, telephone) *and*
 * `buyer_data_required` (titled entries: "First name", "Last name", "Email",
 * "Telephone"). For this account they describe the same four fields, so
 * rendering both produced a checkout asking for the customer's name twice.
 *
 * Dedupe on the semantic type rather than on the label, since one list is
 * labelled and the other is not. Fields whose type could not be inferred
 * ("text") are always kept — two unlabelled custom fields are genuinely two
 * fields, and dropping one would silently fail the purchase.
 *
 * The contact entry wins, because its id is the name the server action
 * validates against.
 */
function mergeFields(
  contact: readonly CheckoutField[],
  buyer: readonly CheckoutField[]
): CheckoutField[] {
  const merged = [...contact];
  const claimed = new Set(contact.map((field) => field.viewType).filter((t) => t !== "text"));

  for (const field of buyer) {
    if (field.viewType !== "text" && claimed.has(field.viewType)) continue;
    if (field.viewType !== "text") claimed.add(field.viewType);
    merged.push(field);
  }

  return merged;
}

export interface CreateHoldInput {
  readonly item: BookingLineItem;
  readonly minutes?: number;
}

/**
 * Reserve stock.
 *
 * `collect_totals=true` folds what would be a second round trip into this one:
 * the response carries the totals and the required-field definitions alongside
 * the reservation code, which is both faster and impossible to get out of sync.
 *
 * Never retried. If this times out, the hold may or may not exist upstream; a
 * blind retry would take a second set of seats. The caller surfaces the error
 * and the customer tries again against fresh availability.
 */
export async function createHold({ item, minutes }: CreateHoldInput): Promise<HeldReservation> {
  const config = requireConfig();

  const raw = await request("/checkout/hold", {
    method: "POST",
    retry: false,
    cache: "no-store",
    schema: reservationSchema,
    params: {
      collect_totals: "true",
      store_locale: config.locale,
      currency: config.currency,
      reserve_minutes: minutes ?? HOLD_MINUTES,
    },
    body: {
      product_id: Number(item.productId),
      option_id: Number(item.optionId),
      date_time: item.dateTime,
      qty: item.qty,
    },
  });

  const reservation = raw.reservation_data[0];
  if (!reservation) {
    throw new RegiondoError("unknown", "Regiondo held the item but returned no reservation code", {
      endpoint: "/checkout/hold",
    });
  }

  return {
    code: reservation.code,
    // Fall back to the window we asked for when the API omits an end time. The
    // countdown is a UX affordance either way — the authority on expiry is the
    // API refusing the reservation.
    expiresAt:
      holdExpiryToIso(reservation.endsAtLocal, reservation.timezone) ??
      new Date(Date.now() + (minutes ?? HOLD_MINUTES) * 60_000).toISOString(),
    totals: toTotalsView(raw.totals ?? null),
    fields: mergeFields(
      toContactFields(raw.contact_data_required),
      raw.buyer_data_required.map(toCheckoutField)
    ),
  };
}

export interface ProlongedHold {
  /** Authoritative going forward — read it back rather than assuming. */
  readonly code: string;
  readonly expiresAt: string;
}

/**
 * Extend a hold. Called when the countdown gets low and the customer is still
 * filling in the form.
 *
 * The response repeats the reservation envelope. Observed behaviour is that the
 * code is unchanged, but it is read back and returned rather than assumed —
 * carrying on with a stale code would silently send the customer to a checkout
 * link for a reservation that no longer exists.
 */
export async function prolongHold(
  reservationCode: string,
  minutes = HOLD_MINUTES
): Promise<ProlongedHold> {
  requireConfig();

  const raw = await request("/checkout/hold", {
    method: "PUT",
    retry: false,
    cache: "no-store",
    schema: reservationUpdateSchema,
    params: { reservation_code: reservationCode, reserve_minutes: minutes },
  });

  const reservation = raw.reservation_data[0];
  return {
    code: reservation?.code ?? reservationCode,
    expiresAt:
      holdExpiryToIso(reservation?.endsAtLocal ?? null, reservation?.timezone ?? null) ??
      new Date(Date.now() + minutes * 60_000).toISOString(),
  };
}

/**
 * Release a hold. Best-effort by design: the caller is usually abandoning the
 * flow, and a failure here just means the stock returns in 20 minutes instead
 * of now. Never let it break the page the customer is on.
 */
export async function releaseHold(reservationCode: string): Promise<void> {
  if (!getConfig().enabled) return;

  try {
    await request("/checkout/hold", {
      method: "DELETE",
      retry: false,
      cache: "no-store",
      schema: totalsSchema.partial().passthrough(),
      params: { reservation_code: reservationCode },
    });
  } catch {
    // Deliberately swallowed. The hold expires on its own.
  }
}

/**
 * Recompute totals server-side.
 *
 * This is the price of record. Nothing the browser sends about price,
 * discounts or totals is ever trusted — the client posts a line item and a
 * coupon code, and the number that reaches the payment handoff comes from here.
 */
export async function getTotals(
  items: readonly BookingLineItem[],
  options: { reservationCode?: string; couponCode?: string } = {}
): Promise<CheckoutTotalsView & { fields: readonly CheckoutField[] }> {
  const config = requireConfig();

  const raw = await request("/checkout/totals", {
    method: "POST",
    retry: false,
    cache: "no-store",
    schema: checkoutTotalsSchema,
    params: { store_locale: config.locale, currency: config.currency },
    body: {
      items: items.map((item) => ({
        product_id: Number(item.productId),
        option_id: Number(item.optionId),
        date_time: item.dateTime,
        qty: item.qty,
        ...(options.reservationCode ? { reservation_code: options.reservationCode } : {}),
      })),
      ...(options.couponCode ? { coupon_code: options.couponCode } : {}),
      source_type: 2, // API, per the CheckoutTotalsInputData schema
    },
  });

  const view = toTotalsView(raw.totals);
  return {
    subtotal: view?.subtotal ?? 0,
    grandTotal: view?.grandTotal ?? 0,
    currency: view?.currency ?? config.currency,
    taxAmount: view?.taxAmount ?? null,
    fields: mergeFields(
      toContactFields(raw.contact_data_required),
      raw.buyer_data_required.map(toCheckoutField)
    ),
  };
}

/**
 * The fields a checkout must collect for these items, without holding stock.
 * Used to render the form before the customer commits to a slot.
 */
export async function getRequiredFields(
  items: readonly BookingLineItem[]
): Promise<readonly CheckoutField[]> {
  const config = requireConfig();

  const raw = await request("/checkout/orderoptionfields", {
    method: "POST",
    retry: false,
    cache: "no-store",
    schema: orderOptionFieldsSchema,
    params: { store_locale: config.locale },
    body: {
      items: items.map((item) => ({
        product_id: Number(item.productId),
        option_id: Number(item.optionId),
        date_time: item.dateTime,
        qty: item.qty,
      })),
    },
  });

  return raw.buyer_data_required.map(toCheckoutField);
}

/**
 * The payment handoff.
 *
 * Returns a URL into Regiondo's hosted ticketshop for an existing hold. This is
 * where the customer enters card details — on Regiondo's domain, under their
 * PCI scope, never ours.
 *
 * The endpoint takes only reservation_code, store_locale and currency: there is
 * no return-URL parameter, so the customer finishes on Regiondo's confirmation
 * page unless a return URL is configured in the ticketshop settings. See the
 * open items in docs/regiondo-build-log.md.
 */
export async function getCheckoutLink(reservationCode: string): Promise<string> {
  const config = requireConfig();

  const links = await request("/checkout/checkoutlink", {
    retry: false,
    cache: "no-store",
    schema: checkoutLinkSchema,
    params: {
      reservation_code: reservationCode,
      store_locale: config.locale,
      currency: config.currency,
    },
  });

  const link = links[0]?.checkout_link;
  if (!link) {
    throw new RegiondoError("unknown", "Regiondo returned no checkout link for the reservation", {
      endpoint: "/checkout/checkoutlink",
    });
  }

  // Belt and braces: only ever redirect a customer to Regiondo.
  const host = new URL(link).hostname;
  if (!host.endsWith(".regiondo.com") && !host.endsWith(".regiondo.de")) {
    throw new RegiondoError("unknown", `Refusing to redirect to unexpected host ${host}`, {
      endpoint: "/checkout/checkoutlink",
    });
  }

  return link;
}

/**
 * Verify an order exists, by its public order number.
 *
 * `GET /checkout/purchase?order_number=` is the right endpoint for this, and it
 * took a live probe to establish that:
 *
 *  - the OpenAPI description says it is for orders "placed via API previously",
 *    which is wrong. It resolves any order on the account — verified against
 *    both a Viator-channel order and a ticketshop one. Since we deliberately
 *    never call `POST /checkout/purchase`, a stricter reading would have left
 *    the confirmation page with nothing to verify against.
 *  - `/supplier/bookings?order_ids=` filters on the *internal* order id, not the
 *    public order number, so looking an order up there silently returns nothing.
 *    It also returns every booking on the account, PII included; this returns
 *    exactly one order.
 *
 * The result is narrowed by `toConfirmedBooking` before it can reach a
 * component.
 */
export async function findBookingByOrderNumber(
  orderNumber: string
): Promise<ConfirmedBooking | null> {
  requireConfig();

  // Order numbers are numeric and around 13 digits. Bound it before spending a
  // request, and before putting anything unbounded into a query string.
  if (!/^[0-9]{6,24}$/.test(orderNumber)) return null;

  try {
    const purchase = await request("/checkout/purchase", {
      retry: false,
      cache: "no-store",
      schema: purchaseSchema,
      params: { order_number: orderNumber },
    });

    // Belt and braces: the response must be the order that was asked for.
    if (purchase.order_number !== orderNumber) return null;

    return toConfirmedBooking(purchase);
  } catch (error) {
    if (error instanceof RegiondoError && (error.kind === "not_found" || error.kind === "validation")) {
      return null;
    }
    throw error;
  }
}
