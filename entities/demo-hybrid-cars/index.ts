/**
 * @file entities/demo-hybrid-cars/index.ts
 * Public entrypoint for the hybrid rental cars entity — hooks, keys, hydration, types.
 *
 * Purpose: Single import surface for views and app route shells
 * Used in: `views/demo-hybrid-page`, `app/(root)/demo-hybrid-page/page.tsx`
 * Used for: Avoid deep imports into entity layer folders
 */

export { rentalCarKeys } from './cache/rental-car-keys'
export * from './client'
export * from './queries'
export * from './hydration'
export { QueryProvider } from './providers'
export { buildRentalCarListQuery } from './transform/build-rental-car-list-query'
export { parseListQueryFromSearchParams } from './transform/parse-list-query-from-search-params'
export type { RentalCarListQuery } from './model/rental-car-list-query'
export type { RentalCarTableItem } from './model/rental-car-table-item'
