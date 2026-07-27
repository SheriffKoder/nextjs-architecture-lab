/**
 * @file entities/demo-hybrid-cars/client/fetch-rental-car-by-id.ts
 * Browser fetch wrapper for a single rental car by id.
 *
 * Purpose: Call `GET /api/demo-hybrid-page/cars/:id` from TanStack `queryFn`
 * Used in: `queries/use-rental-car-detail.ts` (Phase 1 hover prefetch + drawer)
 * Used for: Detail cache seeding without loading the full filtered list
 *
 * Function Index:
 * - fetchRentalCarById — GET one row wrapped as `{ car }`
 *
 * Steps (fetchRentalCarById):
 * 1. Encode id for the path segment.
 * 2. GET the detail route.
 * 3. Map 404 to a stable "Car not found" error.
 * 4. Validate response body shape before returning the row.
 */

import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'

const CARS_PATH = '/api/demo-hybrid-page/cars'

type RentalCarDetailResponseBody = {
  car: RentalCarTableItem
  error?: string
}

/**
 * Load one rental car row by stable id.
 *
 * @param id - Row id from the table or drawer store
 * @returns The matching `RentalCarTableItem`
 * @throws Error when not found or response is invalid
 */
export async function fetchRentalCarById(id: string): Promise<RentalCarTableItem> {
  // Step 1–2: request detail route
  const response = await fetch(`${CARS_PATH}/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  // Step 3: distinguish missing row from other failures
  if (response.status === 404) {
    throw new Error('Car not found')
  }
  if (!response.ok) {
    throw new Error(
      `Failed to fetch rental car: ${response.status} ${response.statusText}`
    )
  }

  // Step 4: guard against malformed JSON
  const json = (await response.json()) as RentalCarDetailResponseBody
  if (!json?.car || typeof json.car.id !== 'string') {
    throw new Error('Failed to fetch rental car: invalid response body')
  }
  return json.car
}
