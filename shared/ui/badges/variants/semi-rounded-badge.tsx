/**
 * Pill with `rounded-md` — uses `palette` bg / border / text only.
 */

import * as React from "react";
import type { BadgePalette } from "../model/badge-palette";

const LAYOUT =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-md";

export function SemiRoundedBadge({
  palette,
  children,
}: {
  palette: BadgePalette;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <span
      className={`${LAYOUT} ${palette.bg} ${palette.border} ${palette.text}`}
    >
      {children}
    </span>
  );
}
