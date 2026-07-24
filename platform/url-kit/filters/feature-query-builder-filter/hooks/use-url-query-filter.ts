/**
 * URL Query Filter Hook
 * 
 * Purpose: Sync filter state with URL parameter
 * Used in: QueryBuilder component
 * Why: Provides URL persistence for filter state
 */

'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { useNavigationTransitionOptional } from '@/platform/url-kit/filters/navigation-transition-context'
import type { FilterNode } from '../types/filter'
import { encodeFilters, decodeFilters } from '../utils'

/**
 * useUrlQueryFilter hook - manages filter in URL
 * WHY: Provides URL persistence for filter state
 * HOW: Uses Next.js navigation hooks to read/write URL parameter
 */
export function useUrlQueryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { wrapNavigation } = useNavigationTransitionOptional()

  /**
   * Get current filter from URL
   */
  const getFilter = useCallback((): FilterNode | null => {
    const filterParam = searchParams.get('filter')
    return decodeFilters(filterParam)
  }, [searchParams])

  /**
   * Set filter in URL
   * Skips replace when the serialized query is unchanged so mount-time clears do not start a transition.
   */
  const setFilter = useCallback((filter: FilterNode | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (filter) {
      const encoded = encodeFilters(filter)
      params.set('filter', encoded)
    } else {
      params.delete('filter')
    }

    if (params.toString() === searchParams.toString()) return
    
    wrapNavigation(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [router, pathname, searchParams, wrapNavigation])

  /**
   * Clear filter from URL
   */
  const clearFilter = useCallback(() => {
    setFilter(null)
  }, [setFilter])

  return {
    getFilter,
    setFilter,
    clearFilter,
  }
}
