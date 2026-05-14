/**
 * buildRentalCarListQuery + rentalCarListQueryToSearchParams
 *
 * Purpose: Same URL → `RentalCarListQuery` mapping as `demo-client-index.tsx` (useUrlFilters + useUrlSorting + useUrlPagination), without hooks — for RSC + future `/page-client` parity
 * Used in: `demo-rsc-index.tsx`, `demo-rsc-cached-loaders.ts` (`getCars`)
 */

import type { SortSpec } from '@/features/ui/filters/feature-sorting/types'
import { parseSorts } from '@/features/ui/filters/feature-sorting/utils'
import { parsePagination } from '@/features/ui/filters/feature-pagination/utils'
import {
  decodeUrlParamListWithKnownMultiSelect,
  encodeUrlParamList,
} from '@/features/ui/filters/feature-filtering/utils/url-param-list-codec'
import type { RentalCarListQuery, RentalCarNumberRange } from '@/features/demo-rsc-page/types/rental-car-list-query'
import type { RentalCarTableItem } from '@/features/demo-rsc-page/types/rental-car-table-item'
import {
  rentalCarFieldMap,
  rentalCarPaginationConfig,
} from '@/features/demo-rsc-page/config/header-filters-config'
import { rentalCars } from '@/features/demo-rsc-page/utils/server/data-source'

/** Flat search-param bag (same shape as Next `searchParams` after `await`). */
type PageSearchParams = Record<string, string | string[] | undefined>

function toScalarString(v: string | string[] | undefined): string | null {
  if (v === undefined) return null
  if (Array.isArray(v)) {
    if (v.length === 0) return null
    return v.join(',')
  }
  return v === '' ? null : v
}

function searchParamsRecordToURLSearchParams(params: PageSearchParams): URLSearchParams {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    const s = toScalarString(value)
    if (s !== null) sp.set(key, s)
  }
  return sp
}

function getList(params: PageSearchParams, key: string): string[] {
  const raw = toScalarString(params[key])
  if (!raw) return []

  const field = rentalCarFieldMap[key]
  const known =
    field !== undefined &&
    (key === 'status' ||
      key === 'make' ||
      key === 'location' ||
      key === 'model' ||
      key === 'licensePlate')
      ? new Set(
          rentalCars.map((c) =>
            String(c[field as keyof RentalCarTableItem]),
          ),
        )
      : undefined

  return decodeUrlParamListWithKnownMultiSelect(raw, known)
}

function getSingle(params: PageSearchParams, key: string): string | null {
  return toScalarString(params[key])
}

function getNumberRange(
  params: PageSearchParams,
  key: string
): { min: number | undefined; max: number | undefined } | null {
  const value = getSingle(params, key)
  if (!value) return null
  const [min, max] = value.split('_')
  return {
    min: min ? Number(min) : undefined,
    max: max ? Number(max) : undefined,
  }
}

/**
 * Mirrors `features/demo-client-page/demo-client-index.tsx` listQuery construction.
 */
export function buildRentalCarListQuery(params: PageSearchParams): RentalCarListQuery {
  const sp = searchParamsRecordToURLSearchParams(params)
  const defaultLimit = rentalCarPaginationConfig.defaultPageSize || 20
  const { page, limit } = parsePagination(sp, defaultLimit)

  const year = getNumberRange(params, 'year')
  const pricePerDay = getNumberRange(params, 'pricePerDay')
  const mileage = getNumberRange(params, 'mileage')
  const rentalStartDate = getSingle(params, 'rentalStartDate')
  const dateParam = getSingle(params, 'date')
  const q = getSingle(params, 'q') ?? ''
  const sortString = sp.get('sort') ?? ''
  const sorts: SortSpec[] = parseSorts(sortString)

  const listQuery: RentalCarListQuery = {
    status: getList(params, 'status'),
    make: getList(params, 'make'),
    location: getList(params, 'location'),
    model: getList(params, 'model'),
    licensePlate: getList(params, 'licensePlate'),
    ...(year && (year.min !== undefined || year.max !== undefined) ? { year } : {}),
    ...(pricePerDay &&
    (pricePerDay.min !== undefined || pricePerDay.max !== undefined)
      ? { pricePerDay }
      : {}),
    ...(mileage &&
    (mileage.min !== undefined || mileage.max !== undefined)
      ? { mileage }
      : {}),
    ...(rentalStartDate ? { rentalStartDate } : {}),
    ...(dateParam ? { date: dateParam } : {}),
    q: q || undefined,
    sort: sorts.length > 0 ? sorts : undefined,
    page,
    limit,
  }

  return listQuery
}

function appendRange(out: PageSearchParams, key: string, range: RentalCarNumberRange | undefined) {
  if (!range || (range.min === undefined && range.max === undefined)) return
  const min = range.min !== undefined ? String(range.min) : ''
  const max = range.max !== undefined ? String(range.max) : ''
  out[key] = `${min}_${max}`
}

/**
 * Turns list query back into flat search params for `getRentalCarsData` / `filterRentalCars` (same strings as the URL would use).
 */
export function rentalCarListQueryToSearchParams(
  query: RentalCarListQuery
): PageSearchParams {
  const out: PageSearchParams = {}

  if (query.status?.length) out.status = encodeUrlParamList(query.status)
  if (query.make?.length) out.make = encodeUrlParamList(query.make)
  if (query.location?.length) out.location = encodeUrlParamList(query.location)
  if (query.model?.length) out.model = encodeUrlParamList(query.model)
  if (query.licensePlate?.length)
    out.licensePlate = encodeUrlParamList(query.licensePlate)

  appendRange(out, 'year', query.year)
  appendRange(out, 'pricePerDay', query.pricePerDay)
  appendRange(out, 'mileage', query.mileage)

  if (query.rentalStartDate) out.rentalStartDate = query.rentalStartDate
  if (query.date) out.date = query.date
  if (query.q) out.q = query.q

  if (query.sort?.length) {
    out.sort = query.sort.map((s) => `${s.key}:${s.direction}`).join(',')
  }

  if (query.page !== undefined) out.page = String(query.page)
  if (query.limit !== undefined) out.limit = String(query.limit)

  return out
}
