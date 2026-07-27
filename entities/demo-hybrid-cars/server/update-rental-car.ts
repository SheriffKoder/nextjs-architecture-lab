/**
 * @file entities/demo-hybrid-cars/server/update-rental-car.ts
 * Server use-case: validate edit patch and merge into mock store.
 *
 * Purpose: Thin orchestration for PATCH edit drawer fields
 * Used in: `PATCH /api/demo-hybrid-page/cars/:id`
 */

import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import {
  rentalCarEditFormSchema,
  type RentalCarEditFormValues,
} from '@/entities/demo-hybrid-cars/schema/rental-car-edit-form-schema'
import {
  RentalCarNotFoundError,
  updateRentalCarInMockStore,
} from '@/entities/demo-hybrid-cars/repository/update-rental-car'

export { RentalCarNotFoundError }

export class UpdateRentalCarValidationError extends Error {
  override readonly name = 'UpdateRentalCarValidationError'

  constructor(message: string) {
    super(message)
  }
}

/**
 * Parse PATCH JSON into edit fields.
 * @throws {UpdateRentalCarValidationError} on invalid input
 */
export function parseRentalCarEditPatch(data: unknown): RentalCarEditFormValues {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new UpdateRentalCarValidationError('Body must be a JSON object')
  }

  const parsed = rentalCarEditFormSchema.safeParse(data)
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors
    const msg = Object.entries(first)
      .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
      .join('; ')
    throw new UpdateRentalCarValidationError(msg || 'Validation failed')
  }
  return parsed.data
}

export async function updateRentalCarServer(
  id: string,
  patch: RentalCarEditFormValues,
): Promise<RentalCarTableItem> {
  return updateRentalCarInMockStore(id, patch)
}
