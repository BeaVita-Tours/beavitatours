import tourHiking from "@/public/tourhiking.jpg";
import hiking2 from "@/public/hiking2.jpg";
import tourCustom from "@/public/tourcustom.jpg";
import tourProsecco from "@/public/tourprosecco.jpg";
import tourWines from "@/public/tourwines.jpg";
import placeholder from "@/public/placeholder.jpg";
import prosecco3 from "@/public/prosecco 3.jpg";
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
