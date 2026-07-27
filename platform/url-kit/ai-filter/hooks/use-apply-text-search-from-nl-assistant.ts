'use client'

import { useCallback } from 'react'

import {
  applyTextSearchToUrlQuery,
  clearTextSearchFromUrlQuery,
} from '@/platform/url-kit/ai-filter/lib/apply-text-search-to-url-query'
import { useUrlParamsTransport } from '@/platform/url-kit/url-params'

/**
 * Applies the assistant input as a normal URL text search (`q` by default),
 * same idea as {@link useUrlFilters} `setSearch` in ExpandableSearchControl, plus page reset.
 */
export function useApplyTextSearchFromNlAssistant(
  paginationPageParamKey = 'page',
  searchParamKey = 'q',
) {
  const {
    effectiveParams,
    buildParams,
    commit,
    committedSnapshot,
    wrapNavigation,
  } = useUrlParamsTransport()

  const applyTextSearch = useCallback(
    (rawText: string) => {
      const qs = applyTextSearchToUrlQuery(
        buildParams(),
        rawText,
        { searchParamKey, paginationPageParamKey },
      )
      if (qs !== committedSnapshot) {
        wrapNavigation(() => commit(qs))
      }
    },
    [
      buildParams,
      commit,
      committedSnapshot,
      paginationPageParamKey,
      searchParamKey,
      wrapNavigation,
    ],
  )

  const clearTextSearch = useCallback(() => {
    const qs = clearTextSearchFromUrlQuery(buildParams(), {
      searchParamKey,
      paginationPageParamKey,
    })
    if (qs !== committedSnapshot) {
      wrapNavigation(() => commit(qs))
    }
  }, [
    buildParams,
    commit,
    committedSnapshot,
    paginationPageParamKey,
    searchParamKey,
    wrapNavigation,
  ])

  return { applyTextSearch, clearTextSearch }
}
