"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Shield } from "lucide-react"

export default function RatesPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-accent uppercase text-accent-foreground border-0">
              Best value for money
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Rates</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We strive to offer the best possible rates without ever
              compromising on quality.
            </p>
          </div>
        </div>
      </section>

      {/* Prominent Two-Column Rates Split (primary section) */}
      <section className="py-20 bg-linear-to-r from-accent/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-stretch md:divide-x-2 md:divide-primary/10 bg-card rounded-lg shadow-lg overflow-hidden">
              {/* Left - Shared Tour CTA */}
              <div className="md:w-1/2 px-8 py-12 text-center md:text-left bg-white/0">
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                  See our LOWEST WEB RATES
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  and book immediately a GROUP TOUR HERE
                </p>
                <div className="mt-6">
                  <Button asChild size="lg">
                    <Link href="/tours/group-tours">Book a Group Tour</Link>
                  </Button>
                </div>
              </div>

              {/* Right - Private Tour Rates (emphasized) */}
              <div className="md:w-1/2 px-8 py-12 bg-primary/5">
                <h3 className="text-2xl md:text-3xl font-semibold mb-6">
                  PRIVATE TOUR RATES
                </h3>
                <ul className="space-y-6 mb-6">
                  <li className="flex justify-between items-center">
                    <span className="text-lg md:text-xl">Half Day (~5h)</span>
                    <span className="text-2xl md:text-4xl font-extrabold text-primary">
                      €600
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-lg md:text-xl">Full day (~9h)</span>
                    <span className="text-2xl md:text-4xl font-extrabold text-primary">
                      €900
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-lg md:text-xl">Multi-day</span>
                    <span className="text-lg md:text-2xl font-semibold">
                      Price on Request
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-lg md:text-xl">Tailor-made</span>
                    <span className="text-lg md:text-2xl font-semibold">
                      Price on Request
                    </span>
                  </li>
                </ul>

                <p className="text-sm text-muted-foreground">
                  Notes: private tour rates include the development of the
                  itinerary, the transport with comfort car/van, a
                  highly-skilled and fluent-english tour guide always with you
                  during the journey. Any extra (entrance fees, tastings, ecc.)
                  must be paid by the Customer directly to the provider.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-linear-to-r from-accent/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    What&apos;s included
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

      {/* Best Price Guarantee */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Best Value for Money</h2>
          </div>
        </div>
      </section>
    </main>
  );
}
