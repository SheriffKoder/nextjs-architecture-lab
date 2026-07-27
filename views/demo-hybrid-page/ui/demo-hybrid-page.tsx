/**
 * @file views/demo-hybrid-page/ui/demo-hybrid-page.tsx
 * Client shell for the hybrid rental cars demo page.
 *
 * Purpose: QueryProvider + HydrationBoundary + shallow URL list state + TanStack list/facets
 * Used in: `app/(root)/demo-hybrid-page/page.tsx` (RSC passes dehydrated state)
 * Used for: Filter/sort/page updates refetch via TanStack only — no App Router navigation
 *
 * Function Index:
 * - DemoHybridPage — `QueryProvider` → `HydrationBoundary` → content
 * - DemoHybridPageContent — shallow params + queries + layout sections
 *
 * Steps (DemoHybridPageContent):
 * 1. Seed `useShallowListParams` from RSC `initialQuery` (hydration key parity).
 * 2. Drive `useRentalCars` + `useRentalCarFilterOptions` from `listQuery`.
 * 3. Render shallow filters, table content, and shallow pagination footer.
 * 4. Do not wrap filter writes in `NavigationTransitionRoot` / `wrapNavigation`.
 */

'use client'

import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query'
import { QueryProvider } from '@/entities/demo-hybrid-cars/providers'
import {
  useRentalCars,
  useRentalCarFilterOptions,
} from '@/entities/demo-hybrid-cars/queries'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import { useShallowListParams } from '@/views/demo-hybrid-page/hooks/use-shallow-list-params'
import { DemoHybridContent } from './demo-hybrid-content'
import { DemoHybridFiltersSection } from './layout-sections/filters-section'
import { DemoHybridPaginationFooter } from './layout-sections/pagination-footer'

type DemoHybridPageContentProps = {
  /** Query built on the server from URL — must match prefetch cache keys */
  initialQuery: RentalCarListQuery
}

type DemoHybridPageClientProps = DemoHybridPageContentProps & {
  /** Server-prefetched TanStack cache — must hydrate inside `QueryProvider` */
  dehydratedState: DehydratedState
}

/**
 * Inner client tree — assumes `QueryProvider` ancestor.
 *
 * @param props.initialQuery - Normalized list state from RSC route
 */
function DemoHybridPageContent({ initialQuery }: DemoHybridPageContentProps) {
  // Step 1: shallow URL is source of truth after mount; seed matches dehydrated keys
  const {
    listQuery,
    setFilter,
    setSearch,
    setSort,
    setPage,
    setLimit,
    setShowAll,
    clearFilters,
  } = useShallowListParams(initialQuery)

  // Step 2: both hooks share `listQuery` → one facet cache for strip + table
  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
    isPlaceholderData: listIsPlaceholderData,
    isError: listError,
  } = useRentalCars(listQuery)
  const {
    data: filterOptions,
    isLoading: filtersLoading,
    isFetching: filtersFetching,
    isError: filtersError,
  } = useRentalCarFilterOptions(listQuery)

  const cars = listData?.cars ?? []
  const totalItems = listData?.pagination.totalItems ?? 0
  const filters = filterOptions ?? []

  // Step 3–4: layout — no NavigationTransitionRoot for list interactions
  return (
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
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
        {listError || filtersError ? (
          <p className="text-sm text-destructive">
            Failed to load rental cars or filter options.
          </p>
        ) : (
          <>
            {filtersLoading && filters.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading filters…</p>
            ) : (
              <DemoHybridFiltersSection
                filters={filters}
                listQuery={listQuery}
                setFilter={setFilter}
                setSearch={setSearch}
                setSort={setSort}
                clearFilters={clearFilters}
                isFetching={filtersFetching}
              />
            )}

            <div className="flex min-h-0 flex-1 flex-col">
              {listLoading && cars.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading cars…</p>
              ) : (
                <DemoHybridContent
                  cars={cars}
                  filters={filters}
                  isListPending={listFetching && listIsPlaceholderData}
                />
              )}
            </div>

            <DemoHybridPaginationFooter
              totalItems={totalItems}
              listQuery={listQuery}
              setPage={setPage}
              setLimit={setLimit}
              setShowAll={setShowAll}
            />
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Hybrid page client entry — provider must wrap `HydrationBoundary` (it calls `useQueryClient`).
 *
 * @param props.initialQuery - List query from RSC prefetch
 * @param props.dehydratedState - Dehydrated cache from server prefetch
 */
export default function DemoHybridPage({
  initialQuery,
  dehydratedState,
}: DemoHybridPageClientProps) {
  return (
    <QueryProvider>
      <HydrationBoundary state={dehydratedState}>
        <DemoHybridPageContent initialQuery={initialQuery} />
      </HydrationBoundary>
    </QueryProvider>
  )
}
