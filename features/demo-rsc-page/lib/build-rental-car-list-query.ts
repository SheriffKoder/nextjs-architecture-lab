/**
 * buildRentalCarListQuery (reserved for TanStack / API parity)
 *
 * Purpose: Single place to turn URL search params into `RentalCarListQuery` — same object the demo client page builds for TanStack + `GET …/page-client`
 * Used in: (future) `get-rental-cars-page-data.ts` or any RSC path that calls the HTTP API instead of mock `getRentalCarsData`
 * Used for: Avoiding drift between RSC and client filter encoding when you hybrid or share fetchers
 *
 * NOTE — entire implementation is commented out until this route uses the same contract as `demo-client-page` (TanStack + `/page-client`).
 * Uncomment and wire `buildRentalCarListQuery(params)` into `getRentalCarsPageData` when replacing mock server helpers with API fetchers.
 */

/*
import type { DemoRscPageSearchParams } from '@/features/demo-rsc-page/utils/ui/demo-rsc-page-url'
import type { RentalCarListQuery } from '@/features/demo-client-page/tanstack'

// Mirror `demo-client-index.tsx`: useUrlFilters + useUrlSorting + useUrlPagination → listQuery object.
// RSC cannot call hooks; replicate the same field mapping with plain reads from `params` (string | string[] | undefined).

export function buildRentalCarListQuery(params: DemoRscPageSearchParams): RentalCarListQuery {
  // Example mapping (pseudo — match hook behavior exactly before enabling):
  // const status = parseCommaList(params.status)
  // const sorts = parseSortParam(params.sort)
  // const { page, limit } = parsePageLimit(params)
  // return { status, make, location, year, pricePerDay, mileage, rentalStartDate, date, q, sort, page, limit }
  return {} as RentalCarListQuery
}
*/

// Keeps the module a valid TS module until the builder is uncommented.
export {}
