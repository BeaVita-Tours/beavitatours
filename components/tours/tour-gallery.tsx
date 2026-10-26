"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { type TouchEvent, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import type { TourImage } from "@/lib/regiondo/types";
import { cn } from "@/lib/utils";

interface TourGalleryProps {
  images: readonly TourImage[];
  title: string;
}

/**
 * The tour page's photographs: a viewer with arrows and a strip of every
 * thumbnail beneath it, and a full-screen lightbox behind the expand button.
 *
 * It used to be a static mosaic — a lead image and four fixed thumbnails, the
 * rest of the gallery unreachable. The client asked to be able to see all of
 * them, larger (revision of 2026-09-29).
 *
 * The first photo is still the page's LCP image: it renders on the server
 * with `priority`, and the script only adds the paging. Regiondo's CDN
 * serves nothing larger than 600×400 (`-cropped1200-800` and the bare
 * filename both 404 — see docs/regiondo-build-log.md), so the lightbox caps
 * the photo at about 1.5× that rather than stretching it across a monitor.
 */
export function TourGallery({ images, title }: TourGalleryProps) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const swipe = useSwipe(go);

  if (count === 0) {
    return <div className="aspect-4/3 w-full rounded-2xl bg-muted" aria-hidden="true" />;
  }

  const current = images[index]!;

  return (
    // min-w-0: as a grid item the figure would otherwise grow to the
    // thumbnail strip's full width and push the page sideways on a phone.
    <figure className="min-w-0 space-y-2">
      <div
        className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-muted"
        {...swipe}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open the photos of ${title} full screen`}
          className="absolute inset-0 cursor-zoom-in"
        >
          <Image
            key={current.url}
            src={current.url}
            alt={current.alt || title}
            fill
            // The source is 600x400; asking for much more only upscales.
            sizes="(min-width: 1024px) 640px, 100vw"
            quality={80}
            priority={index === 0}
            className="object-cover"
          />
        </button>

        <span className="pointer-events-none absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
          <Expand className="size-4" aria-hidden="true" />
        </span>

        {count > 1 ? (
          <>
            <ArrowButton direction="previous" onClick={() => go(-1)} />
            <ArrowButton direction="next" onClick={() => go(1)} />
            <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
              {index + 1} / {count}
            </span>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <ul aria-label={`Photos of ${title}`} className="-mx-1 flex gap-2 overflow-x-auto px-1 pt-1 pb-1">
          {images.map((image, i) => (
            <li key={image.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block aspect-3/2 w-20 overflow-hidden rounded-lg bg-muted transition sm:w-24",
                  i === index
                    ? "ring-2 ring-primary-strong ring-offset-2 ring-offset-background"
                    : "opacity-75 hover:opacity-100"
                )}
              >
                <Image
                  src={image.thumbnailUrl}
                  alt=""
                  fill
                  sizes="96px"
                  quality={70}
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Lightbox
        open={open}
        onOpenChange={setOpen}
        images={images}
        index={index}
        go={go}
        title={title}
      />
    </figure>
  );
}

function Lightbox({
  open,
  onOpenChange,
  images,
  index,
  go,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: readonly TourImage[];
  index: number;
  go: (step: number) => void;
  title: string;
}) {
  const count = images.length;
  const current = images[index]!;
  const swipe = useSwipe(go);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") go(-1);
            if (event.key === "ArrowRight") go(1);
          }}
          // The content fills the screen, so a click on the dark area around
          // the photo lands here rather than on the overlay: close on it.
          onClick={(event) => {
            if (event.target === event.currentTarget) onOpenChange(false);
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 outline-none sm:p-10"
        >
          <DialogTitle className="sr-only">Photos of {title}</DialogTitle>

          <div className="relative aspect-3/2 w-full max-w-[900px]" {...swipe}>
            <Image
              key={current.url}
              src={current.url}
              alt={current.alt || title}
              fill
              sizes="(min-width: 960px) 900px, 100vw"
              quality={85}
              className="rounded-xl object-contain"
            />
            {count > 1 ? (
              <>
                <ArrowButton direction="previous" onClick={() => go(-1)} large />
                <ArrowButton direction="next" onClick={() => go(1)} large />
              </>
            ) : null}
          </div>

          <p className="text-sm text-white/80 tabular-nums" aria-live="polite">
            {index + 1} / {count}
          </p>

          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white">
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function ArrowButton({
  direction,
  onClick,
  large = false,
}: {
  direction: "previous" | "next";
  onClick: () => void;
  large?: boolean;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "previous" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground shadow-md transition hover:bg-white focus-visible:outline-2 focus-visible:outline-primary-strong",
        large ? "size-11" : "size-9",
        // In the lightbox the arrows move out beside the photo once there is room.
        direction === "previous"
          ? cn("left-3", large && "xl:-left-16")
          : cn("right-3", large && "xl:-right-16")
      )}
    >
      <Icon className={large ? "size-6" : "size-5"} aria-hidden="true" />
    </button>
  );
}

/** Horizontal swipe → previous / next, for touch screens. */
function useSwipe(go: (step: number) => void) {
  const start = useRef<number | null>(null);
  return {
    onTouchStart: (event: TouchEvent) => {
      start.current = event.touches[0]?.clientX ?? null;
    },
    onTouchEnd: (event: TouchEvent) => {
      if (start.current === null) return;
      const delta = (event.changedTouches[0]?.clientX ?? start.current) - start.current;
      start.current = null;
      if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
    },
  };
}
