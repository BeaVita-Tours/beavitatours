import { SITE_URL } from "@/lib/constants";

/**
 * Site-wide `TravelAgency` markup.
 *
 * `TravelAgency` rather than a bare `Organization`: it is a subtype of
 * `LocalBusiness`, so it carries the local-business signals while saying what
 * the business actually is. Every value here is verifiable from the footer —
 * the licence number, the VAT number and the authorisation are already printed
 * on the site, and structured data that claims more than the page does is worse
 * than none.
 *
 * `areaServed` rather than a street address: this is a tour operator that
 * collects guests at a meeting point, not a shopfront, and asserting a postal
 * address it does not trade from would be a fabrication.
 */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#organization`,
    name: "Bea Vita Tours",
    url: SITE_URL,
    description:
      "Family-run tour operator running day trips from Venice, Jesolo and Cavallino to the Dolomites and the Prosecco hills.",
    vatID: "IT05602720",
    // Regional tour-operator authorisation, as printed in the site footer.
    identifier: "Auth 6297 prov. TV",
    areaServed: [
      { "@type": "City", name: "Venice" },
      { "@type": "City", name: "Jesolo" },
      { "@type": "City", name: "Cavallino-Treporti" },
      { "@type": "AdministrativeArea", name: "Veneto" },
    ],
    knowsLanguage: ["en", "it"],
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "TouristTrip",
        name: "Day trips from Venice to the Dolomites and the Prosecco hills",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- static, author-controlled
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
