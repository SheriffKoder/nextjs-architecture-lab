/**
 * Day View Item Updater Utility
 * 
 * Purpose: Update timeline item dates based on drag and drop operations in Day view
 * Used in: timeline-row-day.tsx, draggable-timeline-item-day.tsx
 * Why: Provides functions to calculate new start/end dates with hour:minute precision
 * 
 * Features:
 * - Parses cell IDs to extract dates with hour:minute (timelineIndex:year:month:day:hour:minute format)
 * - Calculates new dates while preserving duration in minutes
 * - Handles both moving start and end dates with 5-minute interval precision
 * 
 * Function Index:
 * - parseDayCellIdToDate() - Converts day view cell ID string to Date object
 * - calculateNewDayDates() - Calculates new start/end dates based on drop position
 * - calculateDayResizeLeftDates() - Calculates dates when resizing left edge
 * - calculateDayResizeRightDates() - Calculates dates when resizing right edge
 * - updateDayTimelineItemDates() - Updates raw data with new dates
 */

import { MappingKeys, MappedTimelineItem } from '../mapping/timeline-mapping'
import { CELLS_PER_HOUR, MINUTE_GRANULARITY, MINUTE_INTERVALS } from '../days/day-time-calculator'

// Calculate the last minute interval (e.g., 55 for 5-min, 45 for 15-min, 30 for 30-min)
const LAST_MINUTE_INTERVAL = MINUTE_INTERVALS[MINUTE_INTERVALS.length - 1]

/**
 * Parses a day view cell ID string to extract year, month, day, hour, minute and convert to Date
 * @param cellId - Cell ID in format "timelineIndex:year:month:day:hour:minute"
 * @returns Date object representing the cell's date and time
 * Note: Minute 60 is preserved as 59:59 (last second of the hour) instead of converting to next hour
 */
export const parseDayCellIdToDate = (cellId: string): Date => {
  const parts = cellId.split(':').map(Number)
  if (parts.length < 6) {
    // Fallback for old format without hour:minute
    const [, year, month, day] = parts
    return new Date(year, month - 1, day)
  }
  
  const [, year, month, day, hourIndex, minute] = parts
  // hourIndex is 0-23, minute is the minute interval based on MINUTE_GRANULARITY
  // Note: The last minute interval represents the range from that minute to 59:59.999 (end of hour)
  // For example:
  //   - 5 min granularity: minute 55 represents 55:00 to 59:59.999
  //   - 15 min granularity: minute 45 represents 45:00 to 59:59.999
  //   - 30 min granularity: minute 30 represents 30:00 to 59:59.999
  if (minute === LAST_MINUTE_INTERVAL) {
    // Last minute interval cell represents the full range to end of hour (59:59.999)
    return new Date(year, month - 1, day, hourIndex, 59, 59, 999)
  }
  
  return new Date(year, month - 1, day, hourIndex, minute, 0, 0)
}

/**
 * Converts a Date object to ISO string format with time
 * @param date - Date object to convert
 * @returns Date string in ISO format with timezone
 */
export const dateTimeToString = (date: Date): string => {
  return date.toISOString()
}

/**
 * Calculates new start and end dates for a timeline item based on where it's dropped in Day view
 * @param startCellId - Original start cell ID (may be old format or new format)
 * @param endCellId - Original end cell ID (may be old format or new format)
 * @param droppedCellId - Cell ID where item was dropped (format: "timelineIndex:year:month:day:hour:minute")
 * @returns Object with new start and end dates
 */
export const calculateNewDayDates = (
  startCellId: string,
  endCellId: string,
  droppedCellId: string
): { newStartDate: Date, newEndDate: Date } => {
  const originalStart = parseDayCellIdToDate(startCellId)
  const originalEnd = parseDayCellIdToDate(endCellId)
  const droppedDate = parseDayCellIdToDate(droppedCellId)
  
  // Calculate duration in milliseconds (preserves exact time)
  const durationInMs = originalEnd.getTime() - originalStart.getTime()
  
  // Determine if we're moving the start or end
  const isMovingStart = droppedDate <= originalEnd
  const isMovingEnd = droppedDate >= originalStart
  
  let newStartDate: Date
  let newEndDate: Date
  
  if (isMovingStart) {
    // Moving start date: dropped date becomes new start, end maintains duration
    newStartDate = new Date(droppedDate)
    newEndDate = new Date(droppedDate.getTime() + durationInMs)
  } else if (isMovingEnd) {
    // Moving end date: start maintains duration, dropped date becomes new end
    newEndDate = new Date(droppedDate)
    newStartDate = new Date(droppedDate.getTime() - durationInMs)
  } else {
    // Moving between: calculate offset and apply to both dates
    const offsetInMs = droppedDate.getTime() - originalStart.getTime()
    newStartDate = new Date(originalStart.getTime() + offsetInMs)
    newEndDate = new Date(originalEnd.getTime() + offsetInMs)
  }
  
  return { newStartDate, newEndDate }
}

/**
 * Calculates new dates when resizing left edge in Day view (expanding/contracting start date)
 * @param startDate - Original start date
 * @param endDate - Original end date
 * @param intervalChange - Number of minute intervals to add (positive) or subtract (negative) from start
 * @returns Object with new start and end dates
 * 
 * Note: Uses MINUTE_GRANULARITY (5, 15, or 30 minutes) to calculate the adjustment
 */
