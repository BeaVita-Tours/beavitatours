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

export const getTours = (
  tList: (key: string) => string,
  tData: (key: string) => string,
) => [
  {
    title: tList("dolomites"),
    href: "/tours/dolomites",
    image: "/imgs/dolomites/dolomitesmain.jpeg",
    badge: tData("dolomites.badge"),
  },
  {
    title: tList("prosecco"),
    href: "/tours/prosecco",
    image: tourProsecco,
    badge: tData("prosecco.badge"),
  },
  {
    title: tList("wineFood"),
    href: "/tours/wine-food",
    image: tourWines,
    badge: tData("wineFood.badge"),
  },
  {
    title: tList("activeAdventure"),
    href: "/tours/active-adventure",
    image: mtb,
    badge: tData("activeAdventure.badge"),
  },
  {
    title: tList("cultural"),
    href: "/tours/cultural",
    image: gallaplacidia,
    badge: tData("cultural.badge"),
  },
  {
    title: tList("sharedTours"),
    href: "/tours/shared-tours",
    image: shared,
    badge: undefined,
  },
];

// Keep the old export for backwards compatibility (hardcoded English)
export const tours = [
  {
    title: "The Dolomites",
    href: "/tours/dolomites",
    image: "/imgs/dolomites/dolomitesmain.jpeg",
    badge: "UNESCO World Heritage Site",
  },
  {
    title: "The Prosecco Hills",
    href: "/tours/prosecco",
    image: tourProsecco,
    badge: "UNESCO World Heritage Site",
  },
  {
    title: "Wine and Food",
    href: "/tours/wine-food",
    image: tourWines,
    badge: "UNESCO World Heritage Site",
  },
  {
    title: "Active & Adventure",
    href: "/tours/active-adventure",
    image: mtb,
    badge: undefined,
  },
  {
    title: "Cultural",
    href: "/tours/cultural",
    image: gallaplacidia,
    badge: "UNESCO World Heritage Site",
  },
  {
    title: "Shared Tours",
    href: "/tours/shared-tours",
    image: shared,
    badge: undefined,
  },
];

export default tours;
