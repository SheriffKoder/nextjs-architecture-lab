/**
 * Demo Client Page — fetch helpers for TanStack `queryFn`
 *
 * Purpose: Build query strings and call `/api/demo-client-page/*` Route Handlers
 * Used in: `use-rental-cars.ts`, `use-rental-car-filter-options.ts`, create mutation hook (`createRentalCar`)
 * Why: Keeps `useQuery` / `mutationFn` thin and matches server param encoding (comma lists, `min_max`, sort string)
 *
 * Function Index:
 * - buildRentalCarSearchParams — shared URLSearchParams builder
 * - fetchRentalCars — `GET …/page-client`
 * - createRentalCar — `POST …/page-client` (JSON body; mirrors `CreateRentalCarInput` in `lib/server`)
 * - fetchRentalCarById / updateRentalCarPartial / deleteRentalCar — `GET` / `PATCH` / `DELETE …/page-client/:id`
 * - fetchRentalCarFilterOptions — `GET …/options`
 */

import type { RentalCarTableItem } from '../types/rental-car-table-item'
import type { RentalCarEditFormValues } from '../validation/rental-car-edit-form-schema'
import type { RentalCarListQuery } from './key-factory'
import type { FilterConfig } from '@/features/ui/filters/feature-filtering/components/filter-types'

const PAGE_CLIENT_PATH = '/api/demo-client-page/page-client'
const OPTIONS_PATH = '/api/demo-client-page/options'

function pageClientItemPath(id: string): string {
  return `${PAGE_CLIENT_PATH}/${encodeURIComponent(id)}`
}

function appendCommaList(
  params: URLSearchParams,
  key: string,
  values?: string[]
) {
  if (!values || values.length === 0) return
  params.append(key, values.join(','))
}

/** Same encoding as employee salary / server `parseNumberRange` (`min_max`, open-ended sides). */
function appendNumberRange(
  params: URLSearchParams,
  key: string,
  range?: { min?: number; max?: number }
) {
  if (!range) return
  const { min, max } = range
  if (min === undefined && max === undefined) return
  const encoded =
    min !== undefined && max !== undefined
      ? `${min}_${max}`
      : min !== undefined
        ? `${min}_`
        : `_${max}`
  params.append(key, encoded)
}

/**
 * Build search params consumed by `getRentalCarsData` / `getFilterOptionsServer` (plain object → URL).
 */
export function buildRentalCarSearchParams(
  query?: RentalCarListQuery
): URLSearchParams {
  const params = new URLSearchParams()

  if (!query) {
    appendFilterAstFromWindow(params)
    return params
  }

  appendCommaList(params, 'status', query.status)
  appendCommaList(params, 'make', query.make)
  appendCommaList(params, 'location', query.location)

  appendNumberRange(params, 'year', query.year)
  appendNumberRange(params, 'pricePerDay', query.pricePerDay)
  appendNumberRange(params, 'mileage', query.mileage)

  if (query.rentalStartDate) {
    params.append('rentalStartDate', query.rentalStartDate)
  }
  if (query.date) {
    params.append('date', query.date)
  }

  if (query.q?.trim()) {
    params.append('q', query.q.trim())
  }

  if (query.sort && query.sort.length > 0) {
    params.append(
      'sort',
      query.sort.map((s) => `${s.key}:${s.direction}`).join(',')
    )
  }

  if (query.page != null) {
    params.append('page', String(query.page))
  }
  if (query.limit != null) {
    params.append('limit', String(query.limit))
  }

  appendFilterAstFromWindow(params)
  return params
}

/** Forward query-builder `filter` from the current page URL when present (parity with filters demo). */
function appendFilterAstFromWindow(params: URLSearchParams) {
  if (typeof window === 'undefined') return
  const filterParam = new URLSearchParams(window.location.search).get('filter')
  if (filterParam) {
    params.append('filter', filterParam)
  }
}

function buildApiUrl(path: string, query?: RentalCarListQuery): string {
  const qs = buildRentalCarSearchParams(query).toString()
  return qs ? `${path}?${qs}` : path
}

export type RentalCarsPageResponse = {
  cars: RentalCarTableItem[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}

/** Same shape as server `CreateRentalCarInput` — client must not send `id`; server assigns it. */
export type CreateRentalCarInput = Omit<RentalCarTableItem, 'id'>

type CreateRentalCarResponseBody = {
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

/**
 * POST create — same path as list GET, JSON body, returns persisted-shaped row (`car`).
 * Strips `id` when present (e.g. add form `RentalCarTableItem` with empty id) so the server assigns it.
 */
export async function createRentalCar(
  body: CreateRentalCarInput | RentalCarTableItem
): Promise<RentalCarTableItem> {
  const { id: _omit, ...payload } = body as RentalCarTableItem
  const response = await fetch(PAGE_CLIENT_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const detail = await readJsonErrorMessage(response)
    throw new Error(`Failed to create rental car: ${detail}`)
  }

  const json = (await response.json()) as CreateRentalCarResponseBody
  if (!json?.car || typeof json.car.id !== 'string') {
    throw new Error('Failed to create rental car: invalid response body')
  }
  return json.car
}

type RentalCarDetailResponseBody = {
  car: RentalCarTableItem
  error?: string
}

/**
 * GET one car by id (`/api/demo-client-page/page-client/:id`).
 */
export async function fetchRentalCarById(id: string): Promise<RentalCarTableItem> {
  const response = await fetch(pageClientItemPath(id), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (response.status === 404) {
    throw new Error('Car not found')
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch rental car: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as RentalCarDetailResponseBody
  if (!json?.car || typeof json.car.id !== 'string') {
    throw new Error('Failed to fetch rental car: invalid response body')
  }
  return json.car
}

type PatchRentalCarResponseBody = {
  car: RentalCarTableItem
  error?: string
}

/**
 * PATCH partial edit fields (`/api/demo-client-page/page-client/:id`).
 */
export async function updateRentalCarPartial(
  id: string,
  patch: RentalCarEditFormValues
): Promise<RentalCarTableItem> {
  const response = await fetch(pageClientItemPath(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })

  if (!response.ok) {
    const detail = await readJsonErrorMessage(response)
    throw new Error(`Failed to update rental car: ${detail}`)
  }

  const json = (await response.json()) as PatchRentalCarResponseBody
  if (!json?.car || typeof json.car.id !== 'string') {
    throw new Error('Failed to update rental car: invalid response body')
  }
  return json.car
}

/**
 * DELETE car by id (`/api/demo-client-page/page-client/:id`). Server returns 204 with empty body.
 */
export async function deleteRentalCar(id: string): Promise<void> {
  const response = await fetch(pageClientItemPath(id), {
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

export async function fetchRentalCars(
  query?: RentalCarListQuery
): Promise<RentalCarsPageResponse> {
  const response = await fetch(buildApiUrl(PAGE_CLIENT_PATH, query), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch rental cars: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<RentalCarsPageResponse>
}

export async function fetchRentalCarFilterOptions(
  query?: RentalCarListQuery
): Promise<FilterConfig[]> {
  const response = await fetch(buildApiUrl(OPTIONS_PATH, query), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch rental car filter options: ${response.status} ${response.statusText}`
    )
  }

  return response.json() as Promise<FilterConfig[]>
}
