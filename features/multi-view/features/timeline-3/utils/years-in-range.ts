/**
 * Years In Range Utility
 * 
 * Purpose: Generate array of years between start and end year for timeline display
 * Used in: components/timeline-mapper.tsx
 * Why: Provides dynamic year generation for multi-year timeline visualization
 * 
 * Function Index:
 * generateYearsInRange: Creates array of years from start to end year
 * 
 * Example input: startYear: 2024, endYear: 2025
 * Example output: [2024, 2025]
 * 
 * Steps:
 * 1. Validate input parameters and handle edge cases
 * 2. Generate array of years from start to end (inclusive)
 * 3. Return the years array for timeline rendering
 */

/**
 * Generates array of years between start and end year (inclusive)
 * @param startYear - Starting year for the range
 * @param endYear - Ending year for the range
 * @returns Array of years from start to end year
 */
export const generateYearsInRange = (startYear: number, endYear: number): number[] => {
  //////////////////////////////////
  // Input validation: ensure valid year range and handle edge cases
  //////////////////////////////////
  if (!startYear || !endYear || startYear > endYear) {
    return [new Date().getFullYear()] // Return current year as fallback
  }

  //////////////////////////////////
  // Generate years array: create array from start to end year inclusive
  //////////////////////////////////
  const years: number[] = []
  
  // Loop from startYear to endYear (inclusive) to build years array
  for (let year = startYear; year <= endYear; year++) {
    years.push(year) // Add each year to the array
  }

  return years
}
