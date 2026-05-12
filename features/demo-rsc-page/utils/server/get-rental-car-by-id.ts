/**
 * getRentalCarById
 *
 * Purpose: Server loader for a single rental car by stable `id` (drawer detail, portable entry points)
 * Used in: `getRentalCarByIdAction` in `actions/get-rental-car-by-id-action.ts`
 * Why: `cache()` dedupes per request when the same id is read from layout + detail or retried
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
