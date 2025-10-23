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
            <Badge className="mb-4 bg-accent text-accent-foreground border-0">CONTACT US FOR RATES</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">BOOK YOUR TOUR</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get in touch to discuss your tour preferences and receive personalized pricing information. All tours are private and can be customized to your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Best Price Guarantee */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Quality Service Guaranteed</h2>
            <p className="text-lg text-primary-foreground/90 leading-relaxed">
              Booking directly with us means no agency or intermediary fees. Get the best value for authentic, personalized experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Tour Types */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">PRIVATE TOURS</h2>
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
                  <p className="text-muted-foreground">
                    Perfect for exploring a single destination in depth. Includes professional guide, comfortable transportation, and flexible itinerary.
                  </p>
                </CardContent>
              </Card>

              {/* Full Long Day */}
              <Card className="relative border-primary shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">POPULAR</Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>Full Long Day</CardTitle>
                  </div>
                  <CardDescription>11-hour private tour</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Extended tour for multiple destinations or activities. Ideal for combining mountain scenery with wine tasting experiences.
                  </p>
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
                  <p className="text-muted-foreground">
                    Immersive multi-day adventures allowing you to fully experience the region's highlights at a relaxed pace.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button asChild size="lg">
                <Link href="/#book">Contact Us to Book</Link>
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
                    WHAT'S INCLUDED
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Professional English speaking driver-guide</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Travel in a comfortable air conditioned van</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Professionally planned itinerary</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Taxes, VAT and highway tolls</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <X className="h-5 w-5 text-muted-foreground" />
                    EXCLUDED
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Tips and gratuities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Entrance fees to museums and attractions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Wine tastings, meals and beverages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Overnight stay (2-day tours)</span>
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
            <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Us</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p className="leading-relaxed">
                We focus on essential features to deliver quality tours without unnecessary extras. Our private tours offer personalized experiences tailored to your interests.
              </p>
              <p className="leading-relaxed">
                Booking directly with us means no agency or intermediary fees - you work directly with your guide and driver.
              </p>
              <p className="leading-relaxed">
                We use modern, comfortable vehicles that provide the latest in technology, comfort and safety for your journey through the Veneto region.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
