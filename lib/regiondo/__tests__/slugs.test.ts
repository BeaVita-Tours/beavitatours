import { describe, expect, it } from "vitest";

import productsList from "./fixtures/products-list.json";

import {
  assertSlugRegistry,
  checkSlugRegistry,
  isCuratedSlug,
  productIdForSlug,
  RESERVED_TOUR_SLUGS,
  slugForProductId,
  tourHref,
  TOUR_SLUGS,
} from "@/lib/regiondo/slugs";

/**
 * URLs are the most expensive thing here to change after indexing, so the
 * registry's invariants are asserted rather than assumed.
 */

/** The eleven live product ids, from the catalog snapshot in the build log. */
const LIVE_PRODUCT_IDS = [
  "298188",
  "298190",
  "300877",
  "307882",
  "326843",
  "326844",
  "326845",
  "339660",
  "341596",
  "341597",
  "341599",
];

describe("slug registry invariants", () => {
  it("covers every live product", () => {
    const problems = checkSlugRegistry(LIVE_PRODUCT_IDS).filter((p) => p.kind === "missing-slug");
    expect(problems).toEqual([]);
  });

  it("has no duplicate slugs or product ids", () => {
    const problems = checkSlugRegistry().filter((p) => p.kind === "duplicate-id");
    expect(problems).toEqual([]);
    expect(new Set(Object.keys(TOUR_SLUGS)).size).toBe(Object.keys(TOUR_SLUGS).length);
  });

  it("never collides with a static /tours/* page", () => {
    // A collision would make that tour permanently unreachable: Next resolves
    // the static segment first and the dynamic route never runs.
    for (const reserved of RESERVED_TOUR_SLUGS) {
      expect(TOUR_SLUGS[reserved]).toBeUndefined();
    }
    expect(checkSlugRegistry().filter((p) => p.kind === "reserved-slug")).toEqual([]);
  });

  it("uses clean kebab-case throughout", () => {
    expect(checkSlugRegistry().filter((p) => p.kind === "malformed-slug")).toEqual([]);
  });

  it("passes the build-time assertion against the live catalog", () => {
    expect(() => assertSlugRegistry(LIVE_PRODUCT_IDS)).not.toThrow();
  });

  it("gives 339660 and 341596 distinct slugs despite an identical url_key upstream", () => {
    // This is the collision that motivated the registry: both products report
    // "from-venice-via-ferrata-in-the-dolomites-with-alpine-guide", and it is
    // wrong on 339660 (that tour is the Lake Sorapis hike).
    expect(slugForProductId("339660")).not.toBe(slugForProductId("341596"));
    expect(slugForProductId("339660")).toContain("sorapis");
    expect(slugForProductId("341596")).toContain("via-ferrata");
  });
});

describe("resolution", () => {
  it("round-trips every curated slug", () => {
    for (const [slug, id] of Object.entries(TOUR_SLUGS)) {
      expect(productIdForSlug(slug)).toBe(id);
      expect(slugForProductId(id)).toBe(slug);
      expect(tourHref(id)).toBe(`/tours/${slug}`);
    }
  });

  it("accepts numeric ids as well as strings", () => {
    expect(slugForProductId(298190)).toBe(slugForProductId("298190"));
  });

  it("falls back to /tours/p-<id> for a product added in Regiondo since deploy", () => {
    // Deliberate: an unlisted product gets a mediocre but working URL rather
    // than a 404, and the sitemap logs a warning.
    expect(slugForProductId("999999")).toBe("p-999999");
    expect(productIdForSlug("p-999999")).toBe("999999");
    expect(isCuratedSlug("p-999999")).toBe(false);
  });

  it("rejects anything that is not one of ours", () => {
    expect(productIdForSlug("not-a-tour")).toBeNull();
    expect(productIdForSlug("p-")).toBeNull();
    expect(productIdForSlug("p-abc")).toBeNull();
    // No path traversal through the slug segment.
    expect(productIdForSlug("p-../../etc")).toBeNull();
  });
});

describe("registry problem detection", () => {
  it("reports a product with no curated slug", () => {
    const problems = checkSlugRegistry([...LIVE_PRODUCT_IDS, "424242"]);
    expect(problems).toHaveLength(1);
    expect(problems[0]?.kind).toBe("missing-slug");
    expect(problems[0]?.detail).toContain("424242");
  });

  it("treats a missing slug as a warning, not a build failure", () => {
    // Adding a tour in Regiondo must not be able to break a production build.
    expect(() => assertSlugRegistry([...LIVE_PRODUCT_IDS, "424242"])).not.toThrow();
  });
});

describe("agreement with the live catalog fixture", () => {
  it("maps every product in the captured list", () => {
    for (const product of productsList.data) {
      const id = String(product.product_id);
      expect(slugForProductId(id)).not.toBe(`p-${id}`);
    }
  });
});
