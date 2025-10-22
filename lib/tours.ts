import tourDolomites from "@/public/tourdolomites.jpg";
import tourHiking from "@/public/tourhiking.jpg";
import tourCustom from "@/public/tourcustom.jpg";
import tourProsecco from "@/public/tourprosecco.jpg";
import tourWines from "@/public/tourwines.jpg";
import placeholder from "@/public/placeholder.jpg";

export const tours = [
  {
    title: "DOLOMITES",
    duration: "9-hour Full Day",
    price: "450 €",
    href: "/tours/dolomites",
    image: tourDolomites,
  },
  {
    title: "PROSECCO",
    duration: "9-hour Full Day",
    price: "450 €",
    href: "/tours/prosecco",
    image: tourProsecco,
  },
  {
    title: "DOLOMITES HIKING TOUR",
    duration: "11-hour Full Day",
    price: "500 €",
    href: "/tours/hiking",
    image: tourHiking,
  },
  {
    title: "DOLOMITES AND PROSECCO",
    duration: "11-hour Full Day",
    price: "500 €",
    href: "/tours/dolomites-prosecco",
    image: placeholder,
  },
  {
    title: "GREAT WINES TOUR",
    duration: "11-hour Full Day",
    price: "500 €",
    href: "/tours/great-wines",
    image: tourWines,
  },
  {
    title: "PRIVATE CUSTOM TOURS",
    duration: "Full Day Tours",
    price: "450 €",
    href: "/tours/custom",
    image: tourCustom,
  },
];

export default tours;
