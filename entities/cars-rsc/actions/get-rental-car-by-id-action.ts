'use server'

/**
 * getRentalCarByIdAction
 *
 * Purpose: Server Action entry for loading a single rental car by id (drawer view, prefetch, client callers)
 * Used in: `rsc-car-drawer-view-content.tsx`; row-hover prefetch from `demo-rsc-content` via `onRowPointerEnter`
 * Why: Server-action boundary for client + RSC callers; delegates to `getRentalCarByIdCached` in `demo-rsc-cached-loaders.ts` (`unstable_cache` + underlying `getRentalCarById`).
 */

import type { RentalCarTableItem } from '@/entities/cars-rsc/types/rental-car-table-item'
import { getRentalCarByIdCached } from '@/entities/cars-rsc/server/demo-rsc-cached-loaders'

export async function getRentalCarByIdAction(id: string): Promise<RentalCarTableItem | null> {
  if (typeof id !== 'string' || id.trim() === '') {
    return null
  }
  return getRentalCarByIdCached(id)
}
