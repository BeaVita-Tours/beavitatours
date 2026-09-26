import Link from "next/link";
import type { Category } from "@/lib/sanity/types";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: Category[];
  /** Slug of the currently active category, or undefined for "All". */
  activeCategory?: string;
}

/**
 * Category filter chips. Filtering happens server-side via the `category`
 * query param, so these are plain links — no client state needed, they
 * deep-link cleanly, and the page stays a Server Component.
 */
export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  if (categories.length === 0) return null;

  const chipClasses =
    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <nav aria-label="Filter posts by category">
      <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
        Browse by category
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/blog"
          aria-current={!activeCategory ? "page" : undefined}
          className={cn(
            chipClasses,
            !activeCategory
              ? "bg-accent text-accent-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent/50",
          )}
        >
          All stories
        </Link>
        {categories.map((category) => {
          const active = category.slug === activeCategory;
          return (
            <Link
              key={category._id}
              href={`/blog?category=${encodeURIComponent(category.slug)}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                chipClasses,
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary/50",
              )}
            >
              {category.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
