/**
 * Dropdown Footer Component
 * 
 * Purpose: Footer section with Clear, Cancel, and Apply buttons
 * Used in: DropdownFilter component
 * Why: Provides action buttons for filter management
 */

'use client'

import * as React from "react"

//////////////////////////////////
// Type Definitions
//////////////////////////////////

interface DropdownFooterProps {
  /**
   * Currently pending selections
   * WHY: Determine if Apply button should be enabled
   * HOW: Check if there are pending changes
   */
  pendingSelections: string[]
  
  /**
   * Whether filter is currently active
   * WHY: Determine if Apply button should be enabled
   * HOW: Check if there are active filters
   */
  isFilterActive: boolean
  
  /**
   * Whether to auto-apply changes
   * WHY: Control whether Apply button is shown
   * HOW: If true, hide Apply button; if false, show it
   */
  autoApply: boolean
  
  /**
   * Callback to clear all filters
   * WHY: Allow user to clear all filters
   * HOW: Called when Clear button is clicked
   */
  onClearFilters: () => void
  
  /**
   * Callback to cancel changes
   * WHY: Allow user to cancel pending changes
   * HOW: Called when Cancel button is clicked
   */
  onCancel: () => void
  
  /**
   * Callback to apply pending changes
   * WHY: Allow user to apply pending changes
   * HOW: Called when Apply button is clicked
   */
  onApplyFilters: () => void
}

//////////////////////////////////
// Component Implementation
//////////////////////////////////

/**
 * DropdownFooter component - footer with action buttons
 * WHY: Provides action buttons with exact styling from StandardFilterDropdown
 * HOW: Renders footer with Clear, Cancel, and conditional Apply button
 * @param {DropdownFooterProps} props - Component props
 * @returns {React.ReactElement} Footer section
 */
export function DropdownFooter({
  pendingSelections,
  isFilterActive,
  autoApply,
  onClearFilters,
  onCancel,
  onApplyFilters
}: DropdownFooterProps) {
  return (
    <div className="p-3 border-t border-border dark:border-border/50 bg-foreground/5 flex justify-between items-center z-10">
      <button
        onClick={onClearFilters}
        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-background"
      >
        Clear
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="cursor-pointer text-sm px-3 py-1 text-foreground rounded hover:bg-background"
        >
          Cancel
        </button>
        {!autoApply && (
          <button
            onClick={onApplyFilters}
            className="cursor-pointer text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={pendingSelections.length === 0 && !isFilterActive}
          >
            Apply
          </button>
        )}
      </div>
    </div>
  )
}
