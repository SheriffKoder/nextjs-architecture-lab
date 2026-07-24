/**
 * Day View Time Calculator Utility
 * 
 * Purpose: Calculate cell positions and spans for Day view based on hour:minute precision
 * Used in: components/main/timeline-row-day.tsx
 * Why: Centralized time-to-position calculations for Day view with configurable minute intervals
 * 
 * Features:
 * - Converts dates to grid cell positions (0-based hour:minute to 1-based grid position)
 * - Calculates spans across minute intervals (configurable: 5, 15, or 30 minutes)
 * - Handles cross-day spanning by calculating effective start/end for each day
 * - Normalizes minutes to interval boundaries
 * - Last cell extends to end of hour (59:59.999)
 * 
 * Configuration:
 * - MINUTE_GRANULARITY: Set in utils/timeline-config.ts (default: 5 minutes)
 * - CELLS_PER_HOUR: Calculated from granularity (5min=12, 15min=4, 30min=2)
 * - MINUTE_INTERVALS: Generated based on granularity
 */

import { MINUTE_INTERVALS, CELLS_PER_HOUR, MINUTE_GRANULARITY } from '../../virtualization/timeline-config'

// Re-export for backwards compatibility
export { MINUTE_INTERVALS, CELLS_PER_HOUR, MINUTE_GRANULARITY }

// Calculate the last minute interval (e.g., 55 for 5-min, 45 for 15-min, 30 for 30-min)
const LAST_MINUTE_INTERVAL = MINUTE_INTERVALS[MINUTE_INTERVALS.length - 1]

/**
 * Converts a date/time to a grid cell position (1-based) for Day view
 * Each hour has CELLS_PER_HOUR cells representing MINUTE_GRANULARITY intervals
 * Examples:
 *   - 5 min: 12 cells per hour (0, 5, 10, ..., 55), last cell (55) extends to 59:59.999
 *   - 15 min: 4 cells per hour (0, 15, 30, 45), last cell (45) extends to 59:59.999
 *   - 30 min: 2 cells per hour (0, 30), last cell (30) extends to 59:59.999
 * 
 * @param date - The date/time to convert
 * @param dayDate - The specific day this position is calculated for (to check if date belongs to this day)
 * @returns Grid position (1-based) or 0 if date doesn't belong to this day
 */
export const dateToCellPosition = (
  date: Date,
  dayDate: Date
): number => {
  const itemYear = date.getFullYear()
  const itemMonth = date.getMonth() + 1
  const itemDay = date.getDate()
  
  const dayYear = dayDate.getFullYear()
  const dayMonth = dayDate.getMonth() + 1
  const dayOfMonth = dayDate.getDate()
  
  // Only calculate position if this date is on this day
  if (itemYear !== dayYear || itemMonth !== dayMonth || itemDay !== dayOfMonth) {
    return 0
  }
  
  const hour = date.getHours()
  const minute = date.getMinutes()
  const seconds = date.getSeconds()
  
  // Special handling: last cell extends to 59:59.999
  // If minute is at or beyond the last interval, map to the last cell
  if (minute >= LAST_MINUTE_INTERVAL) {
    // This maps to the last cell, which represents the range from LAST_MINUTE_INTERVAL to 59:59.999
    return (hour * CELLS_PER_HOUR) + CELLS_PER_HOUR // Last cell position (1-based)
  }
  
  // Find the cell interval this minute falls into (round down to nearest interval)
  const minuteInterval = Math.floor(minute / MINUTE_GRANULARITY) * MINUTE_GRANULARITY
  
  // Calculate position: (hour * cells_per_hour) + (minuteInterval / granularity) + 1
  // We use minuteInterval / MINUTE_GRANULARITY to get the cell index within the hour
  const position = (hour * CELLS_PER_HOUR) + (minuteInterval / MINUTE_GRANULARITY) + 1
  return position
}

/**
 * Converts a date/time to a grid cell position (1-based) in a unified grid spanning multiple days
 * For unified grid: position = (day_index * cells_per_day) + hour_cell_position
 * 
 * @param date - The date/time to convert
 * @param daysInRange - Array of all days in the timeline (to find day index)
 * @returns Grid position (1-based) in unified grid, or 0 if date is outside range
 */
