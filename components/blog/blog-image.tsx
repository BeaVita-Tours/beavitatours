import Image, { type ImageProps } from "next/image";
import { workspaceSiteUrl } from "@/lib/seo/config";

/** Hosted workspace photos are public WebP assets; never server-fetch arbitrary URLs. */
export function BlogImage(props: ImageProps) {
  const url = typeof props.src === "string" ? new URL(props.src, workspaceSiteUrl) : null;
  const local = url?.origin === workspaceSiteUrl;
  return <Image {...props} src={local ? `${url.pathname}${url.search}` : props.src} unoptimized={!local} referrerPolicy="no-referrer" />;
}
