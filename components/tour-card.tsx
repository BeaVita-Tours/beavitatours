import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

interface TourCardProps {
  title: string;
  href: string;
  image: any;
}

export function TourCard({ title, href, image }: TourCardProps) {
  const t = useTranslations("tours");

  return (
    <Link
      href={href}
      aria-label={`${t("viewDetails")} ${title}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="relative mt-0 block aspect-4/3 overflow-hidden p-0 transition-shadow duration-300 ease-out hover:shadow-md cursor-default">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute inset-0 flex items-end">
          <div className="flex w-full items-end justify-between gap-3 p-5">
            <h3 className="text-lg font-semibold leading-snug text-white">
              {title}
            </h3>

            <Button
              asChild
              size="icon-lg"
              className="shrink-0 rounded-xl cursor-pointer"
            >
              <span aria-hidden="true">
                <ArrowRight />
              </span>
            </Button>
            <span className="sr-only">{t("viewDetails")}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
