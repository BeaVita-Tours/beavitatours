"use client";

import {
  TourCTA,
  TourDescription,
  TourTemplate,
  type CarouselImage,
} from "@/components/tour-template";
import { useTranslations } from "next-intl";

const carouselImages: CarouselImage[] = [
  { src: "/imgs/dolomites/dolomites1.jpeg", alt: "Dolomites landscape" },
  { src: "/imgs/dolomites/dolomites2.jpeg", alt: "Dolomites panorama" },
];

export default function DolomitesTourPage() {
  const t = useTranslations("tours.data.dolomites");

  return (
    <TourTemplate
      name={t("title")}
      title={t("title")}
      subtitle={t("subtitle")}
      badge={t("badge")}
      image="/imgs/dolomites/dolomitesmain.jpeg"
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
