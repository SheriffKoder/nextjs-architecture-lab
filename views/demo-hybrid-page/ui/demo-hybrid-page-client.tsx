/**
 * @file views/demo-hybrid-page/ui/demo-hybrid-page-client.tsx
 * Hybrid page body — listQuery from URL transport + TanStack queries + layout sections.
 *
 * Purpose: Page content rendered inside HydrationBoundary (no provider wiring here)
 * Used in: `demo-hybrid-page.tsx`
 * Used for: Filter/sort/page changes refetch list + facets via TanStack only
 *
 * Function Index:
 * - DemoHybridPageClient — header, filters section, table + pagination section
 */

'use client'

import { useCallback } from 'react'
import {
  useRentalCars,
  useRentalCarFilterOptions,
} from '@/entities/demo-hybrid-cars/queries'
import OfflineDetector from '@/shared/ui/offline/offline-detector'
import FilterToolbarSkeleton from '@/shared/ui/loading-skeletons/filters/filter-toolbar-skeleton'
import TableSkeleton from '@/shared/ui/loading-skeletons/table/table-skeleton'
import ToastContainer from '@/shared/ui/toast/toast-container'
import { ToastPosition, ToastStacking } from '@/shared/ui/toast/toast'
import { useListQueryFromUrl } from '@/views/demo-hybrid-page/hooks/use-list-query-from-url'
import { useQueryErrorToast } from '@/views/demo-hybrid-page/hooks/use-query-error-toast'
import AddCarButton from './add-car-button'
import { DemoHybridDrawerLayer } from './drawer'
import { DemoHybridFiltersSection } from './layout-sections/filters-section'
import { DemoHybridTableAndPaginationSection } from './layout-sections/table-and-pagination-section'

const HYBRID_LIST_ERROR_TOAST_GROUP = 'hybrid-list-error'
const HYBRID_FILTERS_ERROR_TOAST_GROUP = 'hybrid-filters-error'

export function DemoHybridPageClient() {
  const listQuery = useListQueryFromUrl()

  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
    isPlaceholderData: listIsPlaceholderData,
    error: listError,
    refetch: refetchList,
  } = useRentalCars(listQuery)
  const {
    data: filterOptions,
    isLoading: filtersLoadingQuery,
    error: filtersError,
    refetch: refetchFilters,
  } = useRentalCarFilterOptions(listQuery)

  const retryList = useCallback(() => {
    void refetchList()
  }, [refetchList])

  const retryFilters = useCallback(() => {
    void refetchFilters()
  }, [refetchFilters])

  useQueryErrorToast({
    group: HYBRID_LIST_ERROR_TOAST_GROUP,
    error: listError,
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

  const cars = listData?.cars ?? []
  const totalItems = listData?.pagination.totalItems ?? 0
  const filters = filterOptions ?? []
  const showFiltersLoading = filtersLoadingQuery && filters.length === 0
  const showTableLoading = listLoading && cars.length === 0

  return (
    <>
      <ToastContainer
        position={ToastPosition.BOTTOM_RIGHT}
        stacking={ToastStacking.PUSH_DOWN}
      />
      <OfflineDetector />

      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-tertiary/10 p-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Car Rentals (Hybrid)
            </h1>
            <p className="text-sm text-muted-foreground">
              Shallow URL · TanStack list + facets (no RSC remount on filter)
            </p>
          </div>
          <AddCarButton />
        </header>

        <DemoHybridDrawerLayer />

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
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
              isListPending={listFetching && listIsPlaceholderData}
            />
          )}
        </div>
      </div>
    </>
  )
}
