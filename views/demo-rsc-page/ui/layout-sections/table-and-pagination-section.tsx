/**
 * Table + pagination RSC — loads `getCars` + `getFilters` (table needs both for `DemoRscContent`);
 * wrapped in `<Suspense>` from `demo-rsc-index`. `unstable_cache` dedupes `getFilters` with `FiltersSection`.
 */

// Features/UI
import { NavigationPendingDimmer } from '@/platform/url-kit/filters/navigation-transition-context'
import { PaginationFooter } from '@/platform/url-kit/filters/components/pagination-footer'
import { FolderTabs } from '@/platform/url-kit/view-switchers'

// Page
import { rentalCarPaginationConfig } from '../../config/data/rental-car-pagination-config'
import {
  DEMO_RSC_AVAILABLE_VIEWS,
  DEMO_RSC_DEFAULT_VIEW,
  DEMO_RSC_USE_ALL_ITEMS_VIEWS,
} from '../../config/data/demo-rsc-views-config'
import DemoRscContent from '../../demo-rsc-content'
import { demoRscDataParamsToCacheKey } from '../../lib/demo-rsc-search-params-cache-key'
import TablePaginationErrorRethrow from '../layout-sections-error-boundaries/table-pagination-error-rethrow'

// Data
import { getCars, getFilters } from '@/entities/cars-rsc/server/demo-rsc-cached-loaders'

// Types
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'


export default async function TableAndPaginationSection({
  params,
}: {
  params: DemoRscPageSearchParams
}) {

  const dataKey = demoRscDataParamsToCacheKey(params)

  let cars: Awaited<ReturnType<typeof getCars>>
  let filters: Awaited<ReturnType<typeof getFilters>>
  try {
    ;[cars, filters] = await Promise.all([
      getCars(dataKey),
      getFilters(dataKey),
    ])
  } catch (error) {
    return <TablePaginationErrorRethrow error={error} />
  }

  return (
    <NavigationPendingDimmer className="flex min-h-0 flex-1 flex-col gap-4">
      {/* <div className="w-full flex justify-start shrink-0">
        <FolderTabs
          availableViews={DEMO_RSC_AVAILABLE_VIEWS}
          defaultView={DEMO_RSC_DEFAULT_VIEW}
          useAllItems={DEMO_RSC_USE_ALL_ITEMS_VIEWS}
          defaultPageSize={10}
        />
      </div> */}
      <div className="flex min-h-0 flex-1 flex-col">
        <DemoRscContent cars={cars.cars} filters={filters} />
      </div>
      <div className="shrink-0 mr-2">
        <PaginationFooter
          totalItems={cars.pagination.totalItems}
          config={rentalCarPaginationConfig}
          title="Pagination"
          hideWhenShowAllForViews={DEMO_RSC_USE_ALL_ITEMS_VIEWS}
          defaultView={DEMO_RSC_DEFAULT_VIEW}
        />
      </div>
    </NavigationPendingDimmer>
  )
}
