"use client";

import {
  TourCTA,
  TourDescription,
  TourTemplate,
} from "@/components/tour-template";
import { useTranslations } from "next-intl";

export default function HikingTourPage() {
  const t = useTranslations("tours.data.activeAdventure");

  return (
    <TourTemplate
      name={t("title")}
      title={t("title")}
      subtitle={t("subtitle")}
      image="/imgs/adventure.jpeg"
      imageAlt={t("title")}
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
