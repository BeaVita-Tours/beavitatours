"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CarFront,
  CircleHelp,
  Grape,
  Mail,
  Menu,
  Mountain,
  Newspaper,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import navbarLogo from "@/public/logo-transparent-cropped-inverted.webp";

const NAV_LINKS = [
  { href: "/tours/shared-tours", label: "Shared Tours", icon: Users },
  { href: "/tours/dolomites", label: "Dolomites", icon: Mountain },
  { href: "/tours/wine-food", label: "Food & Wine", icon: Grape },
  { href: "/best-seller", label: "Best Seller", icon: Trophy },
  { href: "/rates", label: "Private Tours", icon: CarFront },
  { href: "/b2b", label: "B2B", icon: BriefcaseBusiness },
  { href: "/about", label: "About", icon: UserRound },
  { href: "/faq", label: "FAQ", icon: CircleHelp },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/blog", label: "Blog", icon: Newspaper },
] as const;

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur">
      {/* Layer 1 — brand + primary action */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="BeaVitaTours home"
            className="flex items-center"
          >
            <Image
              src={navbarLogo}
              alt="BeaVitaTours"
              width={480}
              height={96}
              priority
              className="h-11 w-auto"
            />
            <span className="sr-only">BeaVitaTours</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button asChild className="hidden xl:inline-flex">
              <Link href="/tours/shared-tours">Book Now</Link>
            </Button>
            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              className="inline-flex size-10 items-center justify-center rounded-lg text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
            >
              {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      <nav aria-label="Main">
        {/* Layer 2 — the route map: every link horizontal, icon + label */}
        <div className="hidden border-t border-border/60 bg-muted/40 xl:block">
          <div className="container mx-auto px-4">
            <ul className="flex items-center justify-between gap-1 py-2">
              {NAV_LINKS.map((link, index) => {
                const active = isActive(link.href);
                return (
                  <li
                    key={link.href}
                    className="animate-nav-reveal"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-background",
                        active
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <link.icon className="size-[18px]" strokeWidth={2} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Mobile menu — same icon + label rows. Always mounted so the
            expand/collapse can be animated in both directions; the grid-rows
            trick collapses the height smoothly without measuring it. */}
        <div
          id="mobile-nav"
          inert={!isOpen}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none xl:hidden",
            isOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border py-3">
              <div className="container mx-auto px-4">
                <ul className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          <link.icon className="size-5" strokeWidth={2} />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 border-t border-border pt-3">
                  <Button asChild size="lg" className="w-full">
                    <Link
                      href="/tours/shared-tours"
                      onClick={() => setIsOpen(false)}
                    >
                      Book Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
