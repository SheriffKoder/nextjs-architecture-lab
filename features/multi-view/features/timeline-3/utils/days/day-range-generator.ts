/**
 * Day Range Generator Utility
 * 
 * Purpose: Generate array of dates (days) within a date range
 * Used in: components/timeline-mapper.tsx
 * Why: Provides day-by-day timeline for Day view mode
 */

export interface DayInfo {
  date: Date
  monthIndex: number
  dayOfMonth: number
}

/**
 * Generates array of dates between start and end date (inclusive)
 * Normalizes dates to midnight to ensure proper day-by-day generation
 * @param startDate - Starting date
 * @param endDate - Ending date
 * @returns Array of date objects (normalized to midnight)
 */
export const generateDaysInRange = (startDate: Date, endDate: Date): Date[] => {
  const days: Date[] = []
  
  // Normalize start date to midnight
  const normalizedStart = new Date(startDate)
  normalizedStart.setHours(0, 0, 0, 0)
  
  // Normalize end date to midnight
  const normalizedEnd = new Date(endDate)
  normalizedEnd.setHours(0, 0, 0, 0)
  
  // Start from normalized start date
  const currentDate = new Date(normalizedStart)
  
  // Generate all days from start to end (inclusive)
  while (currentDate <= normalizedEnd) {
    days.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return days
}

/**
 * Extracts start and end dates from timeline data
 * @param data - Array of timeline data objects
 * @param startKey - Key name for the start date field (e.g., 'created_at')
 * @param endKey - Key name for the end date field (e.g., 'due_date')
 * @param gmtShift - GMT shift in hours (e.g., +3) to subtract from dates for display
 * @returns Object containing startDate and endDate
 */
export const extractDateRange = (data: any[], startKey: string, endKey: string, gmtShift: number = 0): { startDate: Date; endDate: Date } | null => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null
  }

  // Extract and validate start dates
  const startDates = data
    .map(item => item?.[startKey])
    .filter(date => date && typeof date === 'string')
    .map(dateString => {
      const date = new Date(dateString)
      // Adjust for display: subtract GMT shift
      date.setHours(date.getHours() - gmtShift)
      return date
    })
    .filter(date => !isNaN(date.getTime()))

  // Extract and validate end dates
  const endDates = data
    .map(item => item?.[endKey])
    .filter(date => date && typeof date === 'string')
    .map(dateString => {
      const date = new Date(dateString)
      // Adjust for display: subtract GMT shift
      date.setHours(date.getHours() - gmtShift)
      return date
    })
    .filter(date => !isNaN(date.getTime()))

  if (startDates.length === 0 || endDates.length === 0) {
    return null
  }

  // Find the earliest start date and latest end date
  const earliestStart = new Date(Math.min(...startDates.map(date => date.getTime())))
  const latestEnd = new Date(Math.max(...endDates.map(date => date.getTime())))

  // Normalize to day boundaries: start at beginning of first day, end at end of last day
  const startDate = new Date(earliestStart)
  startDate.setHours(0, 0, 0, 0)
  
  // Calculate tomorrow (end of today + 1 day)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  // Use the later of: latest end date from data OR tomorrow
  const endDate = new Date(Math.max(latestEnd.getTime(), tomorrow.getTime()))
  endDate.setHours(23, 59, 59, 999)

  return { startDate, endDate }
}

