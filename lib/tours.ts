import tourDolomites from "@/public/tourdolomites.jpg";
import tourHiking from "@/public/tourhiking.jpg";
import hiking2 from "@/public/hiking2.jpg";
import tourCustom from "@/public/tourcustom.jpg";
import tourProsecco from "@/public/tourprosecco.jpg";
import tourWines from "@/public/tourwines.jpg";
import placeholder from "@/public/placeholder.jpg";
import prosecco3 from "@/public/prosecco 3.jpg";
import mtb from "@/public/mtb.webp";
import gallaplacidia from "@/public/gallaplacidia.webp";

export const tours = [
  {
    title: "The Dolomites",
    href: "/tours/dolomites",
    image: tourDolomites,
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
    title: "Active",
    href: "/tours/active",
    image: hiking2,
  },
  {
    title: "Adventure",
    href: "/tours/adventure",
    image: mtb,
  },
  {
    title: "Cultural",
    href: "/tours/cultural",
    image: gallaplacidia,
  },
];

export default tours;
