import "server-only";

import { createHmac } from "node:crypto";

/**
 * Request signing for the Regiondo API.
 *
 * Every request carries three headers:
 *
 *     X-API-ID    the public key
 *     X-API-TIME  unix seconds
 *     X-API-HASH  hex HMAC-SHA256 over `time + publicKey + query`, keyed with
 *                 the private key
 *
 * The trap is `query`. Regiondo's reference client is PHP and builds it with
 * `http_build_query()`, so the server recomputes the signature over a string
 * produced by PHP's encoding rules. Those are not JavaScript's:
 *
 *   | value              | PHP http_build_query | encodeURIComponent |
 *   |--------------------|----------------------|--------------------|
 *   | " " (space)        | `+`                  | `%20`              |
 *   | `~`                | `%7E`                | `~`                |
 *   | `!` `*` `'` `(` `)`| percent-encoded      | left as-is         |
 *   | `{a: {b: 1}}`      | `a%5Bb%5D=1`         | n/a                |
 *
 * PHP's `http_build_query` defaults to PHP_QUERY_RFC1738, i.e. `urlencode()`,
 * which escapes everything outside `[A-Za-z0-9_.-]` and renders a space as `+`.
 *
 * Two invariants follow, and both are load-bearing:
 *
 *  1. The string that is signed must be byte-identical to the string that is
 *     sent. `buildRequest` therefore returns both from one call — there is no
 *     supported way to sign one string and send another.
 *  2. Key order is part of the signature. Object property order is preserved
 *     as given; nothing here sorts.
 */

/** PHP `urlencode()` — RFC1738, the default for `http_build_query`. */
export function phpUrlEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, "+");
}

export type QueryValue = string | number | boolean | null | undefined | QueryObject | QueryValue[];
export interface QueryObject {
  [key: string]: QueryValue;
}

/**
 * A faithful port of PHP's `http_build_query` for the subset of shapes this API
 * uses: flat scalars, nested objects and arrays.
 *
 * Matches PHP in the ways that matter here:
 * - `null` and `undefined` entries are skipped entirely (PHP drops nulls).
 * - booleans serialise as `1` / `0`.
 * - arrays use their numeric index as the key, so `{a: ["x","y"]}` becomes
 *   `a%5B0%5D=x&a%5B1%5D=y`.
 * - empty objects and empty arrays contribute nothing.
 */
export function httpBuildQuery(params: QueryObject, prefix = ""): string {
  const parts: string[] = [];

  for (const [rawKey, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;

    const key = prefix ? `${prefix}[${rawKey}]` : rawKey;

    if (Array.isArray(value)) {
      const nested: QueryObject = {};
      value.forEach((item, index) => {
        nested[String(index)] = item;
      });
      const encoded = httpBuildQuery(nested, key);
      if (encoded) parts.push(encoded);
      continue;
    }

    if (typeof value === "object") {
      const encoded = httpBuildQuery(value as QueryObject, key);
      if (encoded) parts.push(encoded);
      continue;
    }

    const scalar = typeof value === "boolean" ? (value ? "1" : "0") : String(value);
    parts.push(`${phpUrlEncode(key)}=${phpUrlEncode(scalar)}`);
  }

  return parts.join("&");
}

export interface SignedRequest {
  /** Exactly what goes after `?`. Empty string when there are no params. */
  readonly query: string;
  readonly headers: Readonly<Record<string, string>>;
}

export interface SignOptions {
  readonly publicKey: string;
  readonly privateKey: string;
  readonly params?: QueryObject;
  /** Unix seconds. Injectable so tests are deterministic. */
  readonly timestamp?: number;
  readonly locale?: string;
}

/**
 * Build the query string and the signed headers together, so the two can never
 * drift apart.
 */
export function buildSignedRequest({
  publicKey,
  privateKey,
  params = {},
  timestamp = Math.floor(Date.now() / 1000),
  locale,
}: SignOptions): SignedRequest {
  const query = httpBuildQuery(params);
  const message = `${timestamp}${publicKey}${query}`;
  const hash = createHmac("sha256", privateKey).update(message, "utf8").digest("hex");

  const headers: Record<string, string> = {
    "X-API-ID": publicKey,
    "X-API-TIME": String(timestamp),
    "X-API-HASH": hash,
    Accept: "application/json",
  };

  if (locale) headers["Accept-Language"] = locale;

  return { query, headers };
}

/**
 * The message that gets signed. Exported for tests and for the troubleshooting
 * section of docs/regiondo-integration.md — when a 401 shows up, comparing this
 * string against the request's actual query string is the whole debugging
 * procedure.
 */
export function signingMessage(timestamp: number, publicKey: string, query: string): string {
  return `${timestamp}${publicKey}${query}`;
}
