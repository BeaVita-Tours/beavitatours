import type { TourOption, TourPrice } from "./types";

/**
 * The party: how many of each participant tier is being booked.
 *
 * Regiondo sells a tour as one or more *options* per departure — "Adult",
 * "Young (7-14)", "Group" — each with its own price, stock and per-order
 * limits. A booking is a quantity against each, so the state is a map of
 * option id → quantity rather than one option plus one number. Everything the
 * booking panel and the server action need to reason about that map lives
 * here, dependency-free, so it can be unit tested and shared by both sides.
 */
export type PartyQuantities = Readonly<Record<string, number>>;

/**
 * Fallback ceiling for a tier when the API gave neither a per-order cap nor a
 * seat count. With real stock known the stock is the ceiling, not this.
 */
export const UI_QTY_CAP = 10;

/** Most one booking may carry across every tier (the server enforces it too). */
export const MAX_PARTY_SIZE = 50;

/**
 * Some products are sold per group rather than per head ("Group (up to 8px
 * MAX)" at €999). The name is the tell — the panel used to infer it from a
 * per-order cap above one, which misread a per-head tier capped at 8.
 */
export function isGroupOption(option: TourOption): boolean {
  return /\bgroup\b/i.test(option.name) || /\bgroup\b/i.test(option.description);
}

/** The smallest non-zero quantity a tier accepts. */
export function minSelectable(option: TourOption): number {
  return Math.max(option.minPerOrder, 1);
}

/**
 * The most of one tier that can be added right now.
 *
 * Three ceilings, the lowest wins: the tier's own per-order cap
 * (`max_qty_to_sell`, where 0 means "no cap" in Regiondo's vocabulary, not
 * "nothing may be sold"); the tier's stock; and `headroom` — how many places
 * the departure has left once the rest of the party is counted, because
 * Adult and Young share the same coach. Only when none of the three is known
 * does the UI fallback apply. Returns 0 when nothing can be added.
 */
export function maxSelectable(option: TourOption, headroom: number | null = null): number {
  const ceilings = [
    option.maxPerOrder > 0 ? option.maxPerOrder : null,
    option.seatsLeft,
    headroom,
  ].filter((value): value is number => value !== null);
  return Math.max(0, ceilings.length > 0 ? Math.min(...ceilings) : UI_QTY_CAP);
}

/** No stock at all for this tier, whatever the rest of the party. */
export function isSoldOut(option: TourOption): boolean {
  return maxSelectable(option) === 0;
}

/**
 * Places left on the departure for `optionId` specifically: the departure's
 * seats minus everything the *other* tiers in the party already take. Null
 * when the departure's count is unknown.
 */
export function headroomFor(
  quantities: PartyQuantities,
  optionId: string,
  slotSeats: number | null
): number | null {
  if (slotSeats === null) return null;
  const others = Object.entries(quantities).reduce(
    (sum, [id, qty]) => (id === optionId ? sum : sum + qty),
    0
  );
  return Math.max(0, slotSeats - others);
}

/**
 * Bring one tier's quantity inside its rules. Zero is always allowed (the tier
 * is simply not part of the party); anything else is pushed into
 * [minSelectable, maxSelectable], and collapses to zero when there is no room.
 */
export function clampQty(option: TourOption, qty: number, headroom: number | null = null): number {
  if (!Number.isFinite(qty) || qty <= 0) return 0;
  const max = maxSelectable(option, headroom);
  if (max === 0) return 0;
  const min = minSelectable(option);
  if (min > max) return 0;
  return Math.min(Math.max(Math.round(qty), min), max);
}

/**
 * Step a tier's quantity by ±1 the way a person expects: from zero, "+" jumps
 * straight to the minimum (so a "book for at least 2" tier never shows a 1);
 * "−" from the minimum drops to zero rather than to an unbookable count.
 */
export function stepQty(
  option: TourOption,
  current: number,
  delta: 1 | -1,
  headroom: number | null = null
): number {
  const min = minSelectable(option);
  const max = maxSelectable(option, headroom);
  if (delta > 0) {
    if (max === 0 || min > max) return current;
    if (current <= 0) return min;
    return Math.min(current + 1, max);
  }
  if (current <= min) return 0;
  return current - 1;
}

/**
 * The party the panel opens with: one of the first tier that has stock, so
 * the page shows a real total straight away, and nothing else.
 */
