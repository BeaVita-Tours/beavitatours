import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { PostSummary } from "@/lib/sanity/types";
import { cn } from "@/lib/utils";

interface PostMediaProps {
  post: PostSummary;
  /** Aspect-ratio utility for the plate, e.g. "aspect-[4/3]". */
  aspectClassName?: string;
  /** `sizes` hint for next/image. */
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * The image plate for a post — a `next/image` that fills its parent's
 * overflow-hidden frame (rounded corners come from the card, not here) with
 * the standard hover zoom. A post without a cover renders a quiet muted panel
 * instead of a broken image.
 */
export function PostMedia({
  post,
  aspectClassName = "aspect-[4/3]",
  sizes,
  priority,
  className,
}: PostMediaProps) {
  const mainImage = post.mainImage;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectClassName,
        className,
      )}
    >
      {mainImage?.asset?.url ? (
        <Image
          src={urlFor(mainImage).width(1200).url()}
          alt={mainImage.alt ?? post.title}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
      ) : null}
    </div>
  );
}
