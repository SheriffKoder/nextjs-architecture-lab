/**
 * @file entities/demo-hybrid-cars/server/patch-rental-car-row-status.ts
 * Server use-case: toggle activity status on a mock row.
 *
 * Purpose: Activity-column PATCH with demo delay / simulated failure
 * Used in: `PATCH /api/demo-hybrid-page/cars/:id` when body is `{ status }` only
 */

import { z } from 'zod'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import type { RentalCarStatusValue } from '@/entities/demo-hybrid-cars/model/rental-car-status'
import {
  patchRentalCarRowStatusInMockStore,
  RentalCarRowStatusSimulatedError,
} from '@/entities/demo-hybrid-cars/repository/patch-rental-car-row-status'
import { RentalCarNotFoundError } from '@/entities/demo-hybrid-cars/repository/update-rental-car'

export { RentalCarRowStatusSimulatedError, RentalCarNotFoundError }

export class PatchRowStatusValidationError extends Error {
  override readonly name = 'PatchRowStatusValidationError'

  constructor(message: string) {
    super(message)
  }
}

const statusOnlySchema = z.object({
  status: z.string().trim().min(1, 'status is required'),
})

/**
 * Detect a status-only PATCH body (activity toggle).
 * Returns the status string, or `null` when the body is not status-only.
 */
export function tryParseStatusOnlyPatch(data: unknown): string | null {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return null
  }
  const keys = Object.keys(data as object)
  if (keys.length !== 1 || keys[0] !== 'status') {
    return null
  }
  const parsed = statusOnlySchema.safeParse(data)
  if (!parsed.success) {
    throw new PatchRowStatusValidationError(
      parsed.error.flatten().fieldErrors.status?.join(', ') ?? 'Invalid status',
    )
  }
  return parsed.data.status
}

export async function patchRentalCarRowStatusServer(
  id: string,
  status: RentalCarStatusValue,
): Promise<RentalCarTableItem> {
  return patchRentalCarRowStatusInMockStore(id, status)
}
