/**
 * @file entities/demo-hybrid-cars/server/get-rental-car-by-id.ts
 * Server use-case — load one rental car row by stable id.
 *
 * Purpose: Mock lookup for detail drawer, API GET by id, and TanStack prefetch
 * Used in: `app/api/demo-hybrid-page/cars/[id]/route.ts`; Phase 1 hover prefetch
 * Used for: Single-row reads without loading the filtered list
 *
 * Function Index:
 * - getRentalCarById — public async entry (wraps per-request `cache()` dedupe)
 *
 * Steps:
 * 1. Optional simulated latency.
 * 2. Find row in mock `rentalCars` repository by id.
 * 3. Return row or null when missing.
 */

import { cache } from 'react'
import type { RentalCarTableItem } from '../model/rental-car-table-item'
import { rentalCars } from '../repository/data-source'
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
