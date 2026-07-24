/**
 * Filter Rental Cars (URL searchParams simulation)
 *
 * Name: filter-rental-cars
 * Purpose: Apply the demo’s URL query conventions to the in-memory `rentalCars` list
 * Used in: ../get-rental-cars-data.ts, ../get-filter-options-server.ts
 * Used for: (1) Full list filtering for the table API; (2) “Exclude one column” filtering for facet counts
 *
 * Function Index:
 * - parseList: Read comma-separated multi-select param
 * - parseSingle: Read first string value for a key (handles array form from duplicate keys)
 * - parseNumberRange: Parse `min_max` number range strings
 * - isNumberInRange: Inclusive min/max check for numeric filters
 * - filterRentalCars: Apply every URL filter including search
 * - filterRentalCarsExcludingColumn: Same as above but skip one column’s param (facet helper)
 *
 * Steps (filterRentalCars):
 * 1. Clone the array so callers’ source data is never mutated.
 * 2. Apply discrete filters (status, make, location) when present.
 * 3. Apply numeric range filters (year, pricePerDay, mileage) when present.
 * 4. Apply rental start date range when `rentalStartDate` or legacy `date` param is present.
 * 5. Apply `q` full-text filter last so it runs on the already-narrowed set.
 *
 * Steps (filterRentalCarsExcludingColumn):
 * 1. Same as filterRentalCars, but each block is wrapped so the block for `excludeColumn` is skipped.
 * 2. Search (`q`) is always applied — matches facet behavior where search still narrows all facets.
 */

import type { RentalCarTableItem } from '../../../types/rental-car-table-item'
import { decodeUrlParamListWithKnownMultiSelect } from '@/platform/url-kit/filters/feature-filtering/utils/url-param-list-codec'
import { filterBySearch } from './filter-by-search'
import {
  rentalCarFieldMap,
  rentalCarSearchConfig,
} from '../../../config/header-filters-config'

type SearchParams = {
  [key: string]: string | string[] | undefined
}

/**
 * Parse a comma-separated multi-select value from URL params.
 *
 * Steps:
 * 1. Read raw value for `key` (may be string[] if duplicate query keys).
 * 2. Coerce to a single string and decode per-entry (comma-separated encodeURIComponent segments).
 */
function parseList(
  params: SearchParams,
  key: string,
  cars: RentalCarTableItem[],
): string[] {
  const value = params[key]
  if (!value) return []
  const stringValue = Array.isArray(value) ? value[0] : value
  if (!stringValue) return []

  const field = rentalCarFieldMap[key]
  const known =
    field !== undefined &&
    (key === 'status' ||
      key === 'make' ||
      key === 'location' ||
      key === 'model' ||
      key === 'licensePlate')
      ? new Set(
          cars.map((c) => String(c[field as keyof RentalCarTableItem])),
        )
      : undefined

  return decodeUrlParamListWithKnownMultiSelect(stringValue, known)
}

/**
 * Parse the first scalar string for a param key (used for ranges and `q`).
 */
function parseSingle(params: SearchParams, key: string): string | null {
  const value = params[key]
  if (!value) return null
  return Array.isArray(value) ? value[0] : value
}

/**
 * Parse `min_max` or partial `_max` / `min_` number range encoding from the URL.
 *
 * Steps:
 * 1. Resolve string via parseSingle.
 * 2. Split on first underscore into min/max token strings.
 * 3. Parse numbers; empty side becomes undefined (open-ended range).
 */
function parseNumberRange(
  params: SearchParams,
  key: string
): { min: number | undefined; max: number | undefined } | null {
  const value = parseSingle(params, key)
  if (!value) return null
  const [minStr, maxStr] = value.split('_')
  return {
    min: minStr ? Number(minStr) : undefined,
    max: maxStr ? Number(maxStr) : undefined,
  }
}

/**
 * Inclusive numeric range test for car numeric fields.
 */
