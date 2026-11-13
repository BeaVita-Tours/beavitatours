/**
 * The website origin in the publication contract. Production defaults to the
 * live www host; an isolated preview can explicitly select its own origin.
 * Every snapshot and canonical must match it.
 */
export function websiteOrigin(
  env: Record<string, string | undefined> = process.env,
) {
  const url = new URL(env.SEO_WEBSITE_URL || "https://www.beavitatours.com");
  if (
    url.protocol !== "https:" ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error("SEO_WEBSITE_URL must be an HTTPS origin.");
  return url.origin;
}
export const workspaceSiteUrl = websiteOrigin();

// Keep the old origin configuration working until the coordinated cutover.
// The new value is the full endpoint from SEO Controls' connector settings.
export function contentEndpoint(studioUrl: string) {
  const url = new URL(studioUrl);
  return url.pathname === "/" ? `${url.origin}/api/website/content` : url.href;
}
export type SeoConfig = {
  mode: "preview" | "live";
  studioUrl: string;
  readToken: string;
  refreshSecret: string;
  siteUrl?: string;
};
export function seoConfig(
  env: Record<string, string | undefined> = process.env,
): SeoConfig | null {
  const mode = env.SEO_DELIVERY_MODE || "off";
  if (mode === "off") return null;
  if (mode !== "preview" && mode !== "live")
    throw new Error("SEO_DELIVERY_MODE must be off, preview or live.");
  if (mode === "live" && env.VERCEL_ENV && env.VERCEL_ENV !== "production")
    throw new Error(
      "SEO live mode is only allowed on the production deployment.",
    );
  const url = new URL(env.SEO_STUDIO_URL || "invalid");
  const local =
    env.NODE_ENV !== "production" &&
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(url.hostname);
  if (
    (!local && url.protocol !== "https:") ||
    !(
      url.pathname === "/" ||
      /^\/api\/clients\/[a-f0-9-]{36}\/sites\/[a-f0-9-]{36}\/content$/.test(
        url.pathname,
      )
    ) ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error(
      "SEO_STUDIO_URL must be the HTTPS content endpoint from connector settings, or the existing service origin.",
    );
  const readToken = env.SEO_STUDIO_READ_TOKEN || "",
    refreshSecret = env.SEO_REFRESH_SECRET || "";
  if (
    ![readToken, refreshSecret].every((value) =>
      /^[A-Za-z0-9_-]{43,128}$/.test(value),
    ) ||
    readToken === refreshSecret
  )
    throw new Error(
      "Configure two different random server-only connector secrets.",
    );
  return {
    mode,
    studioUrl: url.pathname === "/" ? url.origin : url.href,
    readToken,
    refreshSecret,
    siteUrl: websiteOrigin(env),
  };
}
/** The connector is switched off (the default) — known without validating the rest. */
export function isSeoOff(
  env: Record<string, string | undefined> = process.env,
) {
  return (env.SEO_DELIVERY_MODE || "off") === "off";
}
export function isSeoPreview(
  env: Record<string, string | undefined> = process.env,
) {
  return (
    env.SEO_DELIVERY_MODE === "preview" ||
    (!!env.VERCEL_ENV && env.VERCEL_ENV !== "production")
  );
}
