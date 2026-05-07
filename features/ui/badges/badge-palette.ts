/**
 * Tailwind class fragments for badge shells. Compose in badge components via template literals.
 */

export type BadgePalette = {
  bg: string;
  border: string;
  text: string;
  /** Lucide stroke color classes on `RoundedIconBadge` */
  icon: string;
  /** Circle fill on `RoundedDotBadge`; defaults to `icon` if omitted */
  dotFill?: string;
};
