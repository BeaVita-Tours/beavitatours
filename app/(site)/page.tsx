import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeHero } from "@/components/home-hero";
import { TourCard } from "@/components/tour-card";
import { tours } from "@/lib/tours";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { BlogSection } from "@/components/blog/blog-section";

export default async function HomePage() {
  return (
    <main>
      {/* One-line intro — a slim band in the brand coral bridging the navbar
          and the hero. Coral rather than the muted grey the nav uses: the
          client wanted this line to read as the site's opening statement, not
          as part of the chrome. Semibold, because white on this coral is
          3.16:1 and the extra weight is what keeps it legible. One line on
          desktop (no `text-balance`, which would split it evenly in two);
          it wraps naturally below xl. */}
      <div className="bg-accent text-accent-foreground">
        <p className="px-6 py-3 text-center text-sm font-semibold tracking-wide md:text-base xl:whitespace-nowrap">
          Day tours from Venice to the Dolomites, Prosecco Hills and beyond —
          choose your way to explore, with people who live here.
        </p>
      </div>

      {/* Hero */}
      <HomeHero />

      {/* Reviews */}
      <ReviewsSection />

      {/* Where do you want to go? — the four themes. Sand veil, so the band
          reads as its own chapter between the reviews (teal) and the blog
          (Otti's brown). The travel style (group / private) is the hero's
          question, so it is deliberately not repeated as a tile here. */}
      <section id="tours" className="bg-tint-sand py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
              Not just Venice. The Veneto region we actually know.
            </h2>
            <p className="text-pretty text-muted-foreground">
              From the Dolomites to the Prosecco Hills to the streets of
              Verona, from local flavours to places steeped in history,
              explore the Veneto region through the places and experiences we
              know best.
            </p>
            <p className="mt-3 text-pretty text-muted-foreground">
              <span className="font-semibold text-foreground">
                Choose what you&apos;d like to discover
              </span>
              , and let&apos;s go from there.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tours.map((tour) => (
              <TourCard key={tour.title} {...tour} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section 
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
      */}

      {/* Blog — the 3 latest posts */}
      <BlogSection />

      {/* CTA Section */}
      <section id="book" className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to discover more?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
            Venice is only the beginning. There&apos;s a lot more to see, taste
            and experience beyond the city. Join one of our group tours or let
            us create a private day around what you want to discover.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/tours/group-tours">Explore group tours</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent px-8 text-lg text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/tours/private-tours">Explore private tours</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