export const dateToUnifiedCellPosition = (
  date: Date,
  daysInRange: Date[]
): number => {
  const itemYear = date.getFullYear()
  const itemMonth = date.getMonth() + 1
  const itemDay = date.getDate()
  
  // Find which day in the range this date belongs to
  const dayIndex = daysInRange.findIndex(day => {
    const dayYear = day.getFullYear()
    const dayMonth = day.getMonth() + 1
    const dayOfMonth = day.getDate()
    return itemYear === dayYear && itemMonth === dayMonth && itemDay === dayOfMonth
  })
  
  // If date doesn't belong to any day in range, return 0
  if (dayIndex === -1) {
    return 0
  }
  
  const hour = date.getHours()
  const minute = date.getMinutes()
  
  // Calculate position within the day (hour + minute interval)
  let positionWithinDay: number
  if (minute >= LAST_MINUTE_INTERVAL) {
    positionWithinDay = (hour * CELLS_PER_HOUR) + CELLS_PER_HOUR // Last cell position (1-based)
  } else {
    const minuteInterval = Math.floor(minute / MINUTE_GRANULARITY) * MINUTE_GRANULARITY
    positionWithinDay = (hour * CELLS_PER_HOUR) + (minuteInterval / MINUTE_GRANULARITY) + 1
  }
  
  // Calculate unified position: (day_index * cells_per_day) + position_within_day
  // Each day has 24 hours * 12 cells = 288 cells
  const cellsPerDay = 24 * CELLS_PER_HOUR
  const unifiedPosition = (dayIndex * cellsPerDay) + positionWithinDay
  
  return unifiedPosition
}

/**
 * Calculates the effective start position for a timeline item within a specific day
 * If the item starts before this day, returns position 1 (start of day)
 * If the item starts within this day, returns the actual position
 * 
 * @param itemStartDate - When the timeline item starts
 * @param dayDate - The specific day to calculate for
 * @returns Grid position (1-based) for the effective start within this day
 */
export const getEffectiveStartPosition = (
  itemStartDate: Date,
  dayDate: Date
): number => {
  const dayStart = new Date(dayDate)
  dayStart.setHours(0, 0, 0, 0)
  
  // If item starts before this day, start at position 1 (beginning of day)
  if (itemStartDate < dayStart) {
    return 1
  }
  
  return dateToCellPosition(itemStartDate, dayDate)
}

/**
 * Calculates the effective end position for a timeline item within a specific day
 * If the item ends after this day, returns the last cell of the day
 * If the item ends within this day, returns the exact position where it ends
 * 
 * IMPORTANT: If item ends at exactly 6:00 PM, it should end at the 6:00 PM cell,
 * not extend to 6:05 PM. The end position represents the LAST cell the item occupies.
 * 
 * @param itemEndDate - When the timeline item ends
 * @param dayDate - The specific day to calculate for
 * @returns Grid position (1-based) for the effective end within this day, or 0 if invalid
 */
export const getEffectiveEndPosition = (
  itemEndDate: Date,
  dayDate: Date
): number => {
  const dayStart = new Date(dayDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayDate)
  dayEnd.setHours(23, 59, 59, 999)
  
  // If item ends after this day, use the last cell of the day
  // Last cell is at position: 24 hours * 12 cells per hour = 288
  if (itemEndDate > dayEnd) {
    return 24 * CELLS_PER_HOUR
  }
  
  // Get the position for the end date
  const endPos = dateToCellPosition(itemEndDate, dayDate)
  
  // If endPos is 0 (invalid), return 0
  if (endPos === 0) {
    return 0
  }
  
  return endPos
}

/**
 * Calculates the grid span (number of cells) for a timeline item within a specific day
 * 
 * @param itemStartDate - When the timeline item starts
 * @param itemEndDate - When the timeline item ends
 * @param dayDate - The specific day to calculate for
 * @returns Number of cells the item spans within this day (at least 1), or 0 if item doesn't overlap this day
 */
export const calculateDaySpan = (
  itemStartDate: Date,
  itemEndDate: Date,
  dayDate: Date
): number => {
  const dayStart = new Date(dayDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayDate)
  dayEnd.setHours(23, 59, 59, 999)
  
  // Check if item overlaps with this day
  if (itemEndDate < dayStart || itemStartDate > dayEnd) {
    return 0 // Item doesn't overlap this day
  }
  
  const startPos = getEffectiveStartPosition(itemStartDate, dayDate)
  const endPos = getEffectiveEndPosition(itemEndDate, dayDate)
  
  // If positions are invalid, return 0
  if (startPos === 0 || endPos === 0) {
    return 0
  }
  
  // Span is the difference + 1 (endPos is inclusive)
  return Math.max(1, endPos - startPos + 1)
}

/**
 * Calculates the effective start position for a timeline item in a unified grid
 * If the item starts before the first day, returns position 1
 * If the item starts within range, returns the unified position
 * 
 * @param itemStartDate - When the timeline item starts
 * @param daysInRange - Array of all days in the unified grid
 * @returns Grid position (1-based) in unified grid
 */
