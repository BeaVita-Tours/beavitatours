"use client";

/**
 * @deprecated The Regiondo catalog widget page.
 *
 * Rendered only while `REGIONDO_NATIVE_BOOKING` is off. `page.tsx` in this
 * directory picks between this and the native collection page, so the site
 * behaves exactly as it did before the flag existed.
 *
 * Safe to delete, together with `components/group-tours-regiondo-widget.tsx`,
 * once the native flow has been live and verified. See the migration table in
 * docs/regiondo-integration.md.
 */

import React from "react";
import Image from "next/image";
import { SharedToursRegiondoWidget } from "@/components/group-tours-regiondo-widget";

export function LegacyGroupToursWidgetPage() {
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
              alt="Group Tour"
              fill
              className="object-cover object-[50%_70%]"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
          </div>
          <div className="container mx-auto px-4 z-10 text-center flex flex-col items-center gap-4">
            {/* beaVita only — no partner logos here (client revision). */}
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Group Tours
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Beyond Venice, with good company. Come along for the ride.
            </p>
          </div>
        </section>
        <section className="min-h-[60vh]">
          <SharedToursRegiondoWidget />
        </section>
      </main>
    </div>
  );
}
