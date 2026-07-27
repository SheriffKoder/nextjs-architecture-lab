/**
 * Table + pagination — hybrid client mirror of RSC table island.
 *
 * Purpose: Same structure as `views/demo-rsc-page/ui/layout-sections/table-and-pagination-section.tsx`
 * Why: FetchPendingDimmer; footer stays for page-size / exit All;
 *   table / list / cards embed InfiniteLoadMore as last virtualized row
 */

'use client'

import { PaginationFooter } from '@/platform/url-kit/filters/components/pagination-footer'
import { FolderTabs } from '@/platform/url-kit/view-switchers'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import { rentalCarPaginationConfig } from '../../config/data/rental-car-pagination-config'
import {
  DEMO_HYBRID_INFINITE_LOAD_TRIGGER,
  DEMO_RSC_AVAILABLE_VIEWS,
  DEMO_RSC_DEFAULT_VIEW,
  DEMO_RSC_USE_ALL_ITEMS_VIEWS,
  type HybridInfiniteLoadTrigger,
} from '../../config/data/demo-rsc-views-config'
import { DemoHybridContent } from '../demo-hybrid-content'
import { FetchPendingDimmer } from '../fetch-pending-dimmer'
import { InfiniteLoadMore } from '../infinite-load-more'

type DemoHybridTableAndPaginationSectionProps = {
  cars: RentalCarTableItem[]
  filters: FilterConfig[]
  totalItems: number
  isListPending: boolean
  /** Current URL view — cards drops load-more row background. */
  currentView?: string
  /** `all=1` on table/list/cards → infinite pages + load-more. */
  isInfiniteAllMode?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
  loadTrigger?: HybridInfiniteLoadTrigger
}

export function DemoHybridTableAndPaginationSection({
  cars,
  filters,
  totalItems,
  isListPending,
  currentView = DEMO_RSC_DEFAULT_VIEW,
  isInfiniteAllMode = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  loadTrigger = DEMO_HYBRID_INFINITE_LOAD_TRIGGER,
}: DemoHybridTableAndPaginationSectionProps) {
  const showInfinite = isInfiniteAllMode && Boolean(fetchNextPage)
  /** Avoid a blank last virtualized slot when there is nothing left to load. */
  const showInfiniteControl =
    showInfinite && (hasNextPage || isFetchingNextPage)
  const infiniteControl = showInfiniteControl ? (
    <InfiniteLoadMore
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage!}
      loadTrigger={loadTrigger}
      className={
        currentView === 'cards'
          ? 'border-transparent bg-transparent'
          : undefined
      }
    />
  ) : null

  return (
    <FetchPendingDimmer
      pending={isListPending}
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      {/* <div className="w-full flex justify-start shrink-0">
        <FolderTabs
          availableViews={DEMO_RSC_AVAILABLE_VIEWS}
          defaultView={DEMO_RSC_DEFAULT_VIEW}
          useAllItems={DEMO_RSC_USE_ALL_ITEMS_VIEWS}
          defaultPageSize={10}
        />
      </div> */}
      <div className="flex min-h-0 flex-1 flex-col">
        <DemoHybridContent
          cars={cars}
          filters={filters}
          listEndRow={infiniteControl ?? undefined}
        />
      </div>
      <div className="mr-2 shrink-0">
        <PaginationFooter
          totalItems={totalItems}
          config={rentalCarPaginationConfig}
          title="Pagination"
          hideWhenShowAllForViews={DEMO_RSC_USE_ALL_ITEMS_VIEWS}
          defaultView={DEMO_RSC_DEFAULT_VIEW}
        />
      </div>
    </FetchPendingDimmer>
  )
}
