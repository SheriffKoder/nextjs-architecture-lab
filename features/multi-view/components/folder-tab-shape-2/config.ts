/**
 * View catalog for folder-tab row (folder-tab-shape-2).
 *
 * Purpose: Keys, labels, Lucide icons — no click handlers; parent wires URL via `useViewSwitcher`.
 * Used in: app/development/folder-tab-shape-2/folder-tab-shape-2-view.tsx
 */

import type { LucideIcon } from "lucide-react";
import {
  AlignStartHorizontal,
  Calendar,
  LayoutDashboard,
  List,
  Map,
  Table,
} from "lucide-react";

export type ViewDisplayOption = {
  key: string;
  label: string;
  icon: LucideIcon;
};

export const viewDisplayOptions = {
  table: { key: "table", label: "Table", icon: Table },
  list: { key: "list", label: "List", icon: List },
  kanban: { key: "kanban", label: "Kanban", icon: LayoutDashboard },
  map: { key: "map", label: "Map", icon: Map },
  calendar: { key: "calendar", label: "Calendar", icon: Calendar },
  subheadings: { key: "subheadings", label: "SubHeadings", icon: List },
  timeline: { key: "timeline", label: "Timeline", icon: AlignStartHorizontal },
} as const satisfies Record<string, ViewDisplayOption>;

export type ViewDisplayOptionKey = keyof typeof viewDisplayOptions;

/** One tab in the row (presentational). */
export type FolderTabFlushRowItem = {
  key: string;
  label: string;
  icon?: LucideIcon;
};

export const DEFAULT_VIEW_ORDER = [
  // "table",
  "list",
  // "kanban",
  // "map",
  "calendar",
  // "subheadings",
  "timeline",
] as const satisfies readonly ViewDisplayOptionKey[];

export function buildFolderTabRowItems(
  keys: readonly ViewDisplayOptionKey[],
): FolderTabFlushRowItem[] {
  return keys.map((k) => {
    const o = viewDisplayOptions[k];
    return { key: o.key, label: o.label, icon: o.icon };
  });
}
