"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SharedTourPage() {
  useEffect(() => {
    const src = "https://widgets.regiondo.net/catalog/v1/catalog-widget.min.js";
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement("script");
      s.src = src;
      s.type = "text/javascript";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

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
              alt="Dolomites and Prosecco"
              fill
              className="object-cover object-[50%_70%]"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
          </div>
          <div className="container mx-auto px-4 z-10 text-center flex flex-col items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Shared Tour
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Book immediately one of our shared tour and join a magic
              adventure! Our experiences are top rated on Viator, Get Your
              Guide, Tripadvisor
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
          <div
            id="regiondo-widget"
            className="w-full h-full"
            dangerouslySetInnerHTML={{
              __html:
                '<product-catalog-widget widget-id="7365a711-ca3c-4834-8686-e19642235ae2"></product-catalog-widget>',
            }}
          />
        </section>
      </main>
    </div>
  );
}