export const getUnifiedStartPosition = (
  itemStartDate: Date,
  daysInRange: Date[]
): number => {
  if (daysInRange.length === 0) return 0
  
  const firstDayStart = new Date(daysInRange[0])
  firstDayStart.setHours(0, 0, 0, 0)
  
  // If item starts before first day, start at position 1
  if (itemStartDate < firstDayStart) {
    return 1
  }
  
  return dateToUnifiedCellPosition(itemStartDate, daysInRange)
}

/**
 * Calculates the effective end position for a timeline item in a unified grid
 * If the item ends after the last day, returns the last cell
 * If the item ends within range, returns the unified position
 * 
 * @param itemEndDate - When the timeline item ends
 * @param daysInRange - Array of all days in the unified grid
 * @returns Grid position (1-based) in unified grid
 */
export const getUnifiedEndPosition = (
  itemEndDate: Date,
  daysInRange: Date[]
): number => {
  if (daysInRange.length === 0) return 0
  
  const lastDayEnd = new Date(daysInRange[daysInRange.length - 1])
  lastDayEnd.setHours(23, 59, 59, 999)
  
  // If item ends after last day, use the last cell
  const cellsPerDay = 24 * CELLS_PER_HOUR
  if (itemEndDate > lastDayEnd) {
    return daysInRange.length * cellsPerDay
  }
  
  const endPos = dateToUnifiedCellPosition(itemEndDate, daysInRange)
  if (endPos === 0) {
    // Fallback to last cell if position calculation failed
    return daysInRange.length * cellsPerDay
  }
  
  return endPos
}

/**
 * Calculates the grid span (number of cells) for a timeline item in a unified grid
 * 
 * @param itemStartDate - When the timeline item starts
 * @param itemEndDate - When the timeline item ends
 * @param daysInRange - Array of all days in the unified grid
 * @returns Number of cells the item spans in unified grid (at least 1)
 */
export const calculateUnifiedSpan = (
  itemStartDate: Date,
  itemEndDate: Date,
  daysInRange: Date[]
): number => {
  if (daysInRange.length === 0) return 0
  
  const firstDayStart = new Date(daysInRange[0])
  firstDayStart.setHours(0, 0, 0, 0)
  const lastDayEnd = new Date(daysInRange[daysInRange.length - 1])
  lastDayEnd.setHours(23, 59, 59, 999)
  
  // Check if item overlaps with the range
  if (itemEndDate < firstDayStart || itemStartDate > lastDayEnd) {
    return 0 // Item doesn't overlap the range
  }
  
  const startPos = getUnifiedStartPosition(itemStartDate, daysInRange)
  const endPos = getUnifiedEndPosition(itemEndDate, daysInRange)
  
  // If positions are invalid, return 0
  if (startPos === 0 || endPos === 0) {
    return 0
  }
  
  // Span is the difference + 1 (endPos is inclusive)
  return Math.max(1, endPos - startPos + 1)
}

/**
 * Converts a unified grid position (1-based) back to a Date within daysInRange
 * Used for rendering preview overlays (e.g., resize ghost) with hour:minute precision.
 */
export const unifiedDayPositionToDate = (
  position: number,
  daysInRange: Date[]
): Date => {
  if (daysInRange.length === 0) return new Date(NaN)
  const cellsPerDay = 24 * CELLS_PER_HOUR
  // Clamp position
  if (position < 1) position = 1
  const maxPos = daysInRange.length * cellsPerDay
  if (position > maxPos) position = maxPos

  const zeroBased = position - 1
  const dayIndex = Math.floor(zeroBased / cellsPerDay)
  const withinDayIndex = zeroBased % cellsPerDay
  const hour = Math.floor(withinDayIndex / CELLS_PER_HOUR)
  const minuteIndex = withinDayIndex % CELLS_PER_HOUR
  const minute = MINUTE_INTERVALS[minuteIndex]

  const base = new Date(daysInRange[dayIndex])
  base.setHours(hour, minute, 0, 0)
  return base
}

/**
 * Checks if a timeline item overlaps with a specific day
 * 
 * @param itemStartDate - When the timeline item starts
 * @param itemEndDate - When the timeline item ends
 * @param dayDate - The specific day to check
 * @returns true if item overlaps with this day
 */
export const itemOverlapsDay = (
  itemStartDate: Date,
  itemEndDate: Date,
  dayDate: Date
): boolean => {
  const dayStart = new Date(dayDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayDate)
  dayEnd.setHours(23, 59, 59, 999)
  
  return itemStartDate <= dayEnd && itemEndDate >= dayStart
}

