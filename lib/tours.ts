import tourHiking from "@/public/tourhiking.jpg";
import hiking2 from "@/public/hiking2.jpg";
import tourCustom from "@/public/tourcustom.jpg";
import tourProseccoold from "@/public/tourprosecco.jpg";
import tourProsecco from "@/public/foto paesaggio edited.png";
import tourWines from "@/public/tourwines.jpg";
import placeholder from "@/public/placeholder.jpg";
import prosecco3 from "@/public/prosecco 3.jpg";
import mtb from "@/public/imgs/adventure.jpeg";
import gallaplacidia from "@/public/gallaplacidia.webp";
import shared from "@/public/shared.png";

export const getTours = (t: (key: string) => string) => [
  {
    title: t("dolomites"),
    href: "/tours/dolomites",
    image: "/imgs/dolomites/dolomitesmain.jpeg",
  },
  {
    title: t("prosecco"),
    href: "/tours/prosecco",
    image: tourProsecco,
  },
  {
    title: t("wineFood"),
    href: "/tours/wine-food",
    image: tourWines,
  },
  {
    title: t("activeAdventure"),
    href: "/tours/active-adventure",
    image: mtb,
  },
  {
    title: t("cultural"),
    href: "/tours/cultural",
    image: gallaplacidia,
  },
  {
    title: t("sharedTours"),
    href: "/tours/shared-tours",
    image: shared,
  },
];

// Keep the old export for backwards compatibility (hardcoded English)
export const tours = [
  {
    title: "The Dolomites",
    href: "/tours/dolomites",
    image: "/imgs/dolomites/dolomitesmain.jpeg",
  },
  {
    title: "The Prosecco Hills",
    href: "/tours/prosecco",
    image: tourProsecco,
  },
  {
    title: "Wine and Food",
    href: "/tours/wine-food",
    image: tourWines,
  },
  {
    title: "Active & Adventure",
    href: "/tours/active-adventure",
    image: mtb,
  },
  {
    title: "Cultural",
    href: "/tours/cultural",
    image: gallaplacidia,
  },
  {
    title: "Shared Tours",
    href: "/tours/shared-tours",
    image: shared,
  },
];

export default tours;
