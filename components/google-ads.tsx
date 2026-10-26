"use client";

import { useEffect } from "react";
import {
  injectInlineScript,
  injectScript,
} from "@/lib/tracking-injection";

const GOOGLE_ADS_ID = "AW-18113923113";
const ADS_SRC_ID = "google-ads-src";
const ADS_CONFIG_ID = "google-ads-config";

function adsConfigContent(): string {
  return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`;
}

export function GoogleAds({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    injectScript({
      id: ADS_SRC_ID,
      src: `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`,
    });
    injectInlineScript({
      id: ADS_CONFIG_ID,
      content: adsConfigContent(),
    });
  }, [enabled]);

  return null;
}
