import { cn } from "@/lib/utils";

/**
 * Loading placeholder. Used inside Suspense boundaries so a page's static shell
 * can paint before live availability and pricing arrive — the skeleton reserves
 * the same box the real content will occupy, which is what keeps CLS near zero.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-xl bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
