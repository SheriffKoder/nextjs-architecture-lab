/**
 * Calendar Calculations Utility
 * 
 * Purpose: Utility functions for calendar date calculations and manipulations
 * Used in: app/development/calendar/utils/calendar-calculations.ts
 * Why: Centralized date calculations for calendar functionality
 * 
 * Function Index:
 * getDaysInMonth: Get the number of days in a specific month and year
 * getFirstDayOfMonth: Get the day of the week for the first day of a month
 * getLastDayOfMonth: Get the day of the week for the last day of a month
 * getMonthName: Get the full name of a month
 * getWeekdayName: Get the abbreviated name of a weekday
 * 
 * Steps:
 * 1. Calculate days in month using Date constructor
 * 2. Calculate first and last day positions
 * 3. Provide helper functions for month and weekday names
 */

/**
 * Get the number of days in a specific month and year
 * @param year - The year (e.g., 2025)
 * @param month - The month (0-11, where 0 = January)
 * @returns The number of days in the month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  // Create a new date for the first day of the next month
  // Then go back one day to get the last day of the current month
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Get the day of the week for the first day of a month (0-6, where 0 = Sunday)
 * @param year - The year (e.g., 2025)
 * @param month - The month (0-11, where 0 = January)
 * @returns The day of the week (0-6)
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay()
}

/**
 * Get the day of the week for the last day of a month (0-6, where 0 = Sunday)
 * @param year - The year (e.g., 2025)
 * @param month - The month (0-11, where 0 = January)
 * @returns The day of the week (0-6)
 */
export const getLastDayOfMonth = (year: number, month: number): number => {
  const daysInMonth = getDaysInMonth(year, month)
  return new Date(year, month, daysInMonth).getDay()
}

/**
 * Get the full name of a month
 * @param month - The month (0-11, where 0 = January)
 * @returns The full month name (e.g., "January")
 */
export const getMonthName = (month: number): string => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return monthNames[month]
}

/**
 * Get the abbreviated name of a weekday
 * @param day - The day of the week (0-6, where 0 = Sunday)
 * @returns The abbreviated weekday name (e.g., "Mon")
 */
export const getWeekdayName = (day: number): string => {
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return weekdayNames[day]
}

/**
 * Check if a given day is today for the indicator color
 * @param dayNumber - The day number to check
 * @param year - The year to check against
 * @param month - The month to check against (0-11, where 0 = January)
 * @returns True if the day is today, false otherwise
 */
export const isToday = (dayNumber: number | null, year: number, month: number): boolean => {
  if (dayNumber === null) return false
  
  const today = new Date()
  return year === today.getFullYear() && 
         month === today.getMonth() && 
         dayNumber === today.getDate()
}

/**
 * Get calendar data for a specific month and year
 * @param year - The year (e.g., 2025)
 * @param month - The month (0-11, where 0 = January)
 * @returns Object containing calendar data
 */
export const getCalendarData = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const lastDay = getLastDayOfMonth(year, month)
  
  return {
    daysInMonth,
    firstDay,
    lastDay,
    monthName: getMonthName(month),
    year
  }
}