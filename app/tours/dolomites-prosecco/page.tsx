import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TourFeature } from "@/components/tour-feature"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, MapPin, Mountain } from "lucide-react"

export default function DolomitesProseccoTourPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/italian-countryside-mountains-and-vineyards.jpg"
            alt="Dolomites and Prosecco"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground border-0">
            Two UNESCO Sites in One Day
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            DOLOMITES AND PROSECCO
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Experience both UNESCO World Heritage sites in one unforgettable
            journey
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
                <Mountain className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">UNESCO Sites</p>
                  <p className="font-semibold">2 Sites</p>
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
                The Prosecco hills and the Dolomites mountains are the most
                popular destinations for a day tour in the region of Veneto,
                just outside the crowded Venice.
              </p>
              <p className="leading-relaxed">
                This tour offers the possibility to visit both these Unesco
                world heritage sites on the same day!
              </p>
              <p className="leading-relaxed">
                We drive through the ever-changing scenery of the mountains,
                spending some time in Cortina d'Ampezzo, the 'Queen of the
                Dolomites', and walking around the Lake Misurina, the 'Pearl of
                the Dolomites', from where you can enjoy a splendid view of the
                Tre Cime di Lavaredo, the symbol of the Dolomites.
              </p>
              <p className="leading-relaxed">
                On the way back we drive through the Prosecco Road that
                accommodates the finest vines and wineries where the highest
                quality Proseccos are produced. Finally we end up in a selected
                winery to enjoy some excellent glasses of prosecco wine in a
                guided wine tasting.
              </p>
              <p className="leading-relaxed">
                Then you can relax on your journey back to Venice.
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
                title="THE PROSECCO ROAD"
                description="The Strada del Prosecco goes between hills covered with vineyards and decorated by charming towns, abbeys, churches, castles and ancient inns. You will admire some of the loveliest views of the Prosecco Superiore Docg region and landscapes of extraordinary beauty within a vast natural theatre."
                image="/prosecco-road-scenic-drive-vineyards.jpg"
              />
              <TourFeature
                title="PROSECCO WINE TASTING"
                description="There are over 100 wineries in the Prosecco DOCG area. For your wine tasting we will select one of the best wineries amongst the most beautiful spots in the prosecco vineyards. You wil learn about Prosecco production and will enjoy a guided wine tasting including at least 3 different types of Prosecco."
                image="/prosecco-wine-tasting-glasses-vineyard.jpg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready for the Ultimate Day Trip?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Book your private Dolomites & Prosecco tour today.
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
