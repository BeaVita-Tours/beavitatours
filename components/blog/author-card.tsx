import Image from "next/image";
import { PortableText } from "@portabletext/react";
import type { Author } from "@/lib/sanity/types";

/**
 * The byline card at the end of an article — the same bordered card language
 * as the rest of the site. The bio is Portable Text from Sanity, scoped to the
 * small muted reading style.
 */
export function AuthorCard({ author }: { author?: Author }) {
  if (!author) return null;

  const imageUrl = author.image?.asset?.url;

  return (
    <section className="mt-12 rounded-2xl border border-border bg-card p-6" aria-label={`About ${author.name}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        About the author
      </p>
      <div className="mt-4 flex items-start gap-4">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={author.image?.alt ?? author.name}
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-full object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground">{author.name}</h2>
          {author.bio ? (
            <div className="prose prose-sm mt-2 max-w-none [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_p]:text-muted-foreground">
              <PortableText value={author.bio} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
