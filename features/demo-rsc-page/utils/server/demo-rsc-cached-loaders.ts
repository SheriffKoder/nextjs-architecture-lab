/**
 * Demo RSC cached loaders (server)
 *
 * Purpose: Cross-request cached server entry points for filter facets, paginated list, and single-car-by-id.
 * Used in: `filters-section.tsx`, `table-and-pagination-section.tsx`; `get-rental-car-by-id-action.ts` (by-id).
 * Used for: `unstable_cache` around list/facet/detail helpers with separate `revalidate` windows; list callers pass `demoRscDataParamsToCacheKey(params)` so drawer/view URL keys do not split the list/facet cache.
 *
 * Function index:
 * - `RentalCarsPagePayload` — type alias for `getRentalCarsData` return shape (table + pagination).
 * - `getFilters` — cached facet loader (`revalidate: 3600`).
 * - `getCars` — cached list loader (`revalidate: 60`).
 * - `getRentalCarByIdCached` — cached single-row loader by stable `id` (`revalidate: 60`; still composes with `cache()` in `get-rental-car-by-id.ts` per request).
 *
 * Steps (overall flow from a section RSC):
 * 1. Section computes `dataParamsKey` via `demoRscDataParamsToCacheKey` (data-only search params).
 * 2. Section awaits `getFilters(dataParamsKey)` and/or `getCars(dataParamsKey)`.
 * 3. Cached wrapper parses the key back to a param bag and runs the underlying server helpers.
 *
 * Steps (by-id flow via server action / RSC):
 * 1. Caller passes trimmed `id` string.
 * 2. `getRentalCarByIdCached(id)` hits `unstable_cache` keyed by `id`, then `getRentalCarById` (mock lookup + optional delay).
 */

/////////////////////////////////////////////////////////////
// Imports
/////////////////////////////////////////////////////////////

import { unstable_cache } from 'next/cache'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import { rentalCarBaseFilters } from '../../config/header-filters-config'
import { buildRentalCarListQuery } from '../../lib/build-rental-car-list-query'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import type { FilterConfig } from '@/features/ui/filters/feature-filtering/components/filter-types'
import { getFilterOptionsServer } from './get-filter-options-server'
import { getRentalCarById } from './get-rental-car-by-id'
import { getRentalCarsData } from './get-rental-cars-data'

/////////////////////////////////////////////////////////////
// Types
/////////////////////////////////////////////////////////////

/**
 * Payload shape for table + pagination (same as `getRentalCarsData`).
 * Used in: `table-and-pagination-section.tsx` for typing / consumers of `getCars`.
 * Used for: Keeps list result type colocated with the loader that produces it.
 */
export type RentalCarsPagePayload = Awaited<ReturnType<typeof getRentalCarsData>>

/////////////////////////////////////////////////////////////
// Cached loaders: filter facets + car list
/////////////////////////////////////////////////////////////

//////////////////////////////////
// getFilters — cross-request cache for filter option configs (facets + NL catalog inputs).
// Used in: `filters-section.tsx`, `table-and-pagination-section.tsx` (with `getCars`).
// Used for: Avoid recomputing facet options on every navigation when data URL slice unchanged.
// Steps (inside cached callback):
// 1. Parse `dataParamsKey` back to the data-only search-param record.
// 2. Merge base filter configs with URL via `getFilterOptionsServer`.
//////////////////////////////////
export const getFilters = unstable_cache(
  async (dataParamsKey: string): Promise<FilterConfig[]> => {
    // 1. Deserialize stable cache key → same shape `getFilterOptionsServer` expects for URL-driven counts
    const params = JSON.parse(dataParamsKey) as DemoRscPageSearchParams

    // 2. Run facet pipeline (per-column counts, options, etc.)
    return getFilterOptionsServer(rentalCarBaseFilters, params)
  },
  ['demo-rsc-filters'],
  { revalidate: 3600 }
)

//////////////////////////////////
// getCars — cross-request cache for filtered, sorted, paginated list payload.
// Used in: `table-and-pagination-section.tsx`.
// Used for: List work is the heavier path; shorter `revalidate` than facets keeps table fresher if needed.
// Steps (inside cached callback):
// 1. Parse `dataParamsKey` to data-only params (must match keys used in `buildRentalCarListQuery`).
// 2. Build `RentalCarListQuery` from URL-shaped record.
// 3. Delegate to `getRentalCarsData` (filter → sort → paginate + simulated delay in that module).
//////////////////////////////////
export const getCars = unstable_cache(
  async (dataParamsKey: string): Promise<RentalCarsPagePayload> => {
    // 1. Deserialize cache key so list logic never sees drawer/mode/id chrome
    const params = JSON.parse(dataParamsKey) as DemoRscPageSearchParams

    // 2. Same URL → query mapping as client parity (`buildRentalCarListQuery`)
    const query = buildRentalCarListQuery(params)

    // 3. Produce `{ cars, pagination }` for `DemoRscContent` + footer
    return getRentalCarsData(query)
  },
  ['demo-rsc-cars'],
  { revalidate: 60 }
)

/////////////////////////////////////////////////////////////
// Cached loader: single rental car by id (drawer detail, prefetch)
/////////////////////////////////////////////////////////////

//////////////////////////////////
// getRentalCarByIdCached — cross-request cache for one mock row by stable `id`.
// Used in: `actions/get-rental-car-by-id-action.ts` (drawer view + client prefetch).
// Used for: Same id requested repeatedly (hover + open) shares work across requests within `revalidate`.
// Steps (inside cached callback):
// 1. Delegate to `getRentalCarById` (React `cache()` + mock `rentalCars` + simulated delay live there).
//////////////////////////////////
export const getRentalCarByIdCached = unstable_cache(
  async (id: string): Promise<RentalCarTableItem | null> => {
    // 1. Underlying loader keeps per-request dedupe and delay semantics unchanged
    return getRentalCarById(id)
  },
  ['demo-rsc-rental-car-by-id'],
  { revalidate: 60 }
)
