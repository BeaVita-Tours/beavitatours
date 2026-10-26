import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  buildSignedRequest,
  httpBuildQuery,
  phpUrlEncode,
  signingMessage,
} from "@/lib/regiondo/signing";

/**
 * Vectors below are what PHP's `http_build_query()` produces. They are the
 * contract with Regiondo's server, which recomputes the HMAC over a string it
 * built with that function — so a mismatch here is a 401, not a style nit.
 *
 * Reproduce any of them with:
 *   php -r 'echo http_build_query(["a" => "b c"]);'
 */
describe("phpUrlEncode (PHP urlencode / RFC1738)", () => {
  it("renders a space as + rather than %20", () => {
    expect(phpUrlEncode("b c")).toBe("b+c");
  });

  it("escapes the characters encodeURIComponent leaves alone", () => {
    // These five are the classic divergence: JS treats them as unreserved.
    expect(phpUrlEncode("!")).toBe("%21");
    expect(phpUrlEncode("*")).toBe("%2A");
    expect(phpUrlEncode("'")).toBe("%27");
    expect(phpUrlEncode("(")).toBe("%28");
    expect(phpUrlEncode(")")).toBe("%29");
    expect(phpUrlEncode("~")).toBe("%7E");
  });

  it("leaves PHP's unreserved set alone", () => {
    expect(phpUrlEncode("AZaz09-_.")).toBe("AZaz09-_.");
  });

  it("percent-encodes reserved and structural characters", () => {
    expect(phpUrlEncode("a@b.com")).toBe("a%40b.com");
    expect(phpUrlEncode("08:00")).toBe("08%3A00");
    expect(phpUrlEncode("a,b")).toBe("a%2Cb");
    expect(phpUrlEncode("a&b=c")).toBe("a%26b%3Dc");
    expect(phpUrlEncode("a/b")).toBe("a%2Fb");
    expect(phpUrlEncode("a+b")).toBe("a%2Bb");
  });

  it("encodes non-ASCII as UTF-8 percent triplets", () => {
    expect(phpUrlEncode("Caffè")).toBe("Caff%C3%A8");
    expect(phpUrlEncode("中文")).toBe("%E4%B8%AD%E6%96%87");
  });

  it("distinguishes a literal + from an encoded space", () => {
    // Both round-trip differently on the server; conflating them is the bug
    // this whole module exists to prevent.
    expect(phpUrlEncode(" ")).toBe("+");
    expect(phpUrlEncode("+")).toBe("%2B");
  });
});

describe("httpBuildQuery", () => {
  it("builds a flat query in insertion order", () => {
    expect(httpBuildQuery({ limit: 250, offset: 0 })).toBe("limit=250&offset=0");
  });

  it("preserves the caller's key order, and does not sort", () => {
    // Order is part of the signed message, so a stable-but-different order
    // would still be wrong.
    expect(httpBuildQuery({ offset: 0, limit: 250 })).toBe("offset=0&limit=250");
  });

  it("skips null and undefined but keeps empty strings", () => {
    expect(httpBuildQuery({ a: null, b: undefined, c: "", d: 1 })).toBe("c=&d=1");
  });

  it("serialises booleans as 1 and 0", () => {
    expect(httpBuildQuery({ show_soldout: true, debug: false })).toBe("show_soldout=1&debug=0");
  });

  it("uses bracket notation for nested objects", () => {
    expect(httpBuildQuery({ a: { b: 1, c: 2 } })).toBe("a%5Bb%5D=1&a%5Bc%5D=2");
  });

  it("indexes arrays numerically", () => {
    expect(httpBuildQuery({ ids: ["x", "y"] })).toBe("ids%5B0%5D=x&ids%5B1%5D=y");
  });

  it("nests arrays of objects the way PHP does", () => {
    expect(httpBuildQuery({ items: [{ product_id: 1, qty: 2 }] })).toBe(
      "items%5B0%5D%5Bproduct_id%5D=1&items%5B0%5D%5Bqty%5D=2"
    );
  });

  it("contributes nothing for empty containers", () => {
    expect(httpBuildQuery({})).toBe("");
    expect(httpBuildQuery({ a: [], b: {} })).toBe("");
    expect(httpBuildQuery({ a: [], b: 1 })).toBe("b=1");
  });

  it("encodes the real parameter shapes this integration sends", () => {
    // GET /products/availabilities/{id}
    expect(
      httpBuildQuery({ dt_from: "2026-09-10", dt_to: "2026-09-20", show_soldout: "true" })
    ).toBe("dt_from=2026-09-10&dt_to=2026-09-20&show_soldout=true");

    // GET /products/availoptions/{id} — note HH:MM, not HH:MM:SS
    expect(httpBuildQuery({ date: "2026-09-15", time: "08:00" })).toBe(
      "date=2026-09-15&time=08%3A00"
    );

    // GET /checkout/hold — a datetime carries both a space and a colon
    expect(httpBuildQuery({ date_time: "2026-09-15 08:00" })).toBe(
      "date_time=2026-09-15+08%3A00"
    );

    // GET /products with a multi-word search term
    expect(httpBuildQuery({ kwd: "prosecco hills", kwd_condition: "AND" })).toBe(
      "kwd=prosecco+hills&kwd_condition=AND"
    );

    // Comma-separated id lists stay comma-separated, but the comma is encoded
    expect(httpBuildQuery({ product_ids: "298190,300877" })).toBe(
      "product_ids=298190%2C300877"
    );
  });
});

