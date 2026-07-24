/**
 * Apply Sorts Utility
 * 
 * Purpose: Apply multi-level sorting to data array
 * Used in: Server functions and API routes that need to sort data
 * Why: Implements multi-level sorting logic (primary, secondary, etc.)
 * 
 * Function Index:
 * - applySorts: Sorts data array based on sort specifications
 *   Example input: applySorts(employees, [{ key: 'status', direction: 'asc' }, { key: 'department', direction: 'desc' }])
 *   Example output: Sorted array with status as primary sort, department as secondary
 */

import type { SortSpec } from '../types'

/**
 * Apply sorts to data array (primary first, then secondary, etc.)
 * WHY: Implement multi-level sorting where primary sort takes precedence
 * HOW: Sort array, comparing by each sort level in order, only moving to next level if current level values are equal
 * @param {T[]} data - Array of data to sort
 * @param {SortSpec[]} sorts - Array of sort specifications in priority order (first is primary)
 * @returns {T[]} New sorted array (does not mutate original)
 */
export function applySorts<T extends Record<string, any>>(
  data: T[],
  sorts: SortSpec[]
): T[] {
  // Return original data if no sorts
  if (sorts.length === 0) {
    return data
  }
  
  // Create copy to avoid mutating original
  const sortedData = [...data]
  
  // Sort using all sort levels
  sortedData.sort((a, b) => {
    // Compare by each sort level in order
    for (const { key, direction } of sorts) {
      const aVal = a[key]
      const bVal = b[key]
      
      // Handle null/undefined values (treat as less than defined values)
      if (aVal === null || aVal === undefined) {
        if (bVal === null || bVal === undefined) {
          continue // Both null, check next sort level
        }
        return 1 // a is null, b is not, a comes after
      }
      if (bVal === null || bVal === undefined) {
        return -1 // b is null, a is not, a comes before
      }
      
      // Compare values
      let comparison: number
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        // String comparison (case-insensitive)
        comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase())
      } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        comparison = Number(aVal) - Number(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        // Number comparison
        comparison = aVal - bVal
      } else if (aVal instanceof Date && bVal instanceof Date) {
        // Date comparison
        comparison = aVal.getTime() - bVal.getTime()
      } else {
        // Fallback: convert to string and compare
        comparison = String(aVal).localeCompare(String(bVal))
      }
      
      // If values are equal, continue to next sort level
      if (comparison === 0) {
        continue
      }
      
      // Return comparison result (invert if descending)
      return direction === 'asc' ? comparison : -comparison
    }
    
    // All sort levels equal
    return 0
  })
  
  return sortedData
}