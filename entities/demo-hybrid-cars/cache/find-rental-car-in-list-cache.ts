/**
 * @file entities/demo-hybrid-cars/cache/find-rental-car-in-list-cache.ts
 * Scan cached list pages for a car by id (list key ≠ detail key).
 *
 * Purpose: Seed / initialData for detail without a network round-trip when the row is already on a list page
 * Used in: `useRentalCarDetail`, `seedRentalCarDetailFromRow` callers
 */

import type { QueryClient } from '@tanstack/react-query'
import type { RentalCarsPageResponse } from '@/entities/demo-hybrid-cars/client/fetch-rental-cars'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import { rentalCarKeys } from './rental-car-keys'

/**
 * Find a car in any cached list (or infinite) page response.
 *
 * @returns The row if present in client list cache; otherwise `undefined`
 */
export function findRentalCarInListCache(
  queryClient: QueryClient,
  id: string,
): RentalCarTableItem | undefined {
  const trimmed = id.trim()
  if (!trimmed) return undefined

  const listEntries = queryClient.getQueriesData<RentalCarsPageResponse>({
    queryKey: rentalCarKeys.lists(),
  })

  for (const [, data] of listEntries) {
    const match = data?.cars?.find((car) => car.id === trimmed)
    if (match) return match
  }

  return undefined
}
