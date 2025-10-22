"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tours", label: "Tours" },
    { href: "/rates", label: "Rates" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Mountain className="h-6 w-6 text-primary" />
            <span className="text-foreground">OutsideVenice</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm" className="ml-4">
              <Link href="/#book">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild size="sm" className="w-full">
                <Link href="/#book" onClick={() => setIsOpen(false)}>
                  Book Now
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
