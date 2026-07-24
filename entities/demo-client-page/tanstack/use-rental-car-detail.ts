/**
 * Demo Client Page — TanStack hook for one rental car by id
 *
 * Purpose: `useQuery` → `GET /api/demo-client-page/page-client/:id`
 * Used in: `DemoClientCreateCarDrawerManager` when `mode=edit` + `entityId`
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { rentalCarKeys } from './key-factory'
import { fetchRentalCarById } from './handler'

export function useRentalCarDetail(id: string | null | undefined) {
  const trimmed = id?.trim() ?? ''

  return useQuery({
    queryKey: rentalCarKeys.detail(trimmed),
    queryFn: () => fetchRentalCarById(trimmed),
    enabled: trimmed.length > 0,
  })
}
