/**
 * @file views/demo-hybrid-page/ui/demo-hybrid-page.tsx
 * Client shell for the hybrid rental cars demo page.
 *
 * Purpose: Mount `QueryProvider`, subscribe to hydrated list + facet queries, render Phase 0 placeholder UI
 * Used in: `app/(root)/demo-hybrid-page/page.tsx` via `HydrationBoundary`
 * Used for: Client-side cache reads after RSC prefetch; grows into full table/filters in Phase 2
 *
 * Function Index:
 * - DemoHybridPage — wraps content with entity `QueryProvider`
 * - DemoHybridPageContent — reads hooks and renders scaffold status card
 *
 * Steps (DemoHybridPageContent):
 * 1. Subscribe to list query with server-provided `initialQuery` (matches prefetch keys).
 * 2. Subscribe to filter options query with the same query object.
 * 3. Derive display counts from hook data (no extra local state).
 * 4. Render header + hydrated status card or error message.
 */

'use client'

import { QueryProvider } from '@/entities/demo-hybrid-cars/providers'
import {
  useRentalCars,
  useRentalCarFilterOptions,
} from '@/entities/demo-hybrid-cars/queries'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'

type DemoHybridPageClientProps = {
  /** Query built on the server from URL — must match prefetch cache keys */
  initialQuery: RentalCarListQuery
}

/**
 * Inner client tree — assumes `QueryProvider` ancestor.
 *
 * @param props.initialQuery - Normalized list state from RSC route
 */
function DemoHybridPageContent({ initialQuery }: DemoHybridPageClientProps) {
  // Step 1–2: hydrated queries (instant when prefetch succeeded)
  const { data: listData, isLoading: listLoading, isError: listError } =
    useRentalCars(initialQuery)
  const { data: filterOptions, isLoading: filtersLoading } =
    useRentalCarFilterOptions(initialQuery)

  // Step 3: derived presentation values
  const carCount = listData?.cars.length ?? 0
  const totalItems = listData?.pagination.totalItems ?? 0
  const filterCount = filterOptions?.length ?? 0

  // Step 4: Phase 0 placeholder — replaced by ViewOrchestrator in Phase 2
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-tertiary/10 p-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Car Rentals (Hybrid)
          </h1>
          <p className="text-sm text-muted-foreground">
            RSC prefetch + TanStack hydration scaffold
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {listError ? (
          <p className="text-sm text-destructive">Failed to load rental cars.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <p>
              {listLoading
                ? 'Loading cars…'
                : `Loaded ${carCount} cars on this page (${totalItems} total matching filters).`}
            </p>
            <p className="mt-2 text-muted-foreground">
              {filtersLoading
                ? 'Loading filter facets…'
                : `${filterCount} filter configs hydrated.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Hybrid page client entry — provides TanStack context then renders content.
 *
 * @param props.initialQuery - List query from RSC prefetch
 */
export default function DemoHybridPage({
  initialQuery,
}: DemoHybridPageClientProps) {
  return (
    <QueryProvider>
      <DemoHybridPageContent initialQuery={initialQuery} />
    </QueryProvider>
  )
}
