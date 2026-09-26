import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/constants";

/**
 * About.
 *
 * Structure and copy from the client's brief ("Pagina about: struttura e
 * bozza copy", September 2026, revised 23 September): hero, the story, five
 * reasons, the numbers, the credentials as verifiable text rather than
 * badges, and a call to action into the tours. The legal block keeps the registered name in
 * capitals, as the footer does (lib/brand.ts).
 *
 * Mostly prose, deliberately: the reasons are a ruled list and the figures
 * sit bare on a wash, because a page about people should not read as a grid
 * of product cards (the first cut did, and was sent back).
 *
 * A Server Component: it is copy, two photographs and a few links.
 */

const metadata: Metadata = {
  title: "About beaVita Tours — a local tour operator in the Veneto",
  description:
    "We don't just show you around, we live here. beaVita is a registered tour operator from the Treviso province, running day trips from Venice to the Dolomites, the Prosecco Hills and the towns in between.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About beaVita Tours — a local tour operator in the Veneto",
    description:
      "We don't just show you around, we live here. Day trips from Venice with people who call the Veneto home.",
    url: `${SITE_URL}/about`,
    siteName: "beaVita Tours",
  },
};

// SEO Workspace's approved title, description and robots apply over these.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/about", metadata);
}

interface Reason {
  title: string;
  body: string;
}

const reasons: readonly Reason[] = [
  {
    title: "Because we live here.",
    body: "Knowing a destination isn't just knowing its most famous attractions. It means knowing the roads, the people, the food, the views and the places worth stopping for.",
  },
  {
    title: "Because we care about authenticity.",
    body: "We choose experiences and local partners for their quality and genuine connection to the territory, keeping business local rather than chasing the cheapest supplier. We want you to experience the Veneto region, because we don't do bus-window tourism.",
  },
  {
    title: "Because people make the difference.",
    body: "Our drivers and tour leaders are not simply there to provide information. They live in this region and share it with the naturalness of someone welcoming a friend.",
  },
  {
    title: "Because safety comes first.",
    body: "Our vehicles are selected and maintained to meet stringent safety requirements, with particular attention to mountain and highway routes.",
  },
  {
    title: "Because every detail matters.",
    body: "We carefully test our experiences, from the people we work with to the rhythm of the day and the practical details that can make a tour truly enjoyable.",
  },
];

interface Figure {
  value: string;
  label: string;
}

