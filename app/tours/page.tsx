import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TourCard } from "@/components/tour-card";

const tours = [
  {
    title: "DOLOMITES",
    duration: "9-hour Full Day",
    price: "450 €",
    href: "/tours/dolomites",
    image: "/dolomites-mountains-unesco-world-heritage.jpg",
  },
  {
    title: "PROSECCO",
    duration: "9-hour Full Day",
    price: "450 €",
    href: "/tours/prosecco",
    image: "/prosecco-vineyards-rolling-hills-italy.jpg",
  },
  {
    title: "DOLOMITES HIKING TOUR",
    duration: "11-hour Full Day",
    price: "500 €",
    href: "/tours/hiking",
    image: "/hiking-trail-dolomites-mountains-lake.jpg",
  },
  {
    title: "DOLOMITES AND PROSECCO",
    duration: "11-hour Full Day",
    price: "500 €",
    href: "/tours/dolomites-prosecco",
    image: "/italian-countryside-mountains-and-vineyards.jpg",
  },
  {
    title: "GREAT WINES TOUR",
    duration: "11-hour Full Day",
    price: "500 €",
    href: "/tours/great-wines",
    image: "/wine-tasting-amarone-valpolicella.jpg",
  },
  {
    title: "PRIVATE CUSTOM TOURS",
    duration: "Full Day Tours",
    price: "450 €",
    href: "/tours/custom",
    image: "/italian-hill-towns-scenic-countryside.jpg",
  },
];

export default function ToursPage() {
  return (
    <main>
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/dolomites-mountains-panoramic-view-dramatic-peaks.jpg"
            alt="Dolomites mountains and valleys"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground border-0">
            PRIVATE DAY TRIPS
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Explore Our Tours
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Choose the perfect adventure outside Venice. All tours are private,
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

      <section className="py-16 bg-primary text-primary-foreground">
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
      </section>
    </main>
  );
}
