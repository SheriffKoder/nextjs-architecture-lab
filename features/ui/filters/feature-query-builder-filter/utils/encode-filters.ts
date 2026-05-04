/**
 * Encode Filters Utility
 * 
 * Purpose: Encode filter AST to URL parameter string
 * Used in: URL integration hook
 * Why: Converts filter tree to URL-safe string
 */

import type { FilterNode } from '../types/filter'

/**
 * Encode filter tree to URL parameter string
 * WHY: Store filter state in URL for shareability and persistence
 * HOW: JSON stringify then URI encode
 * @param {FilterNode | null} filterTree - Filter AST to encode
 * @returns {string} Encoded filter string (empty if null)
 */
export function encodeFilters(filterTree: FilterNode | null): string {
  if (!filterTree) return ''
  return encodeURIComponent(JSON.stringify(filterTree))
}
