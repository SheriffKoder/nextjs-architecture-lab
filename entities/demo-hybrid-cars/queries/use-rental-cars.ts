/**
 * @file entities/demo-hybrid-cars/queries/use-rental-cars.ts
 * TanStack read hook for the hybrid rental cars list.
 *
 * Purpose: `useQuery` wired to `GET /api/demo-hybrid-page/cars`
 * Used in: `views/demo-hybrid-page/ui/demo-hybrid-page.tsx`
 * Used for: Hydrated list reads and client refetches when shallow URL list state changes
 *
 * Function Index:
 * - useRentalCars — returns TanStack query result for paginated rows
 *
 * Steps (hook wiring):
 * 1. Partition cache with `rentalCarKeys.list(query)`.
 * 2. Delegate fetch to `fetchRentalCars`.
 * 3. Keep data fresh for 5 minutes before background refetch.
 * 4. Keep previous page rows visible while the next query key fetches (`keepPreviousData`).
 */

'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import { fetchRentalCars } from '@/entities/demo-hybrid-cars/client/fetch-rental-cars'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'

/**
 * Subscribe to the paginated rental car list for the given URL-shaped query.
 *
 * @param query - List/filter/pagination state; should match RSC prefetch query on cold load
 * @returns TanStack `useQuery` result (`data`, `isLoading`, `isFetching`, `isError`, …)
 */
export function useRentalCars(query?: RentalCarListQuery) {
  return useQuery({
    // Step 1: cache key mirrors the query object exactly
    queryKey: rentalCarKeys.list(query),
    // Step 2: client transport via Route Handler
    queryFn: () => fetchRentalCars(query),
    // Step 3: avoid immediate refetch after hydration
    staleTime: 5 * 60 * 1000,
    // Step 4: no empty-table flash on filter/page changes
    placeholderData: keepPreviousData,
  })
}
