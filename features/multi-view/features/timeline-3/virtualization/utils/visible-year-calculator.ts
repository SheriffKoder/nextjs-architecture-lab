/**
 * Visible Year Calculator Utilities
 * 
 * Purpose: Calculate which years are visible in viewport based on scroll position
 * Used in: use-visible-years.ts hook
 * Why: Enables year-level virtualization by determining visible range from scroll data
 * 
 * Function Index:
 * - calculateYearPositions: Calculates x-position and width for each year
 * - calculateVisibleYears: Determines which years are in viewport (with overscan)
 * - isYearVisible: Checks if a specific year is in visible range
 * 
 * Example input: 
 * - yearsInRange: [2020, 2021, 2022, 2023, 2024, 2025]
 * - scrollOffset: 5000px
 * - viewportWidth: 1200px
 * - view: 'Month'
 * 
 * Example output:
 * - visibleYears: [2021, 2022, 2023] (2022 is visible, 2021/2023 are overscan)
 * - yearPositions: Map { 2020: {startX: 0, width: 2555}, ... }
 * 
 * Steps:
 * 1. Calculate precise width for each year using existing utilities
 * 2. Build cumulative position map (each year's startX)
 * 3. Determine visible range based on scroll + viewport
 * 4. Apply overscan buffer (1 year on each side)
 */

import { getMonthWidths, getTotalYearWidth } from '../../utils/year/month-width-calculator'
import { YearPosition } from '../context/visible-range-context'

//////////////////////////////////
// Year Position Calculation: Build position map for all years
//////////////////////////////////

/**
 * calculateYearPositions
 * 
 * Purpose: Calculate x-position and width for each year in timeline
 * 
 * @param yearsInRange - Array of all years in timeline (e.g., [2020, 2021, 2022])
 * @param view - Current view mode ('Year' | 'Month' | 'Week')
 * @param yearWeekWidth - Width of week cell in Year view (default: 50px)
 * @param monthDayWidth - Width of day cell in Month view (default: 50px)
 * @param weekDayWidth - Width of day cell in Week view (default: 150px)
 * @returns Map of year to {startX, width}
 * 
 * Why: Each year has different width (365 vs 366 days, leap years)
 * How: Uses existing getMonthWidths() and getTotalYearWidth() for precision
 */
export const calculateYearPositions = (
  yearsInRange: number[],
  view: 'Year' | 'Month' | 'Week',
  yearWeekWidth: number = 50,
  monthDayWidth: number = 50,
  weekDayWidth: number = 150
): Map<number, YearPosition> => {
  const positions = new Map<number, YearPosition>()
  let cumulativeX = 0 // Track running x-position
  
  // Calculate position for each year sequentially
  yearsInRange.forEach(year => {
    // Get month widths for this specific year (handles leap years, different month lengths)
    const monthWidths = view === 'Week'
      ? getMonthWidths(year, view, yearWeekWidth, monthDayWidth, weekDayWidth)
      : getMonthWidths(year, view, yearWeekWidth, monthDayWidth)
    
    // Sum month widths to get total year width
    const yearWidth = getTotalYearWidth(monthWidths)
    
    // Store position data for this year
    positions.set(year, {
      startX: cumulativeX,
      width: yearWidth
    })
    
    // Update cumulative position for next year
    cumulativeX += yearWidth
  })
  
  return positions
}

//////////////////////////////////
// Visible Years Calculation: Determine which years are in viewport
//////////////////////////////////

/**
 * calculateVisibleYears
 * 
 * Purpose: Determine which years are visible in current viewport
 * 
 * @param yearPositions - Map of year positions from calculateYearPositions()
 * @param scrollOffset - Current horizontal scroll position (scrollLeft)
 * @param viewportWidth - Width of visible viewport
 * @param overscanCount - Number of years to include before/after visible (buffer)
 * @returns Array of visible years including overscan
 * 
 * Why useMemo recommended: Recalculates only when scroll/viewport changes
 * How it helps: Prevents unnecessary re-renders of timeline rows
 * 
 * Example:
 * - scrollOffset: 5000px
 * - viewportWidth: 1200px
 * - visible range: 5000px to 6200px
 * - overscanCount: 1 (include 1 year before and after)
 */
