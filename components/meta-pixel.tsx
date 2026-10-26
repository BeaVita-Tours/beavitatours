"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { injectInlineScript } from "@/lib/tracking-injection";

const PIXEL_ID = "1116117860659984";
const PIXEL_SCRIPT_ID = "meta-pixel-script";

function pixelScriptContent(): string {
  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('consent', 'grant');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`;
}

export function MetaPixel({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Idempotent: StrictMode runs effects twice and the pixel must only
    // initialize once. On revoke, `clearTrackingArtifacts` removes the script
    // and resets `window.fbq`, so re-consent injects cleanly.
    injectInlineScript({
      id: PIXEL_SCRIPT_ID,
      content: pixelScriptContent(),
    });
  }, [enabled]);

  // Track a PageView on subsequent route changes (the inline script already
  // tracks the initial load).
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [enabled, pathname, searchParams]);

  if (!enabled) {
    return null;
  }

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
