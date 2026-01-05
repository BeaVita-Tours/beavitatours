import tourDolomites from "@/public/tourdolomites.jpg";
import tourHiking from "@/public/tourhiking.jpg";
import tourCustom from "@/public/tourcustom.jpg";
import tourProsecco from "@/public/tourprosecco.jpg";
import tourWines from "@/public/tourwines.jpg";
import placeholder from "@/public/placeholder.jpg";
import prosecco3 from "@/public/prosecco 3.jpg";

export const tours = [
  {
    title: "THE DOLOMITES",
    href: "/tours/dolomites",
    image: tourDolomites,
  },
  {
    title: "THE PROSECCO HILLS",
    href: "/tours/prosecco",
    image: tourWines,
  },
  {
    title: "WINE AND FOOD",
    href: "/tours/wine-food",
    image: prosecco3,
  },
  {
    title: "ACTIVE",
    href: "/tours/active",
    image: tourHiking,
  },
  {
    title: "ADVENTURE",
    href: "/tours/adventure",
    image: tourProsecco,
  },
  {
    title: "CULTURAL",
    href: "/tours/cultural",
    image: tourCustom,
  },
];

export default tours;