export const calculateDayResizeLeftDates = (
  startDate: Date,
  endDate: Date,
  intervalChange: number
): { newStartDate: Date, newEndDate: Date } => {
  // Adjust start date by intervalChange * MINUTE_GRANULARITY minutes
  const newStartDate = new Date(startDate)
  newStartDate.setMinutes(newStartDate.getMinutes() - (intervalChange * MINUTE_GRANULARITY))
  
  // Keep end date fixed when resizing left
  const newEndDate = new Date(endDate)
  
  return { newStartDate, newEndDate }
}

/**
 * Calculates new dates when resizing right edge in Day view (expanding/contracting end date)
 * @param startDate - Original start date
 * @param endDate - Original end date
 * @param intervalChange - Number of minute intervals to add (positive) or subtract (negative) from end
 * @returns Object with new start and end dates
 * 
 * Note: Uses MINUTE_GRANULARITY (5, 15, or 30 minutes) to calculate the adjustment
 */
export const calculateDayResizeRightDates = (
  startDate: Date,
  endDate: Date,
  intervalChange: number
): { newStartDate: Date, newEndDate: Date } => {
  // Keep start date fixed when resizing right
  const newStartDate = new Date(startDate)
  
  // Adjust end date by intervalChange * MINUTE_GRANULARITY minutes
  const newEndDate = new Date(endDate)
  newEndDate.setMinutes(newEndDate.getMinutes() + (intervalChange * MINUTE_GRANULARITY))
  
  return { newStartDate, newEndDate }
}

/**
 * Updates a timeline item's dates in the raw data array for Day view
 * @param rawData - Array of raw timeline items
 * @param item - The dragged item with mapping metadata
 * @param droppedCellId - Cell ID where item was dropped
 * @param mappingKeys - Object containing key names for different properties
 * @returns New array with updated item
 */
export const updateDayTimelineItemDates = <T extends Record<string, any>>(
  rawData: T[],
  item: MappedTimelineItem,
  droppedCellId: string,
  mappingKeys: MappingKeys
): T[] => {
  // For Day view, use the actual Date objects from mapping (which have hour:minute)
  // instead of parsing cell IDs (which only have year:month:day)
  // item.mapping.startDate and endDate are already adjusted for display (GMT shift subtracted)
  const originalStart = new Date(item.mapping.startDate)
  const originalEnd = new Date(item.mapping.endDate)
  const droppedDate = parseDayCellIdToDate(droppedCellId)
  
  // Debug: Log parsed dropped date
  console.log('🔄 parseDayCellIdToDate result:', {
    droppedCellId,
    parsedDate: droppedDate.toISOString(),
    hour: droppedDate.getHours(),
    minute: droppedDate.getMinutes()
  })
  
  // Calculate duration in milliseconds (preserves exact time)
  const durationInMs = originalEnd.getTime() - originalStart.getTime()
  
  // Determine if we're moving the start or end
  const isMovingStart = droppedDate <= originalEnd
  const isMovingEnd = droppedDate >= originalStart
  
  let newStartDate: Date
  let newEndDate: Date
  
  if (isMovingStart) {
    // Moving start date: dropped date becomes new start, end maintains duration
    newStartDate = new Date(droppedDate)
    newEndDate = new Date(droppedDate.getTime() + durationInMs)
  } else if (isMovingEnd) {
    // Moving end date: start maintains duration, dropped date becomes new end
    newEndDate = new Date(droppedDate)
    newStartDate = new Date(droppedDate.getTime() - durationInMs)
  } else {
    // Moving between: calculate offset and apply to both dates
    const offsetInMs = droppedDate.getTime() - originalStart.getTime()
    newStartDate = new Date(originalStart.getTime() + offsetInMs)
    newEndDate = new Date(originalEnd.getTime() + offsetInMs)
  }
  
  // Debug: Log calculated new dates
  console.log('🔄 Calculated new dates (before GMT shift):', {
    newStartDate: newStartDate.toISOString(),
    newEndDate: newEndDate.toISOString(),
    newStartHour: newStartDate.getHours(),
    newStartMinute: newStartDate.getMinutes(),
    newEndHour: newEndDate.getHours(),
    newEndMinute: newEndDate.getMinutes(),
    durationMs: durationInMs
  })
  
  // CRITICAL: Use timelineIndex to identify the EXACT item instance
  const itemIndex = item.mapping.timelineIndex
  
  // Validate that the index is valid
  if (itemIndex < 0 || itemIndex >= rawData.length) {
    console.error('Invalid timelineIndex:', itemIndex, 'Data length:', rawData.length)
    return rawData
  }
  
  // Create updated item
  const updatedItem: T = {
    ...rawData[itemIndex],
    [mappingKeys.startDateKey]: dateTimeToString(newStartDate),
    [mappingKeys.endDateKey]: dateTimeToString(newEndDate)
  }
  
  // Return new array with updated item
  const newData = [...rawData]
  newData[itemIndex] = updatedItem
  
  console.log('🔄 UPDATING DAY VIEW ITEM:', {
    index: itemIndex,
    uniqueId: rawData[itemIndex][mappingKeys.uniqueIdKey || 'id'],
    timelineIndex: item.mapping.timelineIndex,
    oldDates: {
      start: rawData[itemIndex][mappingKeys.startDateKey],
      end: rawData[itemIndex][mappingKeys.endDateKey]
    },
    newDates: {
      start: updatedItem[mappingKeys.startDateKey],
      end: updatedItem[mappingKeys.endDateKey]
    }
  })
  
  return newData
}

