/**
 * Demo Client Page — TanStack hook for paginated rental car rows
 *
 * Purpose: `useQuery` wired to `/api/demo-client-page/page-client`
 * Used in: `demo-client-index.tsx` and any client-only rental demos
 * Why: URL-shaped `query` in the key refetches when filters / sort / page change
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { rentalCarKeys } from './key-factory'
import { fetchRentalCars } from './handler'
import type { RentalCarListQuery } from './key-factory'

export function useRentalCars(query?: RentalCarListQuery) {
  return useQuery({
    queryKey: rentalCarKeys.list(query),
    queryFn: () => fetchRentalCars(query),
    staleTime: 5 * 60 * 1000,
  })
}
