/**
 * URL Sorting Hook
 * 
 * Purpose: Manages multi-level sorting state in URL parameters
 * Used in: Sort components and pages that need sorting functionality
 * Why: Provides centralized sorting logic separate from filtering, supports multi-level sorting
 * 
 * Function Index:
 * - useUrlSorting: Main hook that returns all sort getters, setters, and utilities
 *   Example input: const { getSort, toggleSort } = useUrlSorting()
 *   Example output: { getSorts, getSort, getSortLevel, toggleSort, setSort, addSort, removeSort, clearSorts, reorderSorts }
 * 
 * URL Format:
 * - Single sort: sort=status:asc
 * - Multi-level: sort=status:asc,department:desc,createdAt:asc
 * - Order matters: first = primary, second = secondary, etc.
 */

'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import { useOptimisticUrlSearchParams } from '@/features/ui/filters/lib/use-optimistic-url-search-params'
import { useNavigationTransitionOptional } from '@/features/ui/filters/navigation-transition-context'
import { resetPageInSearchParams } from '@/features/ui/filters/feature-pagination/utils'
import type { SortSpec } from '@/features/ui/filters/feature-sorting/types'
import type { SortDirection } from '@/features/ui/filters/feature-sorting/types'

/**
 * Custom hook for managing URL-based sort state
 * 
 * Provides a centralized API for reading, setting, and managing sorts in URL parameters.
 * Supports multi-level sorting where order matters (primary, secondary, etc.).
 * 
 * @returns {Object} Object containing all sort getters, setters, and utility functions
 * 
 * @example
 * ```typescript
 * const { getSort, toggleSort, getSorts } = useUrlSorting()
 * const direction = getSort('status') // 'asc' | 'desc' | null
 * toggleSort('status') // Cycles: none → asc → desc → none
 * const allSorts = getSorts() // [{ key: 'status', direction: 'asc' }, ...]
 * ```
 */
