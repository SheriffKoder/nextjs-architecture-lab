'use client'

import React from 'react'
import {
  AlignStartHorizontal,
  Calendar,
  LayoutDashboard,
  List,
  ListOrdered,
  Map,
  Table,
} from 'lucide-react'

import { useViewResolution } from '@/platform/url-kit/minimal-controls'
import ViewSwitcher, { type ViewSwitcherOption } from './view-switcher'

const VIEW_OPTIONS: Record<string, ViewSwitcherOption> = {
  table: { key: 'table', label: 'Table', icon: Table },
  kanban: { key: 'kanban', label: 'Kanban', icon: LayoutDashboard },
  map: { key: 'map', label: 'Map', icon: Map },
  calendar: { key: 'calendar', label: 'Calendar', icon: Calendar },
  subheadings: { key: 'subheadings', label: 'SubHeadings', icon: List },
  timeline: { key: 'timeline', label: 'Timeline', icon: AlignStartHorizontal },
  list: { key: 'list', label: 'List', icon: ListOrdered },
}

export interface ViewSwitcherWrapperProps {
  /** Available view keys to display — from page views config */
  availableViews: readonly string[]
  /** Default when URL view is missing/invalid */
  defaultView?: string
  /** View keys that require full dataset (`all=1`) */
  useAllItems?: readonly string[]
  /** Default page size when leaving a useAllItems view */
  defaultPageSize?: number
  className?: string
  disabled?: boolean
}

/**
 * Expanded icon view switcher wired to URL `view` (+ `all` sync).
 * Pass `availableViews` from the page views config (single source of truth).
 */
export function ViewSwitcherWrapper({
  availableViews,
  defaultView,
  useAllItems,
  defaultPageSize,
  className = '',
  disabled = false,
}: ViewSwitcherWrapperProps) {
  const views = [...availableViews]
  const effectiveDefault =
    defaultView || (views.length > 0 ? views[0] : 'table')

  const { currentView, setView } = useViewResolution({
    availableViews: views,
    defaultView: effectiveDefault,
    useAllItems,
    defaultPageSize,
  })

  const options = views
    .map((key) => VIEW_OPTIONS[key])
    .filter((option): option is ViewSwitcherOption => option !== undefined)

  if (options.length <= 1) {
    return null
  }

  return (
    <ViewSwitcher
      options={options}
      value={currentView}
      onChange={setView}
      disabled={disabled}
      className={className}
    />
  )
}
