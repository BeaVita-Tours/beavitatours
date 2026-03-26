import type React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { locales } from "@/i18n";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { MetaPixel } from "@/components/meta-pixel";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/google-tag-manager";

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

  return (
    <html lang={locale}>
      <body className={`font-sans antialiased`}>
        <GoogleTagManagerNoscript />
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          {children}
          <Footer />
        </NextIntlClientProvider>
        <Analytics />
        <MetaPixel />
        <GoogleTagManager />
      </body>
    </html>
  );
}
