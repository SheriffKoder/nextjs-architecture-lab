/**
 * Year Extractor Utility
 * 
 * Purpose: Extract start and end years from timeline data based on specified date fields
 * Used in: components/timeline-mapper.tsx
 * Why: Provides reusable logic to find the earliest and latest years across different date fields
 * 
 * Function Index:
 * extractYearRange: Extracts start and end years from data array
 * 
 * Example input: 
 * data: [{created_at: '2023-01-15', due_date: '2024-06-20'}, {created_at: '2022-12-01', due_date: '2025-03-10'}]
 * startKey: 'created_at'
 * endKey: 'due_date'
 * 
 * Example output: {startYear: 2022, endYear: 2025}
 * 
 * Steps:
 * 1. Filter out invalid data entries and extract valid dates
 * 2. Find minimum year from startKey field across all entries
 * 3. Find maximum year from endKey field across all entries
 * 4. Return both years as an object
 */

/**
 * Extracts start and end years from timeline data
 * @param data - Array of timeline data objects
 * @param startKey - Key name for the start date field (e.g., 'created_at')
 * @param endKey - Key name for the end date field (e.g., 'due_date')
 * @returns Object containing startYear and endYear
 */
export const extractYearRange = (data: any[], startKey: string, endKey: string): { startYear: number; endYear: number } => {
  // Validate input data exists and is an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { startYear: new Date().getFullYear(), endYear: new Date().getFullYear() }
  }

  //////////////////////////////////
  // Extract and validate start dates: get all valid dates from startKey field
  //////////////////////////////////
  const startDates = data
    .map(item => item?.[startKey]) // Extract startKey field from each item
    .filter(date => date && typeof date === 'string') // Filter out null/undefined/invalid dates
    .map(dateString => new Date(dateString)) // Convert string dates to Date objects
    .filter(date => !isNaN(date.getTime())) // Filter out invalid Date objects

  //////////////////////////////////
  // Extract and validate end dates: get all valid dates from endKey field
  //////////////////////////////////
  const endDates = data
    .map(item => item?.[endKey]) // Extract endKey field from each item
    .filter(date => date && typeof date === 'string') // Filter out null/undefined/invalid dates
    .map(dateString => new Date(dateString)) // Convert string dates to Date objects
    .filter(date => !isNaN(date.getTime())) // Filter out invalid Date objects

  //////////////////////////////////
  // Calculate year range: find min start year and max end year
  //////////////////////////////////
  const startYear = startDates.length > 0 
    ? Math.min(...startDates.map(date => date.getFullYear())) // Find earliest year from start dates
    : new Date().getFullYear() // Fallback to current year if no valid start dates

  const endYear = endDates.length > 0 
    ? Math.max(...endDates.map(date => date.getFullYear())) // Find latest year from end dates
    : new Date().getFullYear() // Fallback to current year if no valid end dates

  return { startYear, endYear }
}