export function defaultQuantities(options: readonly TourOption[]): PartyQuantities {
  const first = options.find((option) => !isSoldOut(option));
  return first ? { [first.id]: clampQty(first, 1) } : {};
}

/**
 * Re-fit a party to a fresh departure: tiers that no longer exist are
 * dropped, the rest are clamped to the new stock and limits, and the party as
 * a whole to the departure's seats — earlier tiers keep their places, later
 * ones give way. Used whenever the options are refetched (a new date, a new
 * time) so what the visitor chose survives as far as the inventory allows.
 */
export function normalizeQuantities(
  options: readonly TourOption[],
  quantities: PartyQuantities,
  slotSeats: number | null = null
): PartyQuantities {
  const next: Record<string, number> = {};
  let remaining = slotSeats;
  for (const option of options) {
    const qty = clampQty(option, quantities[option.id] ?? 0, remaining);
    if (qty > 0) {
      next[option.id] = qty;
      if (remaining !== null) remaining -= qty;
    }
  }
  return next;
}

export interface PartyLine {
  readonly option: TourOption;
  readonly qty: number;
  readonly lineTotal: number;
}

export interface PartySummary {
  readonly lines: readonly PartyLine[];
  /** Sum of quantities across every tier. */
  readonly count: number;
  readonly total: number;
  readonly currency: string;
  /** True when every tier in the party is sold per group. */
  readonly perGroup: boolean;
  /** True when the party fills every place the departure has left. */
  readonly atCapacity: boolean;
}

export function summarizeParty(
  options: readonly TourOption[],
  quantities: PartyQuantities,
  fallbackCurrency: string,
  slotSeats: number | null = null
): PartySummary {
  const lines: PartyLine[] = [];
  for (const option of options) {
    const qty = quantities[option.id] ?? 0;
    if (qty > 0) lines.push({ option, qty, lineTotal: option.price.amount * qty });
  }
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return {
    lines,
    count,
    total: lines.reduce((sum, line) => sum + line.lineTotal, 0),
    currency: lines[0]?.option.price.currency ?? fallbackCurrency,
    perGroup: lines.length > 0 && lines.every((line) => isGroupOption(line.option)),
    atCapacity: slotSeats !== null && count >= slotSeats,
  };
}

/** The cheapest tier, for the "from €99" headline when there are several. */
export function lowestPrice(options: readonly TourOption[]): TourPrice | null {
  let lowest: TourPrice | null = null;
  for (const option of options) {
    if (!lowest || option.price.amount < lowest.amount) lowest = option.price;
  }
  return lowest;
}

/* -------------------------------------------------------------------------- */
/* wire format                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The party travels to the server action as repeated `line` form fields,
 * one per tier with a non-zero quantity, as "optionId:qty". Plain form data
 * rather than JSON so the form stays a form.
 */
export interface PartyLineInput {
  readonly optionId: string;
  readonly qty: number;
}

export function serializeLines(quantities: PartyQuantities): string[] {
  return Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([optionId, qty]) => `${optionId}:${qty}`);
}

const LINE_PATTERN = /^(\d{1,12}):(\d{1,3})$/;

/**
 * Parse the `line` fields back. Returns null when any entry is malformed, the
 * list is empty, or the party is unreasonably large. Repeated ids are merged
 * (a doubled hidden input should not double-book).
 */
export function parseLines(raw: readonly unknown[]): PartyLineInput[] | null {
  const merged = new Map<string, number>();
  for (const entry of raw) {
    if (typeof entry !== "string") return null;
    const match = LINE_PATTERN.exec(entry);
    if (!match) return null;
    const qty = Number(match[2]);
    if (qty < 1) return null;
    merged.set(match[1]!, (merged.get(match[1]!) ?? 0) + qty);
  }
  if (merged.size === 0) return null;
  const lines = [...merged].map(([optionId, qty]) => ({ optionId, qty }));
  const total = lines.reduce((sum, line) => sum + line.qty, 0);
  if (total > MAX_PARTY_SIZE) return null;
  return lines;
}

/** "2 guests", "1 group", "4 participants". */
export function countLabel(count: number, perGroup: boolean): string {
  if (perGroup) return `${count} ${count === 1 ? "group" : "groups"}`;
  return `${count} ${count === 1 ? "guest" : "guests"}`;
}
