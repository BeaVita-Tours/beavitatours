"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

const widgetIds: Record<string, string> = {
  en: "7365a711-ca3c-4834-8686-e19642235ae2",
  it: "7365a711-ca3c-4834-8686-e19642235ae2",
  zh: "e57d7f00-a3e8-446b-b873-8f236fcf8ae2",
  ja: "f1ecfc87-53bd-4e5d-aff5-7ab7abf64bba",
};

export function SharedToursRegiondoWidget() {
  const locale = useLocale();
  const widgetId = widgetIds[locale] ?? widgetIds.en;

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
        __html: `<product-catalog-widget widget-id="${widgetId}"></product-catalog-widget>`,
      }}
    />
  );
}