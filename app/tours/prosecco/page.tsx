"use client";

import {
  TourCTA,
  TourDescription,
  TourFeatures,
  TourTemplate,
} from "@/components/tour-template";
import { TourFeature } from "@/components/tour-feature";
import { Wine } from "lucide-react";

export default function ProseccoTourPage() {
  return (
    <TourTemplate
      name="Prosecco"
      title="Prosecco Tour"
      subtitle="Explore the rolling hills and finest wineries of the Prosecco region"
      badge="UNESCO World Heritage Site"
      image="/tourprosecco.jpg"
      imageAlt="Prosecco Vineyards"
      ctaHeading="Ready to Experience Prosecco Country?"
      ctaName="Prosecco"
    >
      <TourDescription>
        <p className="leading-relaxed">
          Just a 45 minute drive from Venice lies the region of Prosecco, UNESCO
          World Heritage Site.
        </p>
        <p className="leading-relaxed">
          On this tour we drive through the Prosecco Road that accommodates the
          finest vines and wineries where the highest quality Proseccos are
          produced. The landscape is without an end, villas on hills, hamlets,
          vineries...
        </p>
        <p className="leading-relaxed">
          In a Prosecco full day tour you can visit at least 3 wineries with
          sightseeing and time for a lunch stop in a family-run restaurant with
          excellent food and wine!
        </p>
        <p className="leading-relaxed">
          Pick-up and drop off of our tours are from Venice Piazzale Roma, the
          car terminal, to avoid any stress and waste of time to travel by train
          or by bus. Of course we can pick you up at any local hotel in the
          mainland.
        </p>
        <p className="leading-relaxed">
          We provide wine shipping service to all the countries with proper
          package to ensure that your shipment doesn't get damaged in transit.
        </p>
      </TourDescription>

      <TourCTA />
    </TourTemplate>
  );
}