export function useUrlSorting() {
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
   * WHY: Use replace() instead of push() to prevent history spam when sorts change frequently
   * HOW: Optimistic snapshot for instant sort UI, then replace when committed URL differs
   * IMPACT: Better UX - back button doesn't go through every sort change, cleaner history
   * @param {URLSearchParams} params - The new search parameters to set in URL
   */
  const updateUrl = useCallback(
    (params: URLSearchParams) => {
      resetPageInSearchParams(params)
      const next = params.toString()
      applyPendingSnapshot(next)
      if (next === committedSnapshot) return
      wrapNavigation(() => {
        router.replace(`${pathname}?${next}`, { scroll: false })
      })
    },
    [router, pathname, committedSnapshot, applyPendingSnapshot, wrapNavigation],
  )

  //////////////////////////////////
  // GETTERS: Read and parse sorts from URL
  //////////////////////////////////

  /**
   * Parse sort string from URL into array of sort specifications
   * WHY: Convert URL format to usable data structure
   * HOW: Split by comma, then split each by colon to get key:direction pairs
   * @param {string} sortString - Comma-separated sort string (e.g., "status:asc,department:desc")
   * @returns {SortSpec[]} Array of sort specifications in priority order
   */
  const parseSorts = useCallback((sortString: string): SortSpec[] => {
    if (!sortString || sortString.trim().length === 0) {
      return []
    }
    
    return sortString.split(',').map(sort => {
      const [key, direction] = sort.split(':')
      const validDirection = (direction === 'desc' ? 'desc' : 'asc') as SortDirection
      return {
        key: key.trim(),
        direction: validDirection
      }
    }).filter(sort => sort.key.length > 0)
  }, [])

  /**
   * Get all sorts in priority order (primary first)
   * WHY: Need ordered list of all active sorts for multi-level sorting
   * HOW: Parse sort param from URL and return as array
   * @returns {SortSpec[]} Array of sort specifications in priority order
   */
  const getSorts = useCallback((): SortSpec[] => {
    const sortString = effectiveParams.get('sort') || ''
    return parseSorts(sortString)
  }, [effectiveParams, parseSorts])

  /**
   * Get sort direction for a specific key
   * WHY: Check if a specific field is sorted and in which direction
   * HOW: Parse sorts and find matching key, return direction or null
   * @param {string} key - The field key to check
   * @returns {'asc' | 'desc' | null} Sort direction or null if not sorted
   */
  const getSort = useCallback((key: string): 'asc' | 'desc' | null => {
    const sorts = getSorts()
    const sort = sorts.find(s => s.key === key)
    return sort ? sort.direction : null
  }, [getSorts])

  /**
   * Get the priority/level of a sort (0 = primary, 1 = secondary, etc.)
   * WHY: Determine sort priority for multi-level sorting UI
   * HOW: Find index of sort in sorted array
   * @param {string} key - The field key to check
   * @returns {number | null} Priority level (0-based) or null if not sorted
   */
  const getSortLevel = useCallback((key: string): number | null => {
    const sorts = getSorts()
    const index = sorts.findIndex(s => s.key === key)
    return index >= 0 ? index : null
  }, [getSorts])

  //////////////////////////////////
  // SETTERS: Update sorts in URL
  //////////////////////////////////

  /**
   * Build sort string from array of sort specifications
   * WHY: Convert sort array back to URL format
   * HOW: Join key:direction pairs with commas
   * @param {SortSpec[]} sorts - Array of sort specifications
   * @returns {string} Comma-separated sort string
   */
  const buildSortString = useCallback((sorts: SortSpec[]): string => {
    return sorts.map(s => `${s.key}:${s.direction}`).join(',')
  }, [])

  /**
   * Toggle sort for a key: none → asc → desc → none
   * WHY: Simple toggle functionality for sort buttons
   * HOW: Check current state, cycle through: none → asc → desc → none
   *      If key doesn't exist, adds as primary (first in list)
   *      If key exists, cycles through states
   * @param {string} key - The field key to toggle
   */
  const toggleSort = useCallback((key: string) => {
    const currentSorts = getSorts()
    const currentSort = currentSorts.find(s => s.key === key)
    
    let newSorts: SortSpec[]
    
    if (!currentSort) {
      // Key not in sorts: add at end (maintains click order)
      newSorts = [...currentSorts, { key, direction: 'asc' }]
    } else if (currentSort.direction === 'asc') {
      // Key is asc: change to desc
      newSorts = currentSorts.map(s => 
        s.key === key ? { ...s, direction: 'desc' } : s
      )
    } else {
      // Key is desc: remove from sorts
      newSorts = currentSorts.filter(s => s.key !== key)
    }
    
    const params = buildParams()
    if (newSorts.length > 0) {
      params.set('sort', buildSortString(newSorts))
    } else {
      params.delete('sort')
    }
    updateUrl(params)
  }, [getSorts, buildParams, buildSortString, updateUrl])

  /**
   * Set sort explicitly (for custom logic)
   * WHY: Programmatic control over sort state
   * HOW: If direction is null, removes sort; otherwise adds/updates sort
   * @param {string} key - The field key to set
   * @param {'asc' | 'desc' | null} direction - Sort direction or null to remove
   */
  const setSort = useCallback((key: string, direction: 'asc' | 'desc' | null) => {
    const currentSorts = getSorts()
    let newSorts: SortSpec[]
    
    if (direction === null) {
      // Remove sort
      newSorts = currentSorts.filter(s => s.key !== key)
    } else {
      // Add or update sort
      const existingIndex = currentSorts.findIndex(s => s.key === key)
      if (existingIndex >= 0) {
        // Update existing sort
        newSorts = currentSorts.map(s => 
          s.key === key ? { ...s, direction } : s
        )
      } else {
        // Add at end (maintains click order)
        newSorts = [...currentSorts, { key, direction }]
      }
    }
    
    const params = buildParams()
    if (newSorts.length > 0) {
      params.set('sort', buildSortString(newSorts))
    } else {
      params.delete('sort')
    }
    updateUrl(params)
  }, [getSorts, buildParams, buildSortString, updateUrl])

  /**
   * Add sort at specific priority level
   * WHY: Control sort priority explicitly
   * HOW: If level not provided, adds as primary (shifts others down)
   *      If level provided, inserts at that position
   * @param {string} key - The field key to add
   * @param {'asc' | 'desc'} direction - Sort direction
   * @param {number} [level] - Optional priority level (0 = primary)
   */
  const addSort = useCallback((key: string, direction: 'asc' | 'desc', level?: number) => {
    const currentSorts = getSorts()
    const existingIndex = currentSorts.findIndex(s => s.key === key)
    
    // Remove existing if present
    const withoutKey = currentSorts.filter(s => s.key !== key)
    
    let newSorts: SortSpec[]
    if (level !== undefined) {
      // Insert at specific level
      newSorts = [...withoutKey]
      newSorts.splice(level, 0, { key, direction })
    } else {
      // Add at end (maintains click order)
      newSorts = [...withoutKey, { key, direction }]
    }
    
    const params = buildParams()
    params.set('sort', buildSortString(newSorts))
    updateUrl(params)
  }, [getSorts, buildParams, buildSortString, updateUrl])

  /**
   * Remove sort by key
   * WHY: Remove specific sort without affecting others
   * HOW: Filter out sort with matching key
   * @param {string} key - The field key to remove
   */
  const removeSort = useCallback((key: string) => {
    const currentSorts = getSorts()
    const newSorts = currentSorts.filter(s => s.key !== key)
    
    const params = buildParams()
    if (newSorts.length > 0) {
      params.set('sort', buildSortString(newSorts))
    } else {
      params.delete('sort')
    }
    updateUrl(params)
  }, [getSorts, buildParams, buildSortString, updateUrl])

  /**
   * Clear all sorts
   * WHY: Reset all sorting
   * HOW: Remove sort param from URL
   */
  const clearSorts = useCallback(() => {
    const params = buildParams()
    params.delete('sort')
    updateUrl(params)
  }, [buildParams, updateUrl])

  /**
   * Reorder sorts (for drag-and-drop or programmatic reordering)
   * WHY: Change priority order of existing sorts
   * HOW: Reorder array based on provided keys array
   * @param {string[]} keys - Array of keys in desired priority order
   */
  const reorderSorts = useCallback((keys: string[]) => {
    const currentSorts = getSorts()
    const sortMap = new Map(currentSorts.map(s => [s.key, s]))
    
    const newSorts: SortSpec[] = keys
      .map(key => sortMap.get(key))
      .filter((s): s is SortSpec => s !== undefined)
    
    const params = buildParams()
    if (newSorts.length > 0) {
      params.set('sort', buildSortString(newSorts))
    } else {
      params.delete('sort')
    }
    updateUrl(params)
  }, [getSorts, buildParams, buildSortString, updateUrl])

  /**
   * Set multiple sorts at once (batch operation)
   * WHY: Set multiple sorts in a single URL update (for initial sorts, etc.)
   * HOW: Takes array of SortSpec and sets all at once
   * @param {SortSpec[]} sorts - Array of sort specifications to set
   */
  const setSorts = useCallback((sorts: SortSpec[]) => {
    const params = buildParams()
    if (sorts.length > 0) {
      params.set('sort', buildSortString(sorts))
    } else {
      params.delete('sort')
    }
    updateUrl(params)
  }, [buildParams, buildSortString, updateUrl])

  // Return all functions as a single API for components to use
  return {
    getSorts,
    getSort,
    getSortLevel,
    toggleSort,
    setSort,
    setSorts,
    addSort,
    removeSort,
    clearSorts,
    reorderSorts,
  }
}
