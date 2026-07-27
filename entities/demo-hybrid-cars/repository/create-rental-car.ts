/**
 * @file entities/demo-hybrid-cars/repository/create-rental-car.ts
 * Append a new rental car to the in-memory mock store.
 *
 * Purpose: Persist create so subsequent list GETs include the row
 * Used in: `server/create-rental-car.ts`
 */

import { randomUUID } from 'node:crypto'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import { rentalCars } from './data-source'

/** Payload without `id`; server assigns a stable id. */
export type CreateRentalCarInput = Omit<RentalCarTableItem, 'id'>

/**
 * Insert a new row at the front of the mock array and return a shallow copy.
 */
export async function createRentalCarInMockStore(
  input: CreateRentalCarInput,
): Promise<RentalCarTableItem> {
  const row: RentalCarTableItem = {
    id: randomUUID(),
    make: input.make,
    model: input.model,
    year: input.year,
    status: input.status,
    location: input.location,
    mileage: input.mileage,
    pricePerDay: input.pricePerDay,
    color: input.color,
    licensePlate: input.licensePlate,
    rentalStartDate: input.rentalStartDate,
    rentalEndDate: input.rentalEndDate,
    ...(input.manual_sorting !== undefined
      ? { manual_sorting: input.manual_sorting }
      : {}),
    ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
    ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
  }
  rentalCars.unshift(row)
  return { ...row }
}
