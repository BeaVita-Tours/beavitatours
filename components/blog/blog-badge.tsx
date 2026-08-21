import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BlogBadgeVariant = "primary" | "secondary" | "accent";

const variantClasses: Record<BlogBadgeVariant, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
};

interface BlogBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Which brand token the chip uses. Defaults to the neutral `secondary`. */
  variant?: BlogBadgeVariant;
}

/**
 * The blog's little status/category chip — the rounded-full colored pill used
 * for the "New" flag and post categories. Variants map to the site's brand
 * tokens; size, weight and effects can be overridden via `className` (e.g.
 * `font-bold` for "New", `group-hover:bg-primary` for a link pill).
 */
export function BlogBadge({ variant = "secondary", className, ...props }: BlogBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
