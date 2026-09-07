import type React from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { CookieSettingsDialog } from "@/components/cookie-settings-dialog";
import { OrganizationJsonLd } from "@/components/organization-json-ld";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Site-wide TravelAgency markup. Lives here rather than in the root
          layout so /studio stays free of it. */}
      <OrganizationJsonLd />
      <Navigation />
      {children}
      <Footer nativeBooking={isNativeBookingEnabled()} />
      <CookieConsentBanner />
      <CookieSettingsDialog />
    </>
  );
}
