// These routes come from master. Update this list if the server page wrappers change.
export const pageSuffixes = [
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
export const pagePaths = ["en", "it", "zh", "ja"].flatMap((locale) =>
  pageSuffixes.map((suffix) => `/${locale}${suffix}`),
);
export const isGuideLocale = (locale: string): locale is "en" | "it" =>
  locale === "en" || locale === "it";
