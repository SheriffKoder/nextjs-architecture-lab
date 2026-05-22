/**
 * Table + pagination RSC — loads `getCars` + `getFilters` (table needs both for `DemoRscContent`);
 * wrapped in `<Suspense>` from `demo-rsc-index`. `unstable_cache` dedupes `getFilters` with `FiltersSection`.
 */

// Features/UI
import { NavigationPendingDimmer } from '@/features/url-kit/filters/navigation-transition-context'
import { PaginationFooter } from '@/features/url-kit/filters/components/pagination-footer'

// Page
import { rentalCarPaginationConfig } from '../../config/header-filters-config'
import {
  DEMO_RSC_DEFAULT_VIEW,
  DEMO_RSC_USE_ALL_ITEMS_VIEWS,
} from '../../config/demo-rsc-views-config'
import DemoRscContent from '../../demo-rsc-content'
import { demoRscDataParamsToCacheKey } from '../../utils/demo-rsc-search-params-cache-key'
import TablePaginationErrorRethrow from '../layout-sections-error-boundaries/table-pagination-error-rethrow'

// Data
import { getCars, getFilters } from '@/features/cars-rsc/server/demo-rsc-cached-loaders'

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
