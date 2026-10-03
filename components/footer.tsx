"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import navbarLogo from "@/public/logo-transparent-cropped-inverted.webp";
import {
  Award,
  BadgeEuro,
  CalendarCheck,
  Facebook,
  Flag,
  Instagram,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/components/cookie-consent-provider";
import { PaymentMarks } from "@/components/payment-marks";

/**
 * The social profiles. Hidden while the pages are inactive (client,
 * 2026-09-29) — flip this back on and the icons return to the slot kept for
 * them under the payment methods.
 */
const SHOW_SOCIAL_LINKS = false;

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Bea-Vita-Tours/61575406170256/",
    icon: Facebook,
  },
  { label: "Instagram", href: "https://www.instagram.com/beavitatours", icon: Instagram },
] as const;

/**
 * The strip of reassurances along the very bottom, after italy.mytour.eu's
 * (client, 2026-09-29), corrected before launch: Tripadvisor's Certificate
 * of Excellence ended in 2020 (Travelers' Choice replaced it), the traveller
 * count matches the About page's figure, and the two "powered by Google
 * Cloud" badges are gone — the site is not hosted there.
 */
const trustBadges = [
  { icon: Smile, text: "20,000+ happy travelers since 2018, from around the world" },
  { icon: Award, text: "Tripadvisor Travelers' Choice 2025" },
  { icon: BadgeEuro, text: "Great tours at competitive prices" },
  { icon: CalendarCheck, text: "Free cancellation up to 48 hours before departure" },
] as const;

export function Footer() {
  const { openSettings } = useCookieConsent();
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold text-lg"
              >
                <Image
                  src={navbarLogo}
                  // Decorative: the wrapping link already carries the name, so
                  // repeating it here makes a screen reader say it twice.
                  alt=""
                  width={480}
                  height={96}
                  priority
                  className="h-12 w-auto"
                />
                <span className="sr-only">beaVita Tours</span>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              BEA VITA TOURS
              <br />
              Tour Operator
              <br />
              Auth 6297 prov. TV
              <br />
              protocol n. 6297 of 08/04/2025
              <br />
              BEA VITA srl
              <br />
              VAT IT05602720269
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/tours/group-tours"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Group Tours
                </Link>
              </li>
              <li>
                <Link
                  href="/tours/private-tours"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Private Tours
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Button
                  asChild
                  variant="link"
                  className="h-auto p-0 font-normal text-muted-foreground hover:text-foreground"
                >
                  <Link href="/privacy">Privacy Policy</Link>
                </Button>
              </li>
              <li>
                <Button
                  type="button"
                  variant="link"
                  onClick={openSettings}
                  className="h-auto p-0 font-normal text-muted-foreground hover:text-foreground"
                >
                  Cookie Settings
                </Button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Secure payment</h3>
            <PaymentMarks className="flex flex-wrap gap-2" />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Pay online by card or digital wallet at checkout.
            </p>
            {SHOW_SOCIAL_LINKS ? (
              <>
                <h3 className="mt-8 mb-4 font-semibold">Follow us</h3>
                <div className="flex flex-row items-center justify-start gap-4 text-muted-foreground">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <Link key={label} href={href} className="hover:text-foreground">
                      <span className="sr-only">{label}</span>
                      <Icon />
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div>
            <h3 className="font-semibold mb-4">Reviews</h3>
            {/*
              Guest reviews and their photos are republished on the site.
              Anyone who recognises themselves in a photo, or disputes a
              review, needs an obvious route to ask for it to be taken down —
              this is that route (it lands on the contact form).
            */}
            <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
              Reviews and photos on this site are shared by our guests. Spotted
              something that shouldn&apos;t be here?
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
            >
              <Link href="/contact?subject=report">
                <Flag className="size-3.5" aria-hidden="true" />
                Report a review or photo
              </Link>
            </Button>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-x-6 gap-y-5 border-t border-dashed border-border py-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustBadges.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-strong">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="text-pretty text-xs leading-snug text-muted-foreground">{text}</span>
            </li>
          ))}
        </ul>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {year} beaVita Tours. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
