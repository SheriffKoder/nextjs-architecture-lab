/**
 * Visible Day Calculator Utilities
 * 
 * Purpose: Calculate which days are visible in viewport based on scroll position (for Day view)
 * Used in: use-visible-days.ts hook
 * Why: Enables day-level virtualization for Day view with 100+ days
 * 
 * Function Index:
 * - calculateDayPositions: Calculates x-position and width for each day
 * - calculateVisibleDays: Determines which days are in viewport (with overscan)
 * - isDayVisible: Checks if a specific day is in visible range
 * - formatDayKey: Formats date to YYYY-MM-DD string key
 * 
 * Example input:
 * - daysInRange: [Date(2024-05-01), Date(2024-05-02), ...]
 * - scrollOffset: 12000px
 * - viewportWidth: 1200px
 * - hourColumnWidth: 200px
 * 
 * Example output:
 * - visibleDays: [Date(2024-05-03), Date(2024-05-04), ...] (with overscan)
 * - dayPositions: Map { '2024-05-03': {startX: 11520, width: 4800}, ... }
 * 
 * Steps:
 * 1. Calculate width for each day (24 hours * hourColumnWidth)
 * 2. Build cumulative position map (each day's startX)
 * 3. Determine visible range based on scroll + viewport
 * 4. Apply overscan buffer (7 days on each side)
 */

import { HOURS } from '../../utils/days/hours'
import { DayPosition } from '../context/visible-range-context'

//////////////////////////////////
// Day Key Formatting: Create consistent string keys for dates
//////////////////////////////////

/**
 * formatDayKey
 * 
 * Purpose: Convert Date object to consistent YYYY-MM-DD string key
 * 
 * @param date - Date object to format
 * @returns String in format 'YYYY-MM-DD'
 * 
 * Why: Map keys need consistent format for lookups
 * Example: Date(2024-05-03) → '2024-05-03'
 */
export const formatDayKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

//////////////////////////////////
// Day Position Calculation: Build position map for all days
//////////////////////////////////

/**
 * calculateDayPositions
 * 
 * Purpose: Calculate x-position and width for each day in Day view
 * 
 * @param daysInRange - Array of all days in timeline
 * @param hourColumnWidth - Width of each hour column (default: 200px)
 * @returns Map of day key (YYYY-MM-DD) to {startX, width}
 * 
 * Why: Each day has same width (24 hours), but positions are cumulative
 * How: Calculate width as 24 hours * hourColumnWidth, then track cumulative x
 * 
 * Performance: O(n) where n is number of days
 */
export const calculateDayPositions = (
  daysInRange: Date[],
  hourColumnWidth: number = 200
): Map<string, DayPosition> => {
  const positions = new Map<string, DayPosition>()
  
  // Day width = 24 hours * width per hour
  const dayWidth = HOURS.length * hourColumnWidth
  let cumulativeX = 0 // Track running x-position
  
  // Calculate position for each day sequentially
  daysInRange.forEach(day => {
    const dayKey = formatDayKey(day)
    
    // Store position data for this day
    positions.set(dayKey, {
      startX: cumulativeX,
      width: dayWidth
    })
    
    // Update cumulative position for next day
    cumulativeX += dayWidth
  })
  
  return positions
}

//////////////////////////////////
// Visible Days Calculation: Determine which days are in viewport
//////////////////////////////////

/**
 * calculateVisibleDays
 * 
 * Purpose: Determine which days are visible in current viewport
 * 
 * @param daysInRange - Array of all days in timeline
 * @param dayPositions - Map of day positions from calculateDayPositions()
 * @param scrollOffset - Current horizontal scroll position (scrollLeft)
 * @param viewportWidth - Width of visible viewport
 * @param overscanCount - Number of days to include before/after visible (buffer)
 * @returns Array of visible dates including overscan
 * 
 * Why useMemo recommended: Recalculates only when scroll/viewport changes
 * How it helps: Prevents unnecessary re-renders of day cells and timeline rows
 * 
 * Example:
 * - scrollOffset: 12000px
 * - viewportWidth: 1200px
 * - dayWidth: 4800px (24 hours * 200px)
 * - visible range: 12000px to 13200px
 * - overscanCount: 3 days (optimized for performance)
 */
