"use client";

import { MetaPixel } from "@/components/meta-pixel";
import { GoogleTagManager } from "@/components/google-tag-manager";
import { useCookieConsent } from "@/components/cookie-consent-provider";

export function TrackingScripts() {
  const { consent, hasAnalyticsConsent, hasMarketingConsent } = useCookieConsent();
  const scriptId = (consent?.timestamp ?? "no-consent").replace(/[^a-zA-Z0-9_-]/g, "-");

  if (!hasAnalyticsConsent && !hasMarketingConsent) {
    return null;
  }

  return (
    <>
      <GoogleTagManager
        key={`GTM-${scriptId}`}
        enabled={true}
        analyticsConsent={hasAnalyticsConsent}
        marketingConsent={hasMarketingConsent}
        scriptId={scriptId}
      />
      <MetaPixel
        key={`meta-${scriptId}`}
        enabled={hasMarketingConsent}
        scriptId={scriptId}
      />
    </>
  );
}
