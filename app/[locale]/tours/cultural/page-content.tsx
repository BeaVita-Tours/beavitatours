"use client";

import {
  TourCTA,
  TourDescription,
  TourTemplate,
  type CarouselImage,
} from "@/components/tour-template";

import { useTranslations } from "next-intl";

const carouselImages: CarouselImage[] = [
  { src: "/imgs/cultural/padova1.jpeg", alt: "Padova" },
  { src: "/imgs/cultural/verona1.jpeg", alt: "Verona" },
  { src: "/imgs/cultural/verona2.jpeg", alt: "Verona scenery" },
];

export default function CulturalTourPage() {
  const t = useTranslations("tours.data.cultural");

  return (
    <TourTemplate
      name={t("title")}
      title={t("title")}
      subtitle={t("subtitle")}
      image="/gallaplacidia.webp"
      badge={t("badge")}
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
