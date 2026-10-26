import { describe, expect, it } from "vitest";

import { brandize, brandizeDeep } from "@/lib/brand";

describe("brandize", () => {
  it("rewrites every upstream spelling to the stylised form", () => {
    expect(brandize("Bea Vita Tours | Dolomites Day Trip")).toBe(
      "beaVita Tours | Dolomites Day Trip",
    );
    expect(brandize("BEA VITA TOURS")).toBe("beaVita Tours");
    expect(brandize("BeaVitaTours")).toBe("beaVita Tours");
    expect(brandize("with Bea Vita you")).toBe("with beaVita you");
    expect(brandize("beavita")).toBe("beaVita");
    expect(brandize("<p>Welcome to Bea Vita Tours!</p>")).toBe("<p>Welcome to beaVita Tours!</p>");
  });

  it("leaves domains, e-mail addresses, paths and codes untouched", () => {
    for (const s of [
      "https://beavitatours.com/tours",
      "info@beavitatours.com",
      "beavitasrl@pec.it",
      "instagram.com/beavitatours",
      "BEAVITA10",
      "beavita_cookie_consent",
      '<a href="https://beavitatours.com">book</a>',
    ]) {
      expect(brandize(s)).toBe(s);
    }
  });

  it("passes null and empty strings through", () => {
    expect(brandize(null)).toBeNull();
    expect(brandize("")).toBe("");
  });
});

describe("brandizeDeep", () => {
  it("rewrites prose fields but not identifiers", () => {
    const post = {
      _id: "bea vita",
      title: "A day with Bea Vita Tours",
      slug: "bea-vita-day",
      body: [{ _type: "block", children: [{ _key: "k", text: "Thanks BEA VITA!" }] }],
      mainImage: { asset: { url: "https://cdn.sanity.io/beavita.jpg" } },
      tags: ["Bea Vita", "Dolomites"],
    };
    expect(brandizeDeep(post)).toEqual({
      _id: "bea vita",
      title: "A day with beaVita Tours",
      slug: "bea-vita-day",
      body: [{ _type: "block", children: [{ _key: "k", text: "Thanks beaVita!" }] }],
      mainImage: { asset: { url: "https://cdn.sanity.io/beavita.jpg" } },
      tags: ["beaVita", "Dolomites"],
    });
  });
});
