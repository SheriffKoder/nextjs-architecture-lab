/**
 * Get Filter Options Server (simulation)
 *
 * Name: get-filter-options-server
 * Purpose: Produce `FilterConfig[]` with `options` and facet counts for the filters UI
 * Used in: `app/api/demo-client-page/options/route.ts`
 * Used for: FiltersHeader / dropdowns need `options` with `count` and `initialCount` per facet value
 *
 * Function Index:
 * - getFilterOptionsServer: For each base filter, exclude that column’s param from filtering, then build options
 *
 * Steps (per filter config, parallel):
 * 1. Build a row set that applies every URL filter except the current filter key (facet “other filters” context).
 * 2. Call getFilterOptions with full data + that filtered set so each option gets totalCount vs initialCount.
 * 3. Return configs in the same order as `baseConfigs`.
 */

import type { FilterConfig } from '../../../url-kit/filters/feature-filtering/components/filter-types'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import {
  rentalCarBaseFilters,
  rentalCars,
  rentalCarFieldMap,
} from '../../config/header-filters-config'
import { getFilterOptions } from './backend-simulate/get-filter-options'
import { filterRentalCarsExcludingColumn } from './backend-simulate/filter-rental-cars'

/**
 * Enrich filter configs with dynamic options and counts for the current URL state.
 *
 * @param baseConfigs - Defaults to rental car base filters from header config
 * @param searchParams - Current query string as a plain object (same keys as the list API)
 * @returns Full `FilterConfig` array with `options` where applicable
 */
export async function getFilterOptionsServer(
  baseConfigs: FilterConfig[] = rentalCarBaseFilters,
  searchParams: Record<string, string | string[] | undefined> = {}
): Promise<FilterConfig[]> {
  // WHY: Each facet computation is independent — parallel keeps options API responsive on many filters.
  return Promise.all(
    baseConfigs.map(async (config) => {
      //////////////////////////////////////////////////////////////
      // Step 1: Rows that match “every other filter” (exclude this filter’s own URL key)
      //////////////////////////////////////////////////////////////
      const filteredData = filterRentalCarsExcludingColumn(
        rentalCars,
        searchParams,
        config.key
      )

      //////////////////////////////////////////////////////////////
      // Step 2: Attach unique values + totalCount (full data) + initialCount (filtered data)
      //////////////////////////////////////////////////////////////
      const [filterWithOptions] = await getFilterOptions<RentalCarTableItem>({
        filterConfigs: [config],
        dataSource: rentalCars,
        fieldMap: rentalCarFieldMap as Record<string, keyof RentalCarTableItem>,
        filteredDataSource: filteredData,
      })

      //////////////////////////////////////////////////////////////
      // Step 3: Return this config (one entry per baseConfigs item)
      //////////////////////////////////////////////////////////////
      return filterWithOptions
    })
  )
}
