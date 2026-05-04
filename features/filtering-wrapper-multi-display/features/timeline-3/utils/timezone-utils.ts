/**
 * Timezone Utilities
 * 
 * Purpose: Get user's timezone offset for timeline date calculations
 * Used in: timeline-container.tsx
 * Why: Timeline needs to adjust dates based on user's local timezone
 */

/**
 * Gets the user's GMT/timezone offset in hours
 * @returns The timezone offset in hours (e.g., +3 for GMT+3, -5 for GMT-5)
 * 
 * Example:
 * - User in Cairo (GMT+3): returns 3
 * - User in New York (GMT-5): returns -5
 * - User in London (GMT+0): returns 0
 */
export function getUserGmtOffset(): number {
  // getTimezoneOffset() returns the offset in minutes from UTC
  // For GMT+3, it returns -180 (180 minutes ahead = 3 hours ahead)
  // We need to convert to hours and invert the sign
  const offsetMinutes = new Date().getTimezoneOffset()
  const offsetHours = -offsetMinutes / 60
  console.log('offsetHours', offsetHours);
  return offsetHours
}

