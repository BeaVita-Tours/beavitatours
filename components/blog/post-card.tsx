import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/image";
import { formatDate } from "@/lib/sanity/format-date";
import { readingTimeInMinutes } from "@/lib/sanity/reading-time";
import type { PostSummary } from "@/lib/sanity/types";
import { BlogBadge } from "./blog-badge";
import { PostMedia } from "./post-media";

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
          width={28}
          height={28}
          className="size-7 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </span>
      )}
      <span className="text-sm font-medium text-foreground">
        {post.author.name}
      </span>
    </span>
  );
}

/**
 * Blog card in the site's card language: rounded bordered card, image plate,
 * category pills, bold title, excerpt, and a hairline byline footer with the
 * date and reading time.
 */
export function PostCard({
  post,
  latest = false,
}: {
  post: PostSummary;
  latest?: boolean;
}) {
  const minutes = readingTimeInMinutes(post.bodyText);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <PostMedia
        post={post}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      />

      <div className="flex flex-1 flex-col gap-3 p-5 hover:bg-muted/30 bg-card transition-colors duration-150">
        {/* This thing seems overcomplicated but basically it creates the badge row
        only if there are categories or if it's the latest post */}
        {(post.categories && post.categories.length > 0) || latest ? (
          <div className="flex flex-wrap gap-2">
            {latest && (
              <BlogBadge variant="accent" className="font-bold">
                New
              </BlogBadge>
            )}
            {post.categories &&
              post.categories.map((category) => (
                <BlogBadge key={category._id} variant="secondary">
                  {category.title}
                </BlogBadge>
              ))}
          </div>
        ) : null}

        <h2 className="text-lg font-bold leading-snug text-foreground transition-colors">
          {post.title}
        </h2>

        {post.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <AuthorBadge post={post} />
          <span className="text-xs text-muted-foreground">
            {formatDate(post.publishedAt)}
            {minutes > 0 ? ` · ${minutes} min read` : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
