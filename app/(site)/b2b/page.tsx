import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Handshake,
  Mail,
  Map,
  UserRoundCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * B2B / work with us.
 *
 * Modelled on the "lavora con noi" pattern: one short pitch, then a card per
 * partner type — who it is for and what we offer them — each ending in the
 * same email. Deliberately sparse (client request): the point is that the
 * page exists, says who we work with, and gives a direct address. Terms, net
 * rates and the catalog are sent by email, not published.
 */

const B2B_EMAIL = "info@beavitatours.com";

export const metadata: Metadata = {
  title: "Work with us — travel trade, hotels & guides | Bea Vita Tours",
  description:
    "Bea Vita Tours works with travel agencies, tour operators, hotels and independent guides on day trips from Venice to the Dolomites and the Prosecco hills. Net rates and terms on request.",
};

interface PartnerType {
  icon: typeof Building2;
  title: string;
  question: string;
  body: string;
  /** Pre-filled email subject so replies land in the right thread. */
  subject: string;
}

const partnerTypes: readonly PartnerType[] = [
  {
    icon: Map,
    title: "Travel agencies & tour operators",
    question: "Do you sell Italy?",
    body: "Add our small-group and private day trips from Venice to your programme. Net rates, allotments on shared departures, and a single contact for changes and special requests.",
    subject: "Travel trade partnership",
  },
  {
    icon: Building2,
    title: "Hotels & holiday resorts",
    question: "Do your guests ask about the Dolomites?",
    body: "Offer our tours at reception or in your app, with pickup arranged around your property. Commission on every booking, printed material for the desk, and a direct line for your concierge.",
    subject: "Hotel partnership",
  },
  {
    icon: UserRoundCheck,
    title: "Guides & driver-guides",
    question: "Do you know the Veneto well and speak good English?",
    body: "We work with licensed guides and driver-guides on a freelance basis, from Venice, Treviso and the Prosecco area. Send a short introduction and your licences.",
    subject: "Guide application",
  },
];

function mailto(subject: string): string {
  return `mailto:${B2B_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export default function B2BPage() {
  return (
    <main>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent uppercase text-accent-foreground border-0">
              For travel professionals
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Work with us</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Bea Vita Tours is a licensed tour operator in Treviso running day trips from
              Venice to the Dolomites and the Prosecco hills. We partner with agencies,
              hotels and guides — here is how.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href={mailto("Partnership enquiry")}>
                  <Mail className="size-4" aria-hidden="true" />
                  {B2B_EMAIL}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">
                  <Handshake className="size-4" aria-hidden="true" />
                  Use the contact form
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {partnerTypes.map((partner) => (
              <Card key={partner.title} className="gap-4 p-7">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <partner.icon className="size-6" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-strong">
                    {partner.question}
                  </p>
                  <h2 className="text-xl font-semibold">{partner.title}</h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{partner.body}</p>
                <a
                  href={mailto(partner.subject)}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary-strong underline-offset-4 hover:underline"
                >
                  Write to us
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Card>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-muted/30 p-6 text-sm leading-relaxed text-muted-foreground">
            <p className="flex items-start gap-3">
              <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <strong className="text-foreground">Bea Vita Tours</strong> — Tour Operator,
                Auth. 6297 prov. TV, VAT IT05602720269. Product catalog, net rates and booking
                terms are sent on request to{" "}
                <a href={mailto("Catalog and net rates")} className="font-medium text-foreground underline-offset-4 hover:underline">
                  {B2B_EMAIL}
                </a>
                .
              </span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
