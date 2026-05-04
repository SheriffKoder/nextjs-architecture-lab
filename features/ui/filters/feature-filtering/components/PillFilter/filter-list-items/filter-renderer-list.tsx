/**
 * Filter Renderer List Component
 * 
 * Purpose: Routes filter configuration to the correct list-based filter component
 * Used in: PillFilter filter options panel
 * Why: Provides list-based rendering instead of dropdowns
 * 
 * Features:
 * - Routes to list components based on filter type
 * - Reuses range filters (they're already list-like)
 */

'use client'

import * as React from "react"
import { FilterConfig } from "../../filter-types"
import { MultiSelectFilterList } from "./multi-select-filter-list"
import { SingleSelectFilterList } from "./single-select-filter-list"
import { DateRangeFilterList } from "./date-range-filter-list"
import { NumberRangeFilterList } from "./number-range-filter-list"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface FilterRendererListProps {
  /**
   * Filter configuration to render
   * WHY: Contains all information needed to render the correct filter component
   * HOW: Includes type, key, label, and optional options
   */
  filter: FilterConfig
  
  /**
   * Whether to display initial count alongside count
   * WHY: Show both count and initialCount in format "count / initialCount"
   * HOW: If true, displays "count / initialCount"; if false, displays only "count"
   * Default: false
   */
  showInitialCount?: boolean
}

/**
 * FilterRendererList component - routes to correct list-based filter component
 * WHY: Centralizes routing logic for filter types in list format
 * HOW: Uses switch statement to render appropriate list component based on filter.type
 * @param {FilterRendererListProps} props - Component props containing filter config
 * @returns {React.ReactElement | null} Rendered filter component or null
 */
export function FilterRendererList({ filter, showInitialCount = false }: FilterRendererListProps) {
  // Switch on filter type to render appropriate list component
  // WHY: Type-safe routing ensures correct component for each filter type
  // HOW: Each case returns the matching list filter component
  switch (filter.type) {
    case "multi-select":
      return <MultiSelectFilterList filter={filter} showInitialCount={showInitialCount} />

    case "single-select":
      return <SingleSelectFilterList filter={filter} showInitialCount={showInitialCount} />

    case "date-range":
      // Use list-based date range filter
      return <DateRangeFilterList filter={filter} showInitialCount={showInitialCount} />

    case "number-range":
      // Use list-based number range filter
      return <NumberRangeFilterList filter={filter} showInitialCount={showInitialCount} />

    default:
      // Return null for unknown filter types
      // WHY: Prevents rendering errors for invalid filter types
      // HOW: TypeScript should catch this, but provides runtime safety
      return null
  }
}
