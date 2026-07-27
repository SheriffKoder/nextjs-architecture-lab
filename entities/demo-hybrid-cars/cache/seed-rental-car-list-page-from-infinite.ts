/**
 * @file entities/demo-hybrid-cars/cache/seed-rental-car-list-page-from-infinite.ts
 * Write-through: infinite page response → matching paginated `list` cache key.
 *
 * Purpose: After infinite scroll loads page N, table footer can open page N without refetch
 * Used in: `queries/use-infinite-rental-cars.ts` after each successful page fetch
 *
 * Key shape must match `buildRentalCarListQuery` paginated output:
 * `{ …filters, page, limit }` — no `showAll` (absent ≠ `false` for TanStack hashing).
 *
 * Same idea as detail seed-from-list — shapes match (`RentalCarsPageResponse`).
 * Reverse (rebuild InfiniteData from list pages) is out of scope for v1.
 */

import type { QueryClient } from '@tanstack/react-query'
import type { RentalCarsPageResponse } from '@/entities/demo-hybrid-cars/client/fetch-rental-cars'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import { rentalCarKeys } from './rental-car-keys'

/**
 * Seed `rentalCarKeys.list(listQuery)` from an infinite page payload.
 *
 * @param queryClient - Active QueryClient
 * @param listQuery - Exact paginated key (`page` + `limit`, no `showAll`)
 * @param pageResponse - Same shape as `useRentalCars` data
 */
export function seedRentalCarListPageFromInfinite(
  queryClient: QueryClient,
  listQuery: RentalCarListQuery,
  pageResponse: RentalCarsPageResponse,
): void {
  queryClient.setQueryData(rentalCarKeys.list(listQuery), pageResponse)
}
