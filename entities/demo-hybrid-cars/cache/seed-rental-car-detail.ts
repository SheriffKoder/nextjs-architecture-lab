/**
 * @file entities/demo-hybrid-cars/cache/seed-rental-car-detail.ts
 * Copy a list row into the detail cache key when detail is empty.
 *
 * Purpose: Hover / pre-open warm without `GET …/cars/:id` when shapes match
 * Used in: `demo-hybrid-content` row pointer enter (and optional click)
 */

import type { QueryClient } from '@tanstack/react-query'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import { rentalCarKeys } from './rental-car-keys'

/**
 * Seed `rentalCarKeys.detail(id)` from a known list row if detail is not already cached.
 *
 * Does not overwrite an existing detail entry (e.g. a prior by-id fetch).
 */
export function seedRentalCarDetailFromRow(
  queryClient: QueryClient,
  row: RentalCarTableItem,
): void {
  const key = rentalCarKeys.detail(row.id)
  if (queryClient.getQueryData(key) != null) return
  queryClient.setQueryData(key, row)
}
