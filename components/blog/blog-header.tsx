import type { ReactNode } from "react";

interface BlogHeaderProps {
  /** Page heading, e.g. "The Bea Vita Blog" or a category title. */
  title: ReactNode;
  /** One-line tagline or category description. */
  subtitle?: string;
  /** Short label chips under the subtitle (e.g. "Guides · Tips · Stories"). */
  meta?: string[];
}

/**
 * The blog's page header — the muted band with a centered bold heading and
 * subtitle used across the site. No badge: the heading may carry a teal accent
 * word (the site's way of emphasizing text) and an optional `meta` row of what
 * the blog covers to give the masthead substance.
 */
export function BlogHeader({ title, subtitle, meta }: BlogHeaderProps) {
  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          {subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
          {meta && meta.length > 0 ? (
            <p className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
              {meta.map((item, index) => (
                <span key={item} className="flex items-center gap-2">
                  {index > 0 ? (
                    <span aria-hidden="true" className="text-primary">
                      ·
                    </span>
                  ) : null}
                  {item}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
