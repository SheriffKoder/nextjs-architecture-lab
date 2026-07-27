/**
 * @file entities/demo-hybrid-cars/cache/invalidate-rental-car-caches.ts
 * Shared invalidation targets after mutations.
 *
 * Purpose: Keep list, infinite, options, and detail caches coherent
 * Used in: `mutations/use-*-rental-car*.ts` `onSettled` / `onSuccess`
 */

import type { QueryClient } from '@tanstack/react-query'
import { rentalCarKeys } from './rental-car-keys'

/** Invalidate every list + infinite cache (seeded list pages clear with `lists()`). */
export function invalidateRentalCarListCaches(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: rentalCarKeys.lists() })
  void queryClient.invalidateQueries({ queryKey: rentalCarKeys.infinites() })
}

/** Invalidate facet options after create/delete (counts may change). */
export function invalidateRentalCarOptionCaches(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: rentalCarKeys.optionsAll() })
}

/** Invalidate one detail row (or remove after delete). */
export function invalidateRentalCarDetail(
  queryClient: QueryClient,
  id: string,
): void {
  void queryClient.invalidateQueries({ queryKey: rentalCarKeys.detail(id) })
}
