import { describe, expect, it } from "vitest";

import {
  clampQty,
  countLabel,
  defaultQuantities,
  headroomFor,
  isGroupOption,
  lowestPrice,
  maxSelectable,
  normalizeQuantities,
  parseLines,
  serializeLines,
  stepQty,
  summarizeParty,
} from "@/lib/regiondo/party";
import type { TourOption } from "@/lib/regiondo/types";

/** The live tiers on "Best of the Dolomites" (product 300877), as probed. */
function option(overrides: Partial<TourOption> & { id: string; name: string }): TourOption {
  return {
    variationId: "731837",
    description: "",
    price: { amount: 115, wasAmount: null, currency: "EUR" },
    minPerOrder: 0,
    maxPerOrder: 0,
    seatsLeft: 22,
    sortOrder: 0,
    ...overrides,
  };
}

const adult = option({ id: "2052614", name: "Adult" });
const young = option({
  id: "2052711",
  name: "Young (7-14)",
  price: { amount: 99, wasAmount: null, currency: "EUR" },
  seatsLeft: 49,
});
const group = option({
  id: "2028635",
  name: "Group",
  description: "Group Tour (PRIVATE)",
  price: { amount: 999, wasAmount: null, currency: "EUR" },
  minPerOrder: 1,
  maxPerOrder: 8,
  seatsLeft: 5,
});
const tiers = [adult, young];

describe("tier rules", () => {
  it("caps at seats left, the per-order cap, or the UI cap — whichever is lowest", () => {
    expect(maxSelectable(option({ ...adult, seatsLeft: 3 }))).toBe(3);
    expect(maxSelectable(group)).toBe(5);
    expect(maxSelectable(option({ ...adult, seatsLeft: 0 }))).toBe(0);
  });

  it("recognises per-group tiers by name, not by cap", () => {
    expect(isGroupOption(group)).toBe(true);
    expect(isGroupOption(adult)).toBe(false);
    expect(isGroupOption(option({ ...adult, maxPerOrder: 8 }))).toBe(false);
  });

  it("clamps into [min, max] and lets zero through", () => {
    expect(clampQty(adult, 0)).toBe(0);
    expect(clampQty(adult, 99)).toBe(22);
    expect(clampQty(option({ ...adult, minPerOrder: 2 }), 1)).toBe(2);
    expect(clampQty(option({ ...adult, seatsLeft: 0 }), 4)).toBe(0);
  });
});

describe("stepping", () => {
  it("counts up and down one at a time within stock", () => {
    expect(stepQty(adult, 1, 1)).toBe(2);
    expect(stepQty(adult, 2, -1)).toBe(1);
    expect(stepQty(adult, 22, 1)).toBe(22);
  });

  it("removes a tier entirely rather than leaving an unbookable count", () => {
    const min2 = option({ ...adult, minPerOrder: 2 });
    expect(stepQty(min2, 0, 1)).toBe(2);
    expect(stepQty(min2, 2, -1)).toBe(0);
    expect(stepQty(adult, 1, -1)).toBe(0);
  });

  it("never steps a sold-out tier", () => {
    expect(stepQty(option({ ...adult, seatsLeft: 0 }), 0, 1)).toBe(0);
  });
});