const figures: readonly Figure[] = [
  { value: "20", label: "people on the team, all of them local" },
  { value: "500+", label: "groups our founder guided" },
  { value: "20,000+", label: "travelers welcomed on tour since 2018" },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero — the same photo-and-overlay opening the theme pages use. */}
      <section className="relative flex min-h-[440px] items-center justify-center overflow-hidden md:min-h-[520px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/prosecco 3.jpg"
            alt="Asolo from above, roofs and cypresses on the edge of the Prosecco hills"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-16 text-center">
          <h1 className="mx-auto mb-5 max-w-3xl text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
            We don&apos;t just show you around. We live here.
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-xl text-white/90">
            We know the roads, the people and the places worth stopping for — because this is
            home.
          </p>
        </div>
      </section>

      <section className="bg-background py-14 md:py-16">
        <div className="container mx-auto px-4">
          {/* Left-aligned on the same 6xl column as every section below, with
              a reading measure — not a centred column of its own. */}
          <div className="mx-auto max-w-6xl">
            <div className="prose prose-lg max-w-3xl space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              The Veneto region is much more than Venice. It is the Prosecco Hills, the Dolomites,
              quiet villages, local food and wine, hidden corners of the lagoon and countless
              stories worth stopping for.
            </p>
            <p className="font-bold leading-relaxed text-foreground">
              Venice is our gateway. Veneto is our territory.
            </p>
            <p className="leading-relaxed">
              At beaVita, we believe the best way to experience this region is with people who
              actually live here.
            </p>
            <p className="leading-relaxed">
              We are a DMC &amp; tour operator creating experiences for travelers who want to go
              beyond the usual tourist routes and discover a more authentic side of Veneto.
            </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our story — the copy, with the photograph and the fun fact beside it
          on wide screens (the brief asks for the fun fact as a side box). */}
      <section aria-labelledby="our-story" className="bg-tint-sand py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-14">
            <div>
              <h2 id="our-story" className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                Our story
              </h2>
              <p className="mb-6 text-xl text-muted-foreground">It all started with a tour in Miami.</p>
              <div className="prose prose-lg max-w-none space-y-4 text-muted-foreground">
                <p className="leading-relaxed">
                  In 2016, our founder was working as VP of logistics for an automotive company;
                  until a half-day off during a work trip to Miami changed everything. A local
                  driver took him through the Everglades, sharing his home with a kind of passion
                  that stuck. It took a few more years, and a personal crossroads, before he finally made the
                  leap: from watching someone else share their home, to sharing his own.
                </p>
                <p className="leading-relaxed">He wasn&apos;t the only one ready to make that leap.</p>
                <p className="leading-relaxed">
                  beaVita began in 2018, when our founder and his first collaborators — people who
                  had taken very different paths of their own — found they shared the same idea:
                  that real wealth isn&apos;t what you own, it&apos;s the freedom to choose how
                  you spend your time. We built a company around that belief, starting as a local
                  transport service and growing into a tour operator, convinced that our greatest
                  asset was the territory we call home and that the best way to share it was our
                  own way, not a rehearsed one.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-muted lg:aspect-auto lg:min-h-80 lg:flex-1">
                <Image
                  src="/foto paesaggio edited.png"
                  alt="The Prosecco hills seen from a wooden terrace, a village among the vineyards"
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover"
                />
              </div>
              {/* Pink, like the fun fact on the Food & Wine page. */}
              <aside className="rounded-2xl bg-accent/10 px-5 py-4 text-base text-foreground">
                <span className="font-semibold">Fun fact:</span> in our local dialect, &ldquo;fare
                bea vita&rdquo; usually describes someone who barely works. We decided to flip it:
                for us, &ldquo;bea vita&rdquo; means being rich in time, not things.
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* The reasons, as a ruled list: title on the left, the why on the
          right. The list is the structure; nothing is boxed. */}
      <section aria-labelledby="why-beavita" className="bg-background py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 id="why-beavita" className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">
              Why travel with beaVita?
            </h2>
            <dl className="divide-y divide-border border-y border-border">
              {reasons.map(({ title, body }) => (
                <div
                  key={title}
                  className="grid gap-2 py-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10"
                >
                  <dt className="text-xl font-bold">{title}</dt>
                  <dd className="text-pretty text-lg text-muted-foreground">{body}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-10 max-w-3xl text-pretty text-xl leading-relaxed text-foreground md:text-2xl">
              And when things don&apos;t go according to plan? We adapt. Because the goal
              isn&apos;t simply to follow an itinerary. It&apos;s to give you a great day.
            </p>
          </div>
        </div>
      </section>

      {/* The numbers: three bare figures on the light teal wash, and the
          client's paragraph beneath them. */}
      <section aria-labelledby="in-numbers" className="bg-tint-teal py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 id="in-numbers" className="mb-10 text-3xl font-bold tracking-tight md:text-4xl">
              Proof, in numbers
            </h2>
            <dl className="grid gap-8 sm:grid-cols-3 sm:gap-10">
              {figures.map(({ value, label }) => (
                <div key={value} className="flex flex-col">
                  <dt className="order-last max-w-56 text-pretty text-muted-foreground">{label}</dt>
                  <dd className="mb-1 text-5xl font-bold tracking-tight text-primary-strong sm:text-4xl lg:text-6xl">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-10 max-w-3xl text-pretty text-lg text-muted-foreground">
              Our team today is around 20 people — drivers, guides and team leaders — all local,
              all trained and experienced in tourism. Our founder had personally guided around 500
              groups, and together we&apos;ve welcomed close to 20,000 travelers on tour.
            </p>
          </div>
        </div>
      </section>

      {/* Credentials — verifiable text in place of the badges the page used
          to carry (client brief). The registered name stays in capitals. */}
      <section aria-labelledby="credentials" className="bg-background py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 id="credentials" className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
              A registered tour operator
            </h2>
            <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <p className="text-pretty text-lg text-muted-foreground">
                BEA VITA TOURS is a registered tour operator with the Treviso Chamber of Commerce
                and the Veneto Region. Every tour is run by our own licensed company, with our
                own drivers and vehicles.
              </p>
              <address className="text-sm not-italic leading-relaxed text-muted-foreground">
                BEA VITA TOURS
                <br />
                Auth. n. 6297 prov. TV — protocol n. 6297 of 08/04/2025
                <br />
                Comune di Caerano di San Marco (TV)
                <br />
                VAT IT05602720269
                <br />
                PEC{" "}
                <a href="mailto:beavitasrl@pec.it" className="underline underline-offset-4">
                  beavitasrl@pec.it
                </a>
              </address>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-cta" className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 id="about-cta" className="mb-8 text-balance text-3xl font-bold md:text-4xl">
            Ready to see Veneto the way we see it?
          </h2>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="px-8 text-lg">
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
