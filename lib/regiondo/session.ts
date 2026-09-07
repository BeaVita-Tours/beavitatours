import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { requireConfig } from "./config";
import type { BookingLineItem } from "./types";

/**
 * Booking session state.
 *
 * What is stored: a reservation code and the line item it refers to — product,
 * option, slot, quantity. All of it opaque references to Regiondo entities.
 * **No customer data.** Names, emails and phone numbers are posted straight
 * through to Regiondo and never persisted here.
 *
 * Why a signed cookie rather than a server-side store: there is no session
 * backend in this app, and the deployment is serverless, so an in-memory map
 * would not survive between requests. The cookie is `httpOnly` (so no client
 * script can read the reservation code), `sameSite=lax` (so a cross-site POST
 * cannot drive a booking), and HMAC-signed (so nobody can mint a session for a
 * reservation they do not hold, or edit the quantity after the fact).
 *
 * The signature matters more than it looks: reservations are account-global.
 * `GET /checkout/hold` lists every active hold on the API key, so a guessable
 * or forgeable session would let one visitor drive another's checkout. Holding
 * the code in a signed httpOnly cookie is what binds a reservation to a browser.
 */

export const BOOKING_COOKIE = "bv_booking";

/** A little longer than the 20-minute hold, so an expired hold shows a proper
 *  "your reservation timed out" page instead of a bare 404. */
const COOKIE_MAX_AGE_SECONDS = 45 * 60;

export interface BookingSession {
  readonly code: string;
  readonly item: BookingLineItem;
  /** ISO instant the hold lapses. */
  readonly expiresAt: string;
  /** Slug of the tour, so recovery pages can link back without a lookup. */
  readonly slug: string;
  /** Attribution captured at the start of checkout — see `session.utm`. */
  readonly utm?: Readonly<Record<string, string>>;
}

/**
 * Derive the cookie signing key from the Regiondo private key rather than
 * introducing another secret to manage. The private key is server-only, high
 * entropy and already required for the feature to work at all; the `info`
 * string keeps this derived key distinct from the one used for API signatures,
 * so the two can never be confused for each other.
 *
 * Rotating the API key invalidates in-flight booking sessions. Given they last
 * twenty minutes, that is a fair trade for one less secret in the environment.
 */
function signingKey(): Buffer {
  return createHmac("sha256", requireConfig().privateKey)
    .update("beavita.booking.session.v1")
    .digest();
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

function encode(session: BookingSession): string {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(raw: string): BookingSession | null {
  const separator = raw.lastIndexOf(".");
  if (separator <= 0) return null;

  const payload = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);

  const expected = Buffer.from(sign(payload), "utf8");
  const received = Buffer.from(signature, "utf8");
  // Constant-time compare, and length-check first because timingSafeEqual
  // throws rather than returning false on a length mismatch.
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      typeof parsed?.code !== "string" ||
      typeof parsed?.expiresAt !== "string" ||
      typeof parsed?.slug !== "string" ||
      typeof parsed?.item?.productId !== "string" ||
      typeof parsed?.item?.optionId !== "string" ||
      typeof parsed?.item?.dateTime !== "string" ||
      typeof parsed?.item?.qty !== "number"
    ) {
      return null;
    }
    return parsed as BookingSession;
  } catch {
    return null;
  }
}

export async function setBookingSession(session: BookingSession): Promise<void> {
  const store = await cookies();
  store.set(BOOKING_COOKIE, encode(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function getBookingSession(): Promise<BookingSession | null> {
  const store = await cookies();
  const raw = store.get(BOOKING_COOKIE)?.value;
  return raw ? decode(raw) : null;
}

/**
 * Read the session only if it matches the reservation code in the URL.
 *
 * The checkout route is `/book/[code]`, but the code in the path is never
 * trusted on its own — it only selects which session to load. Someone pasting
 * a reservation code they found elsewhere gets nothing.
 */
export async function getBookingSessionFor(code: string): Promise<BookingSession | null> {
  const session = await getBookingSession();
  return session && session.code === code ? session : null;
}

export async function clearBookingSession(): Promise<void> {
  const store = await cookies();
  store.delete(BOOKING_COOKIE);
}

/**
 * Attribution parameters worth carrying through checkout. Paid traffic lands on
 * `/lp/*` with these attached, and the booking flow must not be the place the
 * chain breaks.
 */
export const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
] as const;

export function pickTrackedParams(
  params: Record<string, string | string[] | undefined>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of TRACKED_PARAMS) {
    const value = params[key];
    const single = Array.isArray(value) ? value[0] : value;
    // Cap the length: these end up in a cookie, and an oversized one is
    // dropped silently by the browser, taking the reservation code with it.
    if (single) out[key] = single.slice(0, 128);
  }
  return out;
}

/** Re-attach captured attribution to a URL, without clobbering what is there. */
export function withTrackedParams(
  path: string,
  utm: Readonly<Record<string, string>> | undefined
): string {
  if (!utm || Object.keys(utm).length === 0) return path;
  const [base, existing] = path.split("?");
  const search = new URLSearchParams(existing);
  for (const [key, value] of Object.entries(utm)) {
    if (!search.has(key)) search.set(key, value);
  }
  return `${base}?${search.toString()}`;
}
