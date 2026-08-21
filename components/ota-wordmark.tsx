import {
  OTA_LOGO_SRC,
  OTA_WORDMARK_ASPECT,
  type OTAId,
} from "@/lib/ota-wordmarks";
import { cn } from "@/lib/utils";

// TODO: Find a better way to do this, maybe automatically
function calculateOtaSize(ota: string) {
  if (ota === "getyourguide") {
    return 0.65;
  } else if (ota === "civitatis") {
    return 0.75;
  } else if (ota === "viator") {
    return 0.775;
  } else if (ota === "klook") {
    return 1.15;
  } else if (ota === "tripadvisor") {
    return 0.875;
  }
  return 1;
}

type OTAWordmarkProps = {
  ota: OTAId;
  /**
   * Wordmark height in px — the logo's size. Every mark renders at exactly
   * this height (width follows the logo's own viewBox proportion), so a wide
   * mark like GetYourGuide is the same height as Google, just wider.
   */
  height?: number;
  className?: string;
};

/**
 * Renders an OTA wordmark at a fixed pixel height.
 *
 * Uses a plain <img> (not next/image) deliberately: next/image sizes SVGs via
 * a width/height box + object-contain, which scales each logo differently by
 * its aspect ratio — so wide marks render a different height than narrow ones.
 *
 * A plain <img> with `height` fixed, `width: auto` and an explicit CSS
 * `aspect-ratio` (the logo's viewBox) makes every mark render at exactly the
 * requested height, regardless of what width/height attributes the SVG file
 * happens to bake in (Google's SVG has none, which would otherwise letterbox
 * it down). `object-fit: contain` + `max-width: 100%` only kick in if a logo
 * would overflow its container (it then shrinks rather than distorting).
 *
 * The mark is always vertically centered where it's used — wrap it in an
 * `items-center` flex container (inline-flex for inline use) and it centers
 * against the surrounding text.
 */
export function OTAWordmark({ ota, height = 16, className }: OTAWordmarkProps) {
  return (
    // Plain <img> is intentional — see the note above about SVG sizing.
    <img
      src={OTA_LOGO_SRC[ota]}
      alt=""
      loading="lazy"
      style={{
        // Some marks are rendered at a different size because they're too big.
        height: height * calculateOtaSize(ota),
        width: "auto",
        aspectRatio: String(OTA_WORDMARK_ASPECT[ota]),
        maxWidth: "100%",
        objectFit: "contain",
      }}
      className={cn("shrink-0", className)}
    />
  );
}
