/**
 * Date Display Utilities
 * 
 * Purpose: Utility functions for formatting date filter button display text
 * Used in: DateFilterButton component
 * Why: Centralizes date formatting logic for different filter modes
 * 
 * Functions:
 * - formatDateFilterDisplay: Formats display text based on date range and mode
 */

import { createLocalDate } from '../../utils/formatting/date-formatter';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, format } from 'date-fns';

/**
 * Date filter mode type
 */
export type DateFilterMode = 'day' | 'week' | 'month' | 'range';

/**
 * Parameters for formatting date filter display
 */
export interface FormatDateFilterDisplayParams {
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  mode?: DateFilterMode;
  defaultText?: string;
}

/**
 * Detects the date filter mode based on the date range
 * 
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @returns Detected mode or null if dates are invalid
 */
export function detectDateFilterMode(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): DateFilterMode | null {
  if (!startDate || !endDate) {
    return null;
  }

  try {
    const start = createLocalDate(startDate);
    const end = createLocalDate(endDate);

    // Check if it's a single day
    if (isSameDay(start, end)) {
      return 'day';
    }

    // Check if it's a full month (start is first day, end is last day of same month)
    const isFullMonth =
      start.getDate() === 1 &&
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear() &&
      end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();

    if (isFullMonth) {
      return 'month';
    }

    // Check if it's a full week (start is start of week, end is end of week)
    const weekStart = startOfWeek(start, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(start, { weekStartsOn: 0 }); // Saturday

    if (isSameDay(start, weekStart) && isSameDay(end, weekEnd)) {
      return 'week';
    }

    // Otherwise it's a custom range
    return 'range';
  } catch {
    return null;
  }
}

/**
 * Formats the date filter button display text based on mode and date range
 * 
 * @param params - Formatting parameters
 * @returns Formatted display text
 * 
 * @example
 * ```ts
 * // Day mode
 * formatDateFilterDisplay({
 *   startDate: '2024-01-15',
 *   endDate: '2024-01-15',
 *   mode: 'day'
 * }); // Returns: "Jan 15, 2024"
 * 
 * // Week mode
 * formatDateFilterDisplay({
 *   startDate: '2024-01-14',
 *   endDate: '2024-01-20',
 *   mode: 'week'
 * }); // Returns: "Jan 14 - Jan 20, 2024"
 * 
 * // Month mode
 * formatDateFilterDisplay({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   mode: 'month'
 * }); // Returns: "Jan 2024"
 * 
 * // Range mode
 * formatDateFilterDisplay({
 *   startDate: '2024-01-15',
 *   endDate: '2024-02-20',
 *   mode: 'range'
 * }); // Returns: "Jan 15 - Feb 20, 2024"
 * ```
 */
export function formatDateFilterDisplay({
  startDate,
  endDate,
  mode,
  defaultText = 'Filter by Date'
}: FormatDateFilterDisplayParams): string {
  // If no dates provided, return default text
  if (!startDate || !endDate) {
    return defaultText;
  }

  try {
    const start = createLocalDate(startDate);
    const end = createLocalDate(endDate);

    // Auto-detect mode if not provided
    const detectedMode = mode || detectDateFilterMode(startDate, endDate);

    if (!detectedMode) {
      return defaultText;
    }

    switch (detectedMode) {
      case 'day': {
        // Check if it's a single day or a range of days
        if (isSameDay(start, end)) {
          // Single day: "Jan 15, 2024"
          return format(start, 'MMM d, yyyy');
        } else {
          // Day range: "Jan 15 - Jan 20, 2024" or "Jan 15, 2024 - Jan 20, 2025"
          const startFormatted = format(start, 'MMM d');
          const endFormatted = format(end, 'MMM d, yyyy');
          
          // If same year, don't repeat year in start
          if (start.getFullYear() === end.getFullYear()) {
            return `${startFormatted} - ${endFormatted}`;
          }
          
          // Different years: "Dec 15, 2023 - Jan 20, 2024"
          return `${format(start, 'MMM d, yyyy')} - ${endFormatted}`;
        }
      }

      case 'week': {
        // Week range: "Jan 14 - Jan 20, 2024" or "Jan 14 - Feb 3, 2024"
        const startFormatted = format(start, 'MMM d');
        const endFormatted = format(end, 'MMM d, yyyy');
        
        // If same year, don't repeat year in start
        if (start.getFullYear() === end.getFullYear()) {
          return `${startFormatted} - ${endFormatted}`;
        }
        
        // Different years: "Dec 28, 2023 - Jan 3, 2024"
        return `${format(start, 'MMM d, yyyy')} - ${endFormatted}`;
      }

      case 'month': {
        // Full month: "Jan 2024"
        return format(start, 'MMM yyyy');
      }

      case 'range': {
        // Custom range: "Jan 15 - Feb 20, 2024" or "Jan 15, 2024 - Feb 20, 2025"
        const startFormatted = format(start, 'MMM d');
        const endFormatted = format(end, 'MMM d, yyyy');
        
        // If same year, don't repeat year in start
        if (start.getFullYear() === end.getFullYear()) {
          return `${startFormatted} - ${endFormatted}`;
        }
        
        // Different years: "Dec 15, 2023 - Jan 20, 2024"
        return `${format(start, 'MMM d, yyyy')} - ${endFormatted}`;
      }

      default:
        return defaultText;
    }
  } catch (error) {
    console.error('Error formatting date filter display:', error);
    return defaultText;
  }
}
