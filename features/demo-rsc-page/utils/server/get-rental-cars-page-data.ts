/**
 * getRentalCarsPageData
 *
 * Purpose: Server loader for list + pagination from a `RentalCarListQuery` (same contract as TanStack list key)
 * Used in: `TableAndPaginationSection` — `react` `cache()` dedupes per request + URL
 */

import { cache } from 'react'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import { getRentalCarsData } from './get-rental-cars-data'

import { buildRentalCarListQuery } from '../../lib/build-rental-car-list-query'
import { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import { rentalCarBaseFilters } from '../../config/header-filters-config'
import { getFilterOptionsServer } from './get-filter-options-server'
import type { FilterConfig } from '@/features/ui/filters/feature-filtering/components/filter-types'

export interface RentalCarsPagePayload {
  cars: RentalCarTableItem[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}

export interface RentalCarsPageData {
  carsPayload: RentalCarsPagePayload
  filtersPayload: FilterConfig[]
}

// cache so each request is only made once, even if this function is called multiple times with the same params
// Even though the data is shared, the rendering is not.
// Each island:
// Suspends independently
// Resolves independently
// Streams independently to the client
// 🧱 What Determines Streaming Order?

// Not the shared data — but:

// Component complexity
// Where await happens
// Additional logic inside each section
// # Split by DATA RESPONSIBILITY, not by UI sections
// Filters → fast, not blocked by table fetch (calls getFilterOptionsServer not getRentalCarsData)
// Table → slower
// Pagination → tied to table
const loadRentalCarsPageData = cache(
  async (params: DemoRscPageSearchParams) => {
    const query = buildRentalCarListQuery(params)

    const [carsResult, filters] = await Promise.all([
      getRentalCarsData(query),
      getFilterOptionsServer(rentalCarBaseFilters, params),
    ])

    return {
      carsPayload: {
        cars: carsResult.cars,
        pagination: carsResult.pagination,
      },
      filtersPayload: filters,
    } satisfies RentalCarsPageData
  }
)

export async function getRentalCarsPageData(
  params: DemoRscPageSearchParams
): Promise<RentalCarsPageData> {
  return loadRentalCarsPageData(params)
}