function isNumberInRange(
  value: number,
  min: number | undefined,
  max: number | undefined
): boolean {
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

/**
 * Apply all URL filters to `cars` (full filter pipeline for list API).
 *
 * @param cars - Typically the full `rentalCars` export
 * @param searchParams - Query object built from the request URL
 */
export function filterRentalCars(
  cars: RentalCarTableItem[],
  searchParams: SearchParams
): RentalCarTableItem[] {
  // Step 1: shallow copy — downstream steps reassign `filtered`
  let filtered = [...cars]

  //////////////////////////////////////////////////////////////
  // Step 2: Discrete multi-selects (comma-separated URL values)
  //////////////////////////////////////////////////////////////
  const statusFilter = parseList(searchParams, 'status', cars)
  if (statusFilter.length > 0) {
    filtered = filtered.filter((car) => statusFilter.includes(car.status))
  }

  const makeFilter = parseList(searchParams, 'make', cars)
  if (makeFilter.length > 0) {
    filtered = filtered.filter((car) => makeFilter.includes(car.make))
  }

  const locationFilter = parseList(searchParams, 'location', cars)
  if (locationFilter.length > 0) {
    filtered = filtered.filter((car) => locationFilter.includes(car.location))
  }

  const modelFilter = parseList(searchParams, 'model', cars)
  if (modelFilter.length > 0) {
    filtered = filtered.filter((car) => modelFilter.includes(car.model))
  }

  const licensePlateFilter = parseList(
    searchParams,
    'licensePlate',
    cars,
  )
  if (licensePlateFilter.length > 0) {
    filtered = filtered.filter((car) =>
      licensePlateFilter.includes(car.licensePlate),
    )
  }

  //////////////////////////////////////////////////////////////
  // Step 3: Numeric ranges (underscore encoding)
  //////////////////////////////////////////////////////////////
  const yearRange = parseNumberRange(searchParams, 'year')
  if (yearRange) {
    filtered = filtered.filter((car) =>
      isNumberInRange(car.year, yearRange.min, yearRange.max)
    )
  }

  const priceRange = parseNumberRange(searchParams, 'pricePerDay')
  if (priceRange) {
    filtered = filtered.filter((car) =>
      isNumberInRange(car.pricePerDay, priceRange.min, priceRange.max)
    )
  }

  const mileageRange = parseNumberRange(searchParams, 'mileage')
  if (mileageRange) {
    filtered = filtered.filter((car) =>
      isNumberInRange(car.mileage, mileageRange.min, mileageRange.max)
    )
  }

  //////////////////////////////////////////////////////////////
  // Step 4: Rental start date range (`start_end` ISO pair)
  //////////////////////////////////////////////////////////////
  const dateRange =
    parseSingle(searchParams, 'rentalStartDate') || parseSingle(searchParams, 'date')
  if (dateRange) {
    const [start, end] = dateRange.split('_')
    if (start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      filtered = filtered.filter((car) => {
        const carDate = new Date(car.rentalStartDate)
        return carDate >= startDate && carDate <= endDate
      })
    }
  }

  //////////////////////////////////////////////////////////////
  // Step 5: Free-text search across configured columns
  //////////////////////////////////////////////////////////////
  const searchQuery = parseSingle(searchParams, 'q')
  if (searchQuery) {
    filtered = filterBySearch(
      filtered,
      searchQuery,
      rentalCarSearchConfig.searchableFields as (keyof RentalCarTableItem)[]
    )
  }

  return filtered
}

/**
 * Same filtering as {@link filterRentalCars} but omits the URL param group for `excludeColumn`.
 * Used when computing facet `initialCount` so one filter’s options are not self-restricted.
 *
 * @param excludeColumn - Filter key to skip (e.g. `"status"` when computing status facet counts)
 */
export function filterRentalCarsExcludingColumn(
  cars: RentalCarTableItem[],
  searchParams: SearchParams,
  excludeColumn: string
): RentalCarTableItem[] {
  let filtered = [...cars]

  //////////////////////////////////////////////////////////////
  // Status — skip when this column is the facet being computed
  //////////////////////////////////////////////////////////////
  if (excludeColumn !== 'status') {
    const statusFilter = parseList(searchParams, 'status', cars)
    if (statusFilter.length > 0) {
      filtered = filtered.filter((car) => statusFilter.includes(car.status))
    }
  }

  if (excludeColumn !== 'make') {
    const makeFilter = parseList(searchParams, 'make', cars)
    if (makeFilter.length > 0) {
      filtered = filtered.filter((car) => makeFilter.includes(car.make))
    }
  }

  if (excludeColumn !== 'location') {
    const locationFilter = parseList(searchParams, 'location', cars)
    if (locationFilter.length > 0) {
      filtered = filtered.filter((car) => locationFilter.includes(car.location))
    }
  }

  if (excludeColumn !== 'model') {
    const modelFilter = parseList(searchParams, 'model', cars)
    if (modelFilter.length > 0) {
      filtered = filtered.filter((car) => modelFilter.includes(car.model))
    }
  }

  if (excludeColumn !== 'licensePlate') {
    const licensePlateFilter = parseList(
      searchParams,
      'licensePlate',
      cars,
    )
    if (licensePlateFilter.length > 0) {
      filtered = filtered.filter((car) =>
        licensePlateFilter.includes(car.licensePlate),
      )
    }
  }

  //////////////////////////////////////////////////////////////
  // Numeric ranges — each gated by excludeColumn
  //////////////////////////////////////////////////////////////
  if (excludeColumn !== 'year') {
    const yearRange = parseNumberRange(searchParams, 'year')
    if (yearRange) {
      filtered = filtered.filter((car) =>
        isNumberInRange(car.year, yearRange.min, yearRange.max)
      )
    }
  }

  if (excludeColumn !== 'pricePerDay') {
    const priceRange = parseNumberRange(searchParams, 'pricePerDay')
    if (priceRange) {
      filtered = filtered.filter((car) =>
        isNumberInRange(car.pricePerDay, priceRange.min, priceRange.max)
      )
    }
  }

  if (excludeColumn !== 'mileage') {
    const mileageRange = parseNumberRange(searchParams, 'mileage')
    if (mileageRange) {
      filtered = filtered.filter((car) =>
        isNumberInRange(car.mileage, mileageRange.min, mileageRange.max)
      )
    }
  }

  //////////////////////////////////////////////////////////////
  // Date range — treat `date` as alias; skip when excluding date keys
  //////////////////////////////////////////////////////////////
  if (excludeColumn !== 'rentalStartDate' && excludeColumn !== 'date') {
    const dateRange =
      parseSingle(searchParams, 'rentalStartDate') || parseSingle(searchParams, 'date')
    if (dateRange) {
      const [start, end] = dateRange.split('_')
      if (start && end) {
        const startDate = new Date(start)
        const endDate = new Date(end)
        filtered = filtered.filter((car) => {
          const carDate = new Date(car.rentalStartDate)
          return carDate >= startDate && carDate <= endDate
        })
      }
    }
  }

  //////////////////////////////////////////////////////////////
  // Search always narrows facets (no excludeColumn branch)
  //////////////////////////////////////////////////////////////
  const searchQuery = parseSingle(searchParams, 'q')
  if (searchQuery) {
    filtered = filterBySearch(
      filtered,
      searchQuery,
      rentalCarSearchConfig.searchableFields as (keyof RentalCarTableItem)[]
    )
  }

  return filtered
}
