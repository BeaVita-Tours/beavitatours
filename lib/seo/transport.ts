import { validateSnapshot } from "./contract";
import { contentEndpoint, workspaceSiteUrl, type SeoConfig } from "./config";
import { getPostSlugs } from "../sanity/queries";
import { assertNoBlogConflicts } from "./publications";

export async function fetchSnapshot(
  config: SeoConfig,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(contentEndpoint(config.studioUrl), {
    headers: {
      Authorization: `Bearer ${config.readToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(5000),
  });
  if (
    !response.ok ||
    !response.headers.get("content-type")?.startsWith("application/json") ||
    !response.body
  )
    throw new Error("Website publications are temporarily unavailable.");
  const reader = response.body.getReader(),
    chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 8_000_000)
        throw new Error("Publication snapshot exceeds the delivery limit.");
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel();
    throw error;
  }
  const snapshot = validateSnapshot(
    JSON.parse(Buffer.concat(chunks).toString("utf8")),
    config.siteUrl ?? workspaceSiteUrl,
  );
  if (snapshot.mode !== config.mode)
    throw new Error("Website publication mode does not match SEO Workspace.");
  assertNoBlogConflicts(snapshot, await getPostSlugs());
  return snapshot;
}
