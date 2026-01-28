import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FAQPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
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
                    Where do I meet my guide for pick up in Venice?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Our private tours depart from Venice Piazzale Roma or from any
                  address in the mainland. Shared tours depart at designated
                  meeting points. Please arrive at the meeting point 10 minutes
                  before the scheduled tour time.
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
                  Your tour guide is always present at the meeting point 15
                  minutes prior to the starting time. He/she will wear a green
                  jacket and/or hold a sign, making it easy for you to spot
                  them.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    Do I need to bring my confirmation e-mail at the meeting
                    point?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  You are not obliged to show your voucher at the meeting point,
                  however please be able to show your reservation (even
                  digitally) in case of problems.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    Do you offer hotel pick up service?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  For private tours we offer pick up service from your hotel.
                  The service is free if your hotel is in the mainland; if your
                  hotel is in Venice island there is a charge for the private
                  water taxi. For shared tours we don’t offer hotel pick up
                  service.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    We are travelling with our children. How does this work?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Our private tours are accessible for children. Children who
                  are under 36 kg / 97 pounds or 150 cm / 4ft 9 must use proper
                  child restraints (we can provide baby seats and/or booster
                  seats free of charge, but we need to know a few days in
                  advance). Please specify the age of children when booking.
                  Shared tours have children age restrictions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    Are pets allowed on the tours?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Generally no as we need to consider that by the Italian law a
                  dog can travel in a vehicle in the passenger compartment only
                  if secured (e.g., with a leash to a seatbelt attachment) or in
                  a suitable container. However, if you are planning to travel
                  with your pet and would still like to book a private tour
                  please contact us first and we will advise if there is any
                  solution available. Pets are not allowed on our shared tours.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    What is your cancellation policy?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  BeaVitaTours requires a minimum of 48 hours notice for
                  cancellations, which must be done by email or whatsapp.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="border rounded-xl px-6">
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

              <AccordionItem value="item-11" className="border rounded-xl px-6">
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

              <AccordionItem value="item-12" className="border rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">
                    Do you cancel tours due to bad wheather?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  BeaVitaTours tours run everyday, rain or shine. We reserve the
                  right to cancel the Dolomites tour only in the event of severe
                  weather / calamity.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact CTA - brand-colored band matching TourCTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            If you can't find the answer you're looking for, please don't
            hesitate to contact us. We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
