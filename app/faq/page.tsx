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
    a: "Our private tours depart from Venice Piazzale Roma or from any address in the mainland. Shared tours depart at designated meeting points. Please arrive at the meeting point 10 minutes before the scheduled tour time.",
  },
  {
    q: "How can I get to Venice Piazzale Roma?",
    a: "You can get to Piazzale Roma by water-bus (lines n. 1, 2, 4.1, 4.2, 5.1, 5.2, 5 and 6), by land bus from the any point of the mainland and by People Mover from the Cruise terminal. The main train station of Venice (Santa Lucia) is at only 5 minutes walking distance.",
  },
  {
    q: "How will I recognize my BeaVitaTours guide at the meeting point?",
    a: "Your tour guide is always present at the meeting point 15 minutes prior to the starting time. He/she will wear a green jacket and/or hold a sign, making it easy for you to spot them.",
  },
  {
    q: "Do I need to bring my confirmation e-mail at the meeting point?",
    a: "You are not obliged to show your voucher at the meeting point, however please be able to show your reservation (even digitally) in case of problems.",
  },
  {
    q: "Do you offer hotel pick up service?",
    a: "For private tours we offer pick up service from your hotel. The service is free if your hotel is in the mainland; if your hotel is in Venice island there is a charge for the private water taxi. For shared tours we don't offer hotel pick up service.",
  },
  {
    q: "We are travelling with our children. How does this work?",
    a: "Our private tours are accessible for children. Children who are under 36 kg / 97 pounds or 150 cm / 4ft 9 must use proper child restraints (we can provide baby seats and/or booster seats free of charge, but we need to know a few days in advance). Please specify the age of children when booking. Shared tours have children age restrictions.",
  },
  {
    q: "Are pets allowed on the tours?",
    a: "Generally no as we need to consider that by the Italian law a dog can travel in a vehicle in the passenger compartment only if secured (e.g., with a leash to a seatbelt attachment) or in a suitable container. However, if you are planning to travel with your pet and would still like to book a private tour please contact us first and we will advise if there is any solution available. Pets are not allowed on our shared tours.",
  },
  {
    q: "What is your cancellation policy?",
    a: "BeaVitaTours requires a minimum of 48 hours notice for cancellations, which must be done by email or whatsapp.",
  },
  {
    q: "Are tours accessible for wheelchair users or people with walking disabilities?",
    a: "Tours are not wheelchair accessible. People with some walking disabilities can join the tour if they can board and exit the minibus and walk short distances.",
  },
  {
    q: "What to wear for the Dolomites tour?",
    a: "We recommend to dress up warm as the weather can be very different to Venice.",
  },
  {
    q: "Do you cancel tours due to bad weather?",
    a: "BeaVitaTours tours run everyday, rain or shine. We reserve the right to cancel the Dolomites tour only in the event of severe weather / calamity.",
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
