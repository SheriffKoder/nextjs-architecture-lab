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
  className = '',
  disabled = false
}: NewSwitcherWrapperProps) {
  // Use first option as default, or 'table' if no options
  const defaultView = availableViews.length > 0 ? availableViews[0] : 'table'
  
  const { currentView, setView } = useViewSwitcher({
    availableViews,
    defaultView
  })

  // Don't render if no valid options or only one option
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
