/**
 * Week Calculator Utility
 * 
 * Purpose: Calculate weeks within a month with Monday as the start of the week (ISO 8601)
 * Used in: components/year-month-week-view.tsx
 * Why: Provides week information for Row 3 in Year view
 * 
 * Note: This calculator uses ISO 8601 week standard where:
 * - Weeks start on Monday and end on Sunday
 * - Days before the first Monday of the month are ignored
 * - Only full Monday-to-Sunday weeks are displayed
 * 
 * Example: For February 2024 (starts on Thursday, 2/1)
 * - Days 1-4 (Thu-Sun) are ignored
 * - Week 1: Days 5-11 (Mon-Sun)
 * - Week 2: Days 12-18 (Mon-Sun)
 * - Week 3: Days 19-25 (Mon-Sun)
 * - Week 4: Days 26-29 (Mon-Wed, partial at end)
 */

export interface WeekInfo {
  weekNumber: number
  startDay: number
  endDay: number
}

/**
 * Calculates all weeks in a given month and year
 * Weeks start on Monday (ISO 8601 standard)
 * @param year - The year
 * @param month - The month (0-11, where 0 = January)
 * @returns Array of week information
 */
export const getWeeksInMonth = (year: number, month: number): WeekInfo[] => {
  const weeks: WeekInfo[] = []
  
  // Get first day of month and last day of month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Get the day of week for first day (0 = Sunday, 1 = Monday, etc.)
  // Convert to ISO: Monday = 0, Sunday = 6
  const getISODay = (date: Date) => {
    const day = date.getDay()
    return day === 0 ? 6 : day - 1
  }
  
  const firstDayOfWeekISO = getISODay(firstDay)
  
  // Calculate how many days are in the month
  const daysInMonth = lastDay.getDate()
  
  // Start from the first Monday of the month (or day 1 if month starts on Monday)
  let currentDay = 1
  
  // If the first day is not Monday, skip to the first Monday
  if (firstDayOfWeekISO !== 0) {
    const daysToNextMonday = 7 - firstDayOfWeekISO
    currentDay = 1 + daysToNextMonday
  }
  
  let weekNumber = 1
  
  // Process full Monday-to-Sunday weeks only
  while (currentDay <= daysInMonth) {
    const endDay = Math.min(currentDay + 6, daysInMonth)
    
    weeks.push({
      weekNumber,
      startDay: currentDay,
      endDay: endDay
    })
    
    // Move to next week (next Monday)
    currentDay = endDay + 1
    weekNumber++
  }
  
  return weeks
}

/**
 * Gets the starting day numbers for each week in a month
 * @param year - The year
 * @param month - The month (0-11)
 * @returns Array of starting day numbers
 */
export const getWeekStartDays = (year: number, month: number): number[] => {
  const weeks = getWeeksInMonth(year, month)
  return weeks.map(week => week.startDay)
}

/**
 * Formats a day number for display
 * @param day - Day number
 * @returns Formatted day string
 */
export const formatWeekDay = (day: number): string => {
  return day.toString()
}