export const calculateVisibleDays = (
  daysInRange: Date[],
  dayPositions: Map<string, DayPosition>,
  scrollOffset: number,
  viewportWidth: number,
  overscanCount: number = 7
): Date[] => {
  // Calculate viewport boundaries
  const viewportStart = scrollOffset
  const viewportEnd = scrollOffset + viewportWidth
  
  // Find days that intersect with viewport
  const visibleDays: Date[] = []
  
  daysInRange.forEach(day => {
    const dayKey = formatDayKey(day)
    const position = dayPositions.get(dayKey)
    if (!position) return
    
    const dayStart = position.startX
    const dayEnd = position.startX + position.width
    
    // Check if day overlaps with viewport (even partially)
    const isVisible = dayEnd >= viewportStart && dayStart <= viewportEnd
    
    if (isVisible) {
      visibleDays.push(day)
    }
  })
  
  // Apply overscan buffer: add days before and after visible range
  if (visibleDays.length > 0) {
    const firstVisibleIndex = daysInRange.findIndex(
      d => formatDayKey(d) === formatDayKey(visibleDays[0])
    )
    const lastVisibleIndex = daysInRange.findIndex(
      d => formatDayKey(d) === formatDayKey(visibleDays[visibleDays.length - 1])
    )
    
    // Add days before (overscan left)
    const startIndex = Math.max(0, firstVisibleIndex - overscanCount)
    for (let i = startIndex; i < firstVisibleIndex; i++) {
      if (!visibleDays.some(d => formatDayKey(d) === formatDayKey(daysInRange[i]))) {
        visibleDays.unshift(daysInRange[i])
      }
    }
    
    // Add days after (overscan right)
    const endIndex = Math.min(daysInRange.length - 1, lastVisibleIndex + overscanCount)
    for (let i = lastVisibleIndex + 1; i <= endIndex; i++) {
      if (!visibleDays.some(d => formatDayKey(d) === formatDayKey(daysInRange[i]))) {
        visibleDays.push(daysInRange[i])
      }
    }
  }
  
  return visibleDays
}

//////////////////////////////////
// Helper Functions: Utility functions for day visibility checks
//////////////////////////////////

/**
 * isDayVisible
 * 
 * Purpose: Check if a specific day is in the visible range
 * 
 * @param day - Date to check
 * @param visibleDays - Array of currently visible days
 * @returns true if day is visible, false otherwise
 * 
 * Use case: Determine if day should be fully rendered or show spacer
 */
export const isDayVisible = (
  day: Date,
  visibleDays: Date[]
): boolean => {
  const dayKey = formatDayKey(day)
  return visibleDays.some(d => formatDayKey(d) === dayKey)
}

/**
 * getDayStartPosition
 * 
 * Purpose: Get the x-position where a day starts
 * 
 * @param day - Date to lookup
 * @param dayPositions - Map of day positions
 * @returns Starting x position in pixels, or 0 if not found
 */
export const getDayStartPosition = (
  day: Date,
  dayPositions: Map<string, DayPosition>
): number => {
  const dayKey = formatDayKey(day)
  const position = dayPositions.get(dayKey)
  return position ? position.startX : 0
}

/**
 * getDayWidth
 * 
 * Purpose: Get the total width of a specific day
 * 
 * @param day - Date to lookup
 * @param dayPositions - Map of day positions
 * @returns Width in pixels, or 0 if not found
 */
export const getDayWidth = (
  day: Date,
  dayPositions: Map<string, DayPosition>
): number => {
  const dayKey = formatDayKey(day)
  const position = dayPositions.get(dayKey)
  return position ? position.width : 0
}

