import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";

/**
 * Custom renderer for the Sanity Portable Text body: headings, quotes, lists,
 * external + internal links, images (via next/image) and code blocks.
 * Rendered inside the `prose prose-blog` wrapper in `post-article`.
 */
const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: SanityImage }) => {
      if (!value?.asset?.url) return null;
      const width = value.asset.metadata?.dimensions?.width ?? 1600;
      const height = value.asset.metadata?.dimensions?.height ?? 900;
      return (
        <figure>
          <Image
            src={urlFor(value).width(1600).url()}
            alt={value.alt ?? ""}
            width={width}
            height={height}
            sizes="(min-width: 768px) 768px, 100vw"
            className="rounded-xl"
          />
          {value.alt ? (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {value.alt}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    code: ({ value }: { value: { code?: string; language?: string; filename?: string } }) => {
      const code = value?.code ?? "";
      const language = value?.language ?? "text";
      const filename = value?.filename;
      return (
        <div className="overflow-hidden rounded-xl border border-border bg-muted/60">
          {filename ? (
            <div className="border-b border-border bg-muted px-4 py-2 font-mono text-xs text-muted-foreground">
              {filename}
            </div>
          ) : null}
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </div>
      );
    },
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href;
      const openInNewTab = Boolean(value?.openInNewTab);
      return (
        <a
          href={href}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
    internalLink: ({ children, value }) => {
      const slug = value?.post?.slug;
      return slug ? <Link href={`/blog/${slug}`}>{children}</Link> : <span>{children}</span>;
    },
  },
  block: {
    // scroll-mt keeps deep-linked headings clear of the sticky site nav.
    h2: ({ children }) => <h2 className="scroll-mt-28">{children}</h2>,
    h3: ({ children }) => <h3 className="scroll-mt-28">{children}</h3>,
    h4: ({ children }) => <h4 className="scroll-mt-28">{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
};

export function PortableTextBody({ value }: { value: unknown[] | undefined }) {
  if (!value || value.length === 0) return null;
  return <PortableText value={value} components={components} />;
}
