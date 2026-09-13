"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CircleHelp,
  Gem,
  Grape,
  Mail,
  Menu,
  Mountain,
  Newspaper,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import navbarLogo from "@/public/logo-transparent-cropped-inverted.webp";

interface NavLink {
  href: string;
  label: string;
  icon: typeof Users;
}

const NAV_LINKS: readonly NavLink[] = [
  { href: "/tours/group-tours", label: "Group Tours", icon: Users },
  // A diamond, not a car: private tours are sold as the premium option.
  { href: "/tours/private-tours", label: "Private Tours", icon: Gem },
  { href: "/tours/dolomites", label: "Dolomites", icon: Mountain },
  { href: "/tours/wine-food", label: "Food & Wine", icon: Grape },
  { href: "/b2b", label: "B2B", icon: BriefcaseBusiness },
  { href: "/about", label: "About", icon: UserRound },
  { href: "/faq", label: "FAQ", icon: CircleHelp },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/contact", label: "Contact", icon: Mail },
];

const isActiveForPath = (pathname: string, link: NavLink) =>
  pathname === link.href || pathname.startsWith(`${link.href}/`);

/**
 * Presentational nav rows. They take an `isActive` function instead of calling
 * `usePathname` themselves, so they can also be rendered as Suspense fallbacks
 * in the static prerender shell (which must not call request-time hooks).
 */
function DesktopNavLinks({
  links,
  isActive,
}: {
  links: readonly NavLink[];
  isActive: (link: NavLink) => boolean;
}) {
  return (
    <ul className="flex items-center justify-between gap-1 py-2">
      {links.map((link, index) => {
        const active = isActive(link);
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
  );
}

function MobileNavLinks({
  links,
  isActive,
  onNavigate,
}: {
  links: readonly NavLink[];
  isActive: (link: NavLink) => boolean;
  onNavigate: () => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {links.map((link) => {
        const active = isActive(link);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
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
  );
}

/**
 * Client leaves that read the pathname. Each is wrapped in <Suspense> at the
 * call site so the static prerender shell never calls usePathname (avoids
 * blocking-prerender-client-hook on statically-adopted routes like the blog).
 * The Suspense fallbacks render the same rows with inactive styling, so the
 * header layout is identical and only a link's color changes after hydration.
 */
function DesktopNavActive({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  return (
    <DesktopNavLinks links={NAV_LINKS} isActive={(link) => isActiveForPath(pathname, link)} />
  );
}

function MobileNavActive({
  links,
  onNavigate,
}: {
  links: readonly NavLink[];
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  return (
    <MobileNavLinks
      links={NAV_LINKS}
      isActive={(link) => isActiveForPath(pathname, link)}
      onNavigate={onNavigate}
    />
  );
}

/** "Book Now" goes to the group tours — the volume product, and the page
    that lists every shared departure now that the catalog index is gone. */
const BOOK_HREF = "/tours/group-tours";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const bookHref = BOOK_HREF;

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const closeMobile = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-muted/85 backdrop-blur-sm">
      {/* Layer 1 — brand + primary action (solid) */}
      <div className="bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="beaVita Tours home"
              className="flex items-center"
            >
              <Image
                src={navbarLogo}
                // Decorative: the wrapping link already carries the name, so
                // repeating it here makes a screen reader say it twice.
                alt=""
                width={480}
                height={96}
                priority
                className="h-11 w-auto"
              />
              <span className="sr-only">beaVita Tours</span>
            </Link>

            <div className="flex items-center gap-3">
              <Button asChild className="hidden xl:inline-flex">
                <Link href={bookHref}>Book Now</Link>
              </Button>
              <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-nav"
                className="inline-flex size-10 items-center justify-center rounded-lg text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
              >
                {isOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="Main">
        {/* Layer 2 — the route map: every link horizontal, icon + label (translucent + blur) */}
        <div className="hidden border-t border-border/60 bg-muted/35 xl:block">
          <div className="container mx-auto px-4">
            <Suspense fallback={<DesktopNavLinks links={NAV_LINKS} isActive={() => false} />}>
              <DesktopNavActive links={NAV_LINKS} />
            </Suspense>
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
            <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background py-3">
              <div className="container mx-auto px-4">
                <Suspense
                  fallback={
                    <MobileNavLinks
                      links={NAV_LINKS}
                      isActive={() => false}
                      onNavigate={closeMobile}
                    />
                  }
                >
                  <MobileNavActive links={NAV_LINKS} onNavigate={closeMobile} />
                </Suspense>
                <div className="mt-3 border-t border-border pt-3">
                  <Button asChild size="lg" className="w-full">
                    <Link href={bookHref} onClick={closeMobile}>
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
