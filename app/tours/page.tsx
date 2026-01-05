import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TourCard } from "@/components/tour-card";
import tours from "@/lib/tours";

export default function ToursPage() {
  return (
    <main>
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <video
            className="w-full h-full object-cover opacity-50"
            src="/bg.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-linear-to-brom-black/50 via-black/30 to-black/60" />
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <Badge className="mb-4 bg-accent uppercase text-accent-foreground border-0 text-sm px-4 py-1">
            Private day trips
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-balance">
            Explore Our Tours
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto text-pretty">
            Choose the perfect adventure near Venice. All tours are private,
            customizable, and led by expert local guides.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Private Experiences
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From UNESCO mountain landscapes to the Prosecco hills and bespoke
              itineraries, discover the best ways to experience the Veneto
              region.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <TourCard key={tour.href} {...tour} />
            ))}
          </div>
        </div>
      </section>

      {/* <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-lg md:text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Get in touch to tailor a perfect day trip or head to our rates page
            to book right away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/rates">View Rates & Book</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              <Link href="/tours/custom">Talk About Custom Tours</Link>
            </Button>
          </div>
        </div>
      </section> */}
    </main>
  );
}
