import "server-only";

import type { z } from "zod";

import { getConfig, requireConfig } from "./config";
import {
  fromCheckoutResult,
  fromHttpStatus,
  RegiondoError,
  schemaError,
  timeoutError,
} from "./errors";
import { buildSignedRequest, type QueryObject } from "./signing";

/**
 * The single door to the Regiondo API.
 *
 * Everything above this file works with parsed domain objects; everything below
 * it is HTTP. Responsibilities: sign, send, time out, retry the retryable,
 * normalise both error shapes, validate with zod, and log a redacted line.
 */

const DEFAULT_TIMEOUT_MS = 8_000;
/** Checkout writes get longer — the customer is watching a spinner either way. */
const WRITE_TIMEOUT_MS = 12_000;
const MAX_ATTEMPTS = 3;
const BACKOFF_BASE_MS = 250;

export interface RequestOptions<T> {
  readonly method?: "GET" | "POST" | "PUT" | "DELETE";
  readonly params?: QueryObject;
  readonly body?: unknown;
  /**
   * Output type may differ from input type — most of these schemas coerce
   * (strings to numbers, keyed objects to arrays), so the third type parameter
   * has to stay open or every transforming schema is rejected here.
   */
  readonly schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  readonly locale?: string;
  readonly timeoutMs?: number;
  /**
   * Retries are opt-out rather than opt-in so that read paths get resilience by
   * default. Any call that consumes or commits inventory must set this false —
   * a retried hold double-books, and a retried purchase double-charges.
   */
  readonly retry?: boolean;
  /**
   * Next.js fetch options. Catalog reads pass revalidate/tags; anything
   * representing live stock or money passes `{ cache: "no-store" }`.
   */
  readonly next?: RequestInit["next"];
  readonly cache?: RequestCache;
}

interface RawResult {
  readonly status: number;
  readonly body: unknown;
}

/**
 * Regiondo wraps most collections as `{data, page}`, some as a bare array, and
 * a few (checkout) as a flat object. Unwrapping happens here so that schemas
 * describe the payload rather than the envelope.
 */
function unwrap(body: unknown): unknown {
  if (body && typeof body === "object" && !Array.isArray(body) && "data" in body) {
    return (body as { data: unknown }).data;
  }
  return body;
}

export function extractPage(body: unknown): PageInfo | null {
  if (!body || typeof body !== "object" || !("page" in body)) return null;
  const page = (body as { page: unknown }).page;
  if (!page || typeof page !== "object") return null;
  const p = page as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" ? v : Number.parseInt(String(v), 10));
  return {
    current: num(p.current) || 1,
    last: num(p.last) || 1,
    totalItems: num(p.total_items) || 0,
    totalPages: num(p.total_pages) || 1,
    limit: num(p.limit) || 0,
  };
}

export interface PageInfo {
  readonly current: number;
  readonly last: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly limit: number;
}

/**
 * Detect the two error shapes documented in the OpenAPI spec:
 *
 *  - `{code, message}` — transport-level, carried at the HTTP status, or at
 *    HTTP 200 when `suppress_response_code=true` was sent.
 *  - `{data: {result, message, available_items, not_available_items}}` —
 *    the Checkout API's own vocabulary, returned with HTTP 202.
 *
 * A 202 is never a success on this API, and a 200 is not automatically one.
 */
function detectError(status: number, body: unknown, endpoint: string): RegiondoError | null {
  if (body && typeof body === "object") {
    const outer = body as Record<string, unknown>;

    // Checkout error envelope. `result: "ok"` is the success sentinel.
    const inner = outer.data;
    if (inner && typeof inner === "object" && "result" in inner) {
      const result = String((inner as { result: unknown }).result);
      if (result !== "ok") {
        const detail = inner as Record<string, unknown>;
        return fromCheckoutResult(result, String(detail.message ?? ""), {
          endpoint,
          status,
          availableItems: detail.available_items,
          notAvailableItems: detail.not_available_items,
        });
      }
    }

    // Some checkout endpoints return the flat form without the `data` wrapper.
    if ("result" in outer && typeof outer.result === "string" && outer.result !== "ok") {
      return fromCheckoutResult(outer.result, String(outer.message ?? ""), { endpoint, status });
    }

    // Transport error body, with or without a matching HTTP status.
    if (typeof outer.code === "number" && typeof outer.message === "string" && !("data" in outer)) {
      return fromHttpStatus(outer.code, outer.message, { endpoint, status, code: outer.code });
    }
  }

  if (status >= 400 || status === 202) {
    return fromHttpStatus(status, `Regiondo responded ${status}`, { endpoint, status });
  }

  return null;
}

