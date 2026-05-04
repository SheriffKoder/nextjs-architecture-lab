/**
 * Year Time Calculator
 * 
 * Purpose: Centralizes year-level position calculations for unified grid in Year/Month/Week views
 * Used in: timeline-row.tsx, year-month-week-view.tsx
 * Why: Single responsibility - handles unified grid position calculations across multiple years
 * 
 * Features:
 * - Converts dates to grid cell positions in unified grid (with year offset)
 * - Calculates spans across multiple years
 * - Handles leap years (365 vs 366 days)
 * - Supports Year, Month, and Week views (all use day cells)
 */

/**
 * Gets the number of days in a year (handles leap years)
 */
export const getDaysInYear = (year: number): number => {
  return new Date(year, 2, 0).getDate() === 29 ? 366 : 365
}

/**
 * Calculates the cumulative offset (in days) for a year index in a years array
 * Returns the total number of days before this year starts
 * 
 * @param yearIndex - Index of the year in yearsInRange (0-based)
 * @param yearsInRange - Array of years in the timeline
 * @returns Cumulative days offset (number of days in all previous years)
 */
export const calculateYearOffset = (
  yearIndex: number,
  yearsInRange: number[]
): number => {
  if (yearIndex <= 0) return 0
  
  let offset = 0
  for (let i = 0; i < yearIndex; i++) {
    offset += getDaysInYear(yearsInRange[i])
  }
  return offset
}

/**
 * Converts a date to a grid cell position (1-based) in a unified grid spanning multiple years
 * Position = (year_offset + days_before_month + day) + 1
 * 
 * @param date - The date to convert
 * @param yearsInRange - Array of all years in the timeline
 * @returns Grid position (1-based) in unified grid, or 0 if date is outside range
 */
export const dateToUnifiedYearPosition = (
  date: Date,
  yearsInRange: number[]
): number => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 1-12
  const day = date.getDate()
  
  // Find which year in the range this date belongs to
  const yearIndex = yearsInRange.findIndex(y => y === year)
  if (yearIndex === -1) {
    return 0 // Date doesn't belong to any year in range
  }
  
  // Calculate position within the year (days before this month + day)
  let positionWithinYear = 0
  
  // Count days in all months before this month
  for (let monthIndex = 1; monthIndex < month; monthIndex++) {
    positionWithinYear += new Date(year, monthIndex, 0).getDate()
  }
  
  // Add the day (offset by 1 for 1-based grid)
  positionWithinYear += day
  
  // Calculate unified position: (year_offset * days) + position_within_year
  const yearOffset = calculateYearOffset(yearIndex, yearsInRange)
  const unifiedPosition = yearOffset + positionWithinYear
  
  return unifiedPosition
}

/**
 * Converts a unified grid position (1-based) back to a Date within yearsInRange
 * If position is out of bounds, clamps to range edges.
 * used for resize-ghost overlays
 */
export const unifiedYearPositionToDate = (
  position: number,
  yearsInRange: number[]
): Date => {
  if (yearsInRange.length === 0) return new Date(NaN)
  if (position < 1) position = 1
  // Determine which year bucket this position falls into
  let remaining = position
  for (let i = 0; i < yearsInRange.length; i++) {
    const year = yearsInRange[i]
    const daysInYear = getDaysInYear(year)
    if (remaining <= daysInYear) {
      // remaining is day-of-year (1-based)
      // Convert day-of-year to month/day
      let dayOfYear = remaining
      for (let month = 0; month < 12; month++) {
        const dim = new Date(year, month + 1, 0).getDate()
        if (dayOfYear <= dim) {
          return new Date(year, month, dayOfYear)
        }
        dayOfYear -= dim
      }
      // Fallback end of year
      return new Date(year, 11, 31)
    }
    remaining -= daysInYear
  }
  // Beyond last year -> clamp to last day
  const lastYear = yearsInRange[yearsInRange.length - 1]
  return new Date(lastYear, 11, 31)
}

/**
 * Calculates the effective start position for a timeline item in a unified grid
 * If the item starts before the first year, returns position 1
 * If the item starts within range, returns the unified position
 * 
 * @param itemStartDate - When the timeline item starts
 * @param yearsInRange - Array of all years in the unified grid
 * @returns Grid position (1-based) in unified grid
 */
export const getUnifiedYearStartPosition = (
  itemStartDate: Date,
  yearsInRange: number[]
): number => {
  if (yearsInRange.length === 0) return 0
  
  const firstYear = yearsInRange[0]
  const firstDayOfFirstYear = new Date(firstYear, 0, 1) // January 1st
  
  // If item starts before first year, start at position 1
  if (itemStartDate < firstDayOfFirstYear) {
    return 1
  }
  
  return dateToUnifiedYearPosition(itemStartDate, yearsInRange)
}

/**
 * Calculates the effective end position for a timeline item in a unified grid
 * If the item ends after the last year, returns the last cell
 * If the item ends within range, returns the unified position
 * 
 * @param itemEndDate - When the timeline item ends
 * @param yearsInRange - Array of all years in the unified grid
 * @returns Grid position (1-based) in unified grid
 */
export const getUnifiedYearEndPosition = (
  itemEndDate: Date,
  yearsInRange: number[]
): number => {
  if (yearsInRange.length === 0) return 0
  
  const lastYear = yearsInRange[yearsInRange.length - 1]
  const lastDayOfLastYear = new Date(lastYear, 11, 31) // December 31st
  lastDayOfLastYear.setHours(23, 59, 59, 999)
  
  // If item ends after last year, use the last cell
  if (itemEndDate > lastDayOfLastYear) {
    // Calculate total cells: sum of all years' days
    const totalDays = yearsInRange.reduce((sum, year) => sum + getDaysInYear(year), 0)
    return totalDays
  }
  
  const endPos = dateToUnifiedYearPosition(itemEndDate, yearsInRange)
  if (endPos === 0) {
    // Fallback to last cell if position calculation failed
    const totalDays = yearsInRange.reduce((sum, year) => sum + getDaysInYear(year), 0)
    return totalDays
  }
  
  return endPos
}

/**
 * Calculates the grid span (number of cells) for a timeline item in a unified grid
 * 
 * @param itemStartDate - When the timeline item starts
 * @param itemEndDate - When the timeline item ends
 * @param yearsInRange - Array of all years in the unified grid
 * @returns Number of cells the item spans in unified grid (at least 1)
 */
export const calculateUnifiedYearSpan = (
  itemStartDate: Date,
  itemEndDate: Date,
  yearsInRange: number[]
): number => {
  if (yearsInRange.length === 0) return 0
  
  const firstYear = yearsInRange[0]
  const lastYear = yearsInRange[yearsInRange.length - 1]
  const firstDayOfFirstYear = new Date(firstYear, 0, 1)
  const lastDayOfLastYear = new Date(lastYear, 11, 31)
  lastDayOfLastYear.setHours(23, 59, 59, 999)
  
  // Check if item overlaps with the range
  if (itemEndDate < firstDayOfFirstYear || itemStartDate > lastDayOfLastYear) {
    return 0 // Item doesn't overlap the range
  }
  
  const startPos = getUnifiedYearStartPosition(itemStartDate, yearsInRange)
  const endPos = getUnifiedYearEndPosition(itemEndDate, yearsInRange)
  
  // If positions are invalid, return 0
  if (startPos === 0 || endPos === 0) {
    return 0
  }
  
  // Span is the difference + 1 (endPos is inclusive)
  return Math.max(1, endPos - startPos + 1)
}

