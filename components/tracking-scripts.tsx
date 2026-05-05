"use client";

import { MetaPixel } from "@/components/meta-pixel";
import { GoogleTagManager } from "@/components/google-tag-manager";
import { GoogleAds } from "@/components/google-ads";
import { useCookieConsent } from "@/components/cookie-consent-provider";

export function TrackingScripts() {
  const { consent, hasAnalyticsConsent, hasMarketingConsent } = useCookieConsent();
  const scriptId = (consent?.timestamp ?? "no-consent").replace(/[^a-zA-Z0-9_-]/g, "-");

  return (
    <>
      {/* GTM always loads, consent mode controls its behavior */}
      <GoogleTagManager
        key={`GTM-${scriptId}`}
        enabled={true}
        analyticsConsent={hasAnalyticsConsent}
        marketingConsent={hasMarketingConsent}
        scriptId={scriptId}
      />
      {/* Meta Pixel only loads with marketing consent */}
      {hasMarketingConsent && (
        <MetaPixel
          key={`meta-${scriptId}`}
          enabled={hasMarketingConsent}
          scriptId={scriptId}
        />
      )}
      {/* Google Ads only loads with marketing consent */}
      {hasMarketingConsent && (
        <GoogleAds
          key={`google-ads-${scriptId}`}
          enabled={hasMarketingConsent}
          scriptId={scriptId}
        />
      )}
    </>
  );
}
