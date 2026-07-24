/**
 * Dropdown Header Component
 * 
 * Purpose: Header section of dropdown with title, count badge, and sort toggle
 * Used in: DropdownFilter component
 * Why: Provides consistent header UI with exact styling from StandardFilterDropdown
 */

'use client'

import * as React from "react"
import { ArrowUpDown } from "lucide-react"

//////////////////////////////////
// Type Definitions
//////////////////////////////////

interface DropdownHeaderProps {
  /**
   * Filter label to display
   * WHY: Show which filter is being configured
   * HOW: Displayed as "Filter: {label}"
   */
  filterLabel: string
  
  /**
   * Number of selected options
   * WHY: Show how many options are currently selected
   * HOW: Displayed in count badge
   */
  selectedCount: number
  
  /**
   * Number of available options
   * WHY: Show total available options
   * HOW: Displayed in count badge as "{selected}/{available}"
   */
  availableCount: number
  
  /**
   * Current sort direction
   * WHY: Show current sort state
   * HOW: Rotates arrow icon based on direction
   */
  sortDirection: 'asc' | 'desc'
  
  /**
   * Callback when sort is toggled
   * WHY: Allow user to toggle sort direction
   * HOW: Called when sort button is clicked
   */
  onToggleSort: () => void
}

//////////////////////////////////
// Component Implementation
//////////////////////////////////

/**
 * DropdownHeader component - header with title, count, and sort
 * WHY: Provides consistent header UI matching StandardFilterDropdown exactly
 * HOW: Renders header with exact styling from old component
 * @param {DropdownHeaderProps} props - Component props
 * @returns {React.ReactElement} Header section
 */
export function DropdownHeader({
  filterLabel,
  selectedCount,
  availableCount,
  sortDirection,
  onToggleSort
}: DropdownHeaderProps) {
  return (
    <div className="p-3 border-b border-border dark:border-border/50 bg-tertiary/20 flex justify-between items-center">
      <div className="flex items-center">
        <h3 className="text-sm font-medium text-tertiary">Filter: {filterLabel}</h3>
        <span className="ml-2 px-1.5 py-0.5 text-xs bg-tertiary/20 text-tertiary rounded-full">
          {selectedCount}/{availableCount}
        </span>
      </div>
      <div className="flex items-center">
        <button
          onClick={onToggleSort}
          className="p-1 rounded-md hover:bg-primary-foreground/20 focus:outline-none"
          title={`Sort options in ${sortDirection === 'asc' ? 'Ascending' : 'Descending' } order`}
        >
          <ArrowUpDown size={14} className={`text-tertiary transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  )
}
