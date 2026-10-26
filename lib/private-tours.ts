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
  "A local driver, with you all day",
  "A comfortable, air-conditioned van or bus",
  "An itinerary planned around what you want to see",
  "Taxes, VAT and motorway tolls",
];

/** Extras added to the quote when asked for (was "Not included" until the
    client's revision of 2026-09-29). */
export const PRIVATE_TOUR_ON_REQUEST: readonly string[] = [
  "Guide in your own language",
  "Luxury car",
  "Overnight stays on multi-day tours",
  "Pick-up from your hotel",
];

/** The line beside "Ask for a quote". */
export const PRIVATE_TOUR_BOOKING_TERMS =
  "20% deposit to confirm. Free cancellation up to 48h before.";

/** Photos for the private-tours page. Paths under `public/`. */
export interface PrivateTourPhoto {
  readonly src: string;
  readonly alt: string;
}

/**
 * The gallery on the tailor-made offer. First one is the lead image. Moments,
 * not landscapes (client, 2026-09-29): the photos should say "this day is
 * yours", which a view of the Dolomites does not. Swap in photos of the
 * vehicles and of private groups as they become available — the layout takes
 * any four.
 *
 * Revision of 2026-10-26: the four were all Prosecco, and the client read the
 * page as offering only that. The mix now follows the homepage hero — the
 * Dolomites as the lead, then one photo each for wine, the mountains and
 * culture.
 */
export const PRIVATE_TOUR_PHOTOS: readonly PrivateTourPhoto[] = [
  { src: "/images/private-tours.webp", alt: "The Dolomites rising behind Cortina d'Ampezzo at sunset" },
  { src: "/landing/broll14.jpg", alt: "Guests with a glass of Prosecco at a private tasting in the hills" },
  { src: "/tourcustom.jpg", alt: "The Olympic rings in Cortina d'Ampezzo, with the Dolomites behind" },
  { src: "/imgs/cultural/padova1.jpeg", alt: "The frescoed ceiling of the Scrovegni Chapel in Padua" },
];
