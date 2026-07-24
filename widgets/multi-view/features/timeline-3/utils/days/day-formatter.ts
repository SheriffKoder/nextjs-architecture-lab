/**
 * Day Formatter Utility
 * 
 * Purpose: Format dates with day name, date, month, and year for display
 * Used in: components/day-view.tsx
 * Why: Provides consistent day label formatting (e.g., "Monday 02 Feb 2024")
 */

import { MONTH_NAMES } from '../month-names'

/**
 * Formats a date as "DayName DD Mon YYYY" (e.g., "Monday 02 Feb 2024")
 * @param date - Date object to format
 * @returns Formatted string like "Monday 02 Feb 2024"
 */
export const formatDayLabel = (date: Date): string => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayOfWeek = dayNames[date.getDay()]
  const dayOfMonth = date.getDate().toString().padStart(2, '0') // Zero-padded day (02)
  const monthIndex = date.getMonth()
  const monthAbbreviation = MONTH_NAMES[monthIndex]
  const year = date.getFullYear()
  return `${dayOfWeek} ${dayOfMonth} ${monthAbbreviation} ${year}`
}

/**
 * Groups days by year-month for display purposes
 * @param days - Array of date objects
 * @returns Array of objects with year, month, and days in that month
 */
export const groupDaysByMonth = (days: Date[]) => {
  const grouped = days.reduce((acc, day) => {
    const year = day.getFullYear()
    const month = day.getMonth()
    const key = `${year}-${month}`
    
    if (!acc[key]) {
      acc[key] = {
        year,
        month,
        monthName: MONTH_NAMES[month],
        days: []
      }
    }
    
    acc[key].days.push(day)
    
    return acc
  }, {} as Record<string, { year: number; month: number; monthName: string; days: Date[] }>)
  
  return Object.values(grouped).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })
}

