/**
 * @file views/demo-hybrid-page/ui/demo-hybrid-content.tsx
 * Hybrid table surface: ViewOrchestrator + detail hover prefetch + selectedId.
 *
 * Purpose: Render list rows from TanStack data; warm detail cache on hover; select on click
 * Used in: `demo-hybrid-page.tsx`
 * Used for: Table UX without drawer panel (drawer arrives later); list data is client-driven
 *
 * Function Index:
 * - DemoHybridContent — ViewOrchestrator + prefetch/selection handlers
 *
 * Steps:
 * 1. Hold local `selectedId` (drawer store deferred).
 * 2. Subscribe with `useRentalCarDetail(selectedId)` so open shares hover cache.
 * 3. Prefetch detail on row pointer enter (same key/`queryFn` as the hook).
 * 4. Click sets `selectedId` only — no panel yet.
 * 5. Render `ViewOrchestrator` inside `FetchPendingDimmer` while placeholder rows fetch.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ViewOrchestrator } from '@/widgets/multi-view/view-orchestrator'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import { fetchRentalCarById } from '@/entities/demo-hybrid-cars/client'
import { useRentalCarDetail } from '@/entities/demo-hybrid-cars/queries'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import { tableDisplayConfig } from '@/views/demo-hybrid-page/config/ui/displays/table-config'
import { tableColumns } from '@/views/demo-hybrid-page/config/ui/columns'
import { listViewConfig } from '@/views/demo-hybrid-page/config/ui/displays/list-config'
import { DEMO_RSC_DEFAULT_GROUPS_EXPANDED } from '@/views/demo-hybrid-page/config/data/demo-rsc-grouping-config'
import { DEMO_RSC_GROUPING_ALLOWED_KEYS } from '@/views/demo-hybrid-page/config/ui/demo-rsc-minimal-controls-config'
import { FetchPendingDimmer } from './fetch-pending-dimmer'

/** Matches `useRentalCarDetail` / hover prefetch staleTime. */
const DETAIL_STALE_TIME_MS = 5 * 60 * 1000

type DemoHybridContentProps = {
  cars: RentalCarTableItem[]
  filters?: FilterConfig[]
  /**
   * True while showing previous rows during a list refetch
   * (`isFetching && isPlaceholderData` from `useRentalCars`).
   */
  isListPending?: boolean
}

/**
 * Table + detail selection surface for the hybrid page.
 */
export function DemoHybridContent({
  cars,
  filters,
  isListPending = false,
}: DemoHybridContentProps) {
  const queryClient = useQueryClient()
  const [tableData, setTableData] = useState(cars)

  // Step 1: local selection only (drawer in a later phase)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Step 2: subscribe — hover then click should be a cache hit
  const detailQuery = useRentalCarDetail(selectedId)

  useEffect(() => {
    setTableData(cars)
  }, [cars])

  // Step 3: warm detail cache on hover
  const handleRowPointerEnter = useCallback(
    (row: RentalCarTableItem) => {
      void queryClient.prefetchQuery({
        queryKey: rentalCarKeys.detail(row.id),
        queryFn: () => fetchRentalCarById(row.id),
        staleTime: DETAIL_STALE_TIME_MS,
      })
    },
    [queryClient]
  )

  // Step 4: click selects id only
  const handleRowClick = useCallback((row: RentalCarTableItem) => {
    setSelectedId(row.id)
  }, [])

  // Step 5: ViewOrchestrator — table only so view chrome does not call router.replace
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        {selectedId == null ? (
          <p>No row selected. Hover to prefetch · click to set selectedId.</p>
        ) : (
          <p>
            selectedId:{' '}
            <span className="font-mono text-foreground">{selectedId}</span>
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

      <FetchPendingDimmer
        pending={isListPending}
        className="flex min-h-0 flex-1 flex-col"
      >
        <ViewOrchestrator
          data={tableData}
          columns={tableColumns}
          filters={filters}
          onRowClick={handleRowClick}
          onRowPointerEnter={handleRowPointerEnter}
          externalUrlControls
          urlGroupingAllowedKeys={DEMO_RSC_GROUPING_ALLOWED_KEYS}
          defaultGroupsExpanded={DEMO_RSC_DEFAULT_GROUPS_EXPANDED}
          defaultPageSize={10}
          availableViews={['table']}
          tableConfig={tableDisplayConfig}
          listViewConfig={listViewConfig}
        />
      </FetchPendingDimmer>
    </div>
  )
}
