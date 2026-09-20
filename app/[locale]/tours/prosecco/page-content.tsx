"use client";

import {
  TourCTA,
  TourDescription,
  TourTemplate,
} from "@/components/tour-template";
import { useTranslations } from "next-intl";

export default function ProseccoTourPage() {
  const t = useTranslations("tours.data.prosecco");

  return (
    <TourTemplate
      name={t("title")}
      title={t("title")}
      subtitle={t("subtitle")}
      badge={t("badge")}
      image="/tourprosecco.jpg"
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
