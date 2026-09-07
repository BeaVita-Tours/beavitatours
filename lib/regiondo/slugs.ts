/**
 * The tour URL registry.
 *
 * Slugs are written here by hand rather than derived from Regiondo's `url_key`,
 * for two reasons that are both observable in live data today:
 *
 *  1. `url_key` collides. Products 339660 and 341596 both report
 *     `from-venice-via-ferrata-in-the-dolomites-with-alpine-guide`, and it is
 *     stale on 339660 — that product is the Lake Sorapis hike.
 *  2. `url_key` is editable in the Regiondo dashboard. A URL we have spent
 *     months getting indexed should not be able to change because someone
 *     renamed a product.
 *
 * A URL is the most expensive thing on this page to change after the fact, so
 * it is a reviewed artefact rather than a derived one. `assertSlugRegistry()`
 * runs in the sitemap build and fails on a duplicate slug, a slug that would be
 * shadowed by an existing static route, or a live product with no entry.
 *
 * Adding a tour in Regiondo without touching this file is safe: it falls back
 * to `/tours/p-<id>`, which is self-canonical and indexable. Add the real slug
 * here when you want the good URL.
 *
 * This file is intentionally not `server-only` — the slug map is public
 * information and client components link with it.
 */

export const TOURS_BASE_PATH = "/tours";

/**
 * Static children of /tours that already exist as hand-written pages. Next
 * resolves static segments before dynamic ones, so these keep working — but a
 * tour slug must never collide with one, or that tour becomes unreachable.
 */
export const RESERVED_TOUR_SLUGS = [
  "dolomites",
  "prosecco",
  "wine-food",
  "active-adventure",
  "cultural",
  "group-tours",
  "private-tours",
] as const;

/**
 * slug -> Regiondo product id.
 *
 * Slugs lead with the departure city because that is how the demand is phrased
 * ("dolomites day trip from venice"), and they drop the marketing colon and
 * "(PRIVATE)" suffix that make the Regiondo titles awkward in a URL.
 */
export const TOUR_SLUGS: Readonly<Record<string, string>> = {
  // Shared departures from Venice
  "venice-dolomites-cortina-misurina-day-trip": "298190",
  "venice-best-of-the-dolomites-day-trip": "300877",
  "venice-dolomites-lake-braies-tre-cime": "341597",
  "venice-prosecco-hills-wine-tasting": "326845",
  "venice-prosecco-hills-wine-spritz-asolo": "307882",

  // Private departures from Venice
  "venice-dolomites-prosecco-hills-private-tour": "298188",
  "venice-medieval-hill-towns-wine-spritz-private-tour": "341599",
  "venice-lake-sorapis-hike-alpine-guide-private-tour": "339660",
  "venice-via-ferrata-dolomites-alpine-guide-private-tour": "341596",

  // Private departures from Jesolo / Cavallino
  "jesolo-cavallino-dolomites-private-tour": "326843",
  "jesolo-cavallino-prosecco-hills-private-tour": "326844",
};

const ID_TO_SLUG: ReadonlyMap<string, string> = new Map(
  Object.entries(TOUR_SLUGS).map(([slug, id]) => [id, slug])
);

/** Prefix for products that have no curated slug yet. */
const FALLBACK_PREFIX = "p-";

export function slugForProductId(productId: string | number): string {
  const id = String(productId);
  return ID_TO_SLUG.get(id) ?? `${FALLBACK_PREFIX}${id}`;
}

/** Resolve a URL slug back to a product id, or null if it is not one of ours. */
export function productIdForSlug(slug: string): string | null {
  const direct = TOUR_SLUGS[slug];
  if (direct) return direct;

  if (slug.startsWith(FALLBACK_PREFIX)) {
    const id = slug.slice(FALLBACK_PREFIX.length);
    return /^\d+$/.test(id) ? id : null;
  }

  return null;
}

export function tourHref(productId: string | number): string {
  return `${TOURS_BASE_PATH}/${slugForProductId(productId)}`;
}

export function isCuratedSlug(slug: string): boolean {
  return slug in TOUR_SLUGS;
}

export interface SlugRegistryProblem {
  readonly kind: "duplicate-id" | "reserved-slug" | "missing-slug" | "malformed-slug";
  readonly detail: string;
}

/**
 * Validate the registry, optionally against the live catalog.
 *
 * Called from `app/sitemap.ts` so problems surface during `next build` rather
 * than as a 404 someone notices in Search Console six weeks later. Missing
 * slugs are reported but are not fatal — the fallback URL keeps the tour
 * reachable, and failing a production build over a newly added product would
 * be worse than the mediocre URL.
 */
export function checkSlugRegistry(liveProductIds?: readonly string[]): SlugRegistryProblem[] {
  const problems: SlugRegistryProblem[] = [];
  const seen = new Map<string, string>();
  const reserved = new Set<string>(RESERVED_TOUR_SLUGS);

  for (const [slug, id] of Object.entries(TOUR_SLUGS)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      problems.push({ kind: "malformed-slug", detail: `"${slug}" is not a clean kebab-case slug` });
    }
    if (reserved.has(slug)) {
      problems.push({
        kind: "reserved-slug",
        detail: `"${slug}" collides with the static page at /tours/${slug}, which would shadow it`,
      });
    }
    const existing = seen.get(id);
    if (existing) {
      problems.push({
        kind: "duplicate-id",
        detail: `product ${id} is mapped by both "${existing}" and "${slug}"`,
      });
    }
    seen.set(id, slug);
  }

  if (liveProductIds) {
    for (const id of liveProductIds) {
      if (!ID_TO_SLUG.has(id)) {
        problems.push({
          kind: "missing-slug",
          detail: `product ${id} has no curated slug and will use /tours/${FALLBACK_PREFIX}${id}`,
        });
      }
    }
  }

  return problems;
}

/**
 * Throw on anything that would break an existing URL; warn on anything that
 * merely produces an ugly one.
 */
export function assertSlugRegistry(liveProductIds?: readonly string[]): void {
  const problems = checkSlugRegistry(liveProductIds);
  const fatal = problems.filter((p) => p.kind !== "missing-slug");

  for (const problem of problems.filter((p) => p.kind === "missing-slug")) {
    console.warn(`[regiondo] slug registry: ${problem.detail}`);
  }

  if (fatal.length > 0) {
    throw new Error(
      `Tour slug registry is invalid:\n${fatal.map((p) => `  - ${p.detail}`).join("\n")}`
    );
  }
}
