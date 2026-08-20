import Link from "next/link";
import { Newspaper, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function BlogPage() {
  return (
    <main>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent uppercase text-accent-foreground border-0">
              Coming soon
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              The Bea Vita Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Stories from the road between Venice and the Dolomites.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 md:p-10 items-center text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Newspaper className="size-7" />
              </span>
              <h2 className="text-2xl font-semibold">On the way</h2>
              <p className="text-muted-foreground leading-relaxed">
                Local tips, hidden corners, and behind-the-scenes from our
                guides are coming soon. Check back shortly — or explore the
                tours that will get you out there in the meantime.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild size="lg">
                  <Link href="/#tours">
                    <Compass className="size-4" />
                    Explore tours
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
