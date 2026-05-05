"use client";

import Script from "next/script";

const GOOGLE_ADS_ID = "AW-18113923113";

export function GoogleAds({
  enabled,
  scriptId,
}: {
  enabled: boolean;
  scriptId: string;
}) {
  if (!enabled) {
    return null;
  }

  return (
    <>
      <Script
        id={`google-ads-src-${scriptId}`}
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="beforeInteractive"
      />
      <Script
        id={`google-ads-config-${scriptId}`}
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `,
        }}
      />
    </>
  );
}
