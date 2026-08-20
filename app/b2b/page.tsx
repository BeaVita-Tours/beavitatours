import Link from "next/link";
import { BriefcaseBusiness, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function B2BPage() {
  return (
    <main>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent uppercase text-accent-foreground border-0">
              For travel professionals
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              B2B &amp; Travel Trade
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A dedicated space for agencies and resellers is on its way.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 md:p-10 items-center text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BriefcaseBusiness className="size-7" />
              </span>
              <h2 className="text-2xl font-semibold">Under construction</h2>
              <p className="text-muted-foreground leading-relaxed">
                We&apos;re preparing a page where tour operators and travel
                agencies can discover how to work with BeaVitaTours — our
                product catalog, net rates, and booking terms. If you&apos;d
                like to hear from us before it goes live, get in touch.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild size="lg">
                  <Link href="/contact">
                    <Handshake className="size-4" />
                    Get in touch
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
