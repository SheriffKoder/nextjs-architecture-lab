/**
 * View catalog for folder-tab row (labels + icons).
 * Which views appear is decided by the page `availableViews` config, not this file.
 */

import type { LucideIcon } from 'lucide-react'
import {
  AlignStartHorizontal,
  Calendar,
  LayoutDashboard,
  LayoutList,
  List,
  ListOrdered,
  Map,
  Table,
} from 'lucide-react'

export type ViewDisplayOption = {
  key: string
  label: string
  icon: LucideIcon
}

export const viewDisplayOptions = {
  table: { key: 'table', label: 'Table', icon: Table },
  list: { key: 'list', label: 'List', icon: ListOrdered },
  cards: { key: 'cards', label: 'Cards', icon: LayoutList },
  kanban: { key: 'kanban', label: 'Kanban', icon: LayoutDashboard },
  map: { key: 'map', label: 'Map', icon: Map },
  calendar: { key: 'calendar', label: 'Calendar', icon: Calendar },
  subheadings: { key: 'subheadings', label: 'SubHeadings', icon: List },
  timeline: { key: 'timeline', label: 'Timeline', icon: AlignStartHorizontal },
} as const satisfies Record<string, ViewDisplayOption>

export type ViewDisplayOptionKey = keyof typeof viewDisplayOptions

/** One tab in the row (presentational). */
export type FolderTabFlushRowItem = {
  key: string
  label: string
  icon?: LucideIcon
}

export function buildFolderTabRowItems(
  keys: readonly ViewDisplayOptionKey[],
): FolderTabFlushRowItem[] {
  return keys.map((k) => {
    const o = viewDisplayOptions[k]
    return { key: o.key, label: o.label, icon: o.icon }
  })
}
