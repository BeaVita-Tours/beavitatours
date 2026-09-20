"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SharedToursRegiondoWidget } from "@/components/shared-tours-regiondo-widget";

export default function SharedTourPage() {
  const t = useTranslations("tours.data.sharedTours");

  return (
    <div
      style={{
        ["--primary" as any]: "var(--secondary)",
        ["--primary-foreground" as any]: "var(--secondary-foreground)",
        ["--secondary" as any]: "var(--primary)",
        ["--secondary-foreground" as any]: "var(--primary-foreground)",
      }}
    >
      <main>
        <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/tourwines.jpg"
              alt={t("title")}
              fill
              className="object-cover object-[50%_70%]"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
          </div>
          <div className="container mx-auto px-4 z-10 text-center flex flex-col items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {t("title")}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              {t("description")}
            </p>
            <div className="flex flex-row items-center gap-2 mt-4">
              <div className="relative h-16 w-40">
                <Image
                  src="/bdlogo.jpg"
                  alt="BD Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-16 w-20">
                <Link href="https://www.kayak.co.uk/Cortina-d-Ampezzo.22382.guide">
                  <Image
                    src="/kayak.png"
                    alt="Kayak"
                    fill
                    className="object-contain"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="min-h-[60vh]">
          <SharedToursRegiondoWidget />
        </section>
      </main>
    </div>
  );
}
