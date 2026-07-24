/**
 * Filter Rental Cars Utility
 * 
 * Purpose: Filters rental car data based on URL search parameters
 * Used in: Server functions that need to filter rental cars based on URL params
 * Why: Centralizes filtering logic and ensures consistent filtering behavior
 */

import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import { decodeUrlParamListWithKnownMultiSelect } from '@/platform/url-kit/filters/feature-filtering/utils/url-param-list-codec'
import { filterBySearch } from "./filter-by-search"
import {
  rentalCarFieldMap,
  rentalCarSearchConfig,
} from "../../../../views/demo-rsc-page/config/header-filters-config"

//////////////////////////////////
// Type Definitions
//////////////////////////////////

/**
 * Search parameters type
 * WHY: Type-safe search parameters object
 * HOW: Defines structure of URL search parameters
 */
type SearchParams = {
  [key: string]: string | string[] | undefined
}

//////////////////////////////////
// Helper Functions
//////////////////////////////////

/**
 * Parse multi-select list from search params (comma-separated encodeURIComponent segments,
 * plus legacy single-value strings that contain commas but match one known facet value).
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
 * Parse single value from search params
 * WHY: Single-select filters use a single value
 * HOW: Extract value and return as string or null
 */
function parseSingle(params: SearchParams, key: string): string | null {
  const value = params[key]
  if (!value) return null
  
  return Array.isArray(value) ? value[0] : value
}

/**
 * Parse number range from search params (format: min_max)
 * WHY: Number ranges stored as underscore-separated values
 * HOW: Extract value, split by underscore, convert to numbers
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
 * Check if number is within range
 * WHY: Filter rental cars by number ranges (year, price, mileage)
 * HOW: Compare value with min and max values
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

//////////////////////////////////
// Main Filter Function
//////////////////////////////////

/**
 * Filter rental cars based on search parameters
 * WHY: Apply URL-based filters to rental car data
 * HOW: Parse each filter type and filter cars array accordingly
 */
export function filterRentalCars(
  cars: RentalCarTableItem[],
  searchParams: SearchParams
): RentalCarTableItem[] {
  let filtered = [...cars]

  // Filter by status (multi-select)
  const statusFilter = parseList(searchParams, 'status', cars)
  if (statusFilter.length > 0) {
    filtered = filtered.filter((car) => statusFilter.includes(car.status))
  }

  // Filter by make (multi-select)
  const makeFilter = parseList(searchParams, 'make', cars)
  if (makeFilter.length > 0) {
    filtered = filtered.filter((car) => makeFilter.includes(car.make))
  }

  // Filter by location (multi-select)
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

  // Filter by year range (number range)
  const yearRange = parseNumberRange(searchParams, 'year')
  if (yearRange) {
    filtered = filtered.filter((car) =>
      isNumberInRange(car.year, yearRange.min, yearRange.max)
    )
  }

  // Filter by price per day range (number range)
  const priceRange = parseNumberRange(searchParams, 'pricePerDay')
  if (priceRange) {
    filtered = filtered.filter((car) =>
      isNumberInRange(car.pricePerDay, priceRange.min, priceRange.max)
    )
  }

  // Filter by mileage range (number range)
  const mileageRange = parseNumberRange(searchParams, 'mileage')
  if (mileageRange) {
    filtered = filtered.filter((car) =>
      isNumberInRange(car.mileage, mileageRange.min, mileageRange.max)
    )
  }

  // Filter by rental start date range
  const dateRange = parseSingle(searchParams, 'rentalStartDate') || parseSingle(searchParams, 'date')
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

  // Filter by search query
  const searchQuery = parseSingle(searchParams, 'q')
  if (searchQuery) {
    filtered = filterBySearch(
      filtered,
      searchQuery,
      rentalCarSearchConfig.searchableFields
    )
  }

  return filtered
}

/**
 * Filter rental cars by other columns (excluding a specific column)
 * WHY: Calculate initialCount for filter options
 * HOW: Apply all filters except the specified column
 */
export function filterRentalCarsExcludingColumn(
  cars: RentalCarTableItem[],
  searchParams: SearchParams,
  excludeColumn: string
): RentalCarTableItem[] {
  let filtered = [...cars]

  // Filter by status (if not excluded)
  if (excludeColumn !== 'status') {
    const statusFilter = parseList(searchParams, 'status', cars)
    if (statusFilter.length > 0) {
      filtered = filtered.filter((car) => statusFilter.includes(car.status))
    }
  }

  // Filter by make (if not excluded)
  if (excludeColumn !== 'make') {
    const makeFilter = parseList(searchParams, 'make', cars)
    if (makeFilter.length > 0) {
      filtered = filtered.filter((car) => makeFilter.includes(car.make))
    }
  }

  // Filter by location (if not excluded)
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

  // Filter by year range (if not excluded)
  if (excludeColumn !== 'year') {
    const yearRange = parseNumberRange(searchParams, 'year')
    if (yearRange) {
      filtered = filtered.filter((car) =>
        isNumberInRange(car.year, yearRange.min, yearRange.max)
      )
    }
  }

  // Filter by price per day range (if not excluded)
  if (excludeColumn !== 'pricePerDay') {
    const priceRange = parseNumberRange(searchParams, 'pricePerDay')
    if (priceRange) {
      filtered = filtered.filter((car) =>
        isNumberInRange(car.pricePerDay, priceRange.min, priceRange.max)
      )
    }
  }

  // Filter by mileage range (if not excluded)
  if (excludeColumn !== 'mileage') {
    const mileageRange = parseNumberRange(searchParams, 'mileage')
    if (mileageRange) {
      filtered = filtered.filter((car) =>
        isNumberInRange(car.mileage, mileageRange.min, mileageRange.max)
      )
    }
  }

  // Filter by date range (if not excluded)
  if (excludeColumn !== 'rentalStartDate' && excludeColumn !== 'date') {
    const dateRange = parseSingle(searchParams, 'rentalStartDate') || parseSingle(searchParams, 'date')
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

  // Filter by search query (always apply search)
  const searchQuery = parseSingle(searchParams, 'q')
  if (searchQuery) {
    filtered = filterBySearch(
      filtered,
      searchQuery,
      rentalCarSearchConfig.searchableFields
    )
  }

  return filtered
}
