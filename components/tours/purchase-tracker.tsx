"use client";

import { useEffect } from "react";

import { useCookieConsent } from "@/components/cookie-consent-provider";
import { type EcommercePayload, trackPurchase } from "@/lib/analytics";

/**
 * Fires the purchase event on the confirmation page.
 *
 * Every value in `payload` comes from `findBookingByOrderNumber()` — the order
 * is looked up against Regiondo on the server before this component is ever
 * rendered. Nothing here is derived from a URL parameter, so a crafted link
 * cannot invent a conversion.
 *
 * `trackPurchase` dedupes on the transaction id, so a refresh, a back-button or
 * a shared link does not count twice.
 */
export function PurchaseTracker({ payload }: { payload: EcommercePayload }) {
  const { hasAnalyticsConsent, hydrated } = useCookieConsent();

  useEffect(() => {
    // Wait for the consent cookie to be read. Pushing before that would be
    // pushing into a dataLayer that clearTrackingArtifacts() is about to empty.
    if (!hydrated) return;
    trackPurchase(payload, hasAnalyticsConsent);
  }, [hydrated, hasAnalyticsConsent, payload]);

  return null;
}
