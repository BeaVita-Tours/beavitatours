"use client";

import {
  TourCTA,
  TourDescription,
  TourTemplate,
  type CarouselImage,
} from "@/components/tour-template";
import { useTranslations } from "next-intl";

const carouselImages: CarouselImage[] = [
  { src: "/imgs/winefood.jpg", alt: "Wine and food experience in Veneto" },
];

export default function WineFoodTourPage() {
  const t = useTranslations("tours.data.wineFood");

  return (
    <TourTemplate
      name={t("title")}
      title={t("title")}
      subtitle={t("subtitle")}
      badge={t("badge")}
      image="/tourwines.jpg"
      imageAlt={t("title")}
      carouselImages={carouselImages}
      ctaHeading={t("ctaHeading")}
      ctaName={t("title")}
    >
      <TourDescription>
        <p className="leading-relaxed">
          {t("description1")}
        </p>
        <p className="leading-relaxed">
          {t("description2")}
        </p>
        <p className="leading-relaxed">
          {t("description3")}
        </p>
      </TourDescription>
      <TourCTA />
    </TourTemplate>
  );
}
