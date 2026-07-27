/**
 * @file entities/demo-hybrid-cars/client/build-rental-car-api-url.ts
 * Builds browser fetch URLs for hybrid demo API routes from `RentalCarListQuery`.
 *
 * Purpose: Encode list/filter state into query strings consumed by Route Handlers
 * Used in: `client/fetch-rental-cars.ts`, `client/fetch-filter-options.ts`
 * Used for: TanStack `queryFn` transport — keeps hooks thin and aligned with server param encoding
 *
 * Function Index:
 * - buildRentalCarApiUrl — `RentalCarListQuery` → absolute API path with search string
 *
 * Steps (buildRentalCarApiUrl):
 * 1. Flatten query via `rentalCarListQueryToSearchParams` (transform layer).
 * 2. Convert flat record to `URLSearchParams`.
 * 3. Forward query-builder `filter` AST from the current window URL when present.
 * 4. Append query string to the base path.
 */

import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import { rentalCarListQueryToSearchParams } from '@/entities/demo-hybrid-cars/transform/build-rental-car-list-query'

type PageSearchParams = Record<string, string | string[] | undefined>

/** Converts Next-style search param record into `URLSearchParams`. */
function pageSearchParamsToURLSearchParams(params: PageSearchParams): URLSearchParams {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    // WHY: duplicate keys become repeated entries (parity with Next `searchParams` merge)
    if (Array.isArray(value)) {
      for (const item of value) {
        sp.append(key, item)
      }
    } else {
      sp.set(key, value)
    }
  }
  return sp
}

/** Forwards query-builder `filter` from the page URL when the client issues a fetch. */
function appendFilterAstFromWindow(params: URLSearchParams) {
  if (typeof window === 'undefined') return
  const filterParam = new URLSearchParams(window.location.search).get('filter')
  if (filterParam) {
    params.append('filter', filterParam)
  }
}

/**
 * Build a fully qualified API URL for list or options routes.
 *
 * @param path - Route path (e.g. `/api/demo-hybrid-page/cars`)
 * @param query - Optional list/filter state; defaults to empty query
 * @returns Path with encoded query string when params exist
 */
export function buildRentalCarApiUrl(
  path: string,
  query?: RentalCarListQuery
): string {
  // Step 1: typed query → flat URL param bag (same encoding as RSC + API)
  const flat = rentalCarListQueryToSearchParams(query ?? {})
  // Step 2: flat bag → URLSearchParams for fetch
  const params = pageSearchParamsToURLSearchParams(flat)
  // Step 3: include advanced filter AST when present on the page URL
  appendFilterAstFromWindow(params)
  // Step 4: assemble final URL
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}
