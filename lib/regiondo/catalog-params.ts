import { z } from "zod";

import type { CatalogFilters, CatalogSort } from "./products";

/**
 * The catalog's URL contract.
 *
 * Filter state lives in `searchParams`, not in client state. That makes a
 * filtered view shareable, correct under the back button, server-rendered, and
 * crawlable — which is the whole SEO argument for replacing the widget.
 *
 * Not `server-only`: the filter UI is a set of links and needs to build the
 * same URLs the server parses.
 */

export const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "duration_asc", label: "Duration: shortest" },
  { value: "duration_desc", label: "Duration: longest" },
] as const satisfies readonly { value: CatalogSort; label: string }[];

/**
 * Price brackets rather than a slider. The catalog spans €115 to €2,200 and
 * splits naturally into shared seats, small private groups and the guided
 * mountain days — three link-shaped choices beat a two-handled range input that
 * needs JavaScript and cannot be crawled.
 */
export const PRICE_BANDS = [
  { value: "under-150", label: "Under €150", min: undefined, max: 149.99 },
  { value: "150-500", label: "€150 – €500", min: 150, max: 500 },
  { value: "over-500", label: "Over €500", min: 500.01, max: undefined },
] as const;

export const DURATION_BANDS = [
  { value: "half-day", label: "Half day (under 6h)", maxHours: 5.99 },
  { value: "full-day", label: "Full day (6h+)", minHours: 6 },
] as const;

const searchParamsSchema = z.object({
  collection: z.string().regex(/^\d+$/).optional(),
  price: z.enum(["under-150", "150-500", "over-500"]).optional(),
  duration: z.enum(["half-day", "full-day"]).optional(),
  sort: z.enum(["popular", "price_asc", "price_desc", "duration_asc", "duration_desc"]).optional(),
  q: z.string().trim().min(2).max(80).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type CatalogSearchParams = z.infer<typeof searchParamsSchema>;

/**
 * Parse `searchParams` leniently: an unrecognised value is dropped rather than
 * erroring. A stale bookmark or a mangled share link should still show the
 * catalog, not a 400.
 */
export function parseCatalogParams(
  raw: Record<string, string | string[] | undefined>
): CatalogSearchParams {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const single = Array.isArray(value) ? value[0] : value;
    if (single) flat[key] = single;
  }

  const parsed = searchParamsSchema.safeParse(flat);
  if (parsed.success) return parsed.data;

  // Keep whatever individually validates.
  const kept: Record<string, string> = {};
  for (const [key, value] of Object.entries(flat)) {
    const single = searchParamsSchema.safeParse({ [key]: value });
    if (single.success) Object.assign(kept, single.data);
  }
  return searchParamsSchema.parse(kept);
}

export function toCatalogFilters(
  params: CatalogSearchParams,
  overrides: Partial<CatalogFilters> = {}
): CatalogFilters {
  const band = PRICE_BANDS.find((b) => b.value === params.price);

  return {
    tag: params.collection,
    search: params.q,
    priceMin: band?.min,
    priceMax: band?.max,
    dateFrom: params.from,
    dateTo: params.to,
    sort: params.sort ?? "popular",
    limit: 250,
    ...overrides,
  };
}

/**
 * Duration has no API-side filter, so it is applied after the fetch. Kept next
 * to the URL contract rather than inside the wrapper because it is a UI
 * affordance, not an API capability.
 */
export function applyDurationBand<T extends { duration: { value: number; unit: string } | null }>(
  tours: readonly T[],
  band: CatalogSearchParams["duration"]
): readonly T[] {
  if (!band) return tours;
  const definition = DURATION_BANDS.find((d) => d.value === band);
  if (!definition) return tours;

  return tours.filter((tour) => {
    if (!tour.duration) return false;
    const hours =
      tour.duration.unit === "day"
        ? tour.duration.value * 24
        : tour.duration.unit === "minute"
          ? tour.duration.value / 60
          : tour.duration.value;

    if ("maxHours" in definition) return hours <= definition.maxHours;
    if ("minHours" in definition) return hours >= definition.minHours;
    return true;
  });
}

/**
 * Build a URL with one filter changed and everything else preserved. Setting a
 * value to its current one clears it, so a chip acts as a toggle.
 */
export function catalogHref(
  basePath: string,
  current: CatalogSearchParams,
  change: Partial<Record<keyof CatalogSearchParams, string | undefined>>
): string {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...current, ...change })) {
    if (value) next.set(key, String(value));
  }

  const query = next.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function hasActiveFilters(params: CatalogSearchParams): boolean {
  return Boolean(params.collection || params.price || params.duration || params.q || params.from);
}
