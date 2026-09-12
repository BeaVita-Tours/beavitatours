import type * as React from "react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * The shell for the four editorial theme pages under `/tours/*`.
 *
 * A Server Component throughout. It used to be a client component for the sake
 * of a gallery carousel; the gallery is now a static grid, so the pages ship no
 * JavaScript of their own and can hold the server-rendered booking section.
 */

export type GalleryImage = {
  src: string;
  alt: string;
};

export type TourTemplateProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  /** Hero photograph. Served from /public. */
  image: string;
  imageAlt: string;
  children: React.ReactNode;
};

export function TourTemplate({
  title,
  subtitle,
  badge,
  image,
  imageAlt,
  children,
}: TourTemplateProps) {
  return (
    <main>
      <section className="relative flex h-[420px] items-center justify-center overflow-hidden md:h-[480px]">
        <div className="absolute inset-0 z-0">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_70%]"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          {/* The coral accent gave near-white text 3.16:1. Small uppercase
              text needs 4.5:1, so this badge uses the deeper teal too. */}
          {badge ? (
            <Badge className="mb-4 border-0 bg-primary-strong text-primary-foreground">
              {badge}
            </Badge>
          ) : null}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mx-auto max-w-2xl text-balance text-xl text-white/90">{subtitle}</p>
          ) : null}
        </div>
      </section>

      {children}
    </main>
  );
}

/**
 * The editorial copy, with the page's photographs beside it on wide screens
 * and in a swipeable row beneath the hero on narrow ones. No JavaScript: the
 * row is CSS scroll-snap.
 */
export function TourDescription({
  gallery = [],
  children,
}: {
  gallery?: GalleryImage[];
  children: React.ReactNode;
}) {
  return (
    <section className="bg-background py-14 md:py-16">
      <div className="container mx-auto px-4">
        <TourCopy gallery={gallery}>{children}</TourCopy>
      </div>
    </section>
  );
}

/**
 * The copy-and-gallery layout on its own, for a `TourSection` that wants its
 * photographs beside its prose the way the opening description has them.
 */
export function TourCopy({
  gallery = [],
  children,
}: {
  gallery?: GalleryImage[];
  children: React.ReactNode;
}) {
  const hasGallery = gallery.length > 0;

  return (
    <div
      className={cn(
        "mx-auto max-w-6xl gap-10 lg:gap-14",
        hasGallery && "grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
      )}
    >
      {/* Without photographs the prose keeps a reading measure but stays on
          the section's left edge, in line with the heading above it. */}
      <div
        className={cn(
          "prose prose-lg space-y-4 text-muted-foreground",
          hasGallery ? "max-w-none" : "max-w-3xl"
        )}
      >
        {children}
      </div>

      {hasGallery ? (
        <ul
          aria-label="Photo gallery"
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {gallery.map((img, index) => {
            // The first image (or a lone pair) spans the column; any
            // further ones sit side by side beneath it.
            const wide = index === 0 || gallery.length === 2;
            return (
              <li
                key={img.src}
                className={cn(
                  "relative shrink-0 snap-start overflow-hidden rounded-2xl bg-muted",
                  "w-[78vw] max-w-sm aspect-4/3 lg:w-auto lg:max-w-none",
                  wide ? "lg:col-span-2 lg:aspect-16/10" : "lg:aspect-4/3"
                )}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 480px, 80vw"
                  className="object-cover"
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * A labelled list of places or activities — "Some of the towns we love:" —
 * shown as pills rather than a comma-separated line, so it scans as a menu of
 * options rather than as another paragraph.
 */
export function TourTagList({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <div className="not-prose mt-6">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-strong">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * An editorial sub-section on a theme page: a heading, an optional one-line
 * tagline, the copy, and whatever follows (usually a `ThemeTourGrid`). The
 * Food & Wine page is two of these — the Prosecco hills, then everything
 * else — and Active & Adventure uses one for the list of things you can do.
 *
 * `id` labels the section and is what a grid beneath it should pass as its
 * `headingId`, so the cards are announced under this heading.
 */
export function TourSection({
  id,
  heading,
  tagline,
  tinted = false,
  children,
}: {
  id: string;
  heading: string;
  tagline?: string;
  /** Sit the section on the muted band, to alternate with its neighbours. */
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn("py-14 md:py-16", tinted ? "border-t border-border bg-muted/30" : "bg-background")}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-8 max-w-6xl space-y-3">
          <h2 id={id} className="text-3xl font-bold tracking-tight md:text-4xl">
            {heading}
          </h2>
          {tagline ? (
            <p className="max-w-3xl text-balance text-xl text-muted-foreground">{tagline}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
