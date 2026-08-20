import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Umami } from "@/components/umami";
import { CookieConsentProvider } from "@/components/cookie-consent-provider";
import { TrackingScripts } from "@/components/tracking-scripts";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title:
    "BeaVitaTours - Tours and Day Trips to Dolomites & Prosecco",
  description:
    "Experience the best Tours and Day Trips to the Dolomites, Prosecco wine region, and Italian countryside. Direct booking with no intermediaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <CookieConsentProvider>
        <head>
          <TrackingScripts />
        </head>
        {/* Site chrome (Navigation, Footer, consent banner/dialog) lives in
            app/(site)/layout.tsx so routes like /studio render standalone. */}
        <body className="font-sans antialiased" suppressHydrationWarning>
          <Umami />
          {children}
        </body>
      </CookieConsentProvider>
    </html>
  );
}
