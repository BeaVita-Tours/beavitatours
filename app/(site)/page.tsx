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
      {/* One-line intro — a slim band bridging the navbar and the hero,
          echoing the muted/hairline layering used in the nav rather than
          floating as bare text on the page background. */}
      <div className="border-b border-border/40 bg-muted/60">
        <p className="mx-auto max-w-xl text-balance px-6 py-3 text-center text-sm font-medium tracking-wide text-muted-foreground md:text-base">
          Boutique day tours from Venice — choose how you travel
        </p>
      </div>

      {/* Hero */}
      <HomeHero />

      {/* Reviews */}
      <ReviewsSection />

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
            Ready to book?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join a small group on a fixed date, or let us plan a private day
            around you.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/tours/group-tours">Book a group tour</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent px-8 text-lg text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/tours/private-tours">Plan a private tour</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
