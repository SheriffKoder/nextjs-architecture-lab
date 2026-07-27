/**
 * @file entities/demo-hybrid-cars/cache/read-rental-car-list-page.ts
 * Read a seeded/fetched paginated list entry from the QueryClient.
 *
 * Purpose: Bootstrap `useInfiniteQuery` from `list({ page: 1, limit })` when entering All
 * Used in: `queries/use-infinite-rental-cars.ts` as `initialData`
 */

import type { QueryClient } from '@tanstack/react-query'
import type { RentalCarsPageResponse } from '@/entities/demo-hybrid-cars/client/fetch-rental-cars'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import { rentalCarKeys } from './rental-car-keys'

/**
 * Return cached list page data + `dataUpdatedAt` when present.
 */
export function readRentalCarListPage(
  queryClient: QueryClient,
  listQuery: RentalCarListQuery,
): { data: RentalCarsPageResponse; dataUpdatedAt: number } | undefined {
  const queryKey = rentalCarKeys.list(listQuery)
  const data = queryClient.getQueryData<RentalCarsPageResponse>(queryKey)
  if (!data) return undefined
  const dataUpdatedAt =
    queryClient.getQueryState(queryKey)?.dataUpdatedAt ?? Date.now()
  return { data, dataUpdatedAt }
}
