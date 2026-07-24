/**
 * Visible Range Context
 * 
 * Purpose: Provides scroll position and visible year/day range information to timeline components
 * Used in: timeline-container.tsx, year-month-week-view.tsx, day-view.tsx, timeline-row.tsx
 * Why: Enables horizontal virtualization by sharing which years/days are visible in viewport
 * 
 * Context Structure:
 * - visibleYears: Array of years currently visible (with overscan buffer)
 * - visibleDays: Array of days currently visible (with overscan buffer)
 * - allYears: Complete array of years in timeline
 * - allDays: Complete array of days in timeline
 * - scrollOffset: Current horizontal scroll position in pixels
 * - viewportWidth: Width of visible viewport in pixels
 * - yearPositions: Map of each year to its x-position and width
 * - dayPositions: Map of each day to its x-position and width
 * - expandVisibleRange: Function to dynamically expand range during drag operations
 * 
 * Steps:
 * 1. Define TypeScript interfaces for type safety
 * 2. Create context with default values
 * 3. Export context and consumer hook
 * 4. Provider component wraps timeline and provides scroll data
 */

"use client"

import React, { createContext, useContext } from 'react'

//////////////////////////////////
// Type Definitions: Define interfaces for visible range data
//////////////////////////////////

/**
 * Position metadata for a single year
 * startX: Starting pixel position in horizontal scroll
 * width: Total width in pixels for this year
 */
export interface YearPosition {
  startX: number
  width: number
}

/**
 * Position metadata for a single day
 * startX: Starting pixel position in horizontal scroll
 * width: Total width in pixels for this day
 */
export interface DayPosition {
  startX: number
  width: number
}

/**
 * Complete visible range state provided to all timeline components
 */
export interface VisibleRangeState {
  // Year-level virtualization (for Year/Month/Week views)
  visibleYears: number[]                      // Years in viewport + overscan
  allYears: number[]                          // All years in timeline data
  yearPositions: Map<number, YearPosition>    // Position lookup for each year
  
  // Day-level virtualization (for Day view)
  visibleDays: Date[]                         // Days in viewport + overscan
  allDays: Date[]                             // All days in timeline data
  dayPositions: Map<string, DayPosition>      // Position lookup for each day (key: YYYY-MM-DD)
  
  // Horizontal scroll metadata
  scrollOffset: number                        // Current scroll left position
  viewportWidth: number                       // Visible viewport width
  
  // Vertical scroll metadata (for row virtualization)
  scrollTop: number                           // Current scroll top position
  viewportHeight: number                      // Visible viewport height
  
  // Row virtualization
  visibleRowIndices: number[]                 // Row indices in viewport + overscan
  totalRows: number                           // Total number of rows in data
  
  // Dynamic range expansion for drag operations
  expandVisibleRange: (targetYear?: number, targetDay?: Date) => void
  
  // Drag state (for optimizing droppable hook usage)
  isDragging: boolean                     // Whether any drag operation is currently active
}

//////////////////////////////////
// Context Creation: Create context with default empty state
//////////////////////////////////

const VisibleRangeContext = createContext<VisibleRangeState>({
  visibleYears: [],
  allYears: [],
  yearPositions: new Map(),
  visibleDays: [],
  allDays: [],
  dayPositions: new Map(),
  scrollOffset: 0,
  viewportWidth: 0,
  scrollTop: 0,
  viewportHeight: 0,
  visibleRowIndices: [],
  totalRows: 0,
  expandVisibleRange: () => {}, // No-op default
  isDragging: false, // Default: no drag active
})

//////////////////////////////////
// Hook Export: Provide convenient hook to consume context
//////////////////////////////////

/**
 * useVisibleRange Hook
 * 
 * Purpose: Access visible range data from any child component
 * Returns: VisibleRangeState object with scroll and visibility information
 * 
 * Example usage:
 * const { visibleYears, yearPositions } = useVisibleRange()
 */
export const useVisibleRange = () => {
  const context = useContext(VisibleRangeContext)
  
  // Verify context is available (must be inside provider)
  if (!context) {
    throw new Error('useVisibleRange must be used within VisibleRangeProvider')
  }
  
  return context
}

//////////////////////////////////
// Exports: Make context available for provider implementation
//////////////////////////////////

export default VisibleRangeContext
export { VisibleRangeContext as VisibleRangeProvider }

