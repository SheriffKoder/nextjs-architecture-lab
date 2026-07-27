/**
 * @file entities/demo-hybrid-cars/cache/rental-car-keys.ts
 * TanStack Query key factory for the hybrid rental cars entity.
 *
 * Purpose: Stable `queryKey` tuples so list, options, detail, and infinite caches partition by URL-driven state
 * Used in: `queries/use-rental-cars.ts`, `queries/use-rental-car-filter-options.ts`, `hydration/prefetch-rental-car-page.ts`
 * Used for: Cache reads/writes and targeted invalidation in later mutation phases
 *
 * Function Index:
 * - rentalCarKeys.all — root segment for the entity
 * - rentalCarKeys.list — paginated list key from `RentalCarListQuery`
 * - rentalCarKeys.lists — prefix to invalidate every cached list
 * - rentalCarKeys.options — facet options key (same query shape as list)
 * - rentalCarKeys.optionsAll — prefix to invalidate every options query
 * - rentalCarKeys.detail — single row by id
 * - rentalCarKeys.details — prefix for all detail queries
 * - rentalCarKeys.infinite / infinites — reserved for Phase 5 infinite scroll
 */

import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'

export const rentalCarKeys = {
  /** Root key segment for all demo-hybrid-cars queries */
  all: () => ['demoHybridCars'] as const,

  /** List cache keyed by the full `RentalCarListQuery` object */
  list: (query?: RentalCarListQuery) => ['demoHybridCars', 'list', query] as const,

  /** Partial key: `invalidateQueries({ queryKey: rentalCarKeys.lists() })` */
  lists: () => ['demoHybridCars', 'list'] as const,

  /** Facet counts refetch when table-driving params change */
  options: (query?: RentalCarListQuery) =>
    ['demoHybridCars', 'options', query] as const,

  optionsAll: () => ['demoHybridCars', 'options'] as const,

  /** Single row (`GET /api/demo-hybrid-page/cars/:id`) */
  detail: (id: string) => ['demoHybridCars', 'detail', id] as const,

  details: () => ['demoHybridCars', 'detail'] as const,

  /** Phase 5 — infinite scroll list variant */
  infinite: (query?: RentalCarListQuery) =>
    ['demoHybridCars', 'infinite', query] as const,

  infinites: () => ['demoHybridCars', 'infinite'] as const,
} as const
