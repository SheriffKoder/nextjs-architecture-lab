/**
 * @file entities/demo-hybrid-cars/hydration/prefetch-rental-car-page.ts
 * RSC prefetch + dehydrate for the hybrid rental cars page.
 *
 * Purpose: Seed TanStack cache on the server before client hydration
 * Used in: `app/(root)/demo-hybrid-page/page.tsx`
 * Used for: Instant first paint of list + facet data without a client-side waterfall
 *
 * Function Index:
 * - prefetchRentalCarPage — parallel prefetch list + options, return `dehydrate(queryClient)`
 *
 * Steps:
 * 1. Convert `RentalCarListQuery` → flat search params for the options server fn.
 * 2. Prefetch list and options queries in parallel via `Promise.all`.
 * 3. Log prefetch failures without aborting dehydrate (client hooks fall back to loading).
 * 4. Return dehydrated state for `HydrationBoundary`.
 */

import {
  QueryClient,
  dehydrate,
  type DehydratedState,
} from '@tanstack/react-query'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import { getRentalCarsData } from '@/entities/demo-hybrid-cars/server/get-rental-cars-data'
import { getFilterOptionsServer } from '@/entities/demo-hybrid-cars/server/get-filter-options-server'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import { rentalCarListQueryToSearchParams } from '@/entities/demo-hybrid-cars/transform/build-rental-car-list-query'

/**
 * Prefetch hybrid page queries on the server and return dehydrated cache state.
 *
 * @param queryClient - Ephemeral server `QueryClient` (not the browser instance)
 * @param query - Normalized list state from URL search params
 * @returns Dehydrated TanStack state for `HydrationBoundary`
 */
export async function prefetchRentalCarPage(
  queryClient: QueryClient,
  query: RentalCarListQuery = {}
): Promise<DehydratedState> {
  // Step 1: options server fn expects flat URL param bag
  const searchParams = rentalCarListQueryToSearchParams(query)

  try {
    // Step 2: warm list + facets together — matches client hook pair
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: rentalCarKeys.list(query),
        queryFn: () => getRentalCarsData(query),
      }),
      queryClient.prefetchQuery({
        queryKey: rentalCarKeys.options(query),
        queryFn: () => getFilterOptionsServer(undefined, searchParams),
      }),
    ])
  } catch (error) {
    // Step 3: still dehydrate partial cache; client hooks handle missing data
    console.error('[prefetchRentalCarPage]', error)
  }

  // Step 4: hand off to RSC `HydrationBoundary`
  return dehydrate(queryClient)
}
