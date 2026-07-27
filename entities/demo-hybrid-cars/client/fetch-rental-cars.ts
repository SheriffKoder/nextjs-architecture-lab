/**
 * @file entities/demo-hybrid-cars/client/fetch-rental-cars.ts
 * Browser fetch wrapper for the hybrid rental cars list API.
 *
 * Purpose: Call `GET /api/demo-hybrid-page/cars` from TanStack `queryFn`
 * Used in: `queries/use-rental-cars.ts`, `hydration/prefetch-rental-car-page.ts` (server uses `getRentalCarsData` directly)
 * Used for: Client-side list refetches after shallow URL changes (Phase 2+)
 *
 * Function Index:
 * - fetchRentalCars — GET paginated `{ cars, pagination }` for a `RentalCarListQuery`
 *
 * Steps (fetchRentalCars):
 * 1. Build API URL from query via `buildRentalCarApiUrl`.
 * 2. Issue GET with JSON accept header.
 * 3. Throw on non-OK status so React Query surfaces error state.
 * 4. Parse and return typed JSON body.
 */

import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import { buildRentalCarApiUrl } from './build-rental-car-api-url'

const CARS_PATH = '/api/demo-hybrid-page/cars'

/** Response shape from `GET /api/demo-hybrid-page/cars`. */
export type RentalCarsPageResponse = {
  cars: RentalCarTableItem[]
  pagination: {
    totalItems: number
    page: number
    limit: number
    showAll?: boolean
  }
}

/**
 * Fetch a filtered, sorted, paginated page of rental cars.
 *
 * @param query - URL-shaped list state; omit for defaults
 * @returns Cars for the current page plus pagination metadata
 * @throws Error when the response is not OK
 */
export async function fetchRentalCars(
  query?: RentalCarListQuery
): Promise<RentalCarsPageResponse> {
  // Step 1–2: build URL and fetch
  const response = await fetch(buildRentalCarApiUrl(CARS_PATH, query), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  // Step 3: surface HTTP failures to TanStack error boundary / hook state
  if (!response.ok) {
    throw new Error(
      `Failed to fetch rental cars: ${response.status} ${response.statusText}`
    )
  }

  // Step 4: return typed payload
  return response.json() as Promise<RentalCarsPageResponse>
}
