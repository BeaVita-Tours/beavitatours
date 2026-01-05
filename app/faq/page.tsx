import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function FAQPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">F.A.Q.</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Frequently Asked Questions about our tours and services
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    Do rates include everything?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  You can check what's included or excluded in the Rates
                  webpage. No extra charges or hidden fees.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    Where do we meet my guide for pick up in Venice?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Our tours depart from Venice Piazzale Roma, the car terminal
                  of Venice. The meeting point is the area in front of the
                  'hotel Olimpia' and 'Trattoria al Vinatier'. Please arrive at
                  the meeting point 15 minutes before the scheduled tour time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    How can I get to Venice Piazzale Roma?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  You can get to Piazzale Roma by water-bus (lines n. 1, 2, 4.1,
                  4.2, 5.1, 5.2, 5 and 6), by land bus from the any point of the
                  mainland and by People Mover from the Cruise terminal. The
                  main train station of Venice (Santa Lucia) is at only 5
                  minutes walking distance.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    How will I recognize my BeaVitaTours guide at the meeting
                    point?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Your tour guide is always present at the meting point 15
                  minutes prior the starting time. He/she will hold a sign,
                  making it easy for you to spot us.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    Do I need to bring my confirmation email to the meeting
                    point?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  You are not obliged to show your confirmation email at the
                  meeting point, we have your name on the list and that is
                  sufficient.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    Do you offer hotel pick up service?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  On request we offer pick up service from your hotel. Price of
                  the service depends on the hotel's location (in the mainland
                  it's free of charge while in Venice island can be rather
                  expensive because we have to arrange a private water taxi).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    We are travelling with our children. How does this work?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Our tours are not accessible for children under the age of 8
                  years. Children who are under 36 kg/ 97 pounds or 150 cm/4ft 9
                  in must use proper child restraints (we provide booster
                  seats).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    What is your cancellation policy?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  BeaVitaTours requires a minimum of 24 hours notice for
                  cancellations, which must be done by email or whatsapp.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    Are tours accessible for wheelchair users or people with
                    walking disabilities?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Tours are not wheelchair accessible. People with some walking
                  disabilities can join the tour if they can board and exit the
                  minibus and walk short distances.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    What to wear for the Dolomites tour?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  We recommend to dress up warm as the weather can be very
                  different to Venice.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    Do you cancel tours due to bad weather?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  BeaVitaTours tours run everyday rain or shine. We reserve the
                  right to cancel the Dolomites tour in the event of severe
                  weather.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                If you can't find the answer you're looking for, please don't
                hesitate to contact us. We're here to help!
              </p>
              <Badge className="bg-primary text-primary-foreground">
                Contact us for more information
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
