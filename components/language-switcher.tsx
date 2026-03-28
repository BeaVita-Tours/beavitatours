"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

const languageNames: Record<Locale, string> = {
  en: "EN",
  it: "IT",
  zh: "中文",
  ja: "日本語",
};

const languageFullNames: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
  zh: "中文",
  ja: "日本語",
};

export function LanguageSwitcher({
  align = "end",
}: {
  align?: "start" | "center" | "end";
}) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto h-10 gap-1 px-2 border-none shadow-none bg-transparent focus:ring-0 text-muted-foreground hover:text-foreground transition-colors">
        <Languages className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium ml-1 mr-1">
          {languageNames[locale]}
        </span>
      </SelectTrigger>
      <SelectContent align={align}>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc} className="cursor-pointer">
            {languageFullNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
