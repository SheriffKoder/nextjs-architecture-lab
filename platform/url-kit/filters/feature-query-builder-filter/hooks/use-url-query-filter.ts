/**
 * URL Query Filter Hook
 *
 * Purpose: Sync filter state with URL parameter
 * Used in: QueryBuilder component
 * Why: Provides URL persistence for filter state
 */

'use client'

import { useCallback } from 'react'
import { useUrlParamsTransport } from '@/platform/url-kit/url-params'
import { resetPageInSearchParams } from '@/platform/url-kit/filters/feature-pagination/utils'
import type { FilterNode } from '../types/filter'
import { encodeFilters, decodeFilters } from '../utils'

/**
 * useUrlQueryFilter hook - manages filter in URL
 * WHY: Provides URL persistence for filter state
 * HOW: Uses url-params transport to read/write URL parameter
 */
export function useUrlQueryFilter() {
  const {
    effectiveParams,
    buildParams,
    commit,
    committedSnapshot,
    wrapNavigation,
  } = useUrlParamsTransport()

  /**
   * Get current filter from URL
   */
  const getFilter = useCallback((): FilterNode | null => {
    const filterParam = effectiveParams.get('filter')
    return decodeFilters(filterParam)
  }, [effectiveParams])

  /**
   * Set filter in URL
   * Skips commit when the serialized query is unchanged so mount-time clears do not start a transition.
   */
  const setFilter = useCallback(
    (filter: FilterNode | null) => {
      const params = buildParams()

      if (filter) {
        const encoded = encodeFilters(filter)
        params.set('filter', encoded)
      } else {
        params.delete('filter')
      }

      resetPageInSearchParams(params)
      const next = params.toString()
      if (next === committedSnapshot) return

      wrapNavigation(() => commit(next))
    },
    [buildParams, commit, committedSnapshot, wrapNavigation],
  )

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
