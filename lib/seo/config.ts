/** Canonicals stay on www in production. Only an isolated preview may override it. */
export function publicationOrigin(env: Record<string, string | undefined> = process.env) {
  if (!env.SEO_PREVIEW_SITE_URL) return "https://www.beavitatours.com";
  const url = new URL(env.SEO_PREVIEW_SITE_URL);
  if (env.SEO_DELIVERY_MODE !== "preview" || env.VERCEL_ENV === "production" ||
      url.protocol !== "https:" || !url.hostname.endsWith(".up.railway.app") || !url.hostname.includes("staging") ||
      url.pathname !== "/" || url.search || url.hash || url.username || url.password)
    throw new Error("SEO_PREVIEW_SITE_URL must be an isolated Railway staging website in preview mode.");
  return url.origin;
}
export const workspaceSiteUrl = publicationOrigin();
export type SeoConfig = {
  mode: "preview" | "live";
  studioUrl: string;
  readToken: string;
  refreshSecret: string;
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
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error("SEO_STUDIO_URL must be an HTTPS origin.");
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
  return { mode, studioUrl: url.origin, readToken, refreshSecret };
}
/** The connector is switched off (the default) — known without validating the rest. */
export function isSeoOff(env: Record<string, string | undefined> = process.env) {
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
