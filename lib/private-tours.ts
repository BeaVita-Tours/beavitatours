/**
 * The tailor-made private tour offer.
 *
 * This copy used to live on `/rates`, a page that priced private tours without
 * being able to sell them. It now sits on `/tours/private-tours`, under the
 * bookable private departures, so the reader who did not find the right day in
 * the catalog is offered a custom one in the same place.
 *
 * Rates are per group and are quoted by the operator; they are not read from
 * Regiondo because tailor-made days are not a Regiondo product.
 */

export interface PrivateTourRate {
  readonly label: string;
  readonly detail: string;
  readonly price: string;
}

export const PRIVATE_TOUR_RATES: readonly PrivateTourRate[] = [
  { label: "Half day", detail: "about 5 hours", price: "€600" },
  { label: "Full day", detail: "about 9 hours", price: "€900" },
  { label: "Multi-day", detail: "two days or more", price: "On request" },
  { label: "Tailor-made", detail: "built around your own itinerary", price: "On request" },
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
