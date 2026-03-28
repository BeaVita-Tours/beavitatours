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
  if (!enabled) {
    return null;
  }

  return (
    <Script
      id={`google-tag-manager-script-${scriptId}`}
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'cookie_consent_update',
            analytics_consent: '${analyticsConsent ? "granted" : "denied"}',
            marketing_consent: '${marketingConsent ? "granted" : "denied"}'
          });
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `,
      }}
    />
  );
}
