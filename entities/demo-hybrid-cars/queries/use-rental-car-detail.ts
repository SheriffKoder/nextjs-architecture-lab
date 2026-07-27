/**
 * @file entities/demo-hybrid-cars/queries/use-rental-car-detail.ts
 * TanStack read hook for a single rental car row.
 *
 * Purpose: `useQuery` → `GET /api/demo-hybrid-page/cars/:id`
 * Used in: Hover prefetch + drawer view/edit mode (Phase 3)
 * Used for: Detail reads from client cache without reloading the list
 *
 * Function Index:
 * - useRentalCarDetail — fetches one row when `id` is non-empty
 *
 * Steps (hook wiring):
 * 1. Trim and guard id — query disabled when empty.
 * 2. Key cache by stable id via `rentalCarKeys.detail`.
 * 3. Fetch through `fetchRentalCarById` (same `queryFn` as hover `prefetchQuery`).
 * 4. Keep detail fresh for 5 minutes so hover→open is a cache hit.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import { fetchRentalCarById } from '@/entities/demo-hybrid-cars/client/fetch-rental-car-by-id'

/** Aligns with list/options hooks and hover `prefetchQuery` staleTime. */
const DETAIL_STALE_TIME_MS = 5 * 60 * 1000

/**
 * Load one rental car by id from the TanStack cache or API.
 *
 * Prefetch and open **must** share this key + `queryFn` so hover warms the open path.
 *
 * @param id - Row id; query stays disabled when null/empty
 * @returns TanStack query result for the detail row
 */
export function useRentalCarDetail(id: string | null | undefined) {
  // Step 1: empty selection → no network
  const trimmed = id?.trim() ?? ''

  return useQuery({
    // Step 2: same key as `queryClient.prefetchQuery` on row hover
    queryKey: rentalCarKeys.detail(trimmed),
    // Step 3: shared client transport (API Route Handler)
    queryFn: () => fetchRentalCarById(trimmed),
    enabled: trimmed.length > 0,
    // Step 4: hover prefetch remains warm when user clicks
    staleTime: DETAIL_STALE_TIME_MS,
  })
}
