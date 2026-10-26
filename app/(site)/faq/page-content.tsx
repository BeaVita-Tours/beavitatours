"use client";

import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqItems: Array<{ q: string; a: string }> = [
  {
    q: "Do rates include everything?",
    a: "You can check what's included or excluded in the Rates webpage. No extra charges or hidden fees.",
  },
  {
    q: "Where do I meet my guide for pick up in Venice?",
    a: "Our private tours depart from Venice Piazzale Roma or from any address in the mainland. Group tours depart at designated meeting points (generally Piazzale Roma or Tronchetto). Please arrive at the meeting point at least 15 minutes before the scheduled tour time.",
  },
  {
    q: "How can I get to Venice Piazzale Roma?",
    a: "You can get to Piazzale Roma by water-bus (lines n. 1, 2, 4.1, 4.2, 5.1, 5.2, 5 and 6), by land bus from the any point of the mainland and by People Mover from the Cruise terminal. The main train station of Venice (Santa Lucia) is at only 5 minutes walking distance.",
  },
  {
    q: "How can I get to Venice Tronchetto?",
    a: "You can get to Tronchetto by water-bus (lines n. 1 and 2) and by People Mover from Piazzale Roma.",
  },
  {
    q: "How will I recognize my beaVita Tours guide at the meeting point?",
    a: "Your tour guide is always present at the meeting point 30 minutes prior to the starting time. He/she will wear a green jacket and/or cap, holding a sign, making it easy for you to spot them.",
  },
  {
    q: "Do I need to bring my confirmation e-mail at the meeting point?",
    a: "You are not obliged to show your voucher at the meeting point, however please be able to show your reservation (even digitally) in case of problems.",
  },
  {
    q: "If we are late at the meeting point, can you wait for us?",
    a: "In respect of the punctual Guests and of the employees, our vehicles leave sharp, so please arrive on time.",
  },
  {
    q: "Do you offer hotel pick up service?",
    a: "For private tours we offer pick up service from your hotel. The service is free if your hotel is in the mainland; if your hotel is in Venice island there is a charge for the private water taxi. For group tours we don't offer hotel pick up service.",
  },
  {
    q: "We are travelling with our children. How does this work?",
    a: "Our private tours are accessible for children. Children who are under 36 kg / 97 pounds or 150 cm / 4ft 9 must use proper child restraints (we can provide baby seats and/or booster seats free of charge, but we need to know a few days in advance). Please specify the age of children when booking. Group tours have children age restrictions, specified in the voucher.",
  },
  {
    q: "Are pets allowed on the tours?",
    a: "Pets are not allowed on our group tours. However, if you are planning to travel with your pet and would like to book a private tour please contact us first and we will advise if there is any solution available.",
  },
  {
    q: "What is your cancellation policy?",
    a: "beaVita Tours requires a minimum of 24 hours notice for group tours and 48 hours notice for private tours, to be done by either Whatsapp or Email.",
  },
  {
    q: "Are tours accessible for wheelchair users or people with walking disabilities?",
    a: "Tours are not wheelchair accessible. People with some walking disabilities can join the tour if they can board and exit the minibus and walk short distances.",
  },
  {
    q: "What to wear for the Dolomites tour?",
    a: "In winter, autumn and spring we recommend to dress up warm as the weather can be much colder than Venice. Waterproof shoes are recommended, especially in case of snow. In summer, we still recommend carrying a wind/rain jacket. In any case, we recommend comfortable shoes and we advise against wearing flip-flops or heels",
  },
  {
    q: "Do you cancel tours due to bad weather?",
    a: "beaVita tours run everyday, rain or shine. We reserve the right to cancel the Dolomites tour only in the event of severe calamity.",
  },
  {
    q: "Can we carry our luggages?",
    a: "Yes, provided that they are normal size and not oversize",
  },
  {
    q: "Can we join the tour but leave the group at one of the stop?",
    a: "Yes, but do not rely 100% on the itinerary shown in the voucher: our drivers have the faculty of modifying the order of the stops every day, depending on expected reasons (road closure, public events, ecc) or on unexpected events (traffic jam, weather, ecc). But still, you can leave the group at the last stop, then reach your destination autonomously by bus/taxi.",
  },
];

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
              {faqItems.map((item, index) => (
                <AccordionItem key={`item-${index + 1}`} value={`item-${index + 1}`} className="border rounded-xl px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold">
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            If you can&apos;t find the answer you&apos;re looking for, please
            don&apos;t hesitate to contact us. We&apos;re here to help!
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
