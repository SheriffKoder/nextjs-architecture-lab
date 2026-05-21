/**
 * Active Filters Section Component
 * 
 * Purpose: Displays active filter badges with remove buttons
 * Used in: DropdownFilter component when filters are active
 * Why: Shows currently applied filters and allows removal
 */

'use client'

import * as React from "react"
import { X } from "lucide-react"
import type { DropdownFilterOption } from "../types"

//////////////////////////////////
// Type Definitions
//////////////////////////////////

interface ActiveFiltersSectionProps {
  /**
   * Currently active filter values
   * WHY: Show which filters are currently applied
   * HOW: Array of filter value strings
   */
  activeFilters: string[]
  
  /**
   * Filter options for formatting display values
   * WHY: Need raw values to format display text
   * HOW: Used to look up rawValue for formatDisplayValue
   */
  filteredOptions: DropdownFilterOption[]
  
  /**
   * Optional formatter for display values
   * WHY: Customize how filter values are displayed
   * HOW: Function that converts raw value to display string
   */
  formatDisplayValue?: (value: any) => string
  
  /**
   * Callback to remove a single filter
   * WHY: Allow user to remove individual filters
   * HOW: Called with filter value to remove
   */
  onRemoveFilter: (filterValue: string) => void
  
  /**
   * Callback to clear all filters
   * WHY: Allow user to clear all filters at once
   * HOW: Called when "Clear All" is clicked
   */
  onClearFilters: () => void
  
  /**
   * Whether to show badges section
   * WHY: Control visibility of active filters
   * HOW: If false, section is not rendered
   */
  showBadges: boolean
}

//////////////////////////////////
// Component Implementation
//////////////////////////////////

/**
 * ActiveFiltersSection component - active filter badges
 * WHY: Shows currently applied filters with exact styling from StandardFilterDropdown
 * HOW: Renders badges with remove buttons, matches old component exactly
 * @param {ActiveFiltersSectionProps} props - Component props
 * @returns {React.ReactElement | null} Active filters section or null
 */
export function ActiveFiltersSection({
  activeFilters,
  filteredOptions,
  formatDisplayValue,
  onRemoveFilter,
  onClearFilters,
  showBadges
}: ActiveFiltersSectionProps) {
  // Don't render if no active filters or showBadges is false
  if (!showBadges || activeFilters.length === 0) {
    return null
  }
  
  return (
    <div className="p-3 pb-2 bg-foreground/5 border-b border-border dark:border-border/50">
      <div className="flex items-center justify-between">
        <div className="text-xs mb-1 text-foreground">Active Filters:</div>
        <button 
          className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
          onClick={onClearFilters}
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap mt-1 max-h-16 overflow-y-auto pr-1">
        {activeFilters.map((filter, index) => {
          // Find the raw value from filteredOptions to properly format the badge
          const option = filteredOptions.find(opt => opt.value === String(filter))
          const rawValue = option?.rawValue ?? filter
          
          // Format the display value using the raw value if formatter is available
          const displayValue = formatDisplayValue ? formatDisplayValue(rawValue) : String(filter)
          
          return (
            <span 
              key={index} 
              className="text-xs inline-flex items-center bg-tertiary/50 border border-tertiary/20 text-background rounded px-1 py-0.5 mr-1 mb-1"
            >
              {displayValue}
              <button 
                className="ml-1 hover:bg-tertiary/30 rounded-full cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveFilter(filter)
                }}
              >
                <X size={12}/>
              </button>
            </span>
          )
        })}
      </div>
    </div>
  )
}
