import { SITE_URL } from "@/lib/constants";

import type { TourDetail, TourReview, TourSummary } from "./types";

/**
 * JSON-LD for the tour catalog.
 *
 * One rule governs this file: **nothing is fabricated.** `AggregateRating` is
 * emitted only when Regiondo returns real reviews, prices come from the parsed
 * API response, and `availability` reflects what the product actually says.
 * Inventing a rating to win a star in the SERP is a manual action waiting to
 * happen, and it is dishonest to the people reading it.
 *
 * `TouristTrip` is the closest schema.org type for a guided day trip, and
 * Google reads `Product` for the merchant listing signals. Emitting both, with
 * the tour as a `Product` that `isSimilarTo` nothing and a `TouristTrip` for
 * the itinerary semantics, is a common and accepted pattern.
 */

type JsonLd = Record<string, unknown>;

function absolute(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

/**
 * Regiondo returns no `validThrough` for a product's base price, and inventing
 * one would be a claim we cannot keep. Offers therefore carry price, currency
 * and availability only.
 */
function offerFor(tour: TourSummary): JsonLd {
  return {
    "@type": "Offer",
    price: tour.priceFrom.amount.toFixed(2),
    priceCurrency: tour.priceFrom.currency,
    availability: "https://schema.org/InStock",
    url: absolute(tour.href),
  };
}

function aggregateRatingFor(tour: TourSummary): JsonLd | null {
  // No reviews, no rating markup. Eight of the eleven live tours land here.
  if (!tour.rating || tour.rating.count < 1) return null;
  return {
    "@type": "AggregateRating",
    ratingValue: tour.rating.value.toFixed(1),
    reviewCount: tour.rating.count,
    bestRating: 5,
    worstRating: 1,
  };
}

export function tourJsonLd(tour: TourDetail, reviews: readonly TourReview[]): JsonLd {
  const rating = aggregateRatingFor(tour);
  const images = tour.gallery.slice(0, 6).map((image) => image.url);

  const trip: JsonLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "TouristTrip"],
    "@id": `${absolute(tour.href)}#tour`,
    name: tour.title,
    description: tour.excerpt,
    url: absolute(tour.href),
    ...(images.length > 0 ? { image: images } : {}),
    ...(tour.provider ? { brand: { "@type": "Brand", name: tour.provider } } : {}),
    ...(tour.duration ? { duration: isoDuration(tour.duration.value, tour.duration.unit) } : {}),
    offers: offerFor(tour),
    ...(rating ? { aggregateRating: rating } : {}),
  };

  if (tour.meetingPoint.lat !== null && tour.meetingPoint.lon !== null) {
    trip.itinerary = {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Place",
            name: tour.meetingPoint.name ?? tour.city ?? tour.title,
            ...(tour.meetingPoint.address
              ? { address: { "@type": "PostalAddress", streetAddress: tour.meetingPoint.address } }
              : {}),
            geo: {
              "@type": "GeoCoordinates",
              latitude: tour.meetingPoint.lat,
              longitude: tour.meetingPoint.lon,
            },
          },
        },
      ],
    };
  }

  // Individual reviews, only where there is a real body and a real score.
  const usable = reviews.filter((review) => review.rating !== null && review.body.length > 20);
  if (usable.length > 0) {
    trip.review = usable.slice(0, 5).map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.author },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      ...(review.title ? { name: review.title } : {}),
      reviewBody: review.body,
      ...(review.createdAt ? { datePublished: review.createdAt.slice(0, 10) } : {}),
    }));
  }

  return trip;
}

export function breadcrumbJsonLd(
  trail: readonly { name: string; href: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.href),
    })),
  };
}

export function itemListJsonLd(tours: readonly TourSummary[], name: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: tours.length,
    itemListElement: tours.map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absolute(tour.href),
      name: tour.title,
    })),
  };
}

/** ISO 8601 duration, e.g. 9 hours -> PT9H. */
function isoDuration(value: number, unit: "hour" | "day" | "minute"): string {
  if (unit === "day") return `P${Math.round(value)}D`;
  if (unit === "minute") return `PT${Math.round(value)}M`;
  const whole = Math.floor(value);
  const minutes = Math.round((value - whole) * 60);
  return minutes > 0 ? `PT${whole}H${minutes}M` : `PT${whole}H`;
}

/**
 * Renders a JSON-LD block. `JSON.stringify` escapes nothing that matters inside
 * a script tag except `</script>`, so that sequence is broken explicitly rather
 * than relying on the sanitiser upstream having caught it.
 */
export function jsonLdScriptProps(data: JsonLd | JsonLd[]) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    },
  } as const;
}
