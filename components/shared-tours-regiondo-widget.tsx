"use client";

import React, { useEffect } from "react";
import { useLocale } from "next-intl";

export function SharedToursRegiondoWidget() {
  const locale = useLocale();

  useEffect(() => {
    if (locale === "zh" || locale === "ja") {
      const src =
        "https://www.regiondo.com/js/integration/calendarwidget/calendarwidget.js";
      if (!document.querySelector(`script[src="${src}"]`)) {
        const s = document.createElement("script");
        s.src = src;
        s.type = "text/javascript";
        s.async = true;
        document.body.appendChild(s);
      }
    } else {
      const src =
        "https://widgets.regiondo.net/catalog/v1/catalog-widget.min.js";
      if (!document.querySelector(`script[src="${src}"]`)) {
        const s = document.createElement("script");
        s.src = src;
        s.type = "text/javascript";
        s.async = true;
        document.body.appendChild(s);
      }
    }
  }, [locale]);

  if (locale === "zh") {
    return (
      <div
        id="regiondo-calendar-widget"
        className="w-full h-full"
        data-code="46886-d9d1a36ce3a1fe350ea04fdc3be5235e"
        data-locale="zh_CN"
        data-apiurl="https://www.regiondo.com/"
        data-sf="0"
        data-sp="1"
        data-vt="m"
      />
    );
  }

  if (locale === "ja") {
    return (
      <div
        id="regiondo-calendar-widget"
        className="w-full h-full"
        data-code="46886-1e2085fb44369bc974a8a5e8e92caa47"
        data-locale="ja_JP"
        data-apiurl="https://www.regiondo.com/"
        data-sf="0"
        data-sp="1"
        data-vt="m"
      />
    );
  }

  return (
    <div
      id="regiondo-widget"
      className="w-full h-full"
      dangerouslySetInnerHTML={{
        __html:
          '<product-catalog-widget widget-id="7365a711-ca3c-4834-8686-e19642235ae2"></product-catalog-widget>',
      }}
    />
  );
}