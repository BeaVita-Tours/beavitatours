import { Badge } from "@/components/ui/badge";

interface BlogHeaderProps {
  /** Page heading, e.g. "The Bea Vita Blog" or a category title. */
  title: string;
  /** One-line tagline or category description. */
  subtitle?: string;
  /** Badge label above the heading. */
  badge?: string;
}

/**
 * The blog's page header — the same centered muted header used across the
 * site (Badge + bold heading + subtitle on `bg-muted/30`).
 */
export function BlogHeader({ title, subtitle, badge = "Blog" }: BlogHeaderProps) {
  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 border-0 bg-accent uppercase text-accent-foreground">
            {badge}
          </Badge>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{title}</h1>
          {subtitle ? (
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
