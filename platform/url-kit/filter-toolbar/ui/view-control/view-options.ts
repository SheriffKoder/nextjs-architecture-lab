/**
 * Shared view metadata for ViewControl (dropdown) and ViewPills.
 */

import {
  Table,
  LayoutDashboard,
  Map,
  Calendar,
  List,
  AlignStartHorizontal,
  LayoutList,
  type LucideIcon,
} from 'lucide-react'

export type ViewOption = {
  key: string
  label: string
  icon: LucideIcon
}

export const VIEW_OPTIONS: Record<string, ViewOption> = {
  table: { key: 'table', label: 'Table', icon: Table },
  list: { key: 'list', label: 'List', icon: List },
  cards: { key: 'cards', label: 'Cards', icon: LayoutList },
  kanban: { key: 'kanban', label: 'Kanban', icon: LayoutDashboard },
  map: { key: 'map', label: 'Map', icon: Map },
  calendar: { key: 'calendar', label: 'Calendar', icon: Calendar },
  subheadings: { key: 'subheadings', label: 'SubHeadings', icon: List },
  timeline: {
    key: 'timeline',
    label: 'Timeline',
    icon: AlignStartHorizontal,
  },
}

export function resolveViewOptions(
  availableViews: readonly string[]
): ViewOption[] {
  return availableViews
    .map((key) => VIEW_OPTIONS[key])
    .filter((option): option is ViewOption => option !== undefined)
}
