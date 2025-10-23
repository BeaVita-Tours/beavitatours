import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TourFeature } from "@/components/tour-feature"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, MapPin, Wine } from "lucide-react"

export default function GreatWinesTourPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/wine-tasting-amarone-valpolicella.jpg"
            alt="Great Wines Tour"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground border-0">
            Amarone & Prosecco
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            GREAT WINES TOUR
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover Veneto's finest wines: Amarone and Prosecco in one
            unforgettable day
          </p>
        </div>
      </section>

      {/* Tour Details */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center gap-2 p-4 bg-card rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">11 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-card rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Group Size</p>
                  <p className="font-semibold">Private</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-card rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Pick-up</p>
                  <p className="font-semibold">Venice</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-card rounded-lg">
                <Wine className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Regions</p>
                  <p className="font-semibold">2 Wine Areas</p>
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
                Veneto is italian biggest wine region in terms of quantity. Here
                wine is part of the popular culture and a glass of red or a
                glass of white will always be on the dining table.
              </p>
              <p className="leading-relaxed">
                There are no doubts about the most famous wines from Veneto:
                Prosecco and Amarone. Prosecco is one of the most popular wines
                in the world thanks to its breeziness and favourable price,
                while Amarone, produced in the surroundings of Verona, is an
                Italian excellence.
              </p>
              <p className="leading-relaxed">
                We drive through the Valpolicella valley and admire the scenic
                country roads with beautiful landscapes. Then we visit a winery,
                meet the winemaker and taste the Amarone, one of the most famous
                and best Italian wines recognized internationally for its
                elegance, complexity and great aging potential.
              </p>
              <p className="leading-relaxed">
                In the afternoon we drive through the Prosecco Road that
                accommodates the finest vines and wineries where the highest
                quality Proseccos are produced. Finally we end up in a selected
                winery to enjoy some excellent glasses of prosecco wine in a
                guided wine tasting.
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
                title="AMARONE WINE TASTING"
                description="Valpolicella is one of Italy's most prestigious wine regions. No Italian wine is more distinctive than Amarone della Valpolicella, and few are as precious. That is due to the time, the labor and the materials required to craft every bottle. We personally select the wineries on our tours so we can guarantee about the quality."
                image="/amarone-wine-tasting-valpolicella-cellar.jpg"
              />
              <TourFeature
                title="PROSECCO WINE TASTING"
                description="There are over 100 wineries in the Prosecco DOCG area. For your wine tasting we will select one of the best wineries amongst the most beautiful spots in the prosecco vineyards. You wil learn about Prosecco production and will enjoy a guided wine tasting including at least 3 different types of Prosecco."
                image="/prosecco-wine-tasting-glasses-vineyard.jpg"
              />
              <TourFeature
                title="THE PROSECCO ROAD"
                description="The Strada del Prosecco goes between hills covered with vineyards and decorated by charming towns, abbeys, churches, castles and ancient inns. You will admire some of the loveliest views of the Prosecco Superiore Docg region and landscapes of extraordinary beauty within a vast natural theatre."
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
            Ready to Taste Italy's Best Wines?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Book your private Great Wines tour today.
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
