import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/image";
import { formatDate } from "@/lib/sanity/format-date";
import type { PostSummary } from "@/lib/sanity/types";
import { cn } from "@/lib/utils";

function AuthorBadge({ post }: { post: PostSummary }) {
  if (!post.author) return null;

  const imageUrl = post.author.image?.asset?.url;
  const initials = post.author.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="flex items-center gap-2">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={post.author.image?.alt ?? post.author.name}
          width={32}
          height={32}
          className="size-8 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </span>
      )}
      <span className="text-sm font-medium text-foreground">{post.author.name}</span>
    </span>
  );
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {post.mainImage?.asset?.url ? (
          <Image
            src={urlFor(post.mainImage).width(1200).url()}
            alt={post.mainImage.alt ?? post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.categories && post.categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <span
                key={category._id}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {category.title}
              </span>
            ))}
          </div>
        ) : null}

        <h2 className="text-lg font-bold leading-snug text-foreground group-hover:text-primary">
          {post.title}
        </h2>

        {post.excerpt ? (
          <p className={cn("text-sm leading-relaxed text-muted-foreground", "line-clamp-3")}>
            {post.excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <AuthorBadge post={post} />
          <time dateTime={post.publishedAt} className="text-xs text-muted-foreground">
            {formatDate(post.publishedAt)}
          </time>
        </div>
      </div>
    </Link>
  );
}
