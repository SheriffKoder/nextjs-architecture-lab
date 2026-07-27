/**
 * @file entities/demo-hybrid-cars/transform/parse-list-query-from-search-params.ts
 * Shared list-query parser for RSC prefetch and client shallow URL state.
 *
 * Purpose: One parse path for `searchParams` / `URLSearchParams` / query strings → `RentalCarListQuery`
 * Used in: `app/(root)/demo-hybrid-page/page.tsx`, `views/demo-hybrid-page/hooks/use-list-query-from-url.ts`
 * Used for: Cold-load hydration keys must match client mount keys (no double-fetch mismatch)
 *
 * Function Index:
 * - parseListQueryFromSearchParams — normalize input then `buildRentalCarListQuery`
 * - urlSearchParamsToPageRecord — `URLSearchParams` → Next-style flat record
 *
 * Steps (parseListQueryFromSearchParams):
 * 1. Accept string | URLSearchParams | flat record.
 * 2. Normalize to PageSearchParams.
 * 3. Delegate to `buildRentalCarListQuery` (single encode/decode source of truth).
 */

import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import { buildRentalCarListQuery } from '@/entities/demo-hybrid-cars/transform/build-rental-car-list-query'

type PageSearchParams = Record<string, string | string[] | undefined>

/**
 * Convert `URLSearchParams` into the flat record shape Next `searchParams` uses.
 *
 * @param sp - Browser or request search params
 * @returns Flat key → string | string[] bag
 */
export function urlSearchParamsToPageRecord(
  sp: URLSearchParams
): PageSearchParams {
  const out: PageSearchParams = {}
  sp.forEach((value, key) => {
    const existing = out[key]
    if (existing === undefined) {
      out[key] = value
      return
    }
    if (Array.isArray(existing)) {
      existing.push(value)
      return
    }
    out[key] = [existing, value]
  })
  return out
}

/**
 * Parse list/filter/pagination state from any common URL param shape.
 *
 * RSC route and `useListQueryFromUrl` must call this (or the same underlying
 * `buildRentalCarListQuery`) so dehydrated TanStack keys match client state.
 *
 * @param input - Query string, `URLSearchParams`, or Next flat `searchParams`
 * @returns Typed `RentalCarListQuery` for cache keys and API fetches
 */
export function parseListQueryFromSearchParams(
  input: string | URLSearchParams | PageSearchParams
): RentalCarListQuery {
  // Step 1–2: normalize to flat record
  if (typeof input === 'string') {
    const trimmed = input.startsWith('?') ? input.slice(1) : input
    return buildRentalCarListQuery(
      urlSearchParamsToPageRecord(new URLSearchParams(trimmed))
    )
  }
  if (input instanceof URLSearchParams) {
    return buildRentalCarListQuery(urlSearchParamsToPageRecord(input))
  }
  // Step 3: already a PageSearchParams bag
  return buildRentalCarListQuery(input)
}
