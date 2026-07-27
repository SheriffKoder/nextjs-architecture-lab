/**
 * @file entities/demo-hybrid-cars/server/create-rental-car.ts
 * Server use-case: validate create payload and persist to mock store.
 *
 * Purpose: Thin orchestration between API routes and repository
 * Used in: `POST /api/demo-hybrid-page/cars`
 */

import {
  createRentalCarInMockStore,
  type CreateRentalCarInput,
} from '@/entities/demo-hybrid-cars/repository/create-rental-car'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import {
  rentalCarFormSchema,
  rentalCarFormValuesToTableItem,
} from '@/entities/demo-hybrid-cars/schema/rental-car-form-schema'

export class CreateRentalCarValidationError extends Error {
  override readonly name = 'CreateRentalCarValidationError'

  constructor(message: string) {
    super(message)
  }
}

export type { CreateRentalCarInput }

/**
 * Parse POST JSON into a create input (strips client `id`).
 * @throws {CreateRentalCarValidationError} on invalid body
 */
export function parseCreateRentalCarPayload(data: unknown): CreateRentalCarInput {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new CreateRentalCarValidationError('Body must be a JSON object')
  }

  const withId = { id: '', ...(data as Record<string, unknown>) }
  const parsed = rentalCarFormSchema.safeParse(withId)
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors
    const msg = Object.entries(first)
      .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
      .join('; ')
    throw new CreateRentalCarValidationError(msg || 'Validation failed')
  }

  const { id: _omit, ...rest } = rentalCarFormValuesToTableItem(parsed.data)
  return rest
}

/** Validate + insert into mock store; return the persisted row. */
export async function createRentalCarServer(
  input: CreateRentalCarInput,
): Promise<RentalCarTableItem> {
  return createRentalCarInMockStore(input)
}
