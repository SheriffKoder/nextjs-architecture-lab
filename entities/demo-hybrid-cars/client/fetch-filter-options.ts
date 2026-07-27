/**
 * @file entities/demo-hybrid-cars/client/fetch-filter-options.ts
 * Browser fetch wrapper for hybrid filter facet options.
 *
 * Purpose: Call `GET /api/demo-hybrid-page/options` from TanStack `queryFn`
 * Used in: `queries/use-rental-car-filter-options.ts`
 * Used for: Filter toolbar / header dropdowns with per-option counts for the current URL
 *
 * Function Index:
 * - fetchRentalCarFilterOptions — GET `FilterConfig[]` with populated options
 *
 * Steps (fetchRentalCarFilterOptions):
 * 1. Build API URL from the same `RentalCarListQuery` as the list hook.
 * 2. GET options route.
 * 3. Throw on failure; return typed facet configs on success.
 */

import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import { buildRentalCarApiUrl } from './build-rental-car-api-url'

const OPTIONS_PATH = '/api/demo-hybrid-page/options'

/**
 * Fetch filter facet configs with counts for the current list-driving URL state.
 *
 * @param query - Same query object passed to `useRentalCars` so facets stay in sync
 * @returns Filter configs with `options` populated
 * @throws Error when the response is not OK
 */
export async function fetchRentalCarFilterOptions(
  query?: RentalCarListQuery
): Promise<FilterConfig[]> {
  // Step 1–2: mirror list query encoding on the options endpoint
  const response = await fetch(buildRentalCarApiUrl(OPTIONS_PATH, query), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  // Step 3: propagate HTTP errors to TanStack
  if (!response.ok) {
    throw new Error(
      `Failed to fetch rental car filter options: ${response.status} ${response.statusText}`
    )
  }

  return response.json() as Promise<FilterConfig[]>
}
