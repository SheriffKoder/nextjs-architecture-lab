/**
 * Rental car list query types (RSC feature)
 *
 * Purpose: Serializable URL/list state for the demo RSC page — same field contract as the TanStack client
 * Used in: `build-rental-car-list-query.ts`, `demo-rsc-cached-loaders.ts` (`getCars`), table/pagination sections
 *
 * Keep in sync with `features/demo-client-page/tanstack/key-factory.ts` (`RentalCarListQuery`, `RentalCarNumberRange`) and `filter-rental-cars.ts` discrete keys.
 */

import type { SortSpec } from '@/features/ui/filters/feature-sorting/types'

/** Inclusive numeric range for URL params encoded as `min_max` (see server `parseNumberRange`). */
export interface RentalCarNumberRange {
  min?: number
  max?: number
}

/**
 * Serializable slice of URL state for list + pagination on this route.
 * Align fields with `filter-rental-cars.ts` + `get-rental-cars-data` (sort, pagination, `q`).
 */
export interface RentalCarListQuery {
  status?: string[]
  make?: string[]
  location?: string[]
  model?: string[]
  licensePlate?: string[]
  year?: RentalCarNumberRange
  pricePerDay?: RentalCarNumberRange
  mileage?: RentalCarNumberRange
  /** `start_end` ISO pair; server also accepts legacy `date` — use {@link date} if your URL uses that key */
  rentalStartDate?: string
  date?: string
  q?: string
  sort?: SortSpec[]
  page?: number
  limit?: number
}
