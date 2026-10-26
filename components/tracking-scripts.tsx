"use client";

import { MetaPixel } from "@/components/meta-pixel";
import { GoogleTagManager } from "@/components/google-tag-manager";
import { GoogleAds } from "@/components/google-ads";
import { useCookieConsent } from "@/components/cookie-consent-provider";

export function TrackingScripts() {
  const { consent, hasAnalyticsConsent, hasMarketingConsent, hydrated } =
    useCookieConsent();

  if (!hydrated) {
    return null;
  }

  // Changing with consent so the gated trackers remount (and re-inject) when
  // the consent record changes; `clearTrackingArtifacts` removes their scripts.
  const scriptId = (consent?.timestamp ?? "no-consent").replace(
    /[^a-zA-Z0-9_-]/g,
    "-",
  );

  return (
    <>
      {/* GTM always loads, consent mode controls its behavior */}
      <GoogleTagManager
        enabled={true}
        analyticsConsent={hasAnalyticsConsent}
        marketingConsent={hasMarketingConsent}
      />
      {/* Meta Pixel only loads with marketing consent */}
      {hasMarketingConsent && (
        <MetaPixel key={`meta-${scriptId}`} enabled={true} />
      )}
      {/* Google Ads only loads with marketing consent */}
      {hasMarketingConsent && (
        <GoogleAds key={`google-ads-${scriptId}`} enabled={true} />
      )}
    </>
  );
}
