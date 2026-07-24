/**
 * Parse Sorts Utility
 * 
 * Purpose: Parse sort string from URL into array of sort specifications
 * Used in: Server functions and API routes that need to parse sort params
 * Why: Converts URL format to usable data structure
 * 
 * Function Index:
 * - parseSorts: Parses comma-separated sort string into SortSpec array
 *   Example input: "status:asc,department:desc"
 *   Example output: [{ key: 'status', direction: 'asc' }, { key: 'department', direction: 'desc' }]
 */

import type { SortSpec } from '@/platform/url-kit/filters/feature-sorting/types'

/**
 * Parse sort string from URL into array of sort specifications
 * WHY: Convert URL format to usable data structure for sorting
 * HOW: Split by comma, then split each by colon to get key:direction pairs
 * @param {string} sortString - Comma-separated sort string from URL (e.g., "status:asc,department:desc")
 * @returns {SortSpec[]} Array of sort specifications, empty array if string is empty
 */
export function parseSorts(sortString: string): SortSpec[] {
  // Return empty array if no sort string
  if (!sortString || sortString.trim().length === 0) {
    return []
  }
  
  // Split by comma to get individual sorts
  return sortString.split(',').map(sort => {
    // Split by colon to get key and direction
    const [key, direction] = sort.split(':')
    
    // Validate direction (default to 'asc' if invalid)
    const validDirection = (direction === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
    
    return {
      key: key.trim(),
      direction: validDirection
    }
  }).filter(sort => sort.key.length > 0) // Filter out empty keys
}
