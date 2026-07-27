/**
 * @file views/demo-hybrid-page/ui/demo-hybrid-content.tsx
 * Phase 1 list surface: hover detail prefetch + selectedId state (no drawer panel yet).
 *
 * Purpose: Prove TanStack detail cache — hover `prefetchQuery` and click `useRentalCarDetail`
 *          share the same key/`queryFn` so open after hover is a cache hit.
 * Used in: `demo-hybrid-page.tsx` after list hydration
 * Used for: Phase 1 bottleneck fix; Phase 3 replaces `selectedId` with the drawer store
 *
 * Function Index:
 * - DemoHybridContent — row list with pointer-enter prefetch and click selection
 *
 * Steps:
 * 1. Hold local `selectedId` (URL drawer params deferred to Phase 3).
 * 2. Subscribe with `useRentalCarDetail(selectedId)` so open reads the same cache as prefetch.
 * 3. On row pointer enter, fire-and-forget `prefetchQuery` with matching key + `fetchRentalCarById`.
 * 4. On row click, set `selectedId` only — no detail panel until Phase 3.
 * 5. Render a simple row list (scaffold until Phase 2 ViewOrchestrator).
 */

'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import { fetchRentalCarById } from '@/entities/demo-hybrid-cars/client'
import { useRentalCarDetail } from '@/entities/demo-hybrid-cars/queries'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'

/** Matches `useRentalCarDetail` / list hooks so prefetch stays warm on open. */
const DETAIL_STALE_TIME_MS = 5 * 60 * 1000

type DemoHybridContentProps = {
  /** Current page rows from the hydrated list query */
  cars: RentalCarTableItem[]
}

/**
 * Minimal row list for Phase 1 detail prefetch.
 * Drawer / detail panel arrives in Phase 3 — selection is local state only.
 *
 * @param props.cars - Rows from `useRentalCars` (already on the page)
 */
export function DemoHybridContent({ cars }: DemoHybridContentProps) {
  const queryClient = useQueryClient()

  // Step 1: local selection only (no panel, no URL drawer params)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Step 2: subscribe — after hover, click should show isFetching: false (cache hit)
  const detailQuery = useRentalCarDetail(selectedId)

  /**
   * Step 3: warm detail cache on hover (fire-and-forget; never blocks UI).
   * Same `queryKey` + `queryFn` as `useRentalCarDetail`.
   */
  const handleRowPointerEnter = (row: RentalCarTableItem) => {
    void queryClient.prefetchQuery({
      queryKey: rentalCarKeys.detail(row.id),
      queryFn: () => fetchRentalCarById(row.id),
      staleTime: DETAIL_STALE_TIME_MS,
    })
  }

  // Step 4: click selects id only — Phase 3 opens the drawer from this same cache
  const handleRowClick = (row: RentalCarTableItem) => {
    setSelectedId(row.id)
  }

  // Step 5: scaffold list (replaced by ViewOrchestrator in Phase 2)
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
        {selectedId == null ? (
          <p>No row selected. Hover to prefetch · click to set selectedId.</p>
        ) : (
          <p>
            selectedId: <span className="font-mono text-foreground">{selectedId}</span>
            {' · '}
            detail:{' '}
            {detailQuery.isFetching
              ? 'fetching'
              : detailQuery.isError
                ? 'error'
                : detailQuery.isSuccess
                  ? 'cache ready'
                  : 'idle'}
            {detailQuery.data
              ? ` (${detailQuery.data.make} ${detailQuery.data.model})`
              : null}
          </p>
        )}
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border">
        {cars.map((car) => {
          const isSelected = car.id === selectedId
          return (
            <li key={car.id}>
              <button
                type="button"
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50 ${
                  isSelected ? 'bg-muted/40' : ''
                }`}
                onPointerEnter={() => handleRowPointerEnter(car)}
                onClick={() => handleRowClick(car)}
              >
                <span className="font-medium">
                  {car.make} {car.model}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {car.id}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
