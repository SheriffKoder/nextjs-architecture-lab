/**
 * Decode Filters Utility
 * 
 * Purpose: Decode URL parameter string to filter AST
 * Used in: URL integration hook
 * Why: Converts URL string back to filter tree
 */

import type { FilterNode } from '../types/filter'

/**
 * Decode URL parameter string to filter AST
 * WHY: Restore filter state from URL on page load
 * HOW: URI decode then JSON parse
 * @param {string | null} param - Encoded filter string from URL
 * @returns {FilterNode | null} Decoded filter tree or null if invalid
 */
export function decodeFilters(param: string | null): FilterNode | null {
  if (!param) return null
  try {
    return JSON.parse(decodeURIComponent(param)) as FilterNode
  } catch {
    return null
  }
}
