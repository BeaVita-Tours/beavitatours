import type React from "react";
import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
// @ts-ignore vscode doesn't find this somehow
import "../globals.css";
import { cookies } from "next/headers";
import { Umami } from "@/components/umami";
import { CookieConsentProvider } from "@/components/cookie-consent-provider";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { CookieSettingsDialog } from "@/components/cookie-settings-dialog";
import { TrackingScripts } from "@/components/tracking-scripts";
import { CONSENT_COOKIE_NAME, parseConsentRecord } from "@/lib/cookie-consent";

const playfairDisplay = Playfair_Display({ subsets: ["latin"] });
const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "BeaVitaTours - Tours and Day Trips from Venice to Dolomites & Prosecco",
  description:
    "Experience the best Tours and Day Trips from Venice to the Dolomites, Prosecco wine region, and Italian countryside. Direct booking with no intermediaries.",
};

export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialConsent = parseConsentRecord(
    cookieStore.get(CONSENT_COOKIE_NAME)?.value,
  );

  return (
    <html lang="en">
      <CookieConsentProvider initialConsent={initialConsent}>
        <head>
          <TrackingScripts />
        </head>
        <body
          className={`font-sans antialiased ${playfairDisplay.className} ${dmSans.className}`}
        >
          <Umami />
          {children}
          <CookieConsentBanner />
          <CookieSettingsDialog />
        </body>
      </CookieConsentProvider>
    </html>
  );
}
