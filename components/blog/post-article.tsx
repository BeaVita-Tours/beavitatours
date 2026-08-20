import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import { formatDate } from "@/lib/sanity/format-date";
import type { Post } from "@/lib/sanity/types";
import { PortableTextBody } from "./portable-text";

export function PostArticle({ post }: { post: Post }) {
  return (
    <article className="container mx-auto px-4">
      <div className="mx-auto max-w-3xl">
        {post.categories && post.categories.length > 0 ? (
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {post.categories.map((category) => (
              <Link
                key={category._id}
                href={`/blog/category/${category.slug}`}
                className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {category.title}
              </Link>
            ))}
          </div>
        ) : null}

        <h1 className="text-center text-4xl font-bold leading-tight text-foreground md:text-5xl">
          {post.title}
        </h1>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          {post.author ? (
            <span className="flex items-center gap-2">
              {post.author.image?.asset?.url ? (
                <Image
                  src={post.author.image.asset.url}
                  alt={post.author.image.alt ?? post.author.name}
                  width={32}
                  height={32}
                  className="size-8 rounded-full object-cover"
                />
              ) : null}
              <span className="font-medium text-foreground">{post.author.name}</span>
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </span>
        </div>

        {post.mainImage?.asset?.url ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={urlFor(post.mainImage).width(1600).url()}
              alt={post.mainImage.alt ?? post.title}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="prose prose-blog prose-lg mx-auto mt-10 max-w-none">
          <PortableTextBody value={post.body} />
        </div>
      </div>
    </article>
  );
}
