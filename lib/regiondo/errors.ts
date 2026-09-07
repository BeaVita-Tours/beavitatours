import "server-only";

/**
 * One error hierarchy for everything the Regiondo API can go wrong with.
 *
 * The point of this file is that no UI code ever string-matches on a message.
 * Regiondo returns German text on a 401 to an English request, and its checkout
 * errors arrive as a `result` enum inside a 202 body — neither is something a
 * component should be reasoning about. Callers branch on `kind`.
 */

export type RegiondoErrorKind =
  /** Signature rejected, key revoked, or clock skew. Not retryable. */
  | "auth"
  /** We sent something the API refuses: bad option id, bad qty, missing field. */
  | "validation"
  /** The requested stock is gone. The user needs another date or fewer seats. */
  | "stock_unavailable"
  /** The hold expired or was never there. Restart from availability. */
  | "reservation_expired"
  /** Product, order or resource does not exist. */
  | "not_found"
  /** We are over the documented request budget. Back off. */
  | "rate_limited"
  /** Regiondo is broken. Retryable. */
  | "upstream"
  /** We gave up waiting. Retryable. */
  | "timeout"
  /** The response did not match its schema. Never retryable — it is our bug. */
  | "schema"
  /** Anything unclassified. Treated as non-retryable. */
  | "unknown";

export interface RegiondoErrorContext {
  readonly endpoint?: string;
  readonly status?: number;
  /** Regiondo's own code (HTTP-ish integer) or `result` string. */
  readonly code?: string | number;
  readonly retryable?: boolean;
  readonly cause?: unknown;
  /**
   * Items the API reported as still available when a hold partially failed.
   * Lets the UI say "only 2 left" instead of "something went wrong".
   */
  readonly availableItems?: unknown;
  readonly notAvailableItems?: unknown;
}

export class RegiondoError extends Error {
  readonly kind: RegiondoErrorKind;
  readonly endpoint?: string;
  readonly status?: number;
  readonly code?: string | number;
  readonly retryable: boolean;
  readonly availableItems?: unknown;
  readonly notAvailableItems?: unknown;

  constructor(kind: RegiondoErrorKind, message: string, context: RegiondoErrorContext = {}) {
    super(message, { cause: context.cause });
    this.name = "RegiondoError";
    this.kind = kind;
    this.endpoint = context.endpoint;
    this.status = context.status;
    this.code = context.code;
    this.retryable = context.retryable ?? DEFAULT_RETRYABLE.has(kind);
    this.availableItems = context.availableItems;
    this.notAvailableItems = context.notAvailableItems;
  }

  /** Safe to log: carries no request params and therefore no PII. */
  toLogFields(): Record<string, string | number | boolean | undefined> {
    return {
      kind: this.kind,
      endpoint: this.endpoint,
      status: this.status,
      code: this.code,
      retryable: this.retryable,
    };
  }
}

const DEFAULT_RETRYABLE = new Set<RegiondoErrorKind>(["upstream", "timeout", "rate_limited"]);

export function isRegiondoError(error: unknown): error is RegiondoError {
  return error instanceof RegiondoError;
}

export function hasKind(error: unknown, ...kinds: RegiondoErrorKind[]): boolean {
  return isRegiondoError(error) && kinds.includes(error.kind);
}

/**
 * The `result` enum from the Checkout API's error body, mapped onto our kinds.
 * Values come from the `errorCheckout` / `errorOrderOptionFields` /
 * `errorCancel` schemas in the OpenAPI document — nothing here is invented.
 */
const CHECKOUT_RESULT_KINDS: Record<string, RegiondoErrorKind> = {
  stock_not_available: "stock_unavailable",
  reservation_not_possible: "stock_unavailable",
  wrong_qty: "validation",
  wrong_option_id: "validation",
  missing_required_data: "validation",
  too_many_items: "validation",
  unsupported_payment: "validation",
  unsupported_shipping: "validation",
  not_available_in_locale_or_channel: "validation",
  reservation_not_found: "reservation_expired",
  wrong_reservation_code: "reservation_expired",
  incorrect_order_number: "not_found",
  ticket_not_found: "not_found",
  no_result_for_input_items: "not_found",
  already_canceled: "validation",
  partner_unknown: "auth",
  unknown_error: "unknown",
};

/**
 * Messages written for a customer mid-booking. Deliberately actionable: each
 * one says what happened and what to do next, because a checkout error with no
 * way forward is the most expensive kind of bug on this site.
 */
const USER_MESSAGES: Record<RegiondoErrorKind, string> = {
  auth: "We could not reach our booking system. Please try again in a moment.",
  validation: "Some of the booking details need another look.",
  stock_unavailable:
    "Those places have just been taken. Please pick another date or reduce the number of guests.",
  reservation_expired:
    "Your reservation timed out and the places were released. We have kept your details — please re-check availability.",
  not_found: "We could not find that booking.",
  rate_limited: "Our booking system is busy. Please try again in a few seconds.",
  upstream: "Our booking system is temporarily unavailable. Please try again shortly.",
  timeout: "Our booking system took too long to answer. Please try again.",
  schema: "Something went wrong on our side. Please try again.",
  unknown: "Something went wrong. Please try again, or contact us and we will book it for you.",
};

export function userMessageFor(error: unknown): string {
  return isRegiondoError(error) ? USER_MESSAGES[error.kind] : USER_MESSAGES.unknown;
}

/** Map a checkout `result` string onto a typed error. */
export function fromCheckoutResult(
  result: string,
  message: string,
  context: RegiondoErrorContext = {}
): RegiondoError {
  const kind = CHECKOUT_RESULT_KINDS[result] ?? "unknown";
  return new RegiondoError(kind, message || result, { ...context, code: result });
}

/**
 * Map an HTTP status (or a `code` from a suppressed-status body) onto a kind.
 *
 * Note 202: the Checkout API uses it for "request understood, but not possible"
 * and puts the reason in the body, so a 202 alone is never a success here.
 */
export function fromHttpStatus(
  status: number,
  message: string,
  context: RegiondoErrorContext = {}
): RegiondoError {
  const kind: RegiondoErrorKind =
    status === 401 || status === 403
      ? "auth"
      : status === 404
        ? "not_found"
        : status === 429
          ? "rate_limited"
          : status === 400 || status === 406 || status === 422
            ? "validation"
            : status >= 500
              ? "upstream"
              : "unknown";

  return new RegiondoError(kind, message || `Regiondo responded ${status}`, {
    ...context,
    // `status` here is the code we classify on, which is not always the
    // transport status: with suppress_response_code=true the transport says
    // 200 and the real code is in the body. Keep the two distinct so logs show
    // what actually came back over the wire.
    status: context.status ?? status,
    code: context.code ?? status,
  });
}

export function timeoutError(endpoint: string, ms: number): RegiondoError {
  return new RegiondoError("timeout", `Regiondo did not respond within ${ms}ms`, {
    endpoint,
    retryable: true,
  });
}

export function schemaError(endpoint: string, detail: string, cause?: unknown): RegiondoError {
  return new RegiondoError(
    "schema",
    `Regiondo returned a shape we do not recognise at ${endpoint}: ${detail}`,
    { endpoint, cause, retryable: false }
  );
}
