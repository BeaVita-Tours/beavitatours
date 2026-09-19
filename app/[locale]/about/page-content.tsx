"use client";

import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="min-h-screen flex items-center bg-background">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row items-stretch gap-8">
          {/* Left panel: stacked title, subtitle, prot.com, PEC and main logo + badges */}
          <div className="md:w-1/2 bg-surface/50 p-6 rounded-xl flex flex-col gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
                {t("title")}
              </h1>
              <h2 className="text-lg md:text-xl mt-2 text-muted-foreground">
                {t("subtitle")}
              </h2>
            </div>

            <div className="text-sm md:text-base leading-relaxed whitespace-pre-line">
              {t("protocol")}
            </div>

            <div className="w-full max-w-sm">
              <img
                src="/logo.webp"
                alt={t("logoAlt")}
                className="w-full h-auto rounded-lg shadow"
              />
            </div>

            <div className="mt-auto flex items-center gap-4">
              <img
                src="/about/poweredbygoogle.png"
                alt={t("poweredByGoogleAlt")}
                className="h-10 object-contain"
              />
              <img
                src="/about/lowcarbontravel.png"
                alt={t("lowCarbonTravelAlt")}
                className="h-10 object-contain"
              />
              <img
                src="/about/landofvenice.jpg"
                alt={t("landOfVeniceAlt")}
                className="h-10 object-contain rounded-md"
              />
            </div>
          </div>

          {/* Right panel: Quality box with slightly larger text */}
          <div className="md:w-1/2 bg-surface/50 p-8 rounded-xl flex items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold">
                {t("qualityTitle")}
              </h3>
              <p className="mt-4 text-base md:text-lg leading-relaxed">
                {t("qualityDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