describe("the party", () => {
  it("opens with one of the first tier that has stock", () => {
    expect(defaultQuantities(tiers)).toEqual({ [adult.id]: 1 });
    expect(defaultQuantities([option({ ...adult, seatsLeft: 0 }), young])).toEqual({
      [young.id]: 1,
    });
    expect(defaultQuantities([])).toEqual({});
  });

  it("sums 2 Adults + 2 Young across both lines", () => {
    const party = summarizeParty(tiers, { [adult.id]: 2, [young.id]: 2 }, "EUR");
    expect(party.count).toBe(4);
    expect(party.total).toBe(2 * 115 + 2 * 99);
    expect(party.lines.map((line) => [line.option.name, line.qty, line.lineTotal])).toEqual([
      ["Adult", 2, 230],
      ["Young (7-14)", 2, 198],
    ]);
    expect(party.perGroup).toBe(false);
  });

  it("1 Adult + 1 Young, then change, then drop a tier", () => {
    let quantities = { [adult.id]: 1, [young.id]: 1 };
    expect(summarizeParty(tiers, quantities, "EUR").total).toBe(214);

    quantities = { ...quantities, [adult.id]: stepQty(adult, 1, 1) };
    expect(summarizeParty(tiers, quantities, "EUR").total).toBe(329);

    quantities = { ...quantities, [young.id]: stepQty(young, 1, -1) };
    const party = summarizeParty(tiers, quantities, "EUR");
    expect(party.lines).toHaveLength(1);
    expect(party.count).toBe(2);
    expect(party.total).toBe(230);
  });

  it("re-fits a party to fresh options when the slot changes", () => {
    const tighter = [option({ ...adult, seatsLeft: 1 }), young];
    expect(normalizeQuantities(tighter, { [adult.id]: 3, [young.id]: 2, "999": 5 })).toEqual({
      [adult.id]: 1,
      [young.id]: 2,
    });
    // A tier that sold out drops away; the rest of the party stays.
    expect(normalizeQuantities([option({ ...adult, seatsLeft: 0 }), young], { [adult.id]: 2, [young.id]: 2 })).toEqual({
      [young.id]: 2,
    });
  });

  it("shares the departure's seats across tiers", () => {
    // 12 places on the coach; 2 Young already in the party leave 10 for Adults.
    const quantities = { [adult.id]: 1, [young.id]: 2 };
    expect(headroomFor(quantities, adult.id, 12)).toBe(10);
    expect(headroomFor(quantities, young.id, 12)).toBe(11);
    expect(headroomFor(quantities, adult.id, null)).toBeNull();

    expect(maxSelectable(adult, 10)).toBe(10);
    expect(stepQty(adult, 10, 1, 10)).toBe(10);
    expect(stepQty(young, 2, 1, 2)).toBe(2);
    // The tier's own stock still wins when it is the smaller number.
    expect(maxSelectable(option({ ...adult, seatsLeft: 3 }), 10)).toBe(3);

    const party = summarizeParty(tiers, { [adult.id]: 10, [young.id]: 2 }, "EUR", 12);
    expect(party.atCapacity).toBe(true);
    expect(summarizeParty(tiers, quantities, "EUR", 12).atCapacity).toBe(false);
  });

  it("trims a restored party to a smaller departure, earlier tiers first", () => {
    expect(normalizeQuantities(tiers, { [adult.id]: 3, [young.id]: 3 }, 4)).toEqual({
      [adult.id]: 3,
      [young.id]: 1,
    });
    expect(normalizeQuantities(tiers, { [adult.id]: 3, [young.id]: 3 }, 2)).toEqual({
      [adult.id]: 2,
    });
  });

  it("uses real stock as the ceiling, not the UI fallback", () => {
    expect(maxSelectable(adult)).toBe(22);
    expect(maxSelectable(option({ ...adult, seatsLeft: null }))).toBe(10);
  });

  it("labels groups as groups", () => {
    const party = summarizeParty([group], { [group.id]: 1 }, "EUR");
    expect(party.perGroup).toBe(true);
    expect(countLabel(party.count, party.perGroup)).toBe("1 group");
    expect(countLabel(4, false)).toBe("4 guests");
  });

  it("headlines the cheapest tier", () => {
    expect(lowestPrice(tiers)?.amount).toBe(99);
    expect(lowestPrice([])).toBeNull();
  });
});

describe("wire format", () => {
  it("round-trips through the form fields", () => {
    const lines = serializeLines({ [adult.id]: 2, [young.id]: 2, "1": 0 });
    expect(lines).toEqual(["2052614:2", "2052711:2"]);
    expect(parseLines(lines)).toEqual([
      { optionId: "2052614", qty: 2 },
      { optionId: "2052711", qty: 2 },
    ]);
  });

  it("merges a repeated tier and rejects garbage", () => {
    expect(parseLines(["1:2", "1:1"])).toEqual([{ optionId: "1", qty: 3 }]);
    expect(parseLines([])).toBeNull();
    expect(parseLines(["1:0"])).toBeNull();
    expect(parseLines(["abc"])).toBeNull();
    expect(parseLines([42])).toBeNull();
    expect(parseLines(["1:999"])).toBeNull();
  });
});
