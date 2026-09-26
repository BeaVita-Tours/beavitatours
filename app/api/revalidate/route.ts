import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * On-demand revalidation webhook for the blog.
 *
 * Point a Sanity webhook at
 *   POST https://<your-domain>/api/revalidate?secret=<REVALIDATE_SECRET>
 * on document create/update/delete, and this route invalidates every cached
 * blog page (list, category, detail) so new posts appear without a redeploy.
 *
 * Route handlers aren't subject to page prerender validation, so calling
 * `revalidateTag` here is cache-components safe. The second argument names the
 * cache-life profile the tag lives in (see `cacheLife.blog` in next.config.ts).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "REVALIDATE_SECRET is not configured" },
      { status: 503 },
    );
  }

  const sentSecret =
    request.nextUrl.searchParams.get("secret") ??
    request.headers.get("x-sanity-webhook-secret");

  if (sentSecret !== secret) {
    return NextResponse.json({ ok: false, message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("blog", "blog");

  return NextResponse.json({
    ok: true,
    revalidated: true,
    timestamp: Date.now(),
  });
}
