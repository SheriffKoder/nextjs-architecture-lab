/**
 * Date Time Utility Functions
 * 
 * Purpose: Handle GMT shift for date display (not for updates)
 * Used in: All date parsing utilities
 * Why: Subtracts GMT shift when displaying dates to correct for timezone offset
 * 
 * Features:
 * - Adjust dates for display by subtracting GMT shift
 * - Preserves original dates for updates
 */

/**
 * Adjusts a date for display by subtracting GMT shift (converts from GMT+X to UTC for display)
 * @param date - The date to adjust
 * @param gmtShift - The GMT shift in hours (e.g., +3 means GMT+3, subtract 3 hours for display)
 * @returns Adjusted date for display
 */
export const adjustDateForDisplay = (date: Date, gmtShift: number): Date => {
  const adjusted = new Date(date)
  adjusted.setHours(adjusted.getHours() - gmtShift)
  return adjusted
}

/**
 * Parses a date string and adjusts it for display
 * @param dateString - ISO date string
 * @param gmtShift - The GMT shift in hours
 * @returns Adjusted date for display
 */
export const parseDateForDisplay = (dateString: string, gmtShift: number): Date => {
  const date = new Date(dateString)
  return adjustDateForDisplay(date, gmtShift)
}

