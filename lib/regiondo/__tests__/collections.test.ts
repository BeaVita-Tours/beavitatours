import { describe, expect, it } from "vitest";

import {
  COLLECTIONS,
  isPrivateTour,
  LANDING_PRODUCT_SETS,
  PRIVATE_PRODUCT_IDS,
  THEME_PAGES,
  THEME_UPSELLS,
  themeForTag,
  type ThemePage,
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
  it("has a page for every hand-written /tours/* theme directory", () => {
    // The reserved slugs are the static children of /tours. Two of them are
    // the collection pages, which have their own catalog, and one is now a
    // redirect into Food & Wine; the rest are the editorial theme pages and
    // each needs at least one tour set to render.
    const themePages = RESERVED_TOUR_SLUGS.filter(
      (slug) => slug !== "group-tours" && slug !== "private-tours" && slug !== "prosecco"
    );
    expect(THEME_PAGES.map((page) => page.slug).sort()).toEqual([...themePages].sort());
    for (const page of THEME_PAGES) {
      expect(page.sets.length, `${page.slug} has no tour set`).toBeGreaterThan(0);
      expect(page.href).toBe(`/tours/${page.slug}`);
    }
  });

  it("renders every tour set on some page", () => {
    // A set nobody renders is dead config; a set rendered on two pages is a
    // duplicate section, which is fine but should be a decision, not a slip.
    const rendered = THEME_PAGES.flatMap((page) => page.sets);
    expect([...rendered].sort()).toEqual(Object.keys(THEME_UPSELLS).sort());
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

describe("theme tags", () => {
  it("gives every group-page theme a numeric Regiondo tag, and each tag once", () => {
    // The group page fills a section from the tag of the same name. A theme
    // without one (privateOnly) shows only its pointer; a tag used by two
    // themes would list the same tours twice.
    const pages: readonly ThemePage[] = THEME_PAGES;
    const tags = pages.flatMap((page) => (page.tagId ? [page.tagId] : []));
    for (const tag of tags) expect(tag).toMatch(/^\d+$/);
    expect(new Set(tags).size).toBe(tags.length);
    expect(tags).toEqual(["45420", "45421"]);
    for (const page of pages) {
      if (page.privateOnly) expect(page.tagId, `${page.slug} is private-only`).toBeUndefined();
    }
    expect(themeForTag("45420")?.slug).toBe("dolomites");
    expect(themeForTag("45421")?.slug).toBe("wine-food");
    expect(themeForTag("1")).toBeUndefined();
  });
});

describe("private departures", () => {
  it("are known products with curated URLs, listed once", () => {
    expect(new Set(PRIVATE_PRODUCT_IDS).size).toBe(PRIVATE_PRODUCT_IDS.length);
    for (const id of PRIVATE_PRODUCT_IDS) {
      expect(KNOWN_PRODUCT_IDS.has(id), `private list references unknown product ${id}`).toBe(true);
      expect(isPrivateTour(id)).toBe(true);
    }
  });

  it("do not include the group departures", () => {
    for (const id of ["298190", "300877", "341597", "347533", "326845", "307882", "347919", "347921"]) {
      expect(isPrivateTour(id), `${id} is a group departure`).toBe(false);
    }
  });
});

describe("collections", () => {
  it("points at real, non-shadowed routes", () => {
    for (const collection of Object.values(COLLECTIONS)) {
      expect(collection.href).toMatch(/^\/tours\/[a-z-]+$/);
      // Both collection hrefs are static /tours/* children, so they must be
      // reserved — otherwise a tour slug could shadow one.
      const segment = collection.href.split("/").pop() ?? "";
      expect(RESERVED_TOUR_SLUGS).toContain(segment);
    }
  });
});
