export type PrivacyPolicySection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type PrivacyPolicyContent = {
  title: string;
  subtitle: string;
  versionLabel: string;
  lastUpdatedLabel: string;
  version: string;
  lastUpdated: string;
  sections: PrivacyPolicySection[];
  contactLabel: string;
  contactValue: string;
  consentNote: string;
};

const companyName = "BEA VITA TOURS";
const companyContact = "info@beavitatours.com";

export const privacyPolicy: PrivacyPolicyContent = {
  title: "Privacy Policy",
  subtitle:
    "This notice explains how BEA VITA TOURS processes personal data when you browse the website, contact us, or use the cookie preferences provided on this site.",
  versionLabel: "Version",
  lastUpdatedLabel: "Last updated",
  version: "1.2",
  lastUpdated: "10 November 2026",
  sections: [
    {
      heading: "1. Controller",
      paragraphs: [
        `${companyName} acts as the data controller for the personal data processed through this website.`,
        `For privacy requests, contact us at ${companyContact}.`,
      ],
    },
    {
      heading: "2. Data we process",
      paragraphs: [
        "We process only the data that is necessary to operate the website and to respond to your requests.",
      ],
      bullets: [
        "Contact details and message content you submit through forms or by e-mail.",
        "Technical information such as IP address, browser type, device information, pages visited, and timestamps.",
        "Consent records that document your choice, timestamp, and selected categories.",
        "Privacy-friendly analytics data collected by Umami in our current configuration without cookies.",
      ],
    },
    {
      heading: "3. Purposes and legal bases",
      paragraphs: [
        "We use strictly necessary data to operate the website, secure the service, and provide language and booking functionality.",
        "We use Umami for aggregate usage statistics in a configuration that does not rely on cookies. We rely on our legitimate interests for this limited analytics processing, subject to applicable law.",
        "Meta Pixel and Google Tag Manager are only activated after explicit consent for the relevant categories. Where they run, they are used to measure advertising performance, understand campaign effectiveness, and manage tags that you have allowed.",
      ],
    },
    {
      heading: "4. Cookies and consent management",
      paragraphs: [
        "Necessary cookies and equivalent technologies remain active because they are required for the site to function.",
        "Analytics and marketing technologies stay disabled until you choose to enable them through the cookie banner or cookie settings.",
        "You may withdraw or modify your choices at any time from the cookie settings link in the footer. When you withdraw consent, we stop loading the relevant scripts and delete related first-party cookies where technically possible.",
      ],
    },
    {
      heading: "5. Third-party services and transfers",
      paragraphs: ["The website currently uses the following services:"],
      bullets: [
        "Umami Analytics for privacy-friendly usage statistics.",
        "Meta Pixel for marketing and conversion measurement, only after marketing consent.",
        "Google Tag Manager as a container for consent-based tags, only after the relevant consent is granted.",
        "Regiondo GmbH, a European company based in Germany, as our booking provider. The booking box on each tour page is Regiondo's booking widget, loaded from Regiondo's servers: your browser connects to Regiondo to show availability, and the details you enter to book, including payment, go directly to Regiondo and are processed by them under their privacy policy. The widget may set its own cookies needed for the booking. If the widget cannot load, availability is requested from Regiondo by our servers instead and you complete the booking on Regiondo's own secure checkout. Either way, we never receive or store your card details.",
      ],
    },
    {
      heading: "6. Retention and your rights",
      paragraphs: [
        "Consent records are retained for as long as needed to demonstrate your choice or until the policy version changes and we request a fresh decision.",
        "You may request access, rectification, erasure, restriction, objection, portability, and withdrawal of consent, subject to legal limits.",
        "You also have the right to lodge a complaint with your competent data protection authority.",
      ],
    },
  ],
  contactLabel: "Contact",
  contactValue: companyContact,
  consentNote:
    "This policy reflects the current website configuration. If the tooling changes, the policy and consent choices should be reviewed and updated accordingly.",
};
