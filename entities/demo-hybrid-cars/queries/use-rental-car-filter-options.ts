/**
 * @file entities/demo-hybrid-cars/queries/use-rental-car-filter-options.ts
 * TanStack read hook for hybrid filter facet configs.
 *
 * Purpose: `useQuery` for `GET /api/demo-hybrid-page/options`
 * Used in: `views/demo-hybrid-page/ui/demo-hybrid-page.tsx`
 * Used for: Single shared facet query for filter strip + table (no duplicate fetches)
 *
 * Function Index:
 * - useRentalCarFilterOptions — returns facet configs for the current list query
 *
 * Steps (hook wiring):
 * 1. Key facets with the same `RentalCarListQuery` as the list hook.
 * 2. Fetch via `fetchRentalCarFilterOptions`.
 * 3. Share staleTime with list hook for consistent hydration behavior.
 * 4. Keep previous facets while the next query key fetches.
 */

'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import { fetchRentalCarFilterOptions } from '@/entities/demo-hybrid-cars/client/fetch-filter-options'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'

/**
 * Subscribe to filter facet configs for the current URL-driven list state.
 *
 * @param query - Same object passed to `useRentalCars` so counts stay aligned
 * @returns TanStack query result with `FilterConfig[]` data
 */
export function useRentalCarFilterOptions(query?: RentalCarListQuery) {
  return useQuery({
    // Step 1–2: shared key + client fetch with the list query
    queryKey: rentalCarKeys.options(query),
    queryFn: () => fetchRentalCarFilterOptions(query),
    // Step 3–4: hydrate-friendly + no chip flash on filter change
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}
