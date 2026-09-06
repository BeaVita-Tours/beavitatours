import { describe, expect, it } from "vitest";

import errorBadSignature from "./fixtures/error-bad-signature.json";
import errorNotFound from "./fixtures/error-not-found.json";
import errorMissingParam from "./fixtures/error-reviews-missing-param.json";

import {
  fromCheckoutResult,
  fromHttpStatus,
  hasKind,
  isRegiondoError,
  RegiondoError,
  schemaError,
  timeoutError,
  userMessageFor,
} from "@/lib/regiondo/errors";

describe("HTTP status mapping", () => {
  it.each([
    [401, "auth"],
    [403, "auth"],
    [404, "not_found"],
    [400, "validation"],
    [406, "validation"],
    [422, "validation"],
    [429, "rate_limited"],
    [500, "upstream"],
    [502, "upstream"],
    [503, "upstream"],
  ])("maps %i to %s", (status, kind) => {
    expect(fromHttpStatus(status, "").kind).toBe(kind);
  });

  it("marks only transient failures retryable", () => {
    expect(fromHttpStatus(500, "").retryable).toBe(true);
    expect(fromHttpStatus(429, "").retryable).toBe(true);
    expect(fromHttpStatus(401, "").retryable).toBe(false);
    expect(fromHttpStatus(400, "").retryable).toBe(false);
    expect(fromHttpStatus(404, "").retryable).toBe(false);
  });

  it("classifies the live bad-signature response as auth", () => {
    const { status, body } = errorBadSignature;
    const error = fromHttpStatus(status, body.message, { code: body.code });
    expect(error.kind).toBe("auth");
    expect(error.retryable).toBe(false);
    // The API answers a request made in English with a German message. Nothing
    // may branch on that text, which is the reason `kind` exists.
    expect(body.message).not.toMatch(/unauthori[sz]ed/i);
  });

  it("classifies a suppressed-status 404 body by its code, not the HTTP 200", () => {
    // With suppress_response_code=true the transport says 200 and the real
    // status is in the body.
    const error = fromHttpStatus(errorNotFound.code, errorNotFound.message, { status: 200 });
    expect(error.kind).toBe("not_found");
    expect(error.status).toBe(200);
    expect(error.code).toBe(404);
  });

  it("classifies a missing required parameter as validation", () => {
    expect(fromHttpStatus(errorMissingParam.code, errorMissingParam.message).kind).toBe(
      "validation"
    );
  });
});

describe("checkout result mapping", () => {
  it.each([
    ["stock_not_available", "stock_unavailable"],
    ["reservation_not_possible", "stock_unavailable"],
    ["reservation_not_found", "reservation_expired"],
    ["wrong_reservation_code", "reservation_expired"],
    ["missing_required_data", "validation"],
    ["wrong_qty", "validation"],
    ["wrong_option_id", "validation"],
    ["not_available_in_locale_or_channel", "validation"],
    ["unsupported_payment", "validation"],
    ["incorrect_order_number", "not_found"],
    ["ticket_not_found", "not_found"],
    ["partner_unknown", "auth"],
    ["unknown_error", "unknown"],
  ])("maps result %s to kind %s", (result, kind) => {
    expect(fromCheckoutResult(result, "").kind).toBe(kind);
  });

  it("falls back to unknown for a result the spec does not list", () => {
    // New enum members are a "when", not an "if". Never crash on one.
    expect(fromCheckoutResult("some_future_result", "").kind).toBe("unknown");
  });

  it("keeps the raw result string as the error code", () => {
    expect(fromCheckoutResult("stock_not_available", "").code).toBe("stock_not_available");
  });

  it("never retries a stock or reservation failure", () => {
    // Retrying a hold that failed on stock consumes inventory it cannot get.
    expect(fromCheckoutResult("stock_not_available", "").retryable).toBe(false);
    expect(fromCheckoutResult("reservation_not_found", "").retryable).toBe(false);
  });

  it("carries the partial-availability payload through for the UI", () => {
    const error = fromCheckoutResult("stock_not_available", "", {
      availableItems: [{ product_id: 298190, qty: 2 }],
      notAvailableItems: [{ product_id: 298190, qty: 3 }],
    });
    expect(error.availableItems).toEqual([{ product_id: 298190, qty: 2 }]);
    expect(error.notAvailableItems).toEqual([{ product_id: 298190, qty: 3 }]);
  });
});

describe("timeout and schema errors", () => {
  it("makes a timeout retryable", () => {
    const error = timeoutError("/products", 8000);
    expect(error.kind).toBe("timeout");
    expect(error.retryable).toBe(true);
    expect(error.message).toContain("8000ms");
  });

  it("never retries a schema mismatch, because it is our bug not theirs", () => {
    const error = schemaError("/products/298190", "base_price: not a number");
    expect(error.kind).toBe("schema");
    expect(error.retryable).toBe(false);
  });
});

describe("guards and user-facing copy", () => {
  it("identifies its own errors", () => {
    expect(isRegiondoError(new RegiondoError("auth", "x"))).toBe(true);
    expect(isRegiondoError(new Error("x"))).toBe(false);
    expect(isRegiondoError(null)).toBe(false);
  });

  it("supports branching on several kinds at once", () => {
    const error = fromCheckoutResult("reservation_not_found", "");
    expect(hasKind(error, "reservation_expired", "stock_unavailable")).toBe(true);
    expect(hasKind(error, "auth")).toBe(false);
    expect(hasKind(new Error("x"), "auth")).toBe(false);
  });

  it("gives every kind a message that tells the customer what to do next", () => {
    const stock = userMessageFor(fromCheckoutResult("stock_not_available", ""));
    expect(stock).toMatch(/another date|reduce/i);

    const expired = userMessageFor(fromCheckoutResult("reservation_not_found", ""));
    expect(expired).toMatch(/re-check availability/i);

    // An unrecognised throwable still gets a usable message rather than blank.
    expect(userMessageFor(new Error("boom"))).toBeTruthy();
    expect(userMessageFor(undefined)).toBeTruthy();
  });

  it("never leaks internals into the customer-facing message", () => {
    const error = new RegiondoError("auth", "HMAC mismatch for key BE1164xxx", {
      endpoint: "/checkout/hold",
    });
    const message = userMessageFor(error);
    expect(message).not.toContain("HMAC");
    expect(message).not.toContain("/checkout/hold");
  });

  it("logs structured fields without request params", () => {
    const error = new RegiondoError("upstream", "boom", {
      endpoint: "/checkout/hold",
      status: 502,
      code: 502,
    });
    const fields = error.toLogFields();
    expect(fields).toEqual({
      kind: "upstream",
      endpoint: "/checkout/hold",
      status: 502,
      code: 502,
      retryable: true,
    });
  });
});
