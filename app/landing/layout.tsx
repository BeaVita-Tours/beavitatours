import type React from "react";
import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
// @ts-ignore vscode doesn't find this somehow
import "../globals.css";
import { cookies } from "next/headers";
import { Umami } from "@/components/umami";
import { CookieConsentProvider } from "@/components/cookie-consent-provider";
import { TrackingScripts } from "@/components/tracking-scripts";
import { CONSENT_COOKIE_NAME, parseConsentRecord } from "@/lib/cookie-consent";
import { CookieConsentBanner } from "@/components/landing/cookie-consent-banner";
import { CookieSettingsDialog } from "@/components/landing/cookie-settings-dialog";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

const landingMetadata = {
  title:
    "BeaVitaTours - Tours and Day Trips to Dolomites & Prosecco",
  description:
    "Experience the best Tours and Day Trips to the Dolomites, Prosecco wine region, and Italian countryside. Direct booking with no intermediaries.",
};

export const metadata: Metadata = landingMetadata;

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
          className={`font-sans antialiased ${playfairDisplay.variable} ${dmSans.variable}`}
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
