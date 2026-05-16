/**
 * Patch rental car `status` in the demo RSC mock store.
 * used on the server action to update the status of the rental car
 *
 * Used in: `row-status-update-action.ts`
 */

import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import type { RentalCarStatusValue } from '../../types/rental-car-status'
import { rentalCars } from './data-source'

/** Demo-only: artificial latency before success or simulated failure. */
const DEMO_UPDATE_DELAY_MS = 1500

export class RentalCarRowNotFoundError extends Error {
  override readonly name = 'RentalCarRowNotFoundError'

  constructor(public readonly id: string) {
    super(`Rental car not found: ${id}`)
  }
}

/** Demo-only: random failure after delay (remove when DB is wired). */
export class RentalCarRowStatusSimulatedError extends Error {
  override readonly name = 'RentalCarRowStatusSimulatedError'

  constructor() {
    super('Simulated server error — activity update failed (demo)')
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Merge `status` into the in-memory row; returns a shallow copy for the action response.
 * Replace with a DB update when persistence exists.
 *
 * Demo: always waits {@link DEMO_UPDATE_DELAY_MS}; ~50% of calls throw {@link RentalCarRowStatusSimulatedError}.
 */
export async function updateRentalCarRowStatusInMockStore(
  id: string,
  status: RentalCarStatusValue
): Promise<RentalCarTableItem> {
  await delay(DEMO_UPDATE_DELAY_MS)

  const row = rentalCars.find((c) => c.id === id)
  if (!row) {
    throw new RentalCarRowNotFoundError(id)
  }

  if (Math.random() < 0.5) {
    throw new RentalCarRowStatusSimulatedError()
  }

  row.status = status
  return { ...row }
}
