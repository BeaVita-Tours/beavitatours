"use client";

import { GoogleTagManager as GTM } from "@next/third-parties/google";
import Script from "next/script";

const GTM_ID = "GTM-N5H2N2VZ";

type GoogleTagManagerProps = {
  enabled: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  scriptId: string;
};

export function GoogleTagManager({
  enabled,
  analyticsConsent,
  marketingConsent,
  scriptId,
}: GoogleTagManagerProps) {
  return (
    <>
      {/* Initialize consent mode before GTM loads */}
      <Script
        id="gtm-consent-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            gtag('consent', 'default', {
              'analytics_storage': '${analyticsConsent ? "granted" : "denied"}',
              'ad_storage': '${marketingConsent ? "granted" : "denied"}',
              'ad_user_data': '${marketingConsent ? "granted" : "denied"}',
              'ad_personalization': '${marketingConsent ? "granted" : "denied"}',
              'functionality_storage': 'granted',
              'personalization_storage': 'granted',
              'security_storage': 'granted',
            });
            
            window.dataLayer.push({
              event: 'cookie_consent_update',
              analytics_consent: '${analyticsConsent ? "granted" : "denied"}',
              marketing_consent: '${marketingConsent ? "granted" : "denied"}'
            });
          `,
        }}
      />
      <GTM gtmId={GTM_ID} />
      {/* noscript fallback for GTM - required by Google */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
