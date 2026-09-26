import Image from "next/image";
import { SITE_URL } from "@/lib/constants";
import type { PublishedArticle } from "@/lib/seo/contract";
import { workspaceSiteUrl } from "@/lib/seo/config";

export function GuideImage({
  image,
  priority = false,
}: {
  image: NonNullable<PublishedArticle["coverImage"]>;
  priority?: boolean;
}) {
  const url = new URL(image.url);
  // Our own photos (/public) go through the image optimizer; anything else is
  // loaded as published.
  const local = url.origin === workspaceSiteUrl || url.origin === SITE_URL;
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
      <Image
        src={local ? `${url.pathname}${url.search}` : image.url}
        alt={image.alt}
        fill
        sizes={
          priority
            ? "(min-width: 768px) 768px, 100vw"
            : "(max-width: 768px) 100vw, 380px"
        }
        className="object-cover"
        priority={priority}
        unoptimized={!local}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
