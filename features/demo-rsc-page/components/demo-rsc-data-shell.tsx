/**
 * Demo Rsc Data Shell
 *
 * Purpose: Async RSC boundary that awaits `searchParams` once and loads cars + filters in one `getRentalCarsPageData` call
 * Used in: `demo-rsc-index.tsx` inside `<Suspense>`
 * Used for: Avoids duplicate server work; passes props into `FiltersHeader`, `DemoRscContent`, `PaginationFooter`
 *
 * Steps:
 * 1. Await `searchParams` promise (Next App Router)
 * 2. Call `getRentalCarsPageData` once
 * 3. Render filters + table + pagination from the same payload
 */

import DemoRscContent from '../demo-rsc-content'
import { FiltersHeader } from '@/features/ui/filters/components/filters-header'
import { PaginationFooter } from '@/features/ui/filters/components/pagination-footer'
import {
  rentalCarSearchConfig,
  rentalCarPaginationConfig,
  rentalCarFiltersHeaderConfig,
} from '../config/header-filters-config'
import { getRentalCarsPageData } from '../utils/server/get-rental-cars-page-data'
import type { DemoRscPageSearchParams } from '../utils/ui/demo-rsc-page-url'

export default async function DemoRscDataShell({
  searchParams,
}: {
  searchParams: Promise<DemoRscPageSearchParams>
}) {
  const params = await searchParams
  const { carsPayload, filters } = await getRentalCarsPageData(params)

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="shrink-0">
        <FiltersHeader
          filters={filters}
          searchConfig={rentalCarSearchConfig}
          config={rentalCarFiltersHeaderConfig}
          dateFilterKey="rentalStartDate"
          dateFilterButtonText="Filter by Rental Start Date"
          dateFilterWidth="300px"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <DemoRscContent cars={carsPayload.cars} filters={filters} />
      </div>

      <div className="shrink-0">
        <PaginationFooter
          totalItems={carsPayload.pagination.totalItems}
          config={rentalCarPaginationConfig}
          title="Pagination"
        />
      </div>
    </div>
  )
}
