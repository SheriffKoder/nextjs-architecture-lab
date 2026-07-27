/**
 * @file views/demo-hybrid-page/hooks/use-shallow-list-params.ts
 * Shallow URL state for hybrid list filters / sort / pagination (Option B).
 *
 * Purpose: Keep shareable URL without App Router `router.replace` on list interactions
 * Used in: `views/demo-hybrid-page/ui/demo-hybrid-page.tsx`
 * Used for: Drive TanStack `queryKey`s via `listQuery`; writes use `history.replaceState`
 *
 * Function Index:
 * - useShallowListParams — mount parse, setters, popstate sync
 *
 * Steps:
 * 1. Seed state from `initialQuery` (RSC prefetch parity) or window search.
 * 2. On setter: merge patch → optional page reset → replaceState + setState.
 * 3. Preserve UI-only URL keys (view, drawer, …) when rewriting list params.
 * 4. Listen `popstate` to re-parse the address bar (back/forward).
 *
 * Decision: `app/development/hybrid-migration/decisions/url-state.md` (Option B, not nuqs).
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SortSpec } from '@/platform/url-kit/filters/feature-sorting/types'
import type {
  RentalCarListQuery,
  RentalCarNumberRange,
} from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import { rentalCarListQueryToSearchParams } from '@/entities/demo-hybrid-cars/transform/build-rental-car-list-query'
import { parseListQueryFromSearchParams } from '@/entities/demo-hybrid-cars/transform/parse-list-query-from-search-params'
import { DEMO_RSC_LIST_DATA_SEARCH_PARAM_KEYS } from '@/views/demo-hybrid-page/config/contract/url-param-keys'
import { rentalCarPaginationConfig } from '@/views/demo-hybrid-page/config/data/rental-car-pagination-config'

/** Multi-select filter keys owned by the shallow list URL contract. */
export type ShallowListFilterKey =
  | 'status'
  | 'make'
  | 'location'
  | 'model'
  | 'licensePlate'

type BatchPatch = Partial<RentalCarListQuery> & {
  /**
   * When true, force `page: 1` in the same `replaceState`.
   * When false, leave page alone (pagination navigation).
   * When omitted, reset page if the patch touches filter/sort/search/limit/showAll.
   */
  resetPage?: boolean
}

export type UseShallowListParamsResult = {
  listQuery: RentalCarListQuery
  setFilter: (key: ShallowListFilterKey, values: string[]) => void
  setNumberRange: (
    key: 'year' | 'pricePerDay' | 'mileage',
    range: RentalCarNumberRange | undefined
  ) => void
  setSearch: (q: string) => void
  setSort: (sort: SortSpec[] | undefined) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setShowAll: (showAll: boolean) => void
  clearFilters: () => void
  batchUpdate: (patch: BatchPatch) => void
}

const DEFAULT_LIMIT = rentalCarPaginationConfig.defaultPageSize || 10

const FILTER_TOUCH_KEYS = [
  'status',
  'make',
  'location',
  'model',
  'licensePlate',
  'year',
  'pricePerDay',
  'mileage',
  'rentalStartDate',
  'date',
  'q',
  'sort',
  'limit',
  'showAll',
] as const

function readQueryFromWindow(): RentalCarListQuery {
  if (typeof window === 'undefined') {
    return { page: 1, limit: DEFAULT_LIMIT }
  }
  return parseListQueryFromSearchParams(window.location.search)
}

/**
 * Write list params into the address bar without App Router navigation.
 * Preserves non-list keys currently on the URL (view chrome, future drawer, etc.).
 */
