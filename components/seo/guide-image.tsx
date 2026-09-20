import Image from "next/image";
import type { PublishedArticle } from "@/lib/seo/contract";
import { siteUrl } from "@/lib/seo/config";

export function GuideImage({
  image,
  priority = false,
}: {
  image: NonNullable<PublishedArticle["coverImage"]>;
  priority?: boolean;
}) {
  const url = new URL(image.url);
  const local = url.origin === siteUrl;
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
      <Image
        src={local ? `${url.pathname}${url.search}` : image.url}
        alt={image.alt}
        fill
        sizes={
          priority
            ? "(max-width: 1024px) 100vw, 992px"
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
