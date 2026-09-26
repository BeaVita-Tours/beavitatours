/**
 * The tailor-made private tour offer.
 *
 * This copy used to live on `/rates`, a page that priced private tours without
 * being able to sell them. It now sits on `/tours/private-tours`, under the
 * bookable private departures, so the reader who did not find the right day in
 * the catalog is offered a custom one in the same place.
 *
 * There is deliberately no price list any more (client decision): a private
 * day is quoted per group by the operator, and a table of half-day / full-day
 * rates was doing the negotiating for them. The page keeps one hook — the
 * full-day starting price — and sends the reader to the contact form.
 */

/** The single price hook shown on the page, per group, full day. */
export const PRIVATE_TOUR_STARTING_PRICE = "€900";

/** What a private day looks like, in the reader's terms — not a rate card. */
export interface PrivateTourFormat {
  readonly label: string;
  readonly detail: string;
}

export const PRIVATE_TOUR_FORMATS: readonly PrivateTourFormat[] = [
  { label: "Half day", detail: "about 5 hours — the Prosecco hills, or a hill town and a winery" },
  { label: "Full day", detail: "about 9 hours — the Dolomites, the lakes, Cortina" },
  { label: "Multi-day", detail: "two days or more, with overnight stops planned for you" },
  { label: "Tailor-made", detail: "your own itinerary, built from scratch with us" },
];

export const PRIVATE_TOUR_INCLUDED: readonly string[] = [
  "A fluent English-speaking driver-guide, with you all day",
  "A comfortable, air-conditioned car or van",
  "An itinerary planned around what you want to see",
  "Taxes, VAT and motorway tolls",
];

export const PRIVATE_TOUR_NOT_INCLUDED: readonly string[] = [
  "Entrance fees to museums and attractions",
  "Wine tastings, meals and drinks",
  "Overnight stays on multi-day tours",
  "Tips and gratuities",
];

/** Photos for the private-tours page. Paths under `public/`. */
export interface PrivateTourPhoto {
  readonly src: string;
  readonly alt: string;
}

/**
 * The gallery on the tailor-made offer. First one is the lead image. Swap in
 * photos of the vehicles and of private groups as they become available —
 * the layout takes any four.
 */
export const PRIVATE_TOUR_PHOTOS: readonly PrivateTourPhoto[] = [
  { src: "/IMG_2240.jpg", alt: "Cortina d'Ampezzo beneath the Tofane peaks" },
  { src: "/landing/broll3.jpg", alt: "Your guide at a viewpoint over the Prosecco hills" },
  { src: "/landing/tourpics/review3.webp", alt: "A private tasting at a family-run winery" },
  { src: "/landing/tourpics/gyg1.webp", alt: "The church of San Vigilio above the vineyards" },
];