async function sendOnce(
  url: string,
  init: RequestInit,
  endpoint: string,
  timeoutMs: number
): Promise<RawResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();

    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        throw schemaError(endpoint, "response was not JSON");
      }
    }

    logUpstream({ endpoint, status: response.status, ms: Date.now() - startedAt });
    return { status: response.status, body };
  } catch (error) {
    if (error instanceof RegiondoError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      logUpstream({ endpoint, status: 0, ms: Date.now() - startedAt, error: "timeout" });
      throw timeoutError(endpoint, timeoutMs);
    }
    logUpstream({ endpoint, status: 0, ms: Date.now() - startedAt, error: "network" });
    throw new RegiondoError("upstream", "Could not reach Regiondo", {
      endpoint,
      cause: error,
      retryable: true,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Structured, redacted upstream logging. Deliberately logs only the endpoint
 * template, never the URL — query strings carry reservation codes and, on the
 * booking lookup, order numbers.
 */
function logUpstream(fields: {
  endpoint: string;
  status: number;
  ms: number;
  error?: string;
  code?: string | number;
}): void {
  const line = {
    at: "regiondo.upstream",
    endpoint: fields.endpoint,
    status: fields.status,
    ms: fields.ms,
    ...(fields.error ? { error: fields.error } : {}),
    ...(fields.code !== undefined ? { code: fields.code } : {}),
  };
  if (fields.error || fields.status >= 400) console.warn(JSON.stringify(line));
  else if (process.env.NODE_ENV !== "production") console.info(JSON.stringify(line));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function request<T>(path: string, options: RequestOptions<T>): Promise<T> {
  const { body: parsed } = await requestWithMeta(path, options);
  return parsed;
}

export async function requestWithMeta<T>(
  path: string,
  options: RequestOptions<T>
): Promise<{ body: T; page: PageInfo | null }> {
  const config = requireConfig();
  const method = options.method ?? "GET";
  const isWrite = method !== "GET";
  const timeoutMs = options.timeoutMs ?? (isWrite ? WRITE_TIMEOUT_MS : DEFAULT_TIMEOUT_MS);
  // Writes never retry unless a caller explicitly opts in: /checkout/hold
  // consumes inventory and /checkout/purchase takes money.
  const retry = options.retry ?? !isWrite;

  let lastError: RegiondoError | null = null;

  for (let attempt = 1; attempt <= (retry ? MAX_ATTEMPTS : 1); attempt++) {
    // Re-sign every attempt: X-API-TIME is part of the signature, and a stale
    // timestamp on a retry can trip the server's clock-skew window.
    const { query, headers } = buildSignedRequest({
      publicKey: config.publicKey,
      privateKey: config.privateKey,
      params: options.params,
      locale: options.locale ?? config.locale,
    });

    const init: RequestInit = {
      method,
      headers: options.body
        ? { ...headers, "Content-Type": "application/json" }
        : { ...headers },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
      ...(options.cache ? { cache: options.cache } : {}),
      ...(options.next ? { next: options.next } : {}),
    };

    const url = `${config.baseUrl}${path}${query ? `?${query}` : ""}`;

    try {
      const raw = await sendOnce(url, init, path, timeoutMs);
      const error = detectError(raw.status, raw.body, path);

      if (error) {
        if (!error.retryable || attempt === MAX_ATTEMPTS || !retry) throw error;
        lastError = error;
        await sleep(BACKOFF_BASE_MS * 2 ** (attempt - 1) + Math.random() * 100);
        continue;
      }

      const payload = unwrap(raw.body);
      const validated = options.schema.safeParse(payload);
      if (!validated.success) {
        throw schemaError(
          path,
          validated.error.issues
            .slice(0, 3)
            .map((i) => `${i.path.join(".") || "<root>"}: ${i.message}`)
            .join("; "),
          validated.error
        );
      }

      return { body: validated.data, page: extractPage(raw.body) };
    } catch (error) {
      const normalised =
        error instanceof RegiondoError
          ? error
          : new RegiondoError("unknown", "Regiondo request failed", { endpoint: path, cause: error });

      if (!normalised.retryable || attempt === MAX_ATTEMPTS || !retry) throw normalised;
      lastError = normalised;
      await sleep(BACKOFF_BASE_MS * 2 ** (attempt - 1) + Math.random() * 100);
    }
  }

  throw lastError ?? new RegiondoError("unknown", "Regiondo request failed", { endpoint: path });
}

/**
 * Read wrapper that degrades instead of throwing. Catalog pages use this so a
 * Regiondo outage renders cached or empty content with a notice rather than a
 * 500. Anything touching stock or money must NOT use it — silently pretending
 * a hold succeeded would be far worse than an error page.
 */
export async function tryRequest<T>(
  path: string,
  options: RequestOptions<T>,
  fallback: T
): Promise<{ data: T; degraded: boolean }> {
  if (!getConfig().enabled) return { data: fallback, degraded: true };
  try {
    return { data: await request(path, options), degraded: false };
  } catch (error) {
    if (error instanceof RegiondoError) {
      console.warn(JSON.stringify({ at: "regiondo.degraded", ...error.toLogFields() }));
    }
    return { data: fallback, degraded: true };
  }
}
