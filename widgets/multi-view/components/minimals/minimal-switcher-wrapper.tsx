/**
 * New View Switcher Wrapper Component
 * 
 * Purpose: Wrapper component that integrates ViewSwitcherControl with URL params
 * Used in: FilteringWrapper for view switching
 * Why: Provides button + dropdown view switcher instead of button group
 */

'use client'

import React from 'react'
import { useViewSwitcher } from '../../hooks/useViewSwitcher'
import { ViewSwitcherControl } from './view-switcher-control'

interface NewSwitcherWrapperProps {
  /** Available view keys to display */
  availableViews: string[]
  /** When provided with onViewChange, skips internal useViewSwitcher (parent owns URL sync) */
  currentView?: string
  onViewChange?: (view: string) => void
  /** View keys that require full dataset (`all=1`) — used when parent does not pass onViewChange */
  useAllItems?: readonly string[]
  /** Default page size when leaving a useAllItems view */
  defaultPageSize?: number
  /** Optional className */
  className?: string
  /** Optional disabled state */
  disabled?: boolean
}

/**
 * New View Switcher Wrapper component that integrates ViewSwitcherControl with URL params
 * Only displays views that are in availableViews array
 * 
 * @example
 * ```tsx
 * <NewSwitcherWrapper availableViews={['table', 'kanban']} />
 * ```
 */
export function NewSwitcherWrapper({
  availableViews,
  currentView: controlledView,
  onViewChange,
  useAllItems,
  defaultPageSize,
  className = '',
  disabled = false
}: NewSwitcherWrapperProps) {
  const defaultView = availableViews.length > 0 ? availableViews[0] : 'table'

  const internal = useViewSwitcher({
    availableViews,
    defaultView,
    useAllItems: controlledView !== undefined ? undefined : useAllItems,
    defaultPageSize,
  })

  const currentView = controlledView ?? internal.currentView
  const setView = onViewChange ?? internal.setView

  if (availableViews.length <= 1) {
    return null
  }

  return (
    <ViewSwitcherControl
      availableViews={availableViews}
      currentView={currentView}
      onViewChange={setView}
      className={className}
      disabled={disabled}
    />
  )
}
