/**
 * @file entities/demo-hybrid-cars/server/get-rental-cars-data.ts
 * Server use-case — filtered, sorted, paginated rental car list.
 *
 * Purpose: Mock pipeline (filter → sort → paginate) for list reads
 * Used in: `hydration/prefetch-rental-car-page.ts`, `app/api/demo-hybrid-page/cars/route.ts`
 * Used for: RSC prefetch and Route Handler list GET — same `{ cars, pagination }` contract as TanStack client
 *
 * Function Index:
 * - getRentalCarsData — filter → sort → paginate mock rows
 *   Example input: getRentalCarsData({ status: ['available'], page: 1, limit: 20 })
 *   Example output: { cars: RentalCarTableItem[], pagination: { totalItems, page, limit } }
 *
 * Steps:
 * 1. Optional simulated latency.
 * 2. Convert `RentalCarListQuery` → flat search params.
 * 3. Filter mock dataset.
 * 4. Apply multi-key sort when present.
 * 5. Return full list when `showAll`, else slice by page/limit.
 */

import { rentalCars } from '../repository/data-source'
import type { RentalCarTableItem } from '../model/rental-car-table-item'
import type { RentalCarListQuery } from '../model/rental-car-list-query'
import { rentalCarListQueryToSearchParams } from '@/entities/demo-hybrid-cars/transform/build-rental-car-list-query'
import { filterRentalCars } from '../repository/filter-rental-cars'
import { parseSorts, applySorts } from '@/platform/url-kit/filters/feature-sorting/utils'
import { parsePagination } from '@/platform/url-kit/filters/feature-pagination/utils'
import { rentalCarPaginationConfig } from '@/views/demo-hybrid-page/config/data/rental-car-pagination-config'
import { decodeFilters } from '@/platform/url-kit/filters/feature-query-builder-filter/utils'
import {
  DEMO_RSC_SIMULATE_RENTAL_CARS_MS,
  simulateServerDelay,
} from './simulate-server-delay'
/**
 * Get mock rental cars data with optional filtering, sorting, and pagination.
 *
 * @param query - Typed list state (filters, sort, page/limit or showAll)
 * @returns Cars for the current page plus pagination metadata
 */
export async function getRentalCarsData(
  query: RentalCarListQuery = {}
): Promise<{
  cars: RentalCarTableItem[]
  pagination: {
    totalItems: number
    page: number
    limit: number
    showAll?: boolean
  }
}> {

  await simulateServerDelay(DEMO_RSC_SIMULATE_RENTAL_CARS_MS)

  const searchParams = rentalCarListQueryToSearchParams(query)

  //////////////////////////////////
  // STEP 1: Filter cars based on URL parameters
  //////////////////////////////////
  const filtered = filterRentalCars(rentalCars, searchParams)
  
    //////////////////////////////////////////
    // QUERY FILTER PARSING (for debugging)
    //////////////////////////////////////////
    const filterParam = typeof searchParams.filter === 'string' ? searchParams.filter : null
    console.log('//////////////////////////////////////////')
    console.log('QUERY FILTER - Raw param:', filterParam)
    const decodedFilter = decodeFilters(filterParam)
    console.log('QUERY FILTER - Decoded JSON:')
    console.log(JSON.stringify(decodedFilter, null, 2))
    console.log('//////////////////////////////////////////')
    //////////////////////////////////////////
    

  //////////////////////////////////
  // STEP 2: Apply sorting to filtered results
  //////////////////////////////////
  const sortString = typeof searchParams.sort === 'string' ? searchParams.sort : ''
  const sorts = parseSorts(sortString)
  const filteredAndSorted = sorts.length > 0 ? applySorts(filtered, sorts) : filtered
  
  //////////////////////////////////
  // STEP 3: Check if show all is enabled
  //////////////////////////////////
  const showAll =
    query.showAll === true ||
    (typeof searchParams.all === 'string' && searchParams.all === '1')

  // If show all is enabled, return the full list
  if (showAll) {
    const total = filteredAndSorted.length
    return {
      cars: filteredAndSorted,
      pagination: {
        totalItems: total,
        page: 1,
        limit: total,
        showAll: true,
      },
    }
  }

  //////////////////////////////////
  // STEP 3: Parse pagination parameters from URL
  //////////////////////////////////
  const params = new URLSearchParams(
    Object.entries(searchParams)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] : v as string])
  )

  // If show all is not enabled, parse pagination parameters from URL
  const { page, limit } = parsePagination(
    params,
    rentalCarPaginationConfig.defaultPageSize || 20,
  )

  //////////////////////////////////
  // STEP 4: Apply pagination slice to sorted results
  //////////////////////////////////
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedCars = filteredAndSorted.slice(startIndex, endIndex)

  //////////////////////////////////
  // STEP 5: Return results with pagination metadata
  //////////////////////////////////
  return {
    cars: paginatedCars,
    pagination: {
      totalItems: filteredAndSorted.length,
      page,
      limit,
    },
  }
}
