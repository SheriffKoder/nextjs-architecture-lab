/**
 * Filter Options Panel Component
 * 
 * Purpose: Displays filter options for the active filter on the right side
 * Used in: PillFilter component for right side of split layout
 * Why: Shows filter options only for the currently active filter
 * 
 * Features:
 * - Only renders options for active filter (conditional rendering)
 * - Reuses existing FilterRendererList component
 * - Proper spacing and layout
 */

'use client'

import * as React from "react"
import { FilterConfig } from "../filter-types"
import { FilterRendererList } from "./filter-list-items/filter-renderer-list"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface FilterOptionsPanelProps {
  /**
   * Filter configurations
   * WHY: Provides all filters to potentially render
   * HOW: Array of FilterConfig objects
   */
  filters: FilterConfig[]
  
  /**
   * Currently active filter key
   * WHY: Need to show only the active filter's options
   * HOW: Compare with filter.key to determine which to render
   */
  activeFilterKey: string | null
  
  /**
   * Whether to display initial count alongside count
   * WHY: Show both count and initialCount in format "count / initialCount"
   * HOW: If true, displays "count / initialCount"; if false, displays only "count"
   * Default: false
   */
  showInitialCount?: boolean
}

/**
 * FilterOptionsPanel component - shows filter options for active filter
 * WHY: Provides right side panel with filter options in pill dropdown
 * HOW: Finds active filter and conditionally renders only that filter's options
 * @param {FilterOptionsPanelProps} props - Component props
 * @returns {React.ReactElement} Panel with active filter options
 */
export function FilterOptionsPanel({
  filters,
  activeFilterKey,
  showInitialCount = false,
}: FilterOptionsPanelProps) {
  // Find the active filter
  // WHY: Need to render only the active filter's options
  // HOW: Find filter where key matches activeFilterKey
  const activeFilter = filters.find((filter) => filter.key === activeFilterKey)
  
  return (
    <div className="flex-1 space-y-2 lg:space-y-4">
      {/* Conditionally render only the active filter */}
      {/* WHY: Only show options for the selected filter on the left */}
      {/* HOW: Render FilterRendererList only if activeFilter exists */}
      {activeFilter ? (
        <FilterRendererList filter={activeFilter} showInitialCount={showInitialCount} />
      ) : (
        <div className="p-4 text-center text-muted-foreground text-xs">
          Select a filter to see options
        </div>
      )}
    </div>
  )
}
