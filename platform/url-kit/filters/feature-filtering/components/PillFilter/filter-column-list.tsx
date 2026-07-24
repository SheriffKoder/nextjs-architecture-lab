/**
 * Filter Column List Component
 * 
 * Purpose: Displays all filter column titles in a vertical list on the left side
 * Used in: PillFilter component for left/right split layout
 * Why: Provides a clean, organized list of all available filters
 * 
 * Features:
 * - Vertical list of all filter labels
 * - Active filter highlighting with gradient
 * - Previously selected filters with active values also highlighted
 * - Scrollable if many filters
 */

'use client'

import * as React from "react"
import { FilterConfig } from "../filter-types"
import { useUrlFilters } from "../../hooks/useUrlFilters"
import { cn } from "@/shared/lib/utils"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface FilterColumnListProps {
  /**
   * Filter configurations
   * WHY: Provides all filters to display as column titles
   * HOW: Array of FilterConfig objects
   */
  filters: FilterConfig[]
  
  /**
   * Currently active filter key
   * WHY: Need to highlight the active filter
   * HOW: Compare with filter.key to determine active state
   */
  activeFilterKey: string | null
  
  /**
   * Array of selected filter keys in order
   * WHY: Track which filters have been selected for styling
   * HOW: Used to determine if filter was previously selected
   */
  selectedFiltersOrder: string[]
  
  /**
   * Callback when a filter column is clicked
   * WHY: Need to update active filter when user clicks
   * HOW: Called with filter.key when column is clicked
   */
  onFilterClick: (filterKey: string) => void
}

/**
 * FilterColumnList component - vertical list of filter column titles
 * WHY: Provides left side navigation for filters in pill dropdown
 * HOW: Maps over filters and renders clickable buttons with state-based styling
 * @param {FilterColumnListProps} props - Component props
 * @returns {React.ReactElement} Vertical list of filter column titles
 */
export function FilterColumnList({
  filters,
  activeFilterKey,
  selectedFiltersOrder,
  onFilterClick,
}: FilterColumnListProps) {
  // Get filter functions from useUrlFilters hook
  // WHY: Need to check if each filter has active values
  // HOW: Use getters to check filter state
  const { getList, get, getRange, getNumberRange } = useUrlFilters()
  
  // Check if a filter has active values
  // WHY: Need to style filters that have active values
  // HOW: Check filter type and use appropriate getter
  const hasActiveFilter = (filter: FilterConfig): boolean => {
    if (filter.type === "multi-select") {
      return getList(filter.key).length > 0
    }
    if (filter.type === "single-select") {
      return Boolean(get(filter.key))
    }
    if (filter.type === "date-range") {
      const range = getRange(filter.key)
      return Boolean(range?.start || range?.end)
    }
    if (filter.type === "number-range") {
      const range = getNumberRange(filter.key)
      return Boolean(range?.min !== undefined || range?.max !== undefined)
    }
    return false
  }
  
  return (
    <div className="w-32 lg:w-48 flex-shrink-0">
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {filters.map((filter) => {
          const isActive = activeFilterKey === filter.key
          const hasBeenSelected = selectedFiltersOrder.includes(filter.key)
          const hasActiveFilters = hasActiveFilter(filter)
          
          // Determine styling based on state
          let buttonClasses = 'w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors'
          
          if (isActive) {
            // Currently active - gradient background, tertiary text
            buttonClasses += ' bg-gradient-to-r from-tertiary/30 to-transparent text-tertiary'
          } else if (hasBeenSelected && hasActiveFilters) {
            // Previously selected AND has active filters - lighter gradient
            buttonClasses += ' bg-gradient-to-r from-tertiary/10 to-transparent text-tertiary'
          } else {
            // Never selected OR no active filters - default styling
            buttonClasses += ' text-foreground hover:text-foreground hover:bg-gradient-to-r from-tertiary/10 to-transparent'
          }
          
          return (
            <div key={filter.key} className="flex items-center">
              <button
                onClick={() => onFilterClick(filter.key)}
                className={buttonClasses}
              >
                {filter.label}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
