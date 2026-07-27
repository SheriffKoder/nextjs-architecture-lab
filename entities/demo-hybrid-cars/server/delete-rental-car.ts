/**
 * @file entities/demo-hybrid-cars/server/delete-rental-car.ts
 * Server use-case: delete a rental car from the mock store.
 *
 * Purpose: Thin wrapper for DELETE route handler
 * Used in: `DELETE /api/demo-hybrid-page/cars/:id`
 */

import { deleteRentalCarFromMockStore } from '@/entities/demo-hybrid-cars/repository/delete-rental-car'
import { RentalCarNotFoundError } from '@/entities/demo-hybrid-cars/repository/update-rental-car'

export { RentalCarNotFoundError }

export async function deleteRentalCarServer(id: string): Promise<void> {
  return deleteRentalCarFromMockStore(id)
}
