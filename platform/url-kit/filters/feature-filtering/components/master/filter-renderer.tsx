/**
 * Filter Renderer Component
 * 
 * Purpose: Routes filter configuration to the correct filter component based on type
 * Used in: FiltersBar to render the appropriate filter component for each filter config
 * Why: Provides a single point of routing logic, making it easy to add new filter types
 * 
 * Function Index:
 * - FilterRenderer: Component that switches on filter type and renders appropriate filter
 *   Example input: <FilterRenderer filter={filterConfig} />
 *   Example output: Rendered filter component (MultiSelectFilter, SingleSelectFilter, etc.)
 * 
 * Steps:
 * 1. Accept filter config as prop
 * 2. Switch on filter.type
 * 3. Return appropriate filter component based on type
 * 4. Return null for unknown types
 */

'use client'
import * as React from "react"
import { FilterConfig } from "../filter-types"
import { MultiSelectFilter } from "../filter-items/multi-select-filter"
import { SingleSelectFilter } from "../filter-items/single-select-filter"
import { DateRangeFilter } from "../filter-items/date-range-filter"
import { NumberRangeFilter } from "../filter-items/number-range-filter"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface FilterRendererProps {
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
 * FilterRenderer component - routes to correct filter component
 * WHY: Centralizes routing logic for filter types
 * HOW: Uses switch statement to render appropriate component based on filter.type
 * @param {FilterRendererProps} props - Component props containing filter config
 * @returns {React.ReactElement | null} Rendered filter component or null
 */
export function FilterRenderer({ filter, showInitialCount = false }: FilterRendererProps) {
  // Switch on filter type to render appropriate component
  // WHY: Type-safe routing ensures correct component for each filter type
  // HOW: Each case returns the matching filter component
  switch (filter.type) {
    case "multi-select":
      return <MultiSelectFilter filter={filter} showInitialCount={showInitialCount} />

    case "single-select":
      return <SingleSelectFilter filter={filter} showInitialCount={showInitialCount} />

    case "date-range":
      return <DateRangeFilter filter={filter} showInitialCount={showInitialCount} />

    case "number-range":
      return <NumberRangeFilter filter={filter} showInitialCount={showInitialCount} />

    default:
      // Return null for unknown filter types
      // WHY: Prevents rendering errors for invalid filter types
      // HOW: TypeScript should catch this, but provides runtime safety
      return null
  }
}
