import Link from "next/link";
import { Trophy, Compass, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function BestSellerPage() {
  return (
    <main>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent uppercase text-accent-foreground border-0">
              Coming soon
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Best Sellers
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The tours our guests book the most, gathered in one place so you
              can book with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 md:p-10 items-center text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Trophy className="size-7" />
              </span>
              <h2 className="text-2xl font-semibold">Still taking shape</h2>
              <p className="text-muted-foreground leading-relaxed">
                This page is under construction. We&apos;re defining the
                criteria we&apos;ll use to choose which tours earn the best
                seller title, so nothing here is set in stone yet. In the
                meantime, explore our full collection or talk to us about your
                trip.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild size="lg">
                  <Link href="/#tours">
                    <Compass className="size-4" />
                    Explore all tours
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">
                    <MessagesSquare className="size-4" />
                    Talk to us
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
