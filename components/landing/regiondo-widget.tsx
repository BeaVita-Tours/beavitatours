"use client";

import { useEffect } from "react";

const regiondoScript =
  "https://widgets.regiondo.net/catalog/v1/catalog-widget.min.js";
const regiondoWidgetId = "7365a711-ca3c-4834-8686-e19642235ae2";

export function RegiondoWidget({ className }: { className?: string }) {
  useEffect(() => {
    if (document.querySelector(`script[src="${regiondoScript}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.src = regiondoScript;
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      id="regiondo-widget"
      className={`w-full h-full ${className || ""}`}
      dangerouslySetInnerHTML={{
        __html: `<product-catalog-widget widget-id="${regiondoWidgetId}"></product-catalog-widget>`,
      }}
    />
  );
}
