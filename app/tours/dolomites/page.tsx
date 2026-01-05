import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TourFeature } from "@/components/tour-feature"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, MapPin, Mountain } from "lucide-react"

export default function DolomitesTourPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/dolomites-mountains-unesco-world-heritage.jpg"
            alt="Dolomites Mountains"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground border-0">
            UNESCO World Heritage Site
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            DOLOMITES TOUR
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Experience the breathtaking beauty of the Queen of the Dolomites
          </p>
        </div>
      </section>

      {/* Tour Details */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center gap-2 p-4 bg-card rounded-xl">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">9 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-card rounded-xl">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Group Size</p>
                  <p className="font-semibold">Private</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-card rounded-xl">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Pick-up</p>
                  <p className="font-semibold">Venice</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-card rounded-xl">
                <Mountain className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Altitude</p>
                  <p className="font-semibold">2,740m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">About This Tour</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p className="leading-relaxed">
                The site of the Dolomites comprises a mountain range in the
                northern Italian Alps, featuring some of the most attractive
                mountain landscapes in the world, with vertical walls, sheer
                cliffs and a high density of narrow, deep and long valleys.
              </p>
              <p className="leading-relaxed">
                In a day trip from Venice you can visit the 'Queen of the
                Dolomites' Cortina d'Ampezzo, one the most popular holiday
                destinations in the world, Lake Misurina, the 'Pearl of the
                Dolomites', from where you can enjoy a splendid view of the Tre
                Cime di Lavaredo, and you can take a ride on the Lagazuoi cable
                car with a breathtaking view in the heart of the Dolomites from
                2.740 m (9,000 ft) above sea level.
              </p>
              <p className="leading-relaxed">
                Pick-up and drop off of our tours are from Venice Piazzale Roma,
                the car terminal. Of course we can pick you up at any local
                hotel in the mainland.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Tour Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TourFeature
                title="UNESCO WORLD NATURAL HERITAGE SITE"
                description="The Dolomites are mountains of exceptional natural beauty. Their dramatic vertical and pale coloured peaks in a variety of distinctive sculptural forms is extraordinary in a global context. The Dolomites also features one of the best examples of the preservation of Mesozoic carbonate platform systems, with fossil records."
                image="/dolomites-unesco-heritage-dramatic-peaks.jpg"
              />
              <TourFeature
                title="CORTINA D'AMPEZZO"
                description="At 1.224m above sea level in the heart of the Dolomites, is located Cortina d'Ampezzo. The natural beauty of 'Queen of the Dolomites' is irresistible both to visitors looking to break the frenzy of today's way of living within the peaceful mountain environment and to those in search of superb sports facilities, both in winter and in summer."
                image="/cortina-dampezzo-town-dolomites-mountains.jpg"
              />
              <TourFeature
                title="LAKE MISURINA"
                description="The Misurina Lake, at 1754 m above sea level is one of the most beautiful lakes in Italy and the largest natural one in the Cadore area. It is embraced by some of the most noble mountain outlines in the Dolomites such as Tre Cime di Lavaredo, Cristallo and Marmarole. When you are here, it's like you're in a fairy tale!"
                image="/lake-misurina-dolomites-reflection-mountains.jpg"
              />
              <TourFeature
                title="LAGAZUOI CABLE CAR"
                description="Starting from Passo Falzarego, the Lagazuoi cable car rides up to 2.740 m (9,000 ft) above sea level, just below the summit of Mt Lagazuoi. Once on top, you will enjoy a breathtaking view in the heart of the Dolomites, an open-air Museum of World War 1, and the Lagazuoi EXPO Dolomiti exhibition."
                image="/lagazuoi-cable-car-mountain-view-dolomites.jpg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Explore the Dolomites?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Book your private Dolomites tour today. Starting from 450€ per
            group.
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
              <Link href="/">Back to All Tours</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
