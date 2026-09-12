/**
 * The two Regiondo tags the site browses by, and the product sets behind the
 * paid landing pages.
 *
 * Tag ids are stable account data (`GET /tags`), so they are pinned here rather
 * than looked up on every render — a collection page that silently empties
 * because a tag was renamed is worse than one that fails loudly.
 *
 * Not `server-only`: page components need these to build links.
 */

export const COLLECTIONS = {
  shared: {
    tagId: "45420",
    title: "Shared Tours from Venice",
    /** Existing URL — the page that hosts the Regiondo widget today. */
    href: "/tours/group-tours",
    /** Short form for the breadcrumb and the ItemList markup. */
    label: "Group tours",
    heading: "Beyond Venice, with good company. Come along for the ride.",
    intro: [
      "From the Dolomites to the Prosecco Hills to the streets of Verona, our group tours take you into the Veneto region — the places we know first-hand.",
      "No complicated planning. Just a fixed date, a group of fellow travelers, an English-speaking local guide, and a day we've taken care of from start to finish.",
      "Choose your tour and let's see Veneto together.",
    ],
  },
  private: {
    tagId: "45421",
    title: "Private Tours from Venice",
    href: "/tours/private-tours",
    label: "Private tours",
    heading: "Private day tours from Venice",
    intro:
      "Your own vehicle, your own driver, your own pace. Private departures let you start when you like, linger where you want, and shape the day around what you actually came to see.",
  },
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;

/**
 * The collection page a tour belongs to, from the category titles Regiondo
 * puts on the product ("Shared Tours from Venice" / "Private Tours from
 * Venice"). Falls back to the group tours page: it is the volume product,
 * and a tour with no category is far likelier to be a tagging slip than a
 * third kind of tour.
 */
export function collectionForTour(collections: readonly string[]): (typeof COLLECTIONS)[CollectionKey] {
  return (
    Object.values(COLLECTIONS).find((collection) => collections.includes(collection.title)) ??
    COLLECTIONS.shared
  );
}

/**
 * Product sets for the paid landing pages.
 *
 * The `/lp/*` iframes filter Regiondo's whitelabel shop by the categories
 * `escape-venice-for-a-day` and `escape-from-jesolo-cavallino`. Those are
 * ticketshop categories — `GET /tags` does not know them, so there is no way to
 * reproduce the filter through the API. The sets are therefore pinned by
 * product id to match what each iframe shows today.
 *
 * If a tour is added to one of those shop categories, add its id here too.
 */
export const LANDING_PRODUCT_SETS = {
  "from-venice": [
    "298190", // Dolomites, Cortina and 2 lakes (shared)
    "300877", // Best of the Dolomites (shared)
    "341597", // Lake Braies and Tre Cime (shared)
    "326845", // Prosecco hills and wine tasting (shared)
    "307882", // Prosecco hills with wine, spritz and Asolo (shared)
    "298188", // Dolomites and Prosecco hills (private)
    "341599", // Medieval hill towns (private)
  ],
  "from-jesolo-cavallino": [
    "326843", // Dolomites day trip (private)
    "326844", // Prosecco hills (private)
  ],
} as const satisfies Record<string, readonly string[]>;

export type LandingKey = keyof typeof LANDING_PRODUCT_SETS;

/* -------------------------------------------------------------------------- */
/* theme pages                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Bookable tours for the hand-written theme pages under `/tours/*`.
 *
 * Those pages have always been editorial: they describe the Dolomites or the
 * Prosecco hills and then send the reader on, with nothing bookable in
 * between. This maps each *section* that lists tours to the departures that
 * actually deliver its subject, so the page can close.
 *
 * Keyed by section, not by page: the Food & Wine page opens with a Prosecco
 * Hills section (the Prosecco page was folded into it, and `/tours/prosecco`
 * redirects there), so `prosecco` is a set without a page of its own, and
 * `wine-food` is a page whose only tour set is `prosecco`. `THEME_PAGES` below
 * is the page → sets map.
 *
 * **Curated ids, not a keyword query.** The API's `kwd` search does work
 * (verified live: "dolomites" returns 8, "prosecco" 5, "wine" 6), but it
 * matches on descriptions, so it is approximate in both directions — a
 * keyword search for "dolomites" pulls in the Medieval Hill Towns tour because
 * its copy mentions them. On a conversion surface the ordering and the
 * membership are editorial judgements, so they are written down.
 *
 * Order is deliberate: shared, lower-priced departures first. They are the
 * easier yes, and someone who wants the private version will scroll.
 *
 * The whole set is rendered on the page. An earlier version showed three and
 * linked the rest to a keyword-filtered `/tours?q=`, which landed the reader on
 * a page they could not otherwise reach with a filter they could not see.
 */
export interface ThemeUpsell {
  readonly heading: string;
  readonly intro: string;
  readonly productIds: readonly string[];
}

export const THEME_UPSELLS = {
  dolomites: {
    heading: "Day trips to the Dolomites",
    intro:
      "Everything above is a two-hour drive away. These are the departures that take you there — leaving Venice in the morning and back the same evening.",
    productIds: ["300877", "298190", "341597", "298188", "339660", "341596", "326843"],
  },
  prosecco: {
    heading: "Day trips to the Prosecco hills",
    intro:
      "Forty-five minutes from Venice, and a different world. These departures take in the vineyards, a family-run winery and the hill towns between them.",
    productIds: ["326845", "307882", "298188", "326844"],
  },
  "active-adventure": {
    heading: "Guided days in the mountains",
    intro:
      "Both of these go out with a qualified alpine guide, and both are private — the group is you and whoever you bring.",
    productIds: ["339660", "341596"],
  },
  cultural: {
    heading: "Tours through the hill towns",
    intro:
      "Asolo, Cison di Valmarino and the walled villages between them — medieval streets, a castle or two, and wine at the end of it.",
    productIds: ["341599"],
  },
} as const satisfies Record<string, ThemeUpsell>;

export type ThemeKey = keyof typeof THEME_UPSELLS;

/**
 * The four theme pages — the answer to "where do you want to go?" — and the
 * tour sets each one renders.
 *
 * Also the grouping the group-tours page uses: the client asked for the shared
 * departures split by theme rather than shown as one flat list, and this is
 * the order they asked for. A theme with no shared departure (the private-only
 * ones) still gets its heading there, with a pointer to the theme page.
 */
export interface ThemePage {
  /** The directory under app/(site)/tours/. */
  readonly slug: string;
  readonly href: `/tours/${string}`;
  /** Short name, as used on the homepage tiles and the group-tours headings. */
  readonly title: string;
  readonly sets: readonly ThemeKey[];
}

export const THEME_PAGES = [
  { slug: "dolomites", href: "/tours/dolomites", title: "Dolomites", sets: ["dolomites"] },
  { slug: "wine-food", href: "/tours/wine-food", title: "Food & Wine", sets: ["prosecco"] },
  {
    slug: "active-adventure",
    href: "/tours/active-adventure",
    title: "Active & Adventure",
    sets: ["active-adventure"],
  },
  { slug: "cultural", href: "/tours/cultural", title: "Culture & History", sets: ["cultural"] },
] as const satisfies readonly ThemePage[];

export type ThemePageSlug = (typeof THEME_PAGES)[number]["slug"];

export function themePage(slug: ThemePageSlug): ThemePage {
  // The slug type guarantees a match; the throw is for a runtime caller
  // outside TypeScript's reach (a CMS field, say).
  const page = THEME_PAGES.find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`Unknown theme page "${slug}"`);
  return page;
}
