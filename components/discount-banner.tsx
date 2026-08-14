"use client";

import { useTranslations } from "next-intl";

/**
 * Scrolling promotional banner shown at the top of the homepage.
 * Pure CSS marquee (see `--animate-promo-marquee` in globals.css) — no
 * animation library needed. The animation is disabled when the user prefers
 * reduced motion, in which case the first message stays readable.
 */
export function DiscountBanner() {
  const t = useTranslations("directBookingPromo.banner");
  const rawSegments = t.raw("segments") as unknown;
  const segments = Array.isArray(rawSegments)
    ? (rawSegments as string[]).filter((segment) => typeof segment === "string")
    : [];

  if (segments.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={t("label")}
      className="relative z-40 overflow-hidden bg-accent text-accent-foreground"
    >
      <div className="flex w-max motion-safe:animate-promo-marquee hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            className="flex shrink-0 items-center whitespace-nowrap py-1.5 text-xs font-semibold tracking-wide sm:text-sm"
          >
            {segments.map((segment) => (
              <span key={segment} className="flex items-center">
                <span className="px-4">{segment}</span>
                <span aria-hidden="true" className="text-accent-foreground/70">
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
