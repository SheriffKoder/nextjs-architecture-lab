/**
 * Fully rounded pill with a leading circle; uses `palette.dotFill` or `palette.icon`.
 */

import * as React from "react";
import type { BadgePalette } from "../model/badge-palette";

const LAYOUT =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full";

const DOT = "h-2 w-2 shrink-0 rounded-full";

export function RoundedDotBadge({
  palette,
  children,
}: {
  palette: BadgePalette;
  children: React.ReactNode;
}): React.ReactElement {
  const dotColor = palette.dotFill ?? palette.icon;
  return (
    <span
      className={`${LAYOUT} ${palette.bg} ${palette.border} ${palette.text}`}
    >
      <span className={`${DOT} ${dotColor}`} aria-hidden />
      {children}
    </span>
  );
}
