/**
 * @file entities/demo-hybrid-cars/repository/update-rental-car.ts
 * Merge a partial patch into a mock rental car row.
 *
 * Purpose: Persist edit-drawer fields against the shared in-memory store
 * Used in: `server/update-rental-car.ts`
 */

import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import type { RentalCarEditFormValues } from '@/entities/demo-hybrid-cars/schema/rental-car-edit-form-schema'
import { rentalCars } from './data-source'

export class RentalCarNotFoundError extends Error {
  override readonly name = 'RentalCarNotFoundError'

  constructor(public readonly id: string) {
    super(`Rental car not found: ${id}`)
  }
}

/**
 * Merge validated edit fields into the mock row; returns a shallow copy.
 */
export async function updateRentalCarInMockStore(
  id: string,
  patch: RentalCarEditFormValues,
): Promise<RentalCarTableItem> {
  const row = rentalCars.find((c) => c.id === id)
  if (!row) {
    throw new RentalCarNotFoundError(id)
  }
  Object.assign(row, patch)
  return { ...row }
}
