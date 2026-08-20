"use client";

import Image from "next/image";
import Link from "next/link";
import navbarLogo from "@/public/logo-transparent-cropped-inverted.webp";
import { Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/components/cookie-consent-provider";

export function Footer() {
  const { openSettings } = useCookieConsent();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold text-lg"
              >
                <Image
                  src={navbarLogo}
                  alt="BeaVitaTours"
                  width={480}
                  height={96}
                  priority
                  className="h-12 w-auto"
                />
                <span className="sr-only">BeaVitaTours</span>
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
                  href="/rates"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Rates
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
            <h3 className="font-semibold mb-4">Reviews &amp; Social</h3>
            <div className="flex gap-4 mb-4 flex-row items-center justify-start text-muted-foreground">
              <Link href="https://www.facebook.com/people/Bea-Vita-Tours/61575406170256/">
                <span className="sr-only">Facebook</span>
                <Facebook />
              </Link>
              <Link href="https://www.instagram.com/beavitatours">
                <span className="sr-only">Instagram</span>
                <Instagram />
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} BeaVitaTours. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
