import Link from "next/link";
import type { Category } from "@/lib/sanity/types";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: Category[];
  /** Slug of the currently active category, or undefined for "All". */
  activeCategory?: string;
}

/**
 * Server-rendered category filter chips. Filtering happens server-side via the
 * `category` query param, so these are plain links — no client state needed,
 * they deep-link cleanly, and the page stays a Server Component.
 */
export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  if (categories.length === 0) return null;

  const chipClasses =
    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <nav aria-label="Filter posts by category" className="flex flex-wrap justify-center gap-2">
      <Link
        href="/blog"
        className={cn(
          chipClasses,
          !activeCategory
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-secondary",
        )}
      >
        All
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
                : "bg-muted text-muted-foreground hover:bg-secondary",
            )}
          >
            {category.title}
          </Link>
        );
      })}
    </nav>
  );
}
