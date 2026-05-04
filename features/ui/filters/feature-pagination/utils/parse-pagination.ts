/**
 * Parse Pagination Utility
 * 
 * Purpose: Parse pagination state from URL search parameters
 * Used in: Server functions, API routes, and hooks
 * Why: Centralized parsing logic for consistency
 * 
 * Function Index:
 * - parsePagination: Parse page and limit from URLSearchParams
 *   Example input: parsePagination(new URLSearchParams('?page=2&limit=20'), 20)
 *   Example output: { page: 2, limit: 20 }
 */

import type { PaginationState } from '../types'

/**
 * Parse pagination from URL search params
 * WHY: Extract page and limit from URL parameters with defaults
 * HOW: Reads 'page' and 'limit' params, validates and defaults to 1 and provided defaultLimit
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {number} defaultLimit - Default items per page (default: 20)
 * @returns {PaginationState} Parsed pagination state
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit: number = 20
): PaginationState {
  // Parse page number
  // WHY: Get current page from URL, default to 1 if not present or invalid
  // HOW: Read 'page' param, parse to number, validate >= 1
  const pageParam = searchParams.get('page')
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1
  
  // Parse limit (items per page)
  // WHY: Get page size from URL, default to provided defaultLimit if not present or invalid
  // HOW: Read 'limit' param, parse to number, validate >= 1
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Math.max(1, parseInt(limitParam, 10) || defaultLimit) : defaultLimit
  
  return { page, limit }
}
