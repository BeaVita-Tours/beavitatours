"use client";

import { useEffect, useState } from "react";

/**
 * Subscribe to a `window.matchMedia` query and return whether it currently
 * matches. Used to switch between the desktop `Dialog` and the mobile `Drawer`
 * variants of the review inspector. Returns `false` on the server so the two
 * never render during hydration (the inspector only mounts after a click).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
