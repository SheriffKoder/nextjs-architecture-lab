/**
 * getRentalCarById
 *
 * Purpose: Server loader for a single rental car by stable `id` (drawer detail, portable entry points)
 * Used in: `demo-rsc-cached-loaders.ts` (`getRentalCarByIdCached`); `getRentalCarByIdAction` calls the cached entry.
 * Why: `cache()` dedupes per request when the same id is read from layout + detail or retried; cross-request caching lives in `demo-rsc-cached-loaders.ts` (`getRentalCarByIdCached`).
 */

import { cache } from 'react'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import { rentalCars } from './data-source'
import {
  DEMO_RSC_SIMULATE_RENTAL_CAR_BY_ID_MS,
  simulateServerDelay,
} from './simulate-server-delay'

const loadRentalCarById = cache(async (id: string): Promise<RentalCarTableItem | null> => {
  await simulateServerDelay(DEMO_RSC_SIMULATE_RENTAL_CAR_BY_ID_MS)
  const car = rentalCars.find((c) => c.id === id) ?? null
  return car
})

export async function getRentalCarById(id: string): Promise<RentalCarTableItem | null> {
  return loadRentalCarById(id)
}
