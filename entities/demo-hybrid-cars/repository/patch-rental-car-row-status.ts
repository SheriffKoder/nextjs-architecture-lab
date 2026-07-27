/**
 * @file entities/demo-hybrid-cars/repository/patch-rental-car-row-status.ts
 * Patch `status` on a mock rental car with demo latency + simulated failure.
 *
 * Purpose: Activity-column persistence boundary for optimistic toggle demos
 * Used in: `server/patch-rental-car-row-status.ts`
 */

import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import type { RentalCarStatusValue } from '@/entities/demo-hybrid-cars/model/rental-car-status'
import { RentalCarNotFoundError } from './update-rental-car'
import { rentalCars } from './data-source'

/** Demo-only: artificial latency before success or simulated failure. */
const DEMO_UPDATE_DELAY_MS = 1500

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
 * Set `status` on the in-memory row.
 * Demo: always waits {@link DEMO_UPDATE_DELAY_MS}; ~50% of calls throw
 * {@link RentalCarRowStatusSimulatedError}.
 */
export async function patchRentalCarRowStatusInMockStore(
  id: string,
  status: RentalCarStatusValue,
): Promise<RentalCarTableItem> {
  await delay(DEMO_UPDATE_DELAY_MS)

  const row = rentalCars.find((c) => c.id === id)
  if (!row) {
    throw new RentalCarNotFoundError(id)
  }

  if (Math.random() < 0.5) {
    throw new RentalCarRowStatusSimulatedError()
  }

  row.status = status
  return { ...row }
}
