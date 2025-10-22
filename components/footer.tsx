import Link from "next/link"
import { Facebook, Youtube, Mountain } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mountain className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">OutsideVenice</span>
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
              <li>
                <Link href="/tours/prosecco" className="text-muted-foreground hover:text-foreground transition-colors">
                  Prosecco Tours
                </Link>
              </li>
              <li>
                <Link href="/tours/dolomites" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dolomites Tours
                </Link>
              </li>
              <li>
                <Link href="/tours/custom" className="text-muted-foreground hover:text-foreground transition-colors">
                  Custom Tours
                </Link>
              </li>
              <li>
                <Link href="/rates" className="text-muted-foreground hover:text-foreground transition-colors">
                  Rates
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
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
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>Copyright {new Date().getFullYear()} OutsideVenice. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
