/** Brand name as it must appear everywhere a visitor can read it. */
export const BRAND = "beaVita";
export const BRAND_FULL = "beaVita Tours";

/**
 * Matches the brand however it was typed upstream — "Bea Vita", "BEA VITA
 * TOURS", "BeaVitaTours", "beavita" — as a standalone word. The lookarounds keep
 * it away from identifiers that merely contain the name: domains and e-mail
 * addresses (beavitatours.com, beavitasrl@pec.it), promo codes (BEAVITA10) and
 * URL paths (/beavitatours).
 */
const BRAND_PATTERN = /(?<![\w@/.-])bea\s?vita(\s?tours)?(?![\w@/.-])/gi;

/**
 * Normalises the brand spelling in text we render but did not author here —
 * Regiondo descriptions and meta tags, Sanity copy — so the stylised form is
 * the only one a visitor ever sees.
 */
export function brandize(text: string): string;
export function brandize(text: string | null): string | null;
export function brandize(text: string | null): string | null {
  if (!text) return text;
  return text.replace(BRAND_PATTERN, (_, tours?: string) => (tours ? BRAND_FULL : BRAND));
}

/**
 * Keys whose values are identifiers rather than prose — never rewritten even
 * though the pattern would leave most of them alone anyway.
 */
const OPAQUE_KEYS = new Set(["_id", "_key", "_ref", "_type", "slug", "url", "href", "code"]);

/**
 * `brandize` applied to every prose string in a fetched document tree, for
 * CMS payloads (Sanity posts, categories, authors) whose shape is not worth
 * enumerating field by field.
 */
export function brandizeDeep<T>(value: T): T {
  if (typeof value === "string") return brandize(value) as T;
  if (Array.isArray(value)) return value.map(brandizeDeep) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = OPAQUE_KEYS.has(key) ? child : brandizeDeep(child);
    }
    return out as T;
  }
  return value;
}
