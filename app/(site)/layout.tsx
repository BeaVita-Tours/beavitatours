import type React from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { CookieSettingsDialog } from "@/components/cookie-settings-dialog";
import { OrganizationJsonLd } from "@/components/organization-json-ld";
import { getOptionalSnapshot } from "@/lib/seo/client";
import { listGuides } from "@/lib/seo/publications";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The Guides link appears once SEO Workspace has published an English guide.
  const publications = await getOptionalSnapshot();
  const showGuides = !!publications && listGuides(publications).length > 0;

  return (
    <>
      {/* Site-wide TravelAgency markup. Lives here rather than in the root
          layout so /studio stays free of it. */}
      <OrganizationJsonLd />
      <Navigation showGuides={showGuides} />
      {children}
      <Footer />
      <CookieConsentBanner />
      <CookieSettingsDialog />
    </>
  );
}
