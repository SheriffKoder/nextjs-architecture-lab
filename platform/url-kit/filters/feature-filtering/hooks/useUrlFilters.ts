/**
 * URL Filters Hook
 * 
 * Purpose: Centralizes all URL filter logic to provide a single source of truth for filter state in the URL
 * Used in: Filter components (MultiSelectFilter, SingleSelectFilter, DateRangeFilter, NumberRangeFilter, etc.)
 * Why: Prevents each filter component from re-implementing URL parameter logic, ensures consistent URL format,
 *      and preserves unrelated params (page, sort, etc.) when filters change
 * 
 * Function Index:
 * - useUrlFilters: Main hook that returns all filter getters, setters, and utilities
 *   Example input: const { getList, toggleListValue } = useUrlFilters()
 *   Example output: { get, getList, getRange, getNumberRange, set, setList, toggleListValue, setRange, setNumberRange, remove, clearAll, setPage, setSort }
 * 
 * Steps:
 * 1. Initialize Next.js navigation hooks (router, searchParams, pathname) to access and modify URL
 * 2. Create helper functions (buildParams, updateUrl) to manage URL parameter operations
 * 3. Implement getter functions to read and parse different filter types from URL
 * 4. Implement setter functions to update URL with different filter types
 * 5. Implement utility functions for removing filters and clearing all filters
 * 6. Implement pagination and sorting helpers
 * 7. Return all functions as a single API for components to use
 */

'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useOptimisticUrlSearchParams } from '@/platform/url-kit/filters/lib/use-optimistic-url-search-params'
import { useNavigationTransitionOptional } from '@/platform/url-kit/filters/navigation-transition-context'
import {
  decodeUrlParamList,
  encodeUrlParamList,
} from '@/platform/url-kit/filters/feature-filtering/utils/url-param-list-codec'
import { resetPageInSearchParams } from '@/platform/url-kit/filters/feature-pagination/utils'

/**
 * Custom hook for managing URL-based filter state
 * 
 * Provides a centralized API for reading, setting, and managing filters in URL parameters.
 * Uses router.replace() instead of push() to prevent history spam when filters change frequently.
 * 
 * @returns {Object} Object containing all filter getters, setters, and utility functions
 * 
 * @example
 * ```typescript
 * const { getList, toggleListValue, setRange } = useUrlFilters()
 * const selected = getList('status')
 * toggleListValue('status', 'open')
 * setRange('date', '2025-01-01', '2025-01-31')
 * ```
 */