describe("buildSignedRequest", () => {
  const publicKey = "PUBLIC_KEY_FIXTURE";
  const privateKey = "PRIVATE_KEY_FIXTURE";
  const timestamp = 1_772_000_000;

  it("signs timestamp + publicKey + query with HMAC-SHA256, hex encoded", () => {
    const params = { limit: 2, offset: 0 };
    const { query, headers } = buildSignedRequest({
      publicKey,
      privateKey,
      params,
      timestamp,
    });

    const expected = createHmac("sha256", privateKey)
      .update(`${timestamp}${publicKey}limit=2&offset=0`, "utf8")
      .digest("hex");

    expect(query).toBe("limit=2&offset=0");
    expect(headers["X-API-HASH"]).toBe(expected);
    expect(headers["X-API-HASH"]).toMatch(/^[0-9a-f]{64}$/);
  });

  it("signs the exact string it returns for sending", () => {
    // The single most important property in this file: sign(x) and send(x)
    // must agree, including the +/%20 choice.
    const params = { kwd: "prosecco hills", tag: "45420" };
    const { query, headers } = buildSignedRequest({
      publicKey,
      privateKey,
      params,
      timestamp,
    });

    const recomputed = createHmac("sha256", privateKey)
      .update(signingMessage(timestamp, publicKey, query), "utf8")
      .digest("hex");

    expect(headers["X-API-HASH"]).toBe(recomputed);
    expect(query).toContain("+");
    expect(query).not.toContain("%20");
  });

  it("signs the empty query for parameterless calls", () => {
    const { query, headers } = buildSignedRequest({ publicKey, privateKey, timestamp });
    const expected = createHmac("sha256", privateKey)
      .update(`${timestamp}${publicKey}`, "utf8")
      .digest("hex");

    expect(query).toBe("");
    expect(headers["X-API-HASH"]).toBe(expected);
  });

  it("produces different signatures for different key orders", () => {
    const a = buildSignedRequest({
      publicKey,
      privateKey,
      params: { limit: 2, offset: 0 },
      timestamp,
    });
    const b = buildSignedRequest({
      publicKey,
      privateKey,
      params: { offset: 0, limit: 2 },
      timestamp,
    });
    expect(a.headers["X-API-HASH"]).not.toBe(b.headers["X-API-HASH"]);
  });

  it("sets the identity headers and omits Accept-Language when no locale is given", () => {
    const { headers } = buildSignedRequest({ publicKey, privateKey, timestamp });
    expect(headers["X-API-ID"]).toBe(publicKey);
    expect(headers["X-API-TIME"]).toBe(String(timestamp));
    expect(headers["Accept-Language"]).toBeUndefined();
  });

  it("passes the locale through as Accept-Language", () => {
    const { headers } = buildSignedRequest({
      publicKey,
      privateKey,
      timestamp,
      locale: "en-US",
    });
    expect(headers["Accept-Language"]).toBe("en-US");
  });

  it("never puts key material in a header other than the public id", () => {
    const { headers } = buildSignedRequest({ publicKey, privateKey, timestamp });
    const serialised = JSON.stringify(headers);
    expect(serialised).not.toContain(privateKey);
  });
});
