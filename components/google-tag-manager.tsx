"use client";

import { useEffect, useRef } from "react";
import { replaceInlineScript } from "@/lib/tracking-injection";

const GTM_ID = "GTM-N5H2N2VZ";
const CONSENT_SCRIPT_ID = "gtm-consent-init";
const LOADER_SCRIPT_ID = "gtm-loader";

type GoogleTagManagerProps = {
  enabled: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
};

const consentState = (allowed: boolean) => (allowed ? "granted" : "denied");

function consentInitContent(
  analyticsConsent: boolean,
  marketingConsent: boolean,
): string {
  const analytics = consentState(analyticsConsent);
  const marketing = consentState(marketingConsent);

  return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

gtag('consent', 'default', {
  'analytics_storage': '${analytics}',
  'ad_storage': '${marketing}',
  'ad_user_data': '${marketing}',
  'ad_personalization': '${marketing}',
  'functionality_storage': 'granted',
  'personalization_storage': 'granted',
  'security_storage': 'granted',
});

window.dataLayer.push({
  event: 'cookie_consent_update',
  analytics_consent: '${analytics}',
  marketing_consent: '${marketing}'
});`;
}

function loaderContent(): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;
}

export function GoogleTagManager({
  enabled,
  analyticsConsent,
  marketingConsent,
}: GoogleTagManagerProps) {
  // Tracks the consent state the scripts were last applied for, so they are
  // re-applied only when consent actually changes (StrictMode runs effects
  // twice on mount; the second run must not reload GTM).
  const appliedConsentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const consentKey = `${analyticsConsent}:${marketingConsent}`;
    if (appliedConsentRef.current === consentKey) {
      return;
    }
    appliedConsentRef.current = consentKey;

    // Consent mode must be set before the GTM container loads so the
    // container respects the visitor's choice from the first event.
    replaceInlineScript({
      id: CONSENT_SCRIPT_ID,
      content: consentInitContent(analyticsConsent, marketingConsent),
    });
    // Reloaded on consent change so GTM re-captures the dataLayer that
    // `clearTrackingArtifacts` resets.
    replaceInlineScript({
      id: LOADER_SCRIPT_ID,
      content: loaderContent(),
    });
  }, [enabled, analyticsConsent, marketingConsent]);

  if (!enabled) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
