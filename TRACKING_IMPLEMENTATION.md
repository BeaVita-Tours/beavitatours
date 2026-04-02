# Consent-based tracking implementation

This project now uses a GDPR/ePrivacy-first consent flow for all non-essential tracking.

## Current behavior

- **Umami Analytics** loads on every page with `beforeInteractive` strategy and is treated as privacy-friendly, cookieless analytics in the current configuration.
- **Meta Pixel** only loads after explicit marketing consent with `beforeInteractive` strategy and noscript fallback.
- **Google Tag Manager** only loads after explicit analytics or marketing consent, with consent mode set in the dataLayer.
- **No tracking scripts fire before consent** other than Umami and strictly necessary site functionality.
- **GTM and Meta Pixel** include noscript fallbacks for users with JavaScript disabled.

## Key files

- `components/cookie-consent-provider.tsx` — consent state, persistence, and cleanup.
- `components/cookie-consent-banner.tsx` — first-visit banner.
- `components/cookie-settings-dialog.tsx` — editable preferences dialog.
- `components/tracking-scripts.tsx` — conditional mounting of Meta Pixel and GTM.
- `components/meta-pixel.tsx` — marketing script loader.
- `components/google-tag-manager.tsx` — GTM loader with consent metadata.
- `lib/cookie-consent.ts` — consent serialization, parsing, and cleanup helpers.
- `app/[locale]/privacy/page.tsx` — multilingual privacy policy page.

## Consent storage

Consent is stored in a first-party cookie named `beavita_cookie_consent`. The record includes:

- the consent version,
- the timestamp of the user's decision,
- the chosen categories,
- and the action used to save it (`accept-all`, `reject-all`, or `custom`).

If the stored version changes, the consent record is treated as invalid and the banner is shown again.

## Withdrawal and cleanup

When the user withdraws or reduces consent, the implementation:

- removes the relevant tracking scripts from the DOM,
- clears known Meta/Google tracking cookies where possible,
- resets common tracking globals such as `fbq`, `dataLayer`, and `google_tag_manager`,
- and keeps the consent cookie itself in sync with the latest choice.

## Notes

- GTM must still be configured in the GTM dashboard to respect the consent categories the site sends.
- Umami is assumed to remain configured without cookies.
- The privacy policy page includes English, Italian, Japanese, and Chinese versions.
