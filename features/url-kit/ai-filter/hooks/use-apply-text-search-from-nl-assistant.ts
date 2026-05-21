'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  applyTextSearchToUrlQuery,
  clearTextSearchFromUrlQuery,
} from '@/features/url-kit/ai-filter/lib/apply-text-search-to-url-query'
import { useNavigationTransitionOptional } from '@/features/url-kit/filters/navigation-transition-context'

/**
 * Applies the assistant input as a normal URL text search (`q` by default),
 * same idea as {@link useUrlFilters} `setSearch` in ExpandableSearchControl, plus page reset.
 */
export function useApplyTextSearchFromNlAssistant(
  paginationPageParamKey = 'page',
  searchParamKey = 'q',
) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { wrapNavigation } = useNavigationTransitionOptional()

  const applyTextSearch = useCallback(
    (rawText: string) => {
      const qs = applyTextSearchToUrlQuery(
        new URLSearchParams(searchParams.toString()),
        rawText,
        { searchParamKey, paginationPageParamKey },
      )
      const href = qs ? `${pathname}?${qs}` : pathname
      if (qs !== searchParams.toString()) {
        wrapNavigation(() => {
          router.replace(href, { scroll: false })
        })
      }
    },
    [
      paginationPageParamKey,
      pathname,
      router,
      searchParamKey,
      searchParams,
      wrapNavigation,
    ],
  )

  const clearTextSearch = useCallback(() => {
    const qs = clearTextSearchFromUrlQuery(
      new URLSearchParams(searchParams.toString()),
      { searchParamKey, paginationPageParamKey },
    )
    const href = qs ? `${pathname}?${qs}` : pathname
    if (qs !== searchParams.toString()) {
      wrapNavigation(() => {
        router.replace(href, { scroll: false })
      })
    }
  }, [
    paginationPageParamKey,
    pathname,
    router,
    searchParamKey,
    searchParams,
    wrapNavigation,
  ])

  return { applyTextSearch, clearTextSearch }
}
