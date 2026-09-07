import { describe, expect, it } from "vitest";

import {
  COLLECTIONS,
  LANDING_PRODUCT_SETS,
  THEME_UPSELLS,
} from "@/lib/regiondo/collections";
import { RESERVED_TOUR_SLUGS, slugForProductId, TOUR_SLUGS } from "@/lib/regiondo/slugs";

/**
 * The theme, landing and collection sets are hand-curated product ids. A typo
 * in one produces an empty section on a live page and nothing anywhere says so
 * — the API just returns no products for an id that does not exist. These
 * assertions are the thing that says so.
 */

const KNOWN_PRODUCT_IDS = new Set(Object.values(TOUR_SLUGS));

describe("theme upsells", () => {
  it("covers every hand-written /tours/* theme page", () => {
    // The reserved slugs are the static children of /tours. Two of them are
    // the collection pages, which have their own catalog; the rest are the
    // editorial theme pages and each needs an upsell.
    const themePages = RESERVED_TOUR_SLUGS.filter(
      (slug) => slug !== "group-tours" && slug !== "private-tours"
    );
    expect(Object.keys(THEME_UPSELLS).sort()).toEqual([...themePages].sort());
  });

  it("references only products that exist", () => {
    for (const [theme, config] of Object.entries(THEME_UPSELLS)) {
      for (const id of config.productIds) {
        expect(KNOWN_PRODUCT_IDS.has(id), `${theme} references unknown product ${id}`).toBe(true);
      }
    }
  });

  it("lists no product twice within a theme", () => {
    for (const [theme, config] of Object.entries(THEME_UPSELLS)) {
      expect(new Set(config.productIds).size, `${theme} has a duplicate`).toBe(
        config.productIds.length
      );
    }
  });

  it("gives every theme something to sell", () => {
    // An upsell with no products renders nothing, which would be a silent
    // regression rather than a visible one.
    for (const [theme, config] of Object.entries(THEME_UPSELLS)) {
      expect(config.productIds.length, `${theme} is empty`).toBeGreaterThan(0);
    }
  });

  it("keys match their own slug field", () => {
    for (const [key, config] of Object.entries(THEME_UPSELLS)) {
      expect(config.slug).toBe(key);
    }
  });

  it("browses to a real catalog URL", () => {
    for (const [theme, config] of Object.entries(THEME_UPSELLS)) {
      expect(config.browseHref, theme).toMatch(/^\/tours(\?q=[a-z]+)?$/);
      expect(config.browseLabel.length, theme).toBeGreaterThan(0);
    }
  });

  it("resolves every referenced product to a curated tour URL", () => {
    // A product with no curated slug would still work via /tours/p-<id>, but on
    // an upsell it would look like a mistake next to its neighbours.
    for (const config of Object.values(THEME_UPSELLS)) {
      for (const id of config.productIds) {
        expect(slugForProductId(id)).not.toMatch(/^p-\d+$/);
      }
    }
  });
});

describe("landing page product sets", () => {
  it("references only products that exist", () => {
    for (const [landing, ids] of Object.entries(LANDING_PRODUCT_SETS)) {
      for (const id of ids) {
        expect(KNOWN_PRODUCT_IDS.has(id), `${landing} references unknown product ${id}`).toBe(true);
      }
    }
  });

  it("has no overlap between the Venice and Jesolo sets", () => {
    // They are different departure points; a tour in both would mean one of
    // the two landing pages is advertising a pickup it does not offer.
    const venice = new Set<string>(LANDING_PRODUCT_SETS["from-venice"]);
    const overlap = LANDING_PRODUCT_SETS["from-jesolo-cavallino"].filter((id) => venice.has(id));
    expect(overlap).toEqual([]);
  });
});

describe("collections", () => {
  it("points at real, non-shadowed routes", () => {
    for (const collection of Object.values(COLLECTIONS)) {
      expect(collection.tagId).toMatch(/^\d+$/);
      expect(collection.href).toMatch(/^\/tours\/[a-z-]+$/);
      // Both collection hrefs are static /tours/* children, so they must be
      // reserved — otherwise a tour slug could shadow one.
      const segment = collection.href.split("/").pop() ?? "";
      expect(RESERVED_TOUR_SLUGS).toContain(segment);
    }
  });
});
