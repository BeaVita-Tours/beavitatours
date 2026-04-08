import type React from "react";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "@/i18n";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Umami } from "@/components/umami";
import { CookieConsentProvider } from "@/components/cookie-consent-provider";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { CookieSettingsDialog } from "@/components/cookie-settings-dialog";
import { TrackingScripts } from "@/components/tracking-scripts";
import { CONSENT_COOKIE_NAME, parseConsentRecord } from "@/lib/cookie-consent";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const cookieStore = await cookies();
  const initialConsent = parseConsentRecord(
    cookieStore.get(CONSENT_COOKIE_NAME)?.value,
  );

  return (
    <html lang={locale}>
      <CookieConsentProvider initialConsent={initialConsent}>
        <TrackingScripts />
        <body className={`font-sans antialiased`}>
          <Umami />
          <NextIntlClientProvider messages={messages}>
            <Navigation />
            {children}
            <Footer />
            <CookieConsentBanner />
            <CookieSettingsDialog />
          </NextIntlClientProvider>
        </body>
      </CookieConsentProvider>
    </html>
  );
}
