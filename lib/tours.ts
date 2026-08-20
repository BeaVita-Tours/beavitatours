import tourProsecco from "@/public/foto paesaggio edited.png";
import tourWines from "@/public/tourwines.jpg";
import mtb from "@/public/imgs/adventure.jpeg";
import gallaplacidia from "@/public/gallaplacidia.webp";
import shared from "@/public/shared.png";

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
