/**
 * Mapping Calculations Utility
 * 
 * Purpose: Utility functions for mapping projects/events to calendar cells
 * Used in: app/development/calendar/utils/mapping-calculations.ts
 * Why: Centralized logic for determining which items belong in which calendar cells
 * 
 * Function Index:
 * getProjectsForMonth: Get projects that fall within a specific month
 * getProjectsForDay: Get projects that should be displayed on a specific day
 * 
 * Steps:
 * 1. Filter projects by month range
 * 2. Check if a project spans a specific day
 * 3. Return formatted project data for calendar display
 */

/**
 * Get projects that fall within a specific month
 * @param projects - Array of projects/events
 * @param startDateKey - Key name for start date in project object
 * @param endDateKey - Key name for end date in project object
 * @param year - The year to filter by
 * @param month - The month to filter by (0-11, where 0 = January)
 * @returns Array of projects that fall within the specified month
 */
export const getProjectsForMonth = (
  projects: any[],
  startDateKey: string,
  endDateKey: string,
  year: number,
  month: number
) => {
  // Create start and end dates for the month in UTC
  const monthStart = new Date(Date.UTC(year, month, 1))
  const monthEnd = new Date(Date.UTC(year, month + 1, 0)) // Last day of the month
  
  return projects.filter(project => {
    const startDate = new Date(project[startDateKey])
    
    // Handle missing end date - use today as end date
    const endDate = project[endDateKey] ? new Date(project[endDateKey]) : new Date()
    
    // Convert project dates to UTC for consistent comparison
    const startDateUTC = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    ))
    const endDateUTC = new Date(Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate()
    ))
    
    // Check if project overlaps with the month
    return startDateUTC <= monthEnd && endDateUTC >= monthStart
  })
}

/**
 * Get projects that should be displayed on a specific day
 * @param projects - Array of projects (already filtered for the month)
 * @param startDateKey - Key name for start date in project object
 * @param endDateKey - Key name for end date in project object
 * @param dayNumber - The day number to check
 * @param year - The year
 * @param month - The month (0-11, where 0 = January)
 * @returns Array of projects that should be displayed on this day
 */
export const getProjectsForDay = (
  projects: any[],
  startDateKey: string,
  endDateKey: string,
  dayNumber: number,
  year: number,
  month: number
) => {
  // Create target date in UTC to match project dates
  const targetDate = new Date(Date.UTC(year, month, dayNumber))
  
  return projects.filter(project => {
    const startDate = new Date(project[startDateKey])
    
    // Handle missing end date - use today as end date
    const endDate = project[endDateKey] ? new Date(project[endDateKey]) : new Date()
    
    // Convert project dates to UTC for consistent comparison
    const startDateUTC = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    ))
    const endDateUTC = new Date(Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate()
    ))
    
    // Check if the target date falls within the project's date range
    return targetDate >= startDateUTC && targetDate <= endDateUTC
  })
}