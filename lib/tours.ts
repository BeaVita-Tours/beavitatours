import tourWines from "@/public/tourwines.jpg";
import mtb from "@/public/imgs/adventure.jpeg";
import gallaplacidia from "@/public/gallaplacidia.webp";

/**
 * The homepage's "where do you want to go?" tiles — one per theme page.
 *
 * Four, not six: the Prosecco Hills now live inside Food & Wine (as in the
 * nav), and "Group Tours" is a way of travelling rather than a place, so it
 * belongs to the hero's group/private choice and not here — putting it in this
 * row was muddling *where* with *how*. Titles match the theme pages' own.
 */
export const tours = [
  {
    title: "The Dolomites",
    href: "/tours/dolomites",
    image: "/imgs/dolomites/dolomitesmain.jpeg",
  },
  {
    title: "Food & Wine",
    href: "/tours/wine-food",
    image: tourWines,
  },
  {
    title: "Active & Adventure",
    href: "/tours/active-adventure",
    image: mtb,
  },
  {
    title: "Culture & History",
    href: "/tours/cultural",
    image: gallaplacidia,
  },
];

export default tours;
