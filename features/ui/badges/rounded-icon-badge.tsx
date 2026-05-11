/**
 * Fully rounded pill with a leading Lucide icon. Default icon: `Flag`.
 * When inside a Tailwind `group` (e.g. table row), hover uses `text-tertiary` on label + icon.
 */

import * as React from "react";
import { Flag, type LucideIcon } from "lucide-react";
import type { BadgePalette } from "./badge-palette";

const LAYOUT =
  "inline-flex items-center gap-1.5 px-1 py-0.5 text-xs font-medium rounded-full";

/** Matches row hover styling used on sticky cells (`group-hover:bg-neutral-200`, etc.) */
const GROUP_HOVER_TEXT = "group-hover:text-tertiary";
const GROUP_HOVER_FILL = "group-hover:fill-tertiary group-hover:text-tertiary";

export function RoundedIconBadge({
  palette,
  icon: Icon = Flag,
  className,
  children,
}: {
  palette: BadgePalette;
  icon?: LucideIcon;
  /** Extra classes on the outer span (after palette + hover) */
  className?: string;
  children: React.ReactNode;
}): React.ReactElement {
  const shell = `${LAYOUT} ${palette.text} ${GROUP_HOVER_TEXT}${className ? ` ${className}` : ""}`;

  return (
    <span className={shell}>
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${palette.icon} ${GROUP_HOVER_FILL}`}
        aria-hidden
      />
      {children}
    </span>
  );
}
