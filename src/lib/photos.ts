/**
 * Marketing photography. Each slot shows the photo when `src` is set, with its credit and licence,
 * and a drawn illustration until then.
 *
 * Rules:
 * - Only openly licensed photos (CC0, CC BY, CC BY-SA) or photos you own.
 * - Never present a stock or Commons photo as Flowkeep pilot work. Captions say where it was taken
 *   and who took it, nothing more.
 * - Put files in /public/photos/ and set `src` to "/photos/<file>".
 */
export interface PhotoSlot {
  src?: string;
  alt: string;
  /** Where the photo was taken, e.g. "Kagoro, Kaduna State". */
  place?: string;
  credit?: string;
  license?: string;
  /** Source page, e.g. the Wikimedia Commons file page. */
  sourceUrl?: string;
}

export const PHOTOS: Record<"hero" | "problem" | "people", PhotoSlot> = {
  hero: { alt: "A community hand pump on a concrete slab" },
  problem: { alt: "A broken community hand pump" },
  people: { alt: "People collecting water at a community water point" },
};
