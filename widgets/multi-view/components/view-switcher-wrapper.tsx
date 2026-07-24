'use client'

import React from 'react'
import { useViewSwitcher } from '../hooks/useViewSwitcher'
import ViewSwitcher, { ViewSwitcherOption } from './view-switcher'
import { Table, LayoutDashboard, Map, Calendar, List, AlignStartHorizontal, ListOrdered } from 'lucide-react'

// Pre-configured view options
const VIEW_OPTIONS: Record<string, ViewSwitcherOption> = {
  table: {
    key: 'table',
    label: 'Table',
    icon: Table
  },
  kanban: {
    key: 'kanban',
    label: 'Kanban',
    icon: LayoutDashboard
  },
  map: {
    key: 'map',
    label: 'Map',
    icon: Map
  },
  calendar: {
    key: 'calendar',
    label: 'Calendar',
    icon: Calendar
  },
  subheadings: {
    key: 'subheadings',
    label: 'SubHeadings',
    icon: List
  },
  timeline: {
    key: 'timeline',
    label: 'Timeline',
    icon: AlignStartHorizontal
  },
  list: {
    key: 'list',
    label: 'List',
    icon: ListOrdered
  }
}

interface ViewSwitcherWrapperProps {
  /** Available view keys to display */
  availableViews: string[]
  /** View keys that require full dataset (`all=1`) */
  useAllItems?: readonly string[]
  /** Default page size when leaving a useAllItems view */
  defaultPageSize?: number
  /** Optional className */
  className?: string
  /** Optional disabled state */
  disabled?: boolean
}

/**
 * Wrapper component that integrates ViewSwitcher with URL params
 * Only displays views that are in availableViews array
 * 
 * @example
 * ```tsx
 * <ViewSwitcherWrapper availableViews={['table', 'kanban']} />
 * ```
 */
export function ViewSwitcherWrapper({
  availableViews,
  useAllItems,
  defaultPageSize,
  className = '',
  disabled = false
}: ViewSwitcherWrapperProps) {
  const defaultView = availableViews.length > 0 ? availableViews[0] : 'table'
  
  const { currentView, setView } = useViewSwitcher({
    availableViews,
    defaultView,
    useAllItems,
    defaultPageSize,
  })

  // Filter options to only show available views
  const options = availableViews
    .map(key => VIEW_OPTIONS[key])
    .filter((option): option is ViewSwitcherOption => option !== undefined)

  // Don't render if no valid options or only one option
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
