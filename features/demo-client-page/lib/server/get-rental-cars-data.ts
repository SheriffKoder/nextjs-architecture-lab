/**
 * Get Rental Cars Data (server-side simulation)
 *
 * Name: get-rental-cars-data
 * Purpose: Turn URL-shaped search params into a paginated slice of mock rental cars with stable sort order
 * Used in: `app/api/demo-client-page/page-client/route.ts`
 * Used for: TanStack Query `queryFn` target — same contract as reading `searchParams` on an RSC page, but callable from a Route Handler
 *
 * Function Index:
 * - getRentalCarsData: filter → sort → paginate → return cars + pagination meta
 *
 * Steps (pipeline):
 * 1. Narrow the mock list with URL filters (status, make, ranges, q, etc.).
 * 2. Apply multi-key sort when `sort` param is present (shared filters utils).
 * 3. Parse page/limit from params (shared pagination util + demo pagination config).
 * 4. Slice the sorted list for the current page and attach totalItems for the footer.
 */

import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import { rentalCars } from '../../config/lib/data-source'
import { filterRentalCars } from './backend-simulate/filter-rental-cars'
import { parseSorts, applySorts } from '@/features/ui/filters/feature-sorting/utils'
import { parsePagination } from '@/features/ui/filters/feature-pagination/utils'
import { rentalCarPaginationConfig } from '../../config/header-filters-config'

/**
 * Build paginated rental car rows from URL-style parameters (mock / in-memory).
 *
 * @param searchParams - Same shape Next passes as `searchParams` on pages (string or string[] per key)
 * @returns Cars for the current page plus pagination metadata (`totalItems` is pre-slice length)
 */
export async function getRentalCarsData(
  searchParams: { [key: string]: string | string[] | undefined } = {}
): Promise<{
  cars: RentalCarTableItem[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}> {
  //////////////////////////////////////////////////////////////
  // Step 1: Apply URL-driven filters to the full mock dataset
  //////////////////////////////////////////////////////////////
  // WHY: Keeps all “which rows match the user’s filters” logic in filter-rental-cars.ts (SRP).
  const filtered = filterRentalCars(rentalCars, searchParams)

  //////////////////////////////////////////////////////////////
  // Step 2: Sort filtered rows when the URL includes `sort`
  //////////////////////////////////////////////////////////////
  // WHY: Reuse shared parse/apply so header sort buttons and API stay aligned.
  const sortString = typeof searchParams.sort === 'string' ? searchParams.sort : ''
  const sorts = parseSorts(sortString)
  const filteredAndSorted =
    sorts.length > 0 ? applySorts(filtered, sorts) : filtered

  //////////////////////////////////////////////////////////////
  // Step 3: Resolve page and page size for slicing
  //////////////////////////////////////////////////////////////
  // WHY: parsePagination expects URLSearchParams; build a mutable view from the plain object.
  const params = new URLSearchParams(
    Object.entries(searchParams)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] : (v as string)])
  )

  const { page, limit } = parsePagination(
    params,
    rentalCarPaginationConfig.defaultPageSize || 20
  )

  //////////////////////////////////////////////////////////////
  // Step 4: Slice to the current page and return metadata
  //////////////////////////////////////////////////////////////
  // WHY: totalItems reflects filtered+sorted length so pagination UI can compute last page.
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedCars = filteredAndSorted.slice(startIndex, endIndex)

  return {
    cars: paginatedCars,
    pagination: {
      totalItems: filteredAndSorted.length,
      page,
      limit,
    },
  }
}
