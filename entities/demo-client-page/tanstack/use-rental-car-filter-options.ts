/**
 * Demo Client Page — TanStack hook for filter facet configs
 *
 * Purpose: `useQuery` for `GET /api/demo-client-page/options`
 * Used in: Filters header / bar that need `options` with counts for the current URL
 * Why: Separate from row fetch so each query can cache and retry independently
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { rentalCarKeys } from './key-factory'
import { fetchRentalCarFilterOptions } from './handler'
import type { RentalCarListQuery } from './key-factory'

export function useRentalCarFilterOptions(query?: RentalCarListQuery) {
  return useQuery({
    queryKey: rentalCarKeys.options(query),
    queryFn: () => fetchRentalCarFilterOptions(query),
    staleTime: 5 * 60 * 1000,
  })
}
