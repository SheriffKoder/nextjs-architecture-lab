/**
 * getRentalCarsPageData
 *
 * Purpose: Single server entry that loads list + filter options in parallel for the demo RSC page
 * Used in: `components/demo-rsc-data-shell.tsx`
 * Used for: One `await` per navigation — same data the UI needs for filters, table, and pagination (payload shape aligned with client list + options for future hybrid)
 *
 * Steps:
 * 1. `Promise.all` — cars slice + filter facets (same pairing as demo client page)
 * 2. Return `{ carsPayload, filters }` for a parent RSC to pass down without duplicate fetches
 */

import type { FilterConfig } from '@/features/ui/filters/feature-filtering/components/filter-types'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import type { DemoRscPageSearchParams } from '../ui/demo-rsc-page-url'
import { rentalCarBaseFilters } from '../../config/header-filters-config'
import { getRentalCarsData } from './get-rental-cars-data'
import { getFilterOptionsServer } from './get-filter-options-server'

/////////////////////////////////////////////////////////////
// Types — mirror client `carsPayload` + options list
/////////////////////////////////////////////////////////////

export interface RentalCarsPagePayload {
  cars: RentalCarTableItem[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}

export interface RentalCarsPageData {
  carsPayload: RentalCarsPagePayload
  filters: FilterConfig[]
}

/////////////////////////////////////////////////////////////
// Loader
/////////////////////////////////////////////////////////////

//////////////////////////////////
// getRentalCarsPageData — parallel cars + filter options for one URL snapshot
// Used in: `demo-rsc-data-shell.tsx`
// Used for: Single fetch parent per Suspense subtree
//////////////////////////////////
export async function getRentalCarsPageData(
  params: DemoRscPageSearchParams
): Promise<RentalCarsPageData> {
  const [carsResult, filters] = await Promise.all([
    getRentalCarsData(params),
    getFilterOptionsServer(rentalCarBaseFilters, params),
  ])

  return {
    carsPayload: {
      cars: carsResult.cars,
      pagination: carsResult.pagination,
    },
    filters,
  }
}
//////////////////////////////////
