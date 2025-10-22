import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TourFeature } from "@/components/tour-feature"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, MapPin, Settings } from "lucide-react"

export default function CustomToursPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/italian-hill-towns-scenic-countryside.jpg"
            alt="Custom Tours"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground border-0">
            Fully Customizable
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            PRIVATE CUSTOM TOURS
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Create your perfect Italian adventure tailored to your interests
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
                  <p className="font-semibold">Flexible</p>
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
                  <p className="font-semibold">Anywhere</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-card rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Itinerary</p>
                  <p className="font-semibold">Custom</p>
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
            <h2 className="text-3xl font-bold mb-6">About Custom Tours</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p className="leading-relaxed">
                Don't waste your time wandering around with other people from
                your group with different interests. Only a private customized
                tour with your personal driver/guide can show you the places
                most interesting to you.
              </p>
              <p className="leading-relaxed">
                If you're looking for personal, custom service that's focused on
                your needs and ensuring a stress free experience planning your
                trip, you've come to the right place. Our goal is to work with
                you to meet your unique traveling needs. Whether you are a solo
                traveler, honeymooners, or a family, we want to work with you to
                create a meaningful worry free experience.
              </p>
              <p className="leading-relaxed">
                Discover the countryside, the wines, the food, the nature, the
                cities of art and much more of the region around Venice. A
                private tour is far more affordable than most people think.
              </p>
              <p className="leading-relaxed">
                Find below some examples of customized day tours from Venice. We
                are available to organize any other itinerary of your interest.
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
              Popular Custom Itineraries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TourFeature
                title="HILL TOWNS"
                description="Full day (9 hours) - Enjoy a relaxing excursion in the beautiful hills of the Veneto near Venice. Tour includes a visit to enchanting Asolo, the pearl of Veneto, Marostica, with its imposing castle and giant chess-board, and picturesque Bassano del Grappa, where you'll have the chance to sample the local firewater, known as 'Grappa'."
                image="/asolo-hill-town-veneto-italy.jpg"
              />
              <TourFeature
                title="LAKE GARDA"
                description="Full day (9 hours) - Lake Garda is the largest lake in Italy. With its picturesque villages is rich with historical monuments, castles and fortresses. During the day we make numerous stop at scenic viewpoints and spend some time in Sirmione, Lazise and the medieval town of Malcesine, where you can take the panoramic cable car."
                image="/lake-garda-scenic-view-italy.jpg"
              />
              <TourFeature
                title="RAVENNA"
                description="Full day (9 hours) - Ravenna is an ancient city with a long history. More than 1,500 years ago, it was the last capital of the Western Roman Empire and it played a strategic role in the Byzantine reconquest by Emperor Justinian. The magnificence of that period has left significant religious buildings decorated with mosaic, recognised as UNESCO World Heritage site."
                image="/ravenna-byzantine-mosaics-basilica.jpg"
              />
              <TourFeature
                title="VENETIAN VILLAS"
                description="Full day (9 hours) - In Veneto there are certainly no villas missing: this type of patrician residence is present in about 5 thousand variants only between Veneto and Friuli-Venezia Giulia. And perhaps the highest examples of this category are the Palladian Villas, which are also a UNESCO World Heritage Site."
                image="/palladian-villa-veneto-architecture.jpg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your Perfect Tour?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Contact us to design your custom private tour. Starting from 450€
            per group.
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
