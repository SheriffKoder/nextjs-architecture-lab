/**
 * Table + pagination RSC island — one Suspense boundary; shares `getRentalCarsPageData` via `cache()`.
 * Client `NavigationPendingDimmer` dims this block during wrapped URL transitions (filters / pagination / drawer).
 */

import { NavigationPendingDimmer } from '@/features/ui/filters/navigation-transition-context'
import { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import { PaginationFooter } from '@/features/ui/filters/components/pagination-footer'
import { rentalCarPaginationConfig } from '../../config/header-filters-config'
import DemoRscContent from '../../demo-rsc-content'
import { getRentalCarsPageData } from '../../utils/server/get-rental-cars-page-data'

export default async function TableAndPaginationSection({
  params,
}: {
  params: DemoRscPageSearchParams
}) {
  const { carsPayload, filtersPayload } = await getRentalCarsPageData(params)

  return (
    <NavigationPendingDimmer className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col">
        <DemoRscContent cars={carsPayload.cars} filters={filtersPayload} />
      </div>
      <div className="shrink-0 mr-2">
        <PaginationFooter
          totalItems={carsPayload.pagination.totalItems}
          config={rentalCarPaginationConfig}
          title="Pagination"
        />
      </div>
    </NavigationPendingDimmer>
  )
}
