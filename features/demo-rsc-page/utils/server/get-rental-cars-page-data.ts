/**
 * getRentalCarsPageData
 *
 * Purpose: Server loader for list + pagination from a `RentalCarListQuery` (same contract as TanStack list key)
 * Used in: `TableSection`, `PaginationSection` — `react` `cache()` dedupes when both pass the same `query` reference
 */

import { cache } from 'react'
import type { RentalCarListQuery } from '@/features/demo-rsc-page/types/rental-car-list-query'
import { rentalCarListQueryToSearchParams } from '../../lib/build-rental-car-list-query'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import { getRentalCarsData } from './get-rental-cars-data'

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
}

const loadRentalCarsPageData = cache(async (query: RentalCarListQuery) => {
  const searchParams = rentalCarListQueryToSearchParams(query)
  const carsResult = await getRentalCarsData(searchParams)
  return {
    carsPayload: {
      cars: carsResult.cars,
      pagination: carsResult.pagination,
    },
  } satisfies RentalCarsPageData
})

export async function getRentalCarsPageData(
  query: RentalCarListQuery
): Promise<RentalCarsPageData> {
  return loadRentalCarsPageData(query)
}
