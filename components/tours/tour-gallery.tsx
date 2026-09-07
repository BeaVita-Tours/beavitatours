import Image from "next/image";

import type { TourImage } from "@/lib/regiondo/types";
import { cn } from "@/lib/utils";

interface TourGalleryProps {
  images: readonly TourImage[];
  title: string;
}

/**
 * The hero gallery.
 *
 * Server-rendered and image-only: no carousel, no lightbox, no JavaScript. That
 * is a deliberate trade against the site's existing `TourGallery` (an Embla
 * carousel), because this image is the LCP element on the page that matters
 * most for conversion, and a carousel means hydrating a library before the
 * largest paint can settle.
 *
 * Regiondo's CDN serves nothing larger than 600×400 (`-cropped1200-800` and the
 * bare filename both 404), so the layout is built around that ceiling rather
 * than around a full-bleed hero that would visibly upscale: a constrained mosaic
 * where no single image is asked to fill more than about 640 CSS pixels.
 */
export function TourGallery({ images, title }: TourGalleryProps) {
  if (images.length === 0) {
    return <div className="aspect-16/9 w-full rounded-2xl bg-muted" aria-hidden="true" />;
  }

  const [lead, ...rest] = images;
  const secondary = rest.slice(0, 4);

  return (
    <figure className="space-y-2">
      <div
        className={cn(
          "grid gap-2",
          secondary.length >= 2 ? "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : ""
        )}
      >
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted md:aspect-3/2">
          <Image
            src={lead!.url}
            alt={lead!.alt || title}
            fill
            // The source is 600x400; asking for much more only upscales.
            sizes="(min-width: 1024px) 640px, 100vw"
            quality={80}
            priority
            className="object-cover"
          />
        </div>

        {secondary.length >= 2 ? (
          <div className="hidden grid-rows-2 gap-2 md:grid">
            {secondary.slice(0, 2).map((image) => (
              <div
                key={image.url}
                className="relative overflow-hidden rounded-2xl bg-muted"
              >
                <Image
                  src={image.url}
                  alt={image.alt || title}
                  fill
                  sizes="320px"
                  quality={72}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {secondary.length > 2 ? (
        <div className="hidden grid-cols-4 gap-2 md:grid">
          {secondary.slice(2).map((image) => (
            <div
              key={image.url}
              className="relative aspect-3/2 overflow-hidden rounded-2xl bg-muted"
            >
              <Image
                src={image.thumbnailUrl}
                alt={image.alt || title}
                fill
                sizes="220px"
                quality={72}
                loading="lazy"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      {images.length > 5 ? (
        <figcaption className="text-xs text-muted-foreground">
          {images.length} photos of {title}
        </figcaption>
      ) : null}
    </figure>
  );
}
