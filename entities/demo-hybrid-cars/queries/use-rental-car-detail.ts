/**
 * @file entities/demo-hybrid-cars/queries/use-rental-car-detail.ts
 * TanStack read hook for a single rental car row.
 *
 * Purpose: `useQuery` → `GET /api/demo-hybrid-page/cars/:id`
 * Used in: Drawer view mode (Phase 3); hover prefetch (Phase 1)
 * Used for: Detail reads from client cache without reloading the list
 *
 * Function Index:
 * - useRentalCarDetail — fetches one row when `id` is non-empty
 *
 * Steps (hook wiring):
 * 1. Trim and guard id — query disabled when empty.
 * 2. Key cache by stable id via `rentalCarKeys.detail`.
 * 3. Fetch through `fetchRentalCarById`.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import { fetchRentalCarById } from '@/entities/demo-hybrid-cars/client/fetch-rental-car-by-id'

/**
 * Load one rental car by id from the TanStack cache or API.
 *
 * @param id - Row id; query stays disabled when null/empty
 * @returns TanStack query result for the detail row
 */
export function useRentalCarDetail(id: string | null | undefined) {
  const trimmed = id?.trim() ?? ''

  return useQuery({
    queryKey: rentalCarKeys.detail(trimmed),
    queryFn: () => fetchRentalCarById(trimmed),
    // WHY: drawer closed / no selection → skip network
    enabled: trimmed.length > 0,
  })
}
