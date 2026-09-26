"use client";

/**
 * @deprecated Legacy Regiondo catalog widget.
 *
 * Replaced by the native collection page in
 * `app/(site)/tours/group-tours/page.tsx`, which renders this only while
 * `REGIONDO_NATIVE_BOOKING` is off.
 *
 * Why it is going: the widget injects a third-party script and renders the
 * whole catalog into a custom element, so none of the tour content is in the
 * server HTML and none of it is crawlable. It also loads regardless of cookie
 * consent, which the native flow does not.
 *
 * Safe to delete once the flag has been on in production and verified —
 * together with `app/(site)/tours/group-tours/legacy-widget-page.tsx` and the
 * `.rcw-*` rules at the bottom of `app/globals.css`. See the migration table in
 * docs/regiondo-integration.md.
 */

import { useEffect } from "react";

const REGIONDO_WIDGET_ID = "7365a711-ca3c-4834-8686-e19642235ae2";

export function SharedToursRegiondoWidget() {
  useEffect(() => {
    const src = "https://widgets.regiondo.net/catalog/v1/catalog-widget.min.js";
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement("script");
      s.src = src;
      s.type = "text/javascript";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div
      id="regiondo-widget"
      className="w-full h-full"
      dangerouslySetInnerHTML={{
        __html: `<product-catalog-widget widget-id="${REGIONDO_WIDGET_ID}"></product-catalog-widget>`,
      }}
    />
  );
}
