/**
 * Table + pagination RSC — loads `getCars` + `getFilters` (table needs both for `DemoRscContent`);
 * wrapped in `<Suspense>` from `demo-rsc-index`. `unstable_cache` dedupes `getFilters` with `FiltersSection`.
 */

import { NavigationPendingDimmer } from '@/features/ui/filters/navigation-transition-context'
import { PaginationFooter } from '@/features/ui/filters/components/pagination-footer'
import { rentalCarPaginationConfig } from '../../config/header-filters-config'
import DemoRscContent from '../../demo-rsc-content'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import { getCars, getFilters } from '../../utils/server/demo-rsc-cached-loaders'
import { demoRscDataParamsToCacheKey } from '../../utils/ui/demo-rsc-search-params-cache-key'
import TablePaginationErrorRethrow from './table-pagination-error-rethrow'

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
        />
      </div>
    </NavigationPendingDimmer>
  )
}
