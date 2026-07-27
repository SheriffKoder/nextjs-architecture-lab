/**
 * @file entities/demo-hybrid-cars/client/mutate-rental-cars.ts
 * Browser fetch helpers for create / update / delete / status-patch.
 *
 * Purpose: Thin `mutationFn` transport over `/api/demo-hybrid-page/cars`
 * Used in: `mutations/use-*-rental-car*.ts`
 */

import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import type { RentalCarEditFormValues } from '@/entities/demo-hybrid-cars/schema/rental-car-edit-form-schema'
import type { RentalCarStatusValue } from '@/entities/demo-hybrid-cars/model/rental-car-status'

const CARS_PATH = '/api/demo-hybrid-page/cars'

function carItemPath(id: string): string {
  return `${CARS_PATH}/${encodeURIComponent(id)}`
}

type CarResponseBody = {
  car: RentalCarTableItem
  error?: string
}

async function readJsonErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string }
    if (typeof data?.error === 'string' && data.error.trim()) {
      return data.error.trim()
    }
  } catch {
    // non-JSON or empty body
  }
  return `${response.status} ${response.statusText}`
}

/** Payload without `id`; server assigns it. */
export type CreateRentalCarInput = Omit<RentalCarTableItem, 'id'>

/**
 * POST create — strips client `id` when present.
 */
export async function createRentalCar(
  body: CreateRentalCarInput | RentalCarTableItem,
): Promise<RentalCarTableItem> {
  const { id: _omit, ...payload } = body as RentalCarTableItem
  const response = await fetch(CARS_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const detail = await readJsonErrorMessage(response)
    throw new Error(`Failed to create rental car: ${detail}`)
  }

  const json = (await response.json()) as CarResponseBody
  if (!json?.car || typeof json.car.id !== 'string') {
    throw new Error('Failed to create rental car: invalid response body')
  }
  return json.car
}

/**
 * PATCH partial edit fields.
 */
export async function updateRentalCarPartial(
  id: string,
  patch: RentalCarEditFormValues,
): Promise<RentalCarTableItem> {
  const response = await fetch(carItemPath(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })

  if (!response.ok) {
    const detail = await readJsonErrorMessage(response)
    throw new Error(`Failed to update rental car: ${detail}`)
  }

  const json = (await response.json()) as CarResponseBody
  if (!json?.car || typeof json.car.id !== 'string') {
    throw new Error('Failed to update rental car: invalid response body')
  }
  return json.car
}

/**
 * PATCH status-only body for the activity column (demo delay + ~50% failure).
 */
export async function patchRentalCarRowStatus(
  id: string,
  status: RentalCarStatusValue,
): Promise<RentalCarTableItem> {
  const response = await fetch(carItemPath(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const detail = await readJsonErrorMessage(response)
    throw new Error(detail)
  }

  const json = (await response.json()) as CarResponseBody
  if (!json?.car || typeof json.car.id !== 'string') {
    throw new Error('Failed to patch rental car status: invalid response body')
  }
  return json.car
}

/**
 * DELETE car by id. Server returns 204 with empty body.
 */
export async function deleteRentalCar(id: string): Promise<void> {
  const response = await fetch(carItemPath(id), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })

  if (response.status === 404) {
    throw new Error('Car not found')
  }
  if (!response.ok) {
    const detail = await readJsonErrorMessage(response)
    throw new Error(`Failed to delete rental car: ${detail}`)
  }
}
