/**
 * Filters Bar Component
 * 
 * Purpose: Main container component that renders all filters in a horizontal bar
 * Used in: Pages that need filtering functionality (tasks, users, invoices, etc.)
 * Why: Provides a single component to render multiple filters with consistent layout
 * 
 * Function Index:
 * - FiltersBar: Main component that maps over filters and renders FilterRenderer for each
 *   Example input: <FiltersBar filters={filterConfigs} />
 *   Example output: Horizontal bar with all filter components rendered
 * 
 * Steps:
 * 1. Accept filters array as prop
 * 2. Map over filters array
 * 3. Render FilterRenderer for each filter with unique key
 * 4. Apply flex layout for horizontal arrangement
 */

'use client'

import * as React from "react"
import { FilterConfig } from "../filter-types"
import { FilterRenderer } from "./filter-renderer"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface FiltersBarProps {
  /**
   * Array of filter configurations to render
   * WHY: Allows pages to define filters declaratively
   * HOW: Each config defines a filter's type, key, label, and options
   */
  filters: FilterConfig[]
  
  /**
   * Whether to display initial count alongside count
   * WHY: Show both count and initialCount in format "count / initialCount"
   * HOW: If true, displays "count / initialCount"; if false, displays only "count"
   * Default: false
   */
  showInitialCount?: boolean
}

/**
 * FiltersBar component - renders all filters in a horizontal bar
 * WHY: Single component to render multiple filters with consistent layout
 * HOW: Maps over filters array and renders FilterRenderer for each
 * @param {FiltersBarProps} props - Component props containing filters array
 * @returns {React.ReactElement} Container with all filter components
 */
export function FiltersBar({ filters, showInitialCount = false }: FiltersBarProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {/* Map over filters array and render each filter */}
      {filters.map(filter => (
        <FilterRenderer key={filter.key} filter={filter} showInitialCount={showInitialCount}/>
      ))}
    </div>
  )
}
