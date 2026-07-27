/**
 * Table + pagination — hybrid client mirror of RSC table island.
 *
 * Purpose: Same structure as `views/demo-rsc-page/ui/layout-sections/table-and-pagination-section.tsx`
 * Why: FetchPendingDimmer replaces NavigationPendingDimmer; PaginationFooter from url-kit
 */

'use client'

import { PaginationFooter } from '@/platform/url-kit/filters/components/pagination-footer'
import { FolderTabs } from '@/platform/url-kit/view-switchers'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import { rentalCarPaginationConfig } from '../../config/data/rental-car-pagination-config'
import {
  DEMO_RSC_AVAILABLE_VIEWS,
  DEMO_RSC_DEFAULT_VIEW,
  DEMO_RSC_USE_ALL_ITEMS_VIEWS,
} from '../../config/data/demo-rsc-views-config'
import { DemoHybridContent } from '../demo-hybrid-content'
import { FetchPendingDimmer } from '../fetch-pending-dimmer'

type DemoHybridTableAndPaginationSectionProps = {
  cars: RentalCarTableItem[]
  filters: FilterConfig[]
  totalItems: number
  isListPending: boolean
}

export function DemoHybridTableAndPaginationSection({
  cars,
  filters,
  totalItems,
  isListPending,
}: DemoHybridTableAndPaginationSectionProps) {
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
        <DemoHybridContent cars={cars} filters={filters} />
      </div>
      <div className="shrink-0 mr-2">
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