export const calculateVisibleYears = (
  yearPositions: Map<number, YearPosition>,
  scrollOffset: number,
  viewportWidth: number,
  overscanCount: number = 1
): number[] => {
  // Calculate viewport boundaries
  const viewportStart = scrollOffset
  const viewportEnd = scrollOffset + viewportWidth
  
  // Debug in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Calculate Visible Years:', {
      scrollOffset,
      viewportWidth,
      viewportStart,
      viewportEnd,
      totalYears: yearPositions.size
    })
  }
  
  // Find years that intersect with viewport
  const visibleYears: number[] = []
  const sortedYears = Array.from(yearPositions.keys()).sort((a, b) => a - b)
  
  sortedYears.forEach(year => {
    const position = yearPositions.get(year)
    if (!position) return
    
    const yearStart = position.startX
    const yearEnd = position.startX + position.width
    
    // Check if year overlaps with viewport (even partially)
    const isVisible = yearEnd >= viewportStart && yearStart <= viewportEnd
    
    // Debug in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`  Year ${year}: start=${yearStart}, end=${yearEnd}, width=${position.width}, visible=${isVisible}`)
    }
    
    if (isVisible) {
      visibleYears.push(year)
    }
  })
  
  // Apply overscan buffer: add years before and after visible range
  if (visibleYears.length > 0) {
    const firstVisible = visibleYears[0]
    const lastVisible = visibleYears[visibleYears.length - 1]
    
    // Add years before (overscan left)
    for (let i = 1; i <= overscanCount; i++) {
      const beforeYear = firstVisible - i
      if (sortedYears.includes(beforeYear) && !visibleYears.includes(beforeYear)) {
        visibleYears.unshift(beforeYear)
      }
    }
    
    // Add years after (overscan right)
    for (let i = 1; i <= overscanCount; i++) {
      const afterYear = lastVisible + i
      if (sortedYears.includes(afterYear) && !visibleYears.includes(afterYear)) {
        visibleYears.push(afterYear)
      }
    }
  }
  
  const result = visibleYears.sort((a, b) => a - b)
  
  // Debug in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Visible Years Result:', result)
  }
  
  return result
}

//////////////////////////////////
// Helper Functions: Utility functions for year visibility checks
//////////////////////////////////

/**
 * isYearVisible
 * 
 * Purpose: Check if a specific year is in the visible range
 * 
 * @param year - Year to check
 * @param visibleYears - Array of currently visible years
 * @returns true if year is visible, false otherwise
 * 
 * Use case: Determine if year should be fully rendered or show spacer
 */
export const isYearVisible = (
  year: number,
  visibleYears: number[]
): boolean => {
  return visibleYears.includes(year)
}

/**
 * getYearStartPosition
 * 
 * Purpose: Get the x-position where a year starts
 * 
 * @param year - Year to lookup
 * @param yearPositions - Map of year positions
 * @returns Starting x position in pixels, or 0 if not found
 */
export const getYearStartPosition = (
  year: number,
  yearPositions: Map<number, YearPosition>
): number => {
  const position = yearPositions.get(year)
  return position ? position.startX : 0
}

/**
 * getYearWidth
 * 
 * Purpose: Get the total width of a specific year
 * 
 * @param year - Year to lookup
 * @param yearPositions - Map of year positions
 * @returns Width in pixels, or 0 if not found
 */
export const getYearWidth = (
  year: number,
  yearPositions: Map<number, YearPosition>
): number => {
  const position = yearPositions.get(year)
  return position ? position.width : 0
}

