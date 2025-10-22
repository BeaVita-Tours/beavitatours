import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TourFeature } from "@/components/tour-feature"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, MapPin, TrendingUp } from "lucide-react"

export default function HikingTourPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hiking-trail-dolomites-mountains-lake.jpg"
            alt="Dolomites Hiking"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground border-0">UNESCO World Heritage Site</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">DOLOMITES HIKING TOUR</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover the Dolomites on foot with breathtaking trails and stunning vistas
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
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <p className="font-semibold">Easy</p>
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
                The Dolomites is a unique geological region in the Alps and an exciting hiking area.
              </p>
              <p className="leading-relaxed">
                The Dolomite Mountains feature an infinite number of trails winding their way through incredible
                landscapes, with breathtaking vistas adding to the drama. On our hiking itineraries, we take you to the
                famous landmarks framing Cortina d'Ampezzo, UNESCO World Heritage, on foot. Our hikes are quite easy and
                they are really doable for everyone.
              </p>
              <p className="leading-relaxed">
                Find below some examples of our most popular Dolomites hiking tours from Venice. We are available to
                organize any other itinerary of your interest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Hiking Destinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TourFeature
                title="RIFUGIO NUVOLAU"
                description="Built in 1883, the mountain hut Rifugio Nuvolau is the oldest refuge in the Dolomites. An authentic eagle's nest built on the summit of Mount Nuvolau (2575 metres high!), it has been renowned since the dawn of mountaineering for its breathtaking panorama."
                image="/rifugio-nuvolau-mountain-hut-dolomites.jpg"
              />
              <TourFeature
                title="LAKE SORAPIS"
                description="This walk is one of the most beautiful excursions in the Dolomites. In fact the lake is famous for its intense colour, in hues ranging from light blue to turquoise. The colour is created by the fine rock dust brought down from the like-named glacier whose spring and summer meltwater gives rise to the lake."
                image="/lake-sorapis-turquoise-water-dolomites.jpg"
              />
              <TourFeature
                title="TRE CIME DI LAVAREDO"
                description="The Tre Cime di Lavaredo is one of the Dolomite's iconic hikes. Three massive rocky prominences rise up from the rolling scenery of the Dolomites, surrounded by amazing views and wildflowers. While on the hike you'll encounter a series of refuges that you can pop into to grab something to eat or a beer along the hike!"
                image="/tre-cime-di-lavaredo-three-peaks-dolomites.jpg"
              />
              <TourFeature
                title="CORTINA D'AMPEZZO"
                description="All our hiking tours include a visit to Cortina d'Ampezzo, located in the heart of the Dolomites. The natural beauty of 'Queen of the Dolomites' is irresistible both to visitors looking to break the frenzy of today's way of living within the peaceful mountain environment and to those in search of superb sports facilities, both in winter and in summer."
                image="/cortina-dampezzo-town-dolomites-mountains.jpg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for a Hiking Adventure?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Book your private Dolomites hiking tour today. Starting from 500€ per group.
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
  )
}
