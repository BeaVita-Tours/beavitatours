import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, Shield } from "lucide-react"

export default function RatesPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-accent uppercase text-accent-foreground border-0">
              Best price guaranteed
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Rates</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We have the lowest rates available in Venice for tours and day
              trips. Booking directly through the web you don't pay any agency
              or intermediaries fees.
            </p>
          </div>
        </div>
      </section>

      {/* Best Price Guarantee */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Best Price Guaranteed</h2>
            <p className="text-lg text-primary-foreground/90 leading-relaxed">
              If, after you have made a reservation and prior to your arrival,
              you find a lower rate, we will guarantee you that lower rate.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Tours and Day Trips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Full Day */}
              <Card className="relative">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>Full Day</CardTitle>
                  </div>
                  <CardDescription>9-hour private tour</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b border-border pb-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-primary">
                          450 €
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        up to 3 people
                      </p>
                    </div>
                    <div className="border-b border-border pb-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-primary">
                          540 €
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        groups from 4 to 6 people
                      </p>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-primary">
                          630 €
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        groups from 7 to 8 people
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Full Long Day */}
              <Card className="relative border-primary shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary uppercase text-primary-foreground">
                    Popular
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>Full Long Day</CardTitle>
                  </div>
                  <CardDescription>11-hour private tour</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b border-border pb-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-primary">
                          500 €
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        up to 3 people
                      </p>
                    </div>
                    <div className="border-b border-border pb-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-primary">
                          600 €
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        groups from 4 to 6 people
                      </p>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-primary">
                          700 €
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        groups from 7 to 8 people
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2-Day Tours */}
              <Card className="relative">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>2-Day Tours</CardTitle>
                  </div>
                  <CardDescription>Multi-day experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b border-border pb-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-primary">
                          1200 €
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        up to 3 people
                      </p>
                    </div>
                    <div className="border-b border-border pb-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-primary">
                          1400 €
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        groups from 4 to 6 people
                      </p>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-primary">
                          1600 €
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        groups from 7 to 8 people
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button asChild size="lg">
                <Link href="/#book">Book Your Tour Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    What's included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        Professional English speaking driver-guide
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        Travel in a comfortable air conditioned van
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        Professionally planned itinerary
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        Taxes, VAT and highway tolls
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <X className="h-5 w-5 text-muted-foreground" />
                    Excluded
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        Tips and gratuities
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        Entrance fees to museums and attractions
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        Wine tastings, meals and beverages
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        Overnight stay (2-day tours)
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Why Our Rates Are the Best
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p className="leading-relaxed">
                We have removed all the non essential features to keep the price
                low without sacrifying quality. Our rates for tours and day
                trips are very cheap and lower than those offered by most of our
                competitors for regular tours!
              </p>
              <p className="leading-relaxed">
                Booking directly through the web you don't pay any agency or
                intermediaries fees.
              </p>
              <p className="leading-relaxed">
                We don't have luxury limousines because they are really
                unnecessary for a tour. However all our vehicles are able to
                satisfy any requirements, being the latest models, the best in
                technology, comfort and safety.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
