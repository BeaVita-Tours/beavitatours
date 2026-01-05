import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TourFeature } from "@/components/tour-feature"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, MapPin, Wine } from "lucide-react"

export default function ProseccoTourPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/prosecco-vineyards-rolling-hills-italy.jpg"
            alt="Prosecco Vineyards"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground border-0">
            UNESCO World Heritage Site
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            PROSECCO TOUR
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Explore the rolling hills and finest wineries of the Prosecco region
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
                <Wine className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tastings</p>
                  <p className="font-semibold">3+ Wineries</p>
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
                Just a 45 minute drive from Venice lies the region of Prosecco,
                UNESCO World Heritage Site.
              </p>
              <p className="leading-relaxed">
                On this tour we drive through the Prosecco Road that
                accommodates the finest vines and wineries where the highest
                quality Proseccos are produced. The landscape is without an end,
                villas on hills, hamlets, vineries...
              </p>
              <p className="leading-relaxed">
                In a Prosecco full day tour you can visit at least 3 wineries
                with sightseeing and time for a lunch stop in a family-run
                restaurant with excellent food and wine!
              </p>
              <p className="leading-relaxed">
                Pick-up and drop off of our tours are from Venice Piazzale Roma,
                the car terminal, to avoid any stress and waste of time to
                travel by train or by bus. Of course we can pick you up at any
                local hotel in the mainland.
              </p>
              <p className="leading-relaxed">
                We provide wine shipping service to all the countries with
                proper package to ensure that your shipment doesn't get damaged
                in transit.
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
                title="MOLINETTO DELLA CRODA"
                description="The Molinetto della Croda, an ancient mill, is a typical example of 17th century rural architecture with original foundations which are set into the rocky face of the mountain. Immersed in a charming natural landscape, it is open to the public as a working museum telling the story of the milling and the land."
                image="/ancient-mill-molinetto-della-croda-prosecco.jpg"
              />
              <TourFeature
                title="PROSECCO WINE TASTING"
                description="There are over 100 wineries in the Prosecco DOCG area. For your wine tastings we select the best wineries amongst the most beautiful spots in the prosecco vineyards. You will learn about Prosecco production and will enjoy a guided wine tasting including at least 4 different types of Prosecco."
                image="/prosecco-wine-tasting-glasses-vineyard.jpg"
              />
              <TourFeature
                title="THE PROSECCO ROAD"
                description="The Prosecco Road goes between hills covered with vineyards and decorated by charming towns, abbeys, churches, castles and ancient inns. You will admire some of the loveliest views of the Prosecco Superiore Docg region and landscapes of extraordinary beauty within a vast natural theatre."
                image="/prosecco-road-scenic-drive-vineyards.jpg"
              />
              <TourFeature
                title="SHIPPING WINE"
                description="If you want to sample some great wines while on vacation but you don't have enough space left in your baggage it is our pleasure to ship anywhere in the world the wines purchased. We safely ship wine with a protection and a special shipping box to avoid any damage to the bottles."
                image="/wine-shipping-service-bottles-packaging.jpg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Experience Prosecco Country?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Book your private Prosecco tour today. Starting from 450€ per group.
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
