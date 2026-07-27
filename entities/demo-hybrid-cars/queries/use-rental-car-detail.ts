/**
 * @file entities/demo-hybrid-cars/queries/use-rental-car-detail.ts
 * TanStack read hook for a single rental car row.
 *
 * Purpose: `useQuery` → detail key; prefer list/detail cache, else `GET /api/demo-hybrid-page/cars/:id`
 * Used in: Drawer view/edit panels; hover seeds detail via `seedRentalCarDetailFromRow`
 * Used for: Instant open when the row is already on a list page; network only on miss
 *
 * Steps (hook wiring):
 * 1. Trim and guard id — query disabled when empty.
 * 2. Key cache by stable id via `rentalCarKeys.detail`.
 * 3. `initialData` from list cache when detail is cold (list key ≠ detail key).
 * 4. `queryFn` fetches by id only when neither detail nor list has the row.
 * 5. Keep detail fresh for 5 minutes after a seed or fetch.
 */

'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { findRentalCarInListCache } from '@/entities/demo-hybrid-cars/cache/find-rental-car-in-list-cache'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import { fetchRentalCarById } from '@/entities/demo-hybrid-cars/client/fetch-rental-car-by-id'

/** Aligns with list hooks and hover seed freshness. */
const DETAIL_STALE_TIME_MS = 5 * 60 * 1000

/**
 * Load one rental car by id — list/detail cache first, network on miss.
 *
 * @param id - Row id; query stays disabled when null/empty
 * @returns TanStack query result for the detail row
 */
export function useRentalCarDetail(id: string | null | undefined) {
  const queryClient = useQueryClient()
  const trimmed = id?.trim() ?? ''

  return useQuery({
    queryKey: rentalCarKeys.detail(trimmed),
    queryFn: () => fetchRentalCarById(trimmed),
    enabled: trimmed.length > 0,
    staleTime: DETAIL_STALE_TIME_MS,
    // List and detail are separate keys — bridge them so drawer open does not GET when the row is already listed.
    initialData: () =>
      trimmed ? findRentalCarInListCache(queryClient, trimmed) : undefined,
    // Treat list-seeded data as fresh for staleTime (avoid immediate background refetch).
    initialDataUpdatedAt: () => Date.now(),
  })
}
