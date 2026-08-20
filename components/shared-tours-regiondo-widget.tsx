"use client";

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
