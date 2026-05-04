/**
 * Demo Client Page — TanStack query keys
 *
 * Purpose: Stable `queryKey` tuples for rental car list + filter-options queries
 * Used in: `use-rental-cars.ts`, `use-rental-car-filter-options.ts`, `use-create-rental-car.ts`
 * Why: Keys must mirror the object passed into `fetch` so cache partitions match URL-driven state
 *
 * Function Index:
 * - rentalCarKeys.all — base key segment
 * - rentalCarKeys.list — list query key from `RentalCarListQuery`
 * - rentalCarKeys.lists — prefix key for invalidating every cached list (use when GET is DB-backed)
 * - rentalCarKeys.options — options query key from the same query shape (facets narrow with URL)
 * - rentalCarKeys.optionsAll — prefix key for invalidating every cached options query
 */

import type { SortSpec } from '@/features/ui/filters/feature-sorting/types'

/** Inclusive numeric range for URL params encoded as `min_max` (see server `parseNumberRange`). */
export interface RentalCarNumberRange {
  min?: number
  max?: number
}

/**
 * Serializable slice of URL state sent to both `/page-client` and `/options`.
 * Align fields with `filter-rental-cars.ts` + `get-rental-cars-data` (sort, pagination, `q`).
 */
export interface RentalCarListQuery {
  status?: string[]
  make?: string[]
  location?: string[]
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

export const rentalCarKeys = {
  all: () => ['rentalCars'] as const,

  list: (query?: RentalCarListQuery) => ['rentalCars', 'list', query] as const,

  /** Partial key: `invalidateQueries({ queryKey: rentalCarKeys.lists() })` hits all `list` queries */
  lists: () => ['rentalCars', 'list'] as const,

  /** Same query object as `list` so option counts refetch when table-driving params change */
  options: (query?: RentalCarListQuery) => ['rentalCars', 'options', query] as const,

  /** Partial key: invalidate all `options` queries when facets are DB-backed */
  optionsAll: () => ['rentalCars', 'options'] as const,

  /** Single row by id (`GET …/page-client/:id`) */
  detail: (id: string) => ['rentalCars', 'detail', id] as const,

  /** Prefix: invalidate every cached detail query */
  details: () => ['rentalCars', 'detail'] as const,
} as const
