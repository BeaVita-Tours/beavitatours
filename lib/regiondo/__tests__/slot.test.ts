import { afterEach, describe, expect, it, vi } from "vitest";

import availoptionsTiers from "./fixtures/availoptions-tiers.json";
import timeslots from "./fixtures/timeslots.json";

import { timeslotListSchema } from "@/lib/regiondo/schemas";

/**
 * The departure's seat count versus the tiers' own stock. Captured live from
 * product 300877: `availoptions` says Adult 22 / Young 49, `timeslots` says
 * the departure has 21 places in total. The lower number is the truth, and
 * `getSlot` must be the place that makes it so.
 */

describe("timeslot shape", () => {
  it("parses the live response, unwrapped", () => {
    const parsed = timeslotListSchema.parse(timeslots.data);
    expect(parsed[0]?.qty_available).toBe(21);
    expect(parsed[0]?.event_capacity).toBe(63);
    expect(parsed[0]?.qty_available_by_option).toEqual({ "2052614": 22, "2052711": 49 });
  });
});

describe("getSlot", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubApi(slotBody: unknown) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input instanceof Request ? input.url : input);
        const body = url.includes("/products/timeslots") ? slotBody : availoptionsTiers;
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      })
    );
  }

  it("caps every tier at the departure's own count and reports it", async () => {
    stubApi(timeslots);
    const { getSlot } = await import("@/lib/regiondo/products");
    const slot = await getSlot("731837", "2026-09-21", "08:00:00");

    expect(slot.seatsLeft).toBe(21);
    expect(slot.options.map((o) => [o.name, o.seatsLeft])).toEqual([
      ["Adult", 21],
      ["Young (7-14)", 21],
    ]);
  });

  it("keeps a tier's own stock when it is the lower number", async () => {
    const generous = structuredClone(timeslots);
    generous.data[0]!.qty_available = 200;
    stubApi(generous);
    const { getSlot } = await import("@/lib/regiondo/products");
    const slot = await getSlot("731837", "2026-09-21", "08:00:00");
    expect(slot.options.map((o) => o.seatsLeft)).toEqual([22, 49]);
  });

  it("treats an unavailable slot as sold out", async () => {
    const closed = structuredClone(timeslots);
    closed.data[0]!.is_available = 0;
    stubApi(closed);
    const { getSlot } = await import("@/lib/regiondo/products");
    const slot = await getSlot("731837", "2026-09-21", "08:00:00");
    expect(slot.seatsLeft).toBe(0);
    expect(slot.options.every((o) => o.seatsLeft === 0)).toBe(true);
  });

  it("falls back to per-tier stock when the departure is not in the answer", async () => {
    stubApi({ status: 1, total: 0, data: [] });
    const { getSlot } = await import("@/lib/regiondo/products");
    const slot = await getSlot("731837", "2026-09-21", "08:00:00");
    expect(slot.seatsLeft).toBeNull();
    expect(slot.options.map((o) => o.seatsLeft)).toEqual([22, 49]);
  });
});
