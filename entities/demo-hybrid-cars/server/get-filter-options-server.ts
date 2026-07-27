/**
 * @file entities/demo-hybrid-cars/server/get-filter-options-server.ts
 * Server use-case — facet filter options with counts for the current URL.
 *
 * Purpose: Merge base filter configs with URL-driven counts (`totalCount`, `initialCount`)
 * Used in: `hydration/prefetch-rental-car-page.ts`, `app/api/demo-hybrid-page/options/route.ts`
 * Used for: Filter toolbar dropdowns that show honest facet counts per column
 *
 * Pipeline (per filter, in parallel via Promise.all):
 * 1. `filterRentalCarsExcludingColumn` — apply all URL filters except the current column.
 * 2. `getFilterOptions` — attach options with full-dataset and narrowed counts.
 *
 * Cross-request caching: not used on hybrid page v1 — TanStack owns client cache after hydration.
 */
import { getFilterOptions } from '../repository/get-filter-options'
import { rentalCarBaseFilters } from '@/views/demo-hybrid-page/config/data/rental-car-base-filters'
import { rentalCarFieldMap } from '@/views/demo-hybrid-page/config/contract/rental-car-field-map'
import { rentalCars } from '../repository/data-source'
import { filterRentalCarsExcludingColumn } from '../repository/filter-rental-cars'
import type { FilterConfig } from "@/platform/url-kit/filters/feature-filtering/components/filter-types"
import type { RentalCarTableItem } from '../model/rental-car-table-item'
import {
  DEMO_RSC_SIMULATE_FILTER_OPTIONS_MS,
  simulateServerDelay,
} from './simulate-server-delay'

/**
 * Server function to get filter options for RSC pages (rental cars)
 * WHY: Provides dynamic filter options for server components with initialCount calculation
 * HOW: Calls getFilterOptions with rental car data and config, calculates filtered data for initialCount
 * @param {FilterConfig[]} [baseConfigs] - Optional base configs (defaults to rentalCarBaseFilters)
 * @param {Record<string, string | string[] | undefined>} [searchParams] - URL search parameters for filtering
 * @returns {Promise<FilterConfig[]>} Filter configs with populated options including initialCount
 *
 * Cross-request caching: use `getFilters` in `demo-rsc-cached-loaders.ts` (demo RSC page), not a second wrapper here.
 */


export async function getFilterOptionsServer(
  baseConfigs: FilterConfig[] = rentalCarBaseFilters,
  searchParams: Record<string, string | string[] | undefined> = {}
): Promise<FilterConfig[]> {
  await simulateServerDelay(DEMO_RSC_SIMULATE_FILTER_OPTIONS_MS)

  // Calculate filtered data for each filter to get proper initialCount
  return Promise.all(
    baseConfigs.map(async (config) => {
      // Filter data excluding this column to calculate initialCount
      const filteredData = filterRentalCarsExcludingColumn(
        rentalCars,
        searchParams,
        config.key
      )
      
      // Get options for this specific filter
      const [filterWithOptions] = await getFilterOptions<RentalCarTableItem>({
        filterConfigs: [config],
        dataSource: rentalCars, // Full data for count
        fieldMap: rentalCarFieldMap as Record<string, keyof RentalCarTableItem>,
        filteredDataSource: filteredData // Filtered data for initialCount
      })
      
      return filterWithOptions

      // Example return value:
      // One element of the returned array — e.g. "status" after the server run
      // {
      //   key: "status",
      //   label: "Status",
      //   type: "multi-select",
      //   options: [
      //     { label: "Available", value: "available", count: 12, initialCount: 8 },
      //     { label: "Rented", value: "rented", count: 5, initialCount: 3 },
      //     // ...sorted by value string
      //   ],
      // }
    })
  )
}
