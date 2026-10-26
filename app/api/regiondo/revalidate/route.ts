import { type NextRequest, NextResponse } from "next/server";

import { revalidateCatalog } from "@/lib/regiondo/cache";
import { consumeRateLimit } from "@/lib/rate-limit";

/**
 * Cache invalidation for Regiondo catalog data.
 *
 * Point a Regiondo product webhook here, or call it by hand after editing a
 * tour in the dashboard:
 *
 *     POST /api/regiondo/revalidate?secret=<REVALIDATE_SECRET>&product_id=298190
 *
 * Omitting `product_id` flushes the whole catalog — right after a bulk edit,
 * wrong as a habit, since it costs a fresh `/products` call per page on the
 * next request.
 *
 * A Route Handler rather than a Server Action (the exception noted in D-005):
 * the caller is a machine with a shared secret, not a browser with an origin,
 * so Next's action-origin check is not the control that applies here.
 *
 * This mirrors `app/api/revalidate/route.ts`, which does the same job for
 * Sanity, and reuses the same `REVALIDATE_SECRET`.
 */

function isAuthorised(request: NextRequest): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  // No secret configured means no authenticated caller is possible. Refusing is
  // the safe reading: an open cache-buster is a free way to hammer the API.
  if (!expected) return false;

  const provided =
    request.nextUrl.searchParams.get("secret") ??
    request.headers.get("x-regiondo-webhook-secret") ??
    "";

  return timingSafeEqualString(provided, expected);
}

/** Constant-time string compare, so the secret cannot be guessed byte by byte. */
function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const limit = consumeRateLimit(`regiondo:revalidate:${forwarded ?? "unknown"}`, {
    windowMs: 60 * 1000,
    max: 30,
  });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = request.nextUrl.searchParams.get("product_id") ?? undefined;
  if (productId && !/^\d{1,12}$/.test(productId)) {
    return NextResponse.json({ error: "Invalid product_id" }, { status: 400 });
  }

  revalidateCatalog(productId);

  return NextResponse.json({
    revalidated: true,
    scope: productId ? `product ${productId}` : "catalog",
    at: new Date().toISOString(),
  });
}
