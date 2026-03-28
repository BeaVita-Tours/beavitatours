"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import navbarLogo from "@/public/logo-transparent-cropped-inverted.webp";
import { Facebook, Instagram } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("navigation");

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
              {t("companyName")}
              <br />
              {t("companyType")}
              <br />
              {t("authorization")}
              <br />
              {t("protocol")}
              <br />
              {t("vat")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/rates"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tNav("rates")}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tNav("faq")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tNav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("reviewsSocial")}</h3>
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
            <div className="mt-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} BeaVitaTours. {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
