/**
 * @file entities/demo-hybrid-cars/model/rental-car-list-query.ts
 * Serializable URL/list state types for the hybrid rental cars entity.
 *
 * Purpose: Typed contract for filters, sort, pagination, and show-all across RSC, API, and TanStack
 * Used in: `transform/build-rental-car-list-query.ts`, `cache/rental-car-keys.ts`, server loaders
 * Used for: Cache key partitioning and shared list contract between server + client
 *
 * Keep field names aligned with `repository/filter-rental-cars.ts` discrete URL keys.
 */

import type { SortSpec } from '@/platform/url-kit/filters/feature-sorting/types'

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
  /** When true, return the full filtered+sorted list; `page` / `limit` are ignored. */
  showAll?: boolean
  page?: number
  limit?: number
}
