import { describe, expect, it } from "vitest";

import { COLLECTIONS, type CollectionKey } from "@/lib/regiondo/collections";
import { closingBandFor } from "@/lib/regiondo/theme-cta";

const styles = (...keys: CollectionKey[]) => new Set<CollectionKey>(keys);

describe("theme page closing band", () => {
  it("offers group and private when the theme has both", () => {
    const band = closingBandFor(styles("shared", "private"));
    expect(band.heading).toMatch(/choose how/i);
    expect(band.options.map((o) => o.href)).toEqual([
      COLLECTIONS.shared.href,
      COLLECTIONS.private.href,
    ]);
  });

  it("offers private and contact when the theme is private-only", () => {
    const band = closingBandFor(styles("private"));
    expect(band.heading).toMatch(/something specific/i);
    expect(band.options.map((o) => o.href)).toEqual([COLLECTIONS.private.href, "/contact"]);
  });

  it("offers group and contact when the theme is group-only", () => {
    const band = closingBandFor(styles("shared"));
    expect(band.options.map((o) => o.href)).toEqual([COLLECTIONS.shared.href, "/contact"]);
    // The private route is still reachable — through us.
    expect(band.options[1].description).toMatch(/private/i);
  });

  it("falls back to both when nothing is known", () => {
    // Catalog unreachable, or a theme with no tagged departure: never guess a
    // route away.
    expect(closingBandFor(styles())).toEqual(closingBandFor(styles("shared", "private")));
  });

  it("uses the page's own private copy wherever the private card appears", () => {
    const copy = { description: "Tell us the hike.", action: "Plan your private adventure" };
    for (const set of [styles("private"), styles("shared", "private")]) {
      const card = closingBandFor(set, copy).options.find(
        (o) => o.href === COLLECTIONS.private.href
      );
      expect(card).toMatchObject(copy);
    }
    // And never on the group-only band, which has no private card.
    expect(
      closingBandFor(styles("shared"), copy).options.some((o) => o.action === copy.action)
    ).toBe(false);
  });
});
