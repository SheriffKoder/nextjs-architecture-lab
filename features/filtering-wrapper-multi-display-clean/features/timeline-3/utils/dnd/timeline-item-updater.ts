/**
 * Timeline Item Updater Utility
 * 
 * Purpose: Update timeline item dates based on drag and drop operations
 * Used in: timeline-mapper.tsx
 * Why: Provides functions to calculate new start/end dates when items are dragged
 * 
 * Features:
 * - Parses cell IDs to extract dates (timelineIndex:year:month:day format)
 * - Calculates new dates while preserving duration
 * - Handles both moving start and end dates
 * 
 * Function Index:
 * - parseCellIdToDate() - Converts cell ID string to Date object
 * - calculateNewDates() - Calculates new start/end dates based on drop position
 */

import { MappingKeys, MappedTimelineItem } from '../mapping/timeline-mapping'

/**
 * Parses a cell ID string to extract year, month, day and convert to Date
 * @param cellId - Cell ID in format "timelineIndex:year:month:day"
 * @returns Date object representing the cell's date
 */
export const parseCellIdToDate = (cellId: string): Date => {
  const [, year, month, day] = cellId.split(':').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed in JS Date
}

/**
 * Calculates new start and end dates for a timeline item based on where it's dropped
 * @param startCellId - Original start cell ID
 * @param endCellId - Original end cell ID
 * @param droppedCellId - Cell ID where item was dropped
 * @returns Object with new start and end dates
 */
export const calculateNewDates = (
  startCellId: string,
  endCellId: string,
  droppedCellId: string
): { newStartDate: Date, newEndDate: Date } => {
  const originalStart = parseCellIdToDate(startCellId)
  const originalEnd = parseCellIdToDate(endCellId)
  const droppedDate = parseCellIdToDate(droppedCellId)
  
  // Calculate duration in days
  const durationInDays = Math.ceil((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24))
  
  // Determine if we're moving the start or end
  const isMovingStart = droppedDate <= originalEnd
  const isMovingEnd = droppedDate >= originalStart
  
  let newStartDate: Date
  let newEndDate: Date
  
  if (isMovingStart) {
    // Moving start date: dropped date becomes new start, end maintains duration
    newStartDate = new Date(droppedDate)
    newEndDate = new Date(droppedDate)
    newEndDate.setDate(newEndDate.getDate() + durationInDays)
  } else if (isMovingEnd) {
    // Moving end date: start maintains duration, dropped date becomes new end
    newEndDate = new Date(droppedDate)
    newStartDate = new Date(droppedDate)
    newStartDate.setDate(newStartDate.getDate() - durationInDays)
  } else {
    // Moving between: calculate offset and apply to both dates
    const offsetInDays = Math.ceil((droppedDate.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24))
    newStartDate = new Date(originalStart)
    newStartDate.setDate(newStartDate.getDate() + offsetInDays)
    newEndDate = new Date(originalEnd)
    newEndDate.setDate(newEndDate.getDate() + offsetInDays)
  }
  
  return { newStartDate, newEndDate }
}

/**
 * Converts a Date object to YYYY-MM-DD string format
 * @param date - Date object to convert
 * @returns Date string in YYYY-MM-DD format
 */
// Removed dateToString (unused)

/**
 * Calculates new dates when resizing left (expanding/contracting start date)
 * @param startCellId - Original start cell ID
 * @param endCellId - Original end cell ID
 * @param widthChangeInDays - Number of days to add (positive) or subtract (negative) from start
 * @returns Object with new start and end dates
 */
// Removed calculateResizeLeftDates (unused)

/**
 * Calculates new dates when resizing right (expanding/contracting end date)
 * @param startCellId - Original start cell ID
 * @param endCellId - Original end cell ID
 * @param widthChangeInDays - Number of days to add (positive) or subtract (negative) from end
 * @returns Object with new start and end dates
 */
// Removed calculateResizeRightDates (unused)

/**
 * Updates a timeline item's dates in the raw data array
 * @param rawData - Array of raw timeline items
 * @param item - The dragged item with mapping metadata
 * @param droppedCellId - Cell ID where item was dropped
 * @param mappingKeys - Object containing key names for different properties
 * @returns New array with updated item
 */
// Removed updateTimelineItemDates (unused)