function replaceListQueryInUrl(query: RentalCarListQuery) {
  if (typeof window === 'undefined') return

  const next = new URLSearchParams(window.location.search)

  for (const key of DEMO_RSC_LIST_DATA_SEARCH_PARAM_KEYS) {
    next.delete(key)
  }

  const flat = rentalCarListQueryToSearchParams(query)
  for (const [key, value] of Object.entries(flat)) {
    if (value === undefined) continue
    next.set(key, Array.isArray(value) ? value.join(',') : value)
  }

  const qs = next.toString()
  const path = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`
  window.history.replaceState(window.history.state, '', path)
}

function omitEmptyLists(query: RentalCarListQuery): RentalCarListQuery {
  let next = { ...query }
  for (const key of [
    'status',
    'make',
    'location',
    'model',
    'licensePlate',
  ] as const) {
    if (next[key] && next[key]!.length === 0) {
      const { [key]: _, ...rest } = next
      next = rest
    }
  }
  if (next.q === '') {
    const { q: _, ...rest } = next
    next = rest
  }
  if (next.sort && next.sort.length === 0) {
    const { sort: _, ...rest } = next
    next = rest
  }
  return next
}

function applyPatch(
  prev: RentalCarListQuery,
  patch: BatchPatch
): RentalCarListQuery {
  const { resetPage: resetPageFlag, ...rest } = patch
  let next: RentalCarListQuery = omitEmptyLists({ ...prev, ...rest })

  const touchesFilterLike = FILTER_TOUCH_KEYS.some((key) => key in rest)
  const shouldResetPage =
    resetPageFlag === true ||
    (resetPageFlag !== false && touchesFilterLike && rest.page === undefined)

  if (next.showAll) {
    const { page: _p, limit: _l, ...showAllQuery } = next
    next = { ...showAllQuery, showAll: true }
  } else {
    const { showAll: _a, ...paged } = next
    next = {
      ...paged,
      page: shouldResetPage ? 1 : (paged.page ?? 1),
      limit: paged.limit ?? DEFAULT_LIMIT,
    }
  }

  return omitEmptyLists(next)
}

/**
 * Shallow list URL hook — single source of truth for hybrid filter/sort/page state.
 *
 * @param initialQuery - Query from RSC prefetch; preferred seed so hydration keys match
 */
export function useShallowListParams(
  initialQuery?: RentalCarListQuery
): UseShallowListParamsResult {
  // Step 1: seed from server query (preferred) so first paint matches dehydrated keys
  const [listQuery, setListQuery] = useState<RentalCarListQuery>(
    () => initialQuery ?? readQueryFromWindow()
  )

  // Step 4: back/forward restores list state from the address bar
  useEffect(() => {
    const onPopState = () => {
      setListQuery(readQueryFromWindow())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const batchUpdate = useCallback((patch: BatchPatch) => {
    // Step 2–3: state + shallow URL write in one turn
    setListQuery((prev) => {
      const next = applyPatch(prev, patch)
      replaceListQueryInUrl(next)
      return next
    })
  }, [])

  const setFilter = useCallback(
    (key: ShallowListFilterKey, values: string[]) => {
      batchUpdate({ [key]: values, resetPage: true })
    },
    [batchUpdate]
  )

  const setNumberRange = useCallback(
    (
      key: 'year' | 'pricePerDay' | 'mileage',
      range: RentalCarNumberRange | undefined
    ) => {
      batchUpdate({ [key]: range, resetPage: true })
    },
    [batchUpdate]
  )

  const setSearch = useCallback(
    (q: string) => {
      batchUpdate({ q, resetPage: true })
    },
    [batchUpdate]
  )

  const setSort = useCallback(
    (sort: SortSpec[] | undefined) => {
      batchUpdate({ sort, resetPage: true })
    },
    [batchUpdate]
  )

  const setPage = useCallback(
    (page: number) => {
      batchUpdate({
        page: Math.max(1, page),
        showAll: false,
        resetPage: false,
      })
    },
    [batchUpdate]
  )

  const setLimit = useCallback(
    (limit: number) => {
      batchUpdate({
        limit,
        showAll: false,
        resetPage: true,
      })
    },
    [batchUpdate]
  )

  const setShowAll = useCallback(
    (showAll: boolean) => {
      if (showAll) {
        batchUpdate({ showAll: true, resetPage: false })
      } else {
        batchUpdate({
          showAll: false,
          page: 1,
          limit: listQuery.limit ?? DEFAULT_LIMIT,
          resetPage: false,
        })
      }
    },
    [batchUpdate, listQuery.limit]
  )

  const clearFilters = useCallback(() => {
    batchUpdate({
      status: [],
      make: [],
      location: [],
      model: [],
      licensePlate: [],
      year: undefined,
      pricePerDay: undefined,
      mileage: undefined,
      rentalStartDate: undefined,
      date: undefined,
      q: '',
      sort: [],
      resetPage: true,
    })
  }, [batchUpdate])

  return {
    listQuery,
    setFilter,
    setNumberRange,
    setSearch,
    setSort,
    setPage,
    setLimit,
    setShowAll,
    clearFilters,
    batchUpdate,
  }
}