export function useUrlFilters() {
  // Initialize Next.js navigation hooks to access and modify URL state
  // WHY: These hooks provide access to current URL params and ability to update them
  // HOW: searchParams reads current URL, router updates URL, pathname gets current route
  const router = useRouter()
  const pathname = usePathname()
  const { wrapNavigation } = useNavigationTransitionOptional()
  const {
    committedSnapshot,
    effectiveParams,
    buildParams,
    applyPendingSnapshot,
  } = useOptimisticUrlSearchParams()

  //////////////////////////////////
  // Helper Functions: Build and update URL parameters
  //////////////////////////////////

  /**
   * Updates the URL with new search parameters
   * WHY: Use replace() instead of push() to prevent history spam when filters change frequently
   * HOW: Applies optimistic snapshot for instant control UI, then replace when committed URL differs
   * IMPACT: Better UX - back button doesn't go through every filter change, cleaner history
   * @param {URLSearchParams} params - The new search parameters to set in URL
   */
  const updateUrl = (params: URLSearchParams) => {
    const next = params.toString()
    applyPendingSnapshot(next)
    // Skip replace when already committed (e.g. QueryBuilder clear on mount when param absent).
    if (next === committedSnapshot) return
    wrapNavigation(() => {
      router.replace(`${pathname}?${next}`, { scroll: false })
    })
  }

  /**
   * Filter / search / legacy sort updates reset pagination to page 1 (see `reset-page-on-filter-sort.md`).
   * Do not use for `setPage` — pagination navigation must preserve the chosen page.
   */
  const updateUrlAfterDataChange = (params: URLSearchParams) => {
    resetPageInSearchParams(params)
    updateUrl(params)
  }

  //////////////////////////////////
  // GETTERS: Read and parse filters from URL
  //////////////////////////////////

  /**
   * Gets a single string value from URL parameters
   * WHY: Simple getter for single-select filters or text search
   * HOW: Reads directly from searchParams, returns null if not found
   * @param {string} key - The parameter key to retrieve
   * @returns {string | null} The parameter value or null if not found
   */
  const get = (key: string): string | null => {
    return effectiveParams.get(key)
  }

  /**
   * Gets a comma-separated list from URL parameters
   * WHY: Multi-select filters store multiple values as comma-separated string
   * HOW: Splits comma-separated string into array, returns empty array if not found
   * @param {string} key - The parameter key to retrieve
   * @returns {string[]} Array of values, empty array if not found
   */
  const getList = (key: string): string[] => {
    const value = effectiveParams.get(key)
    return decodeUrlParamList(value)
  }

  /**
   * Gets a date range from URL parameters (format: start_end)
   * WHY: Date ranges stored as underscore-separated values to avoid comma conflicts
   * HOW: Splits underscore-separated string into start and end values
   * @param {string} key - The parameter key to retrieve
   * @returns {{ start: string, end: string } | null} Object with start and end dates, or null if not found
   */
  const getRange = (key: string) => {
    const value = effectiveParams.get(key)
    if (!value) return null

    // Split underscore-separated range into start and end values
    const [start, end] = value.split('_')
    return { start, end }
  }

  /**
   * Gets a number range from URL parameters (format: min_max)
   * WHY: Number ranges stored as underscore-separated values, need numeric conversion
   * HOW: Splits underscore-separated string and converts to numbers
   * @param {string} key - The parameter key to retrieve
   * @returns {{ min: number | undefined, max: number | undefined } | null} Object with min and max numbers, or null if not found
   */
  const getNumberRange = (key: string) => {
    const value = effectiveParams.get(key)
    if (!value) return null

    // Split underscore-separated range and convert to numbers
    const [min, max] = value.split('_')
    return {
      min: min ? Number(min) : undefined, // Convert to number if exists, undefined otherwise
      max: max ? Number(max) : undefined   // Convert to number if exists, undefined otherwise
    }
  }

  //////////////////////////////////
  // SETTERS: Update filters in URL
  //////////////////////////////////

  /**
   * Sets a single string or number value in URL parameters
   * WHY: For single-select filters, text search, or pagination
   * HOW: Creates new params, sets the key-value pair, updates URL
   * @param {string} key - The parameter key to set
   * @param {string | number} value - The value to set (converted to string)
   */
  const set = (key: string, value: string | number) => {
    const params = buildParams()
    params.set(key, String(value)) // Convert to string for URL compatibility
    updateUrlAfterDataChange(params)
  }

  /**
   * Sets a comma-separated list in URL parameters
   * WHY: Multi-select filters need to store multiple values as single URL param
   * HOW: Joins array into comma-separated string, removes param if array is empty
   * @param {string} key - The parameter key to set
   * @param {string[]} values - Array of values to set (joined with commas)
   */
  const setList = (key: string, values: string[]) => {
    const params = buildParams()

    // Remove param if no values to keep URL clean
    if (values.length === 0) {
      params.delete(key)
    } else {
      params.set(key, encodeUrlParamList(values))
    }

    updateUrlAfterDataChange(params)
  }

  /**
   * Toggles a value in a multi-select list
   * WHY: Common UX pattern - clicking a filter option should add/remove it
   * HOW: Gets current list, checks if value exists, adds if missing or removes if present
   * @param {string} key - The parameter key for the list
   * @param {string} value - The value to toggle
   */
  const toggleListValue = (key: string, value: string) => {
    const current = getList(key)

    // If value already in list, remove it; otherwise add it
    if (current.includes(value)) {
      setList(
        key,
        current.filter(v => v !== value) // Remove the value from current list
      )
    } else {
      setList(key, [...current, value]) // Add value to current list
    }
  }

  /**
   * Sets a date range in URL parameters (format: start_end)
   * WHY: Date ranges need both start and end, stored as underscore-separated to avoid comma conflicts
   * HOW: Joins start and end with underscore, removes param if both are empty
   * @param {string} key - The parameter key to set
   * @param {string | undefined} start - Start date string
   * @param {string | undefined} end - End date string
   */
  const setRange = (key: string, start?: string, end?: string) => {
    const params = buildParams()

    // Remove param if no range values to keep URL clean
    if (!start && !end) {
      params.delete(key)
    } else {
      // Join start and end with underscore separator
      params.set(key, `${start ?? ''}_${end ?? ''}`)
    }

    updateUrlAfterDataChange(params)
  }

  /**
   * Sets a number range in URL parameters (format: min_max)
   * WHY: Number ranges need both min and max, stored as underscore-separated
   * HOW: Converts numbers to strings and joins with underscore, removes param if both are empty
   * @param {string} key - The parameter key to set
   * @param {number | undefined} min - Minimum number value
   * @param {number | undefined} max - Maximum number value
   */
  const setNumberRange = (key: string, min?: number, max?: number) => {
    const params = buildParams()

    // Remove param if no range values to keep URL clean
    if (!min && !max) {
      params.delete(key)
    } else {
      // Convert numbers to strings and join with underscore separator
      params.set(key, `${min ?? ''}_${max ?? ''}`)
    }

    updateUrlAfterDataChange(params)
  }

  //////////////////////////////////
  // UTILITIES: Remove and clear filters
  //////////////////////////////////

  /**
   * Removes a specific filter from URL parameters
   * WHY: Allow users to clear individual filters without affecting others
   * HOW: Deletes the specified key from params, preserves all other params
   * @param {string} key - The parameter key to remove
   */
  const remove = (key: string) => {
    const params = buildParams()
    params.delete(key) // Remove only this key, keep all other params
    updateUrlAfterDataChange(params)
  }

  /**
   * Clears all filters from URL, keeping only the pathname
   * WHY: Provide "Reset Filters" functionality to return to base state
   * HOW: Replaces entire URL with just pathname, removing all query parameters
   */
  const clearAll = () => {
    applyPendingSnapshot('')
    wrapNavigation(() => {
      router.replace(pathname, { scroll: false }) // Navigate to pathname only, removing all query params
    })
  }

  //////////////////////////////////
  // PAGINATION: Page number management
  //////////////////////////////////

  /**
   * Sets the page number in URL parameters
   * WHY: Pagination needs to be in URL for shareable/bookmarkable page states
   * HOW: Uses generic set() function to set page number
   * @param {number} page - The page number to set
   */
  const setPage = (page: number) => {
    const params = buildParams()
    params.set('page', String(Math.max(1, page)))
    updateUrl(params)
  }

  //////////////////////////////////
  // SORTING: Sort field and order management
  //////////////////////////////////

  /**
   * Sets sort field and order in URL parameters
   * WHY: Sorting needs to be in URL for shareable/bookmarkable sort states
   * HOW: Sets both 'sort' and 'order' params atomically in single URL update
   * @param {string} field - The field name to sort by
   * @param {'asc' | 'desc'} order - The sort order (ascending or descending)
   */
  const setSort = (field: string, order: 'asc' | 'desc') => {
    const params = buildParams()
    params.set('sort', field)   // Set sort field
    params.set('order', order)  // Set sort order
    updateUrlAfterDataChange(params)
  }

  //////////////////////////////////
  // SEARCH: Search query management
  //////////////////////////////////

  /**
   * Get search query from URL
   * WHY: Read current search query from URL params
   * HOW: Returns value of 'q' parameter or empty string
   * @returns {string} Current search query or empty string
   */
  const getSearch = (): string => {
    return effectiveParams.get('q') || ''
  }

  /**
   * Set search query in URL
   * WHY: Update URL with search query for shareable/bookmarkable search states
   * HOW: Sets 'q' parameter, removes if empty string
   * @param {string} query - The search query string
   */
  const setSearch = (query: string) => {
    const params = buildParams()
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      params.set('q', trimmedQuery)
    } else {
      params.delete('q') // Remove 'q' param if query is empty
    }
    updateUrlAfterDataChange(params)
  }

  // Return all functions as a single API for components to use
  return {
    get,
    getList,
    getRange,
    getNumberRange,

    set,
    setList,
    toggleListValue,
    setRange,
    setNumberRange,

    remove,
    clearAll,

    setPage,
    setSort,

    getSearch,
    setSearch,
  }
}
