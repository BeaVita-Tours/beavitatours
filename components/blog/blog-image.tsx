import Image, { type ImageProps } from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";
import { workspaceSiteUrl } from "@/lib/seo/config";

/** Approved SEO images use their public URL; Sanity images retain CDN sizing. */
export function BlogImage({
  image,
  imageWidth = 1600,
  ...props
}: Omit<ImageProps, "src"> & { image: SanityImage; imageWidth?: number }) {
  if (!image.asset?.url) return null;
  const url = new URL(image.asset.url);
  const sanity = url.hostname === "cdn.sanity.io";
  const local = url.origin === workspaceSiteUrl;
  const src = sanity
    ? urlFor(image).width(imageWidth).url()
    : local
      ? `${url.pathname}${url.search}`
      : url.href;
  return (
    <Image
      {...props}
      src={src}
      unoptimized={!sanity && !local}
      referrerPolicy="no-referrer"
    />
  );
}
