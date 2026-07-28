/**
 * @file views/demo-hybrid-page/ui/demo-hybrid-page-client.tsx
 * Hybrid page body — listQuery from URL transport + TanStack queries + layout sections.
 *
 * Purpose: Page content rendered inside HydrationBoundary (no provider wiring here)
 * Used in: `demo-hybrid-page.tsx`
 * Used for: Filter/sort/page changes refetch via TanStack;
 *   `all=1` on table/list/cards → `useInfiniteRentalCars` (board views still showAll fetch)
 *
 * Function Index:
 * - DemoHybridPageClient — header, filters section, table + pagination / infinite section
 */

'use client'

import { useCallback, useMemo, useRef } from 'react'
import {
  useInfiniteRentalCars,
  useRentalCars,
  useRentalCarFilterOptions,
} from '@/entities/demo-hybrid-cars/queries'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import { useUrlParamsTransport } from '@/platform/url-kit/url-params'
import FilterToolbarSkeleton from '@/shared/ui/loading-skeletons/filters/filter-toolbar-skeleton'
import TableSkeleton from '@/shared/ui/loading-skeletons/table/table-skeleton'
import {
  DEMO_HYBRID_INFINITE_LOAD_TRIGGER,
  DEMO_RSC_DEFAULT_VIEW,
  isHybridInfiniteAllMode,
} from '@/views/demo-hybrid-page/config/data/demo-rsc-views-config'
import { useListQueryFromUrl } from '@/views/demo-hybrid-page/hooks/use-list-query-from-url'
import { useQueryErrorToast } from '@/views/demo-hybrid-page/hooks/use-query-error-toast'
import DemoHybridPageHeader from './demo-hybrid-page-header'
import { DemoHybridDrawerLayer } from './drawer'
import { DemoHybridFiltersSection } from './layout-sections/filters-section'
import { DemoHybridTableAndPaginationSection } from './layout-sections/table-and-pagination-section'

const HYBRID_LIST_ERROR_TOAST_GROUP = 'hybrid-list-error'
const HYBRID_FILTERS_ERROR_TOAST_GROUP = 'hybrid-filters-error'

export function DemoHybridPageClient() {
  const listQuery = useListQueryFromUrl()
  const { effectiveParams } = useUrlParamsTransport()
  const currentView =
    effectiveParams.get('view')?.trim() || DEMO_RSC_DEFAULT_VIEW
  const isInfiniteAllMode = isHybridInfiniteAllMode(
    currentView,
    listQuery.showAll,
  )

  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
    isPlaceholderData: listIsPlaceholderData,
    error: listError,
    refetch: refetchList,
  } = useRentalCars(listQuery, { enabled: !isInfiniteAllMode })

  const {
    data: infiniteData,
    isLoading: infiniteLoading,
    isFetching: infiniteFetching,
    isFetchingNextPage,
    isPlaceholderData: infiniteIsPlaceholderData,
    hasNextPage,
    fetchNextPage,
    error: infiniteError,
    refetch: refetchInfinite,
  } = useInfiniteRentalCars(listQuery, { enabled: isInfiniteAllMode })

  const {
    data: filterOptions,
    isLoading: filtersLoadingQuery,
    error: filtersError,
    refetch: refetchFilters,
  } = useRentalCarFilterOptions(listQuery)

  const liveCars = useMemo(() => {
    if (isInfiniteAllMode) {
      return infiniteData?.pages.flatMap((page) => page.cars) ?? []
    }
    return listData?.cars ?? []
  }, [infiniteData?.pages, isInfiniteAllMode, listData?.cars])

  const liveTotalItems = isInfiniteAllMode
    ? (infiniteData?.pages.at(-1)?.pagination.totalItems ?? 0)
    : (listData?.pagination.totalItems ?? 0)

  // Keep last non-empty rows when flipping All ↔ page (infinite cold start / key swap)
  const heldCarsRef = useRef<RentalCarTableItem[]>([])
  const heldTotalRef = useRef(0)
  if (liveCars.length > 0) {
    heldCarsRef.current = liveCars
    heldTotalRef.current = liveTotalItems
  }
  const holdingPreviousRows =
    liveCars.length === 0 && heldCarsRef.current.length > 0
  const cars = holdingPreviousRows ? heldCarsRef.current : liveCars
  const totalItems = holdingPreviousRows
    ? heldTotalRef.current
    : liveTotalItems

  const listErrorActive = isInfiniteAllMode ? infiniteError : listError

  const retryList = useCallback(() => {
    if (isInfiniteAllMode) {
      void refetchInfinite()
      return
    }
    void refetchList()
  }, [isInfiniteAllMode, refetchInfinite, refetchList])

  const retryFilters = useCallback(() => {
    void refetchFilters()
  }, [refetchFilters])

  const handleFetchNextPage = useCallback(() => {
    void fetchNextPage()
  }, [fetchNextPage])

  useQueryErrorToast({
    group: HYBRID_LIST_ERROR_TOAST_GROUP,
    error: listErrorActive,
    title: 'Failed to load cars',
    fallbackMessage: 'Could not load rental cars.',
    onRetry: retryList,
  })

  useQueryErrorToast({
    group: HYBRID_FILTERS_ERROR_TOAST_GROUP,
    error: filtersError,
    title: 'Failed to load filters',
    fallbackMessage: 'Could not load filter options.',
    onRetry: retryFilters,
  })

  const filters = filterOptions ?? []
  const showFiltersLoading = filtersLoadingQuery && filters.length === 0
  const showTableLoading = isInfiniteAllMode
    ? infiniteLoading && cars.length === 0
    : listLoading && cars.length === 0

  // Dim: placeholder key swap, or holding previous rows while infinite page 1 loads
  const isListPending = isInfiniteAllMode
    ? (infiniteFetching && infiniteIsPlaceholderData && !isFetchingNextPage) ||
      (holdingPreviousRows && infiniteFetching && !isFetchingNextPage)
    : listFetching && listIsPlaceholderData

  return (
    <>
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <DemoHybridPageHeader />

        <DemoHybridDrawerLayer />

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden pb-0 pt-0 md:pt-2 md:px-2">
          {showFiltersLoading ? (
            <FilterToolbarSkeleton />
          ) : (
            <DemoHybridFiltersSection filters={filters} />
          )}

          {showTableLoading ? (
            <TableSkeleton columnCount={10} rowCount={8} showHeader={true} />
          ) : (
            <DemoHybridTableAndPaginationSection
              cars={cars}
              filters={filters}
              totalItems={totalItems}
              isListPending={isListPending}
              currentView={currentView}
              isInfiniteAllMode={isInfiniteAllMode}
              hasNextPage={Boolean(hasNextPage)}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={handleFetchNextPage}
              loadTrigger={DEMO_HYBRID_INFINITE_LOAD_TRIGGER}
            />
          )}
        </div>
      </div>
    </>
  )
}
