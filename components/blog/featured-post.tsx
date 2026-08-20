import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import { formatDate } from "@/lib/sanity/format-date";
import { readingTimeInMinutes } from "@/lib/sanity/reading-time";
import type { PostSummary } from "@/lib/sanity/types";
import { cn } from "@/lib/utils";

/**
 * The featured "latest story" — a large photo card in the site's language:
 * full-bleed image, dark gradient scrim, white title and meta overlaid at the
 * bottom (the same treatment the tour cards use). Without a cover it falls
 * back to a muted panel with the content in foreground colors.
 */
export function FeaturedPost({ post }: { post: PostSummary }) {
  const minutes = readingTimeInMinutes(post.bodyText);
  const mainImage = post.mainImage;
  const imageUrl = mainImage?.asset?.url;
  const category = post.categories?.[0];

  const meta = [
    category?.title,
    formatDate(post.publishedAt),
    minutes > 0 ? `${minutes} min read` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="container mx-auto px-4 pt-10 md:pt-14">
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          "group relative block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          !imageUrl && "border border-border bg-muted/30",
        )}
      >
        <div className={cn("relative aspect-[16/10] md:aspect-[21/9]", !imageUrl && "md:aspect-[16/6]")}>
          {mainImage?.asset?.url ? (
            <>
              <Image
                src={urlFor(mainImage).width(1600).url()}
                alt={mainImage.alt ?? post.title}
                fill
                sizes="(min-width: 768px) 80vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
            </>
          ) : null}

          <div className={cn("absolute inset-x-0 bottom-0 p-6 md:p-10", !imageUrl && "relative p-0")}>
            {category ? (
              <span
                className={cn(
                  "inline-block rounded-full px-3 py-1 text-xs font-medium",
                  imageUrl
                    ? "border border-white/30 bg-white/15 text-white backdrop-blur-sm"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {category.title}
              </span>
            ) : null}

            <h2
              className={cn(
                "mt-3 text-2xl font-bold leading-tight md:text-4xl",
                imageUrl ? "text-white" : "text-foreground",
              )}
            >
              {post.title}
            </h2>

            {post.excerpt ? (
              <p
                className={cn(
                  "mt-3 max-w-2xl line-clamp-2 text-sm leading-relaxed md:text-base",
                  imageUrl ? "text-white/80" : "text-muted-foreground",
                )}
              >
                {post.excerpt}
              </p>
            ) : null}

            <p
              className={cn(
                "mt-4 text-sm",
                imageUrl ? "text-white/70" : "text-muted-foreground",
              )}
            >
              {meta}
            </p>
            <p
              className={cn(
                "mt-3 flex items-center gap-1.5 text-sm font-semibold",
                imageUrl ? "text-white" : "text-primary",
              )}
            >
              Read the story
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </p>
          </div>
        </div>
      </Link>
    </section>
  );
}
