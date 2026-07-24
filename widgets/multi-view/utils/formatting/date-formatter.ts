/**
 * Date and Time Formatting Utilities
 * 
 * Purpose: Centralized date and time formatting functions for consistent display across the application
 * Used in: Timeline tooltips, dashboard displays, and other time-related components
 * Why: Ensures consistent date/time formatting and reduces code duplication
 * 
 * UPDATED to use createLocalDate for timezone-safe date formatting and added
 * formatDisplayDate function for consistent date display across components
 * 
 * UPDATED with additional formatting functions:
 * - formatDisplayDate: Basic date display (Jan 15, 2024)
 * - formatDisplayDateWithWeekday: Date with full weekday (Monday, January 15, 2024)
 * - formatWeekdayShort: Short weekday only (Mon)
 * - formatProjectDate: Date with time for project details (January 15, 2024, 02:30 PM)
 * All functions use createLocalDate for timezone safety (except formatProjectDate which preserves time)
 */

/**
 * Create a Date object at local midnight to avoid timezone issues
 * @param {string} dateString - Optional date string in YYYY-MM-DD format or ISO timestamp
 * @returns {Date} Date object at local midnight
 */
export const createLocalDate = (dateString?: string): Date => {
  if (!dateString) {
    // Create today's date at local midnight
    // Use static date for SSR compatibility, will be updated on client
    if (typeof window === 'undefined') {
      // Server-side: return a static date to avoid hydration mismatch
      return new Date(2024, 0, 1) // January 1, 2024
    }
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }
  
  // Handle ISO timestamp strings (e.g., "2025-07-22T00:00:00.000")
  // Extract just the date part (YYYY-MM-DD)
  const dateOnly = dateString.split('T')[0]
  
  // Parse the date string and create at local midnight
  const [year, month, day] = dateOnly.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed
}

/**
 * Format date for display using createLocalDate for timezone safety
 * @param {string | Date | undefined} date - Date string, Date object, or undefined for today
 * @returns {string} Formatted date string (e.g., "Jan 15, 2024")
 */
export const formatDisplayDate = (date?: string | Date): string => {
  let dateObj: Date
  
  if (!date) {
    // Use today's date if none provided
    dateObj = createLocalDate()
  } else if (typeof date === 'string') {
    // Convert string to Date using createLocalDate
    dateObj = createLocalDate(date)
  } else {
    // Already a Date object, use as is
    dateObj = date
  }
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format date for display with weekday using createLocalDate for timezone safety
 * @param {string | Date | undefined} date - Date string, Date object, or undefined for today
 * @returns {string} Formatted date string with weekday (e.g., "Monday, January 15, 2024")
 */
export const formatDisplayDateWithWeekday = (date?: string | Date): string => {
  let dateObj: Date
  
  if (!date) {
    // Use today's date if none provided
    dateObj = createLocalDate()
  } else if (typeof date === 'string') {
    // Convert string to Date using createLocalDate
    dateObj = createLocalDate(date)
  } else {
    // Already a Date object, use as is
    dateObj = date
  }
  
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format date for display with short weekday using createLocalDate for timezone safety
 * @param {string | Date | undefined} date - Date string, Date object, or undefined for today
 * @returns {string} Formatted date string with short weekday (e.g., "Mon")
 */
export const formatWeekdayShort = (date?: string | Date): string => {
  let dateObj: Date
  
  if (!date) {
    // Use today's date if none provided
    dateObj = createLocalDate()
  } else if (typeof date === 'string') {
    // Convert string to Date using createLocalDate
    dateObj = createLocalDate(date)
  } else {
    // Already a Date object, use as is
    dateObj = date
  }
  
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short'
  })
}

/**
 * Format date with time for project details using createLocalDate for timezone safety
 * @param {string | Date | undefined} date - Date string, Date object, or undefined for today
 * @returns {string} Formatted date string with time (e.g., "January 15, 2024, 02:30 PM")
 */
export const formatProjectDate = (date?: string | Date): string => {
  let dateObj: Date
  
  if (!date) {
    // Use today's date if none provided
    dateObj = new Date() // Use current date/time for project dates
  } else if (typeof date === 'string') {
    // For project dates, we want to preserve the time, so use new Date() instead of createLocalDate
    dateObj = new Date(date)
  } else {
    // Already a Date object, use as is
    dateObj = date
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format timestamp to time string (HH:MM AM/PM) in local time
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted time string
 */
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format timestamp to date string (DD/MM/YYYY) in local time
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  });
};

/**
 * Format time interval (HH:MM to HH:MM)
 * @param {string} startAt - Start timestamp
 * @param {string} endAt - End timestamp
 * @returns {string} Formatted time interval string
 */
export const formatTimeInterval = (startAt: string, endAt: string): string => {
  return `${formatTime(startAt)} to ${formatTime(endAt)}`;
}; 