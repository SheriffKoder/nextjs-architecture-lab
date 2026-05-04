/**
 * PaginationSection
 *
 * Purpose: Async RSC boundary for pagination footer (shares cached `getRentalCarsPageData` with TableSection when `query` is the same reference)
 * Used in: `demo-rsc-index.tsx` inside `<Suspense>`
 */

import { PaginationFooter } from '@/features/ui/filters/components/pagination-footer'
import { rentalCarPaginationConfig } from '../config/header-filters-config'
import { getRentalCarsPageData } from '../utils/server/get-rental-cars-page-data'
import type { RentalCarListQuery } from '@/features/demo-rsc-page/types/rental-car-list-query'

export default async function PaginationSection({ query }: { query: RentalCarListQuery }) {
  const { carsPayload } = await getRentalCarsPageData(query)

  return (
    <div className="shrink-0">
      <PaginationFooter
        totalItems={carsPayload.pagination.totalItems}
        config={rentalCarPaginationConfig}
        title="Pagination"
      />
    </div>
  )
}
