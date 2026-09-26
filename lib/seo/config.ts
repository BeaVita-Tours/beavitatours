/**
 * The origin SEO Workspace publishes for — the live www host. It is part of
 * the publication contract (the snapshot's `siteUrl` and every canonical must
 * use it), and the canonicals, guide URLs and sitemap entries the connector
 * produces keep it, as they did on the localized site.
 */
export const workspaceSiteUrl = "https://www.beavitatours.com";
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
/**
 * The connector is off for this deployment — known without validating the
 * rest. That includes live settings on a non-production deployment: Vercel
 * gives previews production's variables, and `seoConfig` refuses live mode
 * there, so on a preview the site behaves as if the connector were off
 * (guides 404, pages keep their own metadata) instead of erroring.
 */
export function isSeoOff(env: Record<string, string | undefined> = process.env) {
  const mode = env.SEO_DELIVERY_MODE || "off";
  return (
    mode === "off" ||
    (mode === "live" && !!env.VERCEL_ENV && env.VERCEL_ENV !== "production")
  );
}
export function isSeoPreview(
  env: Record<string, string | undefined> = process.env,
) {
  return (
    env.SEO_DELIVERY_MODE === "preview" ||
    (!!env.VERCEL_ENV && env.VERCEL_ENV !== "production")
  );
}
