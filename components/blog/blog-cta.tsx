import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BlogCtaProps {
  /** Tour page the CTA points to. */
  href?: string;
  label?: string;
}

/**
 * The closing call-to-action in the site's voice and card language — a quiet
 * nudge from reading toward booking a real day out.
 */
export function BlogCta({
  href = "/tours/group-tours",
  label = "Explore day trips",
}: BlogCtaProps) {
  return (
    <section className="container mx-auto px-4 pb-16 pt-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-muted/30 p-8 text-center md:p-12">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Ready to see it in person?
        </h2>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">
          Direct booking with no intermediaries — small-group day trips from
          Venice into the Dolomites, the Prosecco hills and beyond.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href={href}>{label}</Link>
        </Button>
      </div>
    </section>
  );
}
