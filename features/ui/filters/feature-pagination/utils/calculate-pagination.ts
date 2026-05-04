/**
 * Calculate Pagination Utility
 * 
 * Purpose: Calculate derived pagination values from state and total items
 * Used in: Components and hooks that need pagination calculations
 * Why: Centralized calculation logic for consistency
 * 
 * Function Index:
 * - calculatePagination: Calculate all derived pagination values
 *   Example input: calculatePagination(2, 20, 100)
 *   Example output: { totalPages: 5, isFirst: false, isLast: false, hasNext: true, hasPrevious: true, startItem: 21, endItem: 40 }
 */

import type { PaginationCalculated } from '../types'

/**
 * Calculate derived pagination values
 * WHY: Compute all pagination metadata needed for display and navigation
 * HOW: Uses page, limit, and totalItems to calculate totals, flags, and ranges
 * @param {number} page - Current page number (1-indexed)
 * @param {number} limit - Items per page
 * @param {number} totalItems - Total number of items
 * @returns {PaginationCalculated} All calculated pagination values
 */
export function calculatePagination(
  page: number,
  limit: number,
  totalItems: number
): PaginationCalculated {
  // Calculate total pages
  // WHY: Determine how many pages exist
  // HOW: Divide total items by limit, round up
  const totalPages = Math.ceil(totalItems / limit)
  
  // Calculate navigation flags
  // WHY: Determine navigation state for buttons
  // HOW: Compare current page to boundaries
  const isFirst = page === 1
  const isLast = page >= totalPages || totalPages === 0
  const hasNext = !isLast
  const hasPrevious = !isFirst
  
  // Calculate item range for current page
  // WHY: Display "Showing X-Y of Z" text
  // HOW: Calculate start/end indices, convert to 1-indexed item numbers
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, totalItems)
  
  return {
    totalPages,
    isFirst,
    isLast,
    hasNext,
    hasPrevious,
    startItem,
    endItem
  }
}
