/**
 * Month Width Calculator Utility
 * 
 * Purpose: Calculate dynamic widths for months based on their content
 * Used in: components/year-month-week-view.tsx
 * Why: Row 3 content (weeks/days) determines the actual width needed
 * 
 * Function Index:
 * - getMonthWidthFromWeeks() - Calculate width based on weeks in month (Year view)
 * - getMonthWidthFromDays() - Calculate width based on days in month (Month view)
 * - getMonthWidthFromWeekDays() - Calculate width based on days in month (Week view)
 * - getMonthWidths() - Get all month widths for a year based on view type
 * - getTotalYearWidth() - Calculate total width for a year based on month widths
 */

import { getWeekStartDays } from './week-calculator'

/**
 * Calculates the width needed for a month based on its weeks
 * @param year - The year
 * @param monthIndex - The month index (0-11)
 * @param yearWeekWidth - Width of each week cell
 * @returns Width needed for this month
 */
export const getMonthWidthFromWeeks = (year: number, monthIndex: number, yearWeekWidth: number): number => {
  const weekStartDays = getWeekStartDays(year, monthIndex)
  return weekStartDays.length * yearWeekWidth
}

/**
 * Calculates the width needed for a month based on its days (for Month view)
 * @param year - The year
 * @param monthIndex - The month index (0-11)
 * @param monthDayWidth - Width of each day cell
 * @returns Width needed for this month
 */
export const getMonthWidthFromDays = (year: number, monthIndex: number, monthDayWidth: number): number => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  return daysInMonth * monthDayWidth
}

/**
 * Calculates the width needed for a month based on its days (for Week view)
 * @param year - The year
 * @param monthIndex - The month index (0-11)
 * @param weekDayWidth - Width of each day cell in Week view
 * @returns Width needed for this month
 */
export const getMonthWidthFromWeekDays = (year: number, monthIndex: number, weekDayWidth: number): number => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  return daysInMonth * weekDayWidth
}

/**
 * Gets all month widths for a year based on view type
 * @param year - The year
 * @param view - The view type
 * @param yearWeekWidth - Width of each week cell
 * @param monthDayWidth - Width of each day cell
 * @param weekDayWidth - Width of each day cell in Week view
 * @returns Array of widths for each month
 */
export const getMonthWidths = (
  year: number, 
  view: 'Year' | 'Month' | 'Week' | 'Day', 
  yearWeekWidth: number, 
  monthDayWidth: number,
  weekDayWidth?: number
): number[] => {
  const widths: number[] = []
  
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    if (view === 'Year') {
      widths.push(getMonthWidthFromWeeks(year, monthIndex, yearWeekWidth))
    } else if (view === 'Month') {
      widths.push(getMonthWidthFromDays(year, monthIndex, monthDayWidth))
    } else if (view === 'Week') {
      widths.push(getMonthWidthFromWeekDays(year, monthIndex, weekDayWidth || 150))
    } else {
      // Default fallback
      widths.push(200) // Default column width
    }
  }
  
  return widths
}

/**
 * Calculates total width for a year based on month widths
 * @param monthWidths - Array of month widths
 * @returns Total width for the year
 */
export const getTotalYearWidth = (monthWidths: number[]): number => {
  return monthWidths.reduce((sum, width) => sum + width, 0)
}
