import { snapshotSchema } from "./contract";
import type { SeoConfig } from "./config";

export async function fetchSnapshot(
  config: SeoConfig,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(`${config.studioUrl}/api/website/content`, {
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
  const snapshot = snapshotSchema.parse(
    JSON.parse(Buffer.concat(chunks).toString("utf8")),
  );
  if (snapshot.mode !== config.mode)
    throw new Error("Website publication mode does not match SEO Workspace.");
  return snapshot;
}
