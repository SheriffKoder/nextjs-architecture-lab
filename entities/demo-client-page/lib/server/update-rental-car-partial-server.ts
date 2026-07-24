/**
 * Update Rental Car (partial) — mock in-memory row patch
 *
 * Purpose: Validate PATCH body and merge allowed fields into `rentalCars` from `data-source`
 * Used in: `app/api/demo-client-page/page-client/[id]/route.ts` (PATCH)
 */

import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import { rentalCars } from '../../config/lib/data-source'
import {
  rentalCarEditFormSchema,
  type RentalCarEditFormValues,
} from '../../validation/rental-car-edit-form-schema'

export class UpdateRentalCarValidationError extends Error {
  override readonly name = 'UpdateRentalCarValidationError'

  constructor(message: string) {
    super(message)
  }
}

export class RentalCarNotFoundError extends Error {
  override readonly name = 'RentalCarNotFoundError'

  constructor(public readonly id: string) {
    super(`Rental car not found: ${id}`)
  }
}

function asRecord(data: unknown): Record<string, unknown> {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new UpdateRentalCarValidationError('Body must be a JSON object')
  }
  return data as Record<string, unknown>
}

/**
 * Parse PATCH JSON into edit fields; throws {@link UpdateRentalCarValidationError} on invalid input.
 */
export function parseRentalCarEditPatch(data: unknown): RentalCarEditFormValues {
  const parsed = rentalCarEditFormSchema.safeParse(asRecord(data))
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors
    const msg = Object.entries(first)
      .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
      .join('; ')
    throw new UpdateRentalCarValidationError(msg || 'Validation failed')
  }
  return parsed.data
}

/**
 * Merge validated patch into the mock store row and return the updated row (shallow copy for JSON).
 */
export async function updateRentalCarInMockStoreById(
  id: string,
  patch: RentalCarEditFormValues
): Promise<RentalCarTableItem> {
  const row = rentalCars.find((c) => c.id === id)
  if (!row) {
    throw new RentalCarNotFoundError(id)
  }
  Object.assign(row, patch)
  return { ...row }
}
