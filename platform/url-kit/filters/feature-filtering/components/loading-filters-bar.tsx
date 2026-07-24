/**
 * Loading Filters Bar Component
 * 
 * Purpose: Shows loading state for FiltersBar while options are being fetched
 * Used in: Pages that need to load filter options dynamically
 * Why: Provides visual feedback while filter options are loading
 * 
 * Function Index:
 * - LoadingFiltersBar: Component that renders skeleton loaders for filters
 *   Example input: <LoadingFiltersBar />
 *   Example output: Skeleton loaders matching FiltersBar layout
 * 
 * Steps:
 * 1. Render skeleton loaders
 * 2. Match FiltersBar layout (flex gap-2 flex-wrap)
 * 3. Use animate-pulse for loading effect
 */

import React from "react"

/**
 * LoadingFiltersBar component
 * WHY: Provides loading state while filter options are being fetched
 * HOW: Renders skeleton loaders matching FiltersBar layout
 * @returns {React.ReactElement} Container with skeleton filter loaders
 */
export function LoadingFiltersBar() {
  return (
    <div className="flex gap-2 flex-wrap">
      {/* Render skeleton loaders for filters */}
      {/* WHY: Show loading state while options are being fetched */}
      {/* HOW: Use animate-pulse with muted background */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-10 w-32 animate-pulse rounded-md bg-muted"
          aria-label="Loading filter"
        />
      ))}
    </div>
  )
}
