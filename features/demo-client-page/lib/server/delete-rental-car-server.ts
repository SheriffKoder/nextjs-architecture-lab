/**
 * Delete Rental Car — remove row from mock in-memory store
 *
 * Purpose: Splice one `RentalCarTableItem` out of `rentalCars` by id
 * Used in: `app/api/demo-client-page/page-client/[id]/route.ts` (DELETE)
 */

import { rentalCars } from '../../config/lib/data-source'
import { RentalCarNotFoundError } from './update-rental-car-partial-server'

/**
 * Removes the car from the shared mock array; throws {@link RentalCarNotFoundError} when id is missing.
 */
export async function deleteRentalCarFromMockStore(id: string): Promise<void> {
  const idx = rentalCars.findIndex((c) => c.id === id)
  if (idx === -1) {
    throw new RentalCarNotFoundError(id)
  }
  rentalCars.splice(idx, 1)
}
