import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TourCard } from "@/components/tour-card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, DollarSign, MapPin, Star } from "lucide-react";
import tours from "@/lib/tours";

const OTAS: Array<{
  name: string;
  href: string;
  rating: number | string;
  logoSrc: string;
}> = [
  {
    name: "GetYourGuide",
    href: "https://www.getyourguide.com/",
    rating: 5.0,
    logoSrc: "/ota/getyourguide.svg",
  },
  {
    name: "Viator",
    href: "https://www.viator.com/",
    rating: 5.0,
    logoSrc: "/ota/viator.svg",
  },
  {
    name: "Klook",
    href: "https://www.klook.com/",
    rating: "NEW",
    logoSrc: "/ota/klook.svg",
  },
  {
    name: "Civitatis",
    href: "https://www.civitatis.com/",
    rating: "NEW",
    logoSrc: "/ota/civitatis.svg",
  },
  {
    name: "Musement",
    href: "https://www.musement.com/",
    rating: "NEW",
    logoSrc: "/ota/musement.svg",
  },
  {
    name: "Tripadvisor",
    href: "https://www.tripadvisor.com/",
    rating: 4.9,
    logoSrc: "/ota/tripadvisor.svg",
  },
  {
    name: "Booking",
    href: "https://www.booking.com/",
    rating: 4.9,
    logoSrc: "/ota/booking.svg",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
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
            Tours and day trips from Venice
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-balance">
            Discover the beauty around Venice
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto text-pretty">
            Dolomites, Hills of Prosecco, Cities of Art, Wine & Food, and
            more...
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="#tours">Explore Tours</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20"
            >
              <Link href="/tours/shared-tours">Book Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Tours</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
              Choose from our carefully curated selection of tours and day
              trips, each crafted to immerse you in the true essence of the
              Veneto region.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <TourCard key={tour.title} {...tour} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl">
                <Award className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Best Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Premium service and experiences
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl">
                <DollarSign className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Best Value</h3>
                <p className="text-sm text-muted-foreground">
                  Direct booking, no intermediaries
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Expert Guides</h3>
                <p className="text-sm text-muted-foreground">
                  Extensive local knowledge
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl">
                <MapPin className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Customization</h3>
                <p className="text-sm text-muted-foreground">
                  Tailored to your interests
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="book" className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to book?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Start your adventure near Venice today. Contact us to reserve your
            private tour.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="text-lg px-8"
          >
            <Link href="/rates">View Rates & Book</Link>
          </Button>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            What Our Guests Say
          </h2>
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap gap-3 justify-center items-center">
              {OTAS.map((ota) => (
                <div
                  key={ota.name}
                  className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl"
                  aria-label={`${ota.name} reviews`}
                >
                  <Image
                    src={ota.logoSrc}
                    alt={ota.name}
                    width={120}
                    height={24}
                    className="h-6 w-auto"
                  />
                  <span className="text-sm font-medium text-muted-foreground flex flex-row items-center justify-center gap-1">
                    {ota.rating}
                    {typeof ota.rating === "number" && (
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
