import Link from "next/link"
import Image from "next/image";
import navbarLogo from "@/public/logo-transparent-cropped-inverted.webp";

export function Footer() {
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
              Agenzia di Viaggi e Turismo
              <br />
              Autorizzazione Provincia di Treviso
              <br />
              protocollo n. 6297 del 08/04/2025
              <br />
              VAT No 04897010262
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {/* <li>
                <Link
                  href="/tours"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Our Tours
                </Link>
              </li>
              <li>
                <Link
                  href="/travel-agency"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Are you a Travel Agency?
                </Link>
              </li> */}
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Reviews & Social</h3>
            <ul className="space-y-2 text-sm mb-4">
              <li>
                <a
                  href="https://www.getyourguide.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GetYourGuide Reviews
                </a>
              </li>
              <li>
                <a
                  href="https://www.tripadvisor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tripadvisor Reviews
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} BeaVitaTours. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
