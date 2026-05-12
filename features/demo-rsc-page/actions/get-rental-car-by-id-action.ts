'use server'

/**
 * getRentalCarByIdAction
 *
 * Purpose: Server Action entry for loading a single rental car by id (drawer view, prefetch, client callers)
 * Used in: `rsc-car-drawer-view-content.tsx`; row-hover prefetch from `demo-rsc-content` via `onRowPointerEnter`
 * Why: Keeps fetches behind the server-actions boundary while reuse stays in `utils/server/get-rental-car-by-id` + `cache()`
 */

import type { RentalCarTableItem } from '@/features/demo-rsc-page/types/rental-car-table-item'
import { getRentalCarById } from '@/features/demo-rsc-page/utils/server/get-rental-car-by-id'

export async function getRentalCarByIdAction(id: string): Promise<RentalCarTableItem | null> {
  if (typeof id !== 'string' || id.trim() === '') {
    return null
  }
  return getRentalCarById(id)
}
