/**
 * Create Rental Car — server module (DB-ready, no mock array mutation)
 *
 * Name: create-rental-car-server
 * Purpose: Validate create payload and return a canonical `RentalCarTableItem` with a server-generated `id`
 * Used in: `app/api/demo-client-page/page-client/route.ts` (POST)
 * Used for: Write boundary that becomes `INSERT … RETURNING` later; list GET stays mock until DB migration
 *
 * Function Index:
 * - CreateRentalCarValidationError — invalid body
 * - parseCreateRentalCarPayload — `unknown` → `CreateRentalCarInput`
 * - createRentalCarServer — assign `id`, return persisted-shaped row (no in-memory append)
 */

import { randomUUID } from 'node:crypto'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'

/** Payload without `id`; client `id` is ignored when parsing. */
export type CreateRentalCarInput = Omit<RentalCarTableItem, 'id'>

//////////////////////////////////
// CreateRentalCarValidationError
// Purpose: Distinguish 400 responses from unexpected server errors in the route handler
//////////////////////////////////
export class CreateRentalCarValidationError extends Error {
  override readonly name = 'CreateRentalCarValidationError'

  constructor(message: string) {
    super(message)
  }
}

function asRecord(data: unknown): Record<string, unknown> {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new CreateRentalCarValidationError('Body must be a JSON object')
  }
  return data as Record<string, unknown>
}

function requireTrimmedString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new CreateRentalCarValidationError(`${field} must be a string`)
  }
  return value.trim()
}

function requireFiniteNumber(
  value: unknown,
  field: string,
  opts?: { min?: number; max?: number; int?: boolean }
): number {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN
  if (!Number.isFinite(n)) {
    throw new CreateRentalCarValidationError(`${field} must be a finite number`)
  }
  if (opts?.int && !Number.isInteger(n)) {
    throw new CreateRentalCarValidationError(`${field} must be an integer`)
  }
  if (opts?.min !== undefined && n < opts.min) {
    throw new CreateRentalCarValidationError(`${field} must be >= ${opts.min}`)
  }
  if (opts?.max !== undefined && n > opts.max) {
    throw new CreateRentalCarValidationError(`${field} must be <= ${opts.max}`)
  }
  return n
}

function optionalFiniteNumber(
  value: unknown,
  field: string
): number | undefined {
  if (value === undefined || value === null) return undefined
  return requireFiniteNumber(value, field)
}

/**
 * Parse and validate POST JSON into a create input (no `id`).
 * Aligns with `CarSliderForm` / `RentalCarTableItem` shape.
 */
export function parseCreateRentalCarPayload(data: unknown): CreateRentalCarInput {
  const o = asRecord(data)

  const make = requireTrimmedString(o.make, 'make')
  const model = requireTrimmedString(o.model, 'model')
  if (!make) throw new CreateRentalCarValidationError('make is required')
  if (!model) throw new CreateRentalCarValidationError('model is required')

  const year = requireFiniteNumber(o.year, 'year', {
    min: 1900,
    max: 2100,
    int: true,
  })
  const status = requireTrimmedString(o.status, 'status')
  const location = requireTrimmedString(o.location, 'location')
  if (!status) throw new CreateRentalCarValidationError('status is required')
  if (!location) throw new CreateRentalCarValidationError('location is required')

  const mileage = requireFiniteNumber(o.mileage, 'mileage', { min: 0 })
  const pricePerDay = requireFiniteNumber(o.pricePerDay, 'pricePerDay', {
    min: 0,
  })
  const color = requireTrimmedString(o.color, 'color')
  const licensePlate = requireTrimmedString(o.licensePlate, 'licensePlate')

  const rentalStartDate = requireTrimmedString(o.rentalStartDate, 'rentalStartDate')
  const rentalEndDate = requireTrimmedString(o.rentalEndDate, 'rentalEndDate')
  if (!rentalStartDate) {
    throw new CreateRentalCarValidationError('rentalStartDate is required')
  }
  if (!rentalEndDate) {
    throw new CreateRentalCarValidationError('rentalEndDate is required')
  }
  if (Number.isNaN(Date.parse(rentalStartDate))) {
    throw new CreateRentalCarValidationError('rentalStartDate must be a valid date string')
  }
  if (Number.isNaN(Date.parse(rentalEndDate))) {
    throw new CreateRentalCarValidationError('rentalEndDate must be a valid date string')
  }

  const manual_sorting = optionalFiniteNumber(o.manual_sorting, 'manual_sorting')
  const latitude = optionalFiniteNumber(o.latitude, 'latitude')
  const longitude = optionalFiniteNumber(o.longitude, 'longitude')

  const base: CreateRentalCarInput = {
    make,
    model,
    year,
    status,
    location,
    mileage,
    pricePerDay,
    color,
    licensePlate,
    rentalStartDate,
    rentalEndDate,
  }

  if (manual_sorting !== undefined) {
    base.manual_sorting = manual_sorting
  }
  if (latitude !== undefined) {
    base.latitude = latitude
  }
  if (longitude !== undefined) {
    base.longitude = longitude
  }

  return base
}

/**
 * Build the canonical row returned to the client. Today: validate + new UUID.
 * Later: replace body with DB insert and return the stored row.
 */
export async function createRentalCarServer(
  input: CreateRentalCarInput
): Promise<RentalCarTableItem> {
  const id = randomUUID()
  return {
    id,
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
}
