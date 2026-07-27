/**
 * @file entities/demo-hybrid-cars/repository/delete-rental-car.ts
 * Remove a rental car from the in-memory mock store by id.
 *
 * Purpose: Persist DELETE so subsequent list GETs omit the row
 * Used in: `server/delete-rental-car.ts`
 */

import { RentalCarNotFoundError } from './update-rental-car'
import { rentalCars } from './data-source'

/**
 * Splice the car out of the shared mock array.
 * @throws {RentalCarNotFoundError} when id is missing
 */
export async function deleteRentalCarFromMockStore(id: string): Promise<void> {
  const idx = rentalCars.findIndex((c) => c.id === id)
  if (idx === -1) {
    throw new RentalCarNotFoundError(id)
  }
  rentalCars.splice(idx, 1)
}
