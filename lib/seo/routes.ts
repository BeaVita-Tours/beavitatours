/**
 * Pages whose metadata SEO Workspace manages, by their path on this site.
 * Each one passes its path to `pageMetadata` in its page.tsx — add both
 * together.
 */
export const pagePaths = [
  "/",
  "/about",
  "/contact",
  "/faq",
  "/privacy",
  "/tours/dolomites",
  "/tours/wine-food",
  "/tours/active-adventure",
  "/tours/cultural",
  "/tours/group-tours",
  "/tours/private-tours",
  "/lp/from-venice",
  "/lp/from-jesolo-cavallino",
];

// SEO Workspace was set up against the old localized site and publishes
// `/en/...`, `/it/...` paths with the old page names. The site is English-only
// now, so the contract still accepts those paths and `toSitePath` maps the
// English ones onto this site; the other languages are ignored.
const legacyLocales = ["en", "it", "zh", "ja"];
const legacySuffixes = [
  "",
  "/about",
  "/contact",
  "/faq",
  "/rates",
  "/privacy",
  "/tours/dolomites",
  "/tours/prosecco",
  "/tours/shared-tours",
  "/tours/wine-food",
  "/tours/active-adventure",
  "/tours/cultural",
  "/lp/from-venice",
  "/lp/from-jesolo-cavallino",
];
// One-to-one renames only. /tours/prosecco was folded into Food & Wine, which
// has its own entry, so it maps to nothing (links to it still redirect).
const renamed: Record<string, string> = {
  "/rates": "/tours/private-tours",
  "/tours/shared-tours": "/tours/group-tours",
};

/** Every path the publication contract accepts: this site's and the legacy ones. */
export const publishablePaths = [
  ...pagePaths,
  ...legacyLocales.flatMap((locale) =>
    legacySuffixes.map((suffix) => `/${locale}${suffix}`),
  ),
];

/**
 * The path on this site for a published path: legacy English paths lose their
 * prefix (and old page names are renamed), other languages give null.
 */
export function toSitePath(path: string): string | null {
  const match = /^\/(en|it|zh|ja)(\/.*)?$/.exec(path);
  if (!match) return path;
  if (match[1] !== "en") return null;
  const rest = match[2] ?? "/";
  return renamed[rest] ?? rest;
}
