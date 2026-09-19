import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { seoConfig } from "@/lib/seo/config";
import { fetchSnapshot } from "@/lib/seo/transport";
import { getSnapshot, publicationTag } from "@/lib/seo/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
async function connection(request: Request) {
  try {
    const config = seoConfig();
    if (!config)
      return Response.json(
        { error: "Connector disabled." },
        { status: 404, headers },
      );
    const supplied = request.headers.get("authorization") || "",
      expected = `Bearer ${config.refreshSecret}`;
    if (
      Buffer.byteLength(supplied) !== Buffer.byteLength(expected) ||
      !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
    )
      return Response.json(
        { error: "Unauthorized." },
        { status: 401, headers },
      );
    if (request.headers.has("origin") || request.headers.has("sec-fetch-site"))
      return Response.json(
        { error: "Server-to-server requests only." },
        { status: 403, headers },
      );
    if (request.method === "POST") {
      // Only clear the last good copy if the new data passes validation.
      const snapshot = await fetchSnapshot(config);
      revalidateTag(publicationTag, { expire: 0 });
      // Next clears the tag when this request finishes, so check the cache in the
      // next GET. Anything cached here would be cleared too.
      return Response.json(
        { accepted: true, contentHash: snapshot.contentHash },
        { status: 202, headers },
      );
    }
    const snapshot = await getSnapshot();
    if (!snapshot) throw new Error("Connector disabled.");
    return Response.json(
      {
        protocol: snapshot.protocol,
        mode: snapshot.mode,
        siteUrl: snapshot.siteUrl,
        contentHash: snapshot.contentHash,
      },
      { headers },
    );
  } catch {
    return Response.json(
      {
        error:
          "Publications could not be validated. Existing content is retained. Check the connector configuration and retry.",
      },
      { status: 503, headers },
    );
  }
}
export const GET = connection;
export const POST = connection;
