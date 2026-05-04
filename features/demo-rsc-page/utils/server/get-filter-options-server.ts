/**
 * Get Filter Options Server Function
 *
 * Purpose: Server-side wrapper for getting filter options in RSC pages (rental cars)
 * Used in: RSC pages that need dynamic filter options
 * Why: Provides server function that can be called directly in RSC components
 *
 * Role
 *
 * Server entry for the demo RSC page: merges base filter configs with the current URL
 * query into full FilterConfig objects. Each option includes labels, values, totalCount,
 * and initialCount (see backend-simulate/get-filter-options.ts).
 *
 * Pipeline (per filter, in parallel via Promise.all)
 *
 * 1. filterRentalCarsExcludingColumn(rentalCars, searchParams, config.key)
 *    - Applies the same URL-driven rules as filterRentalCars, but skips the param for
 *      config.key (e.g. for "status", still applies make, location, ranges, text search,
 *      but not status).
 *    - Result is filteredDataSource used only for initialCount on that filter's options.
 *
 *    Why exclude the current column?
 *    - Faceted search: counts reflect rows that match other filters, not "if this column's
 *      selection stayed applied." The UI shows what remains possible when the user
 *      changes this filter.
 *
 *    Note: q (search) is always applied; there is no excludeColumn path for it, so search
 *    narrows counts for every filter.
 *
 * 2. getFilterOptions({ filterConfigs: [config], dataSource: rentalCars, fieldMap,
 *    filteredDataSource: filteredData })
 *    - dataSource (full rentalCars): totalCount per option = frequency in the full dataset.
 *    - filteredDataSource: initialCount = frequency among rows passing every other filter
 *      (and search).
 *    - config.key is mapped to a row field via rentalCarFieldMap; select / quick-select
 *      types get unique values plus both counts.
 *
 * Return: Same order as baseConfigs; each config gains options (with count fields).
 *
 * Defaults: Omitting args uses rentalCarBaseFilters and {} for params (no URL filters),
 * so filtered data is the full list and initialCount matches totalCount per option.
 *
 * One-line summary: For each column, facet totals from all data; "current" counts from
 * URL-filtered rows excluding that column's param, so counts stay honest when editing
 * that filter.
 */
import { getFilterOptions } from "./backend-simulate/get-filter-options"
import { 
  rentalCarBaseFilters, 
  rentalCars, 
  rentalCarFieldMap 
} from "../../config/header-filters-config"
import { filterRentalCarsExcludingColumn } from "./backend-simulate/filter-rental-cars"
import type { FilterConfig } from "../../../ui/filters/feature-filtering/components/filter-types"
import type { RentalCarTableItem } from '../../types/rental-car-table-item'

/**
 * Server function to get filter options for RSC pages (rental cars)
 * WHY: Provides dynamic filter options for server components with initialCount calculation
 * HOW: Calls getFilterOptions with rental car data and config, calculates filtered data for initialCount
 * @param {FilterConfig[]} [baseConfigs] - Optional base configs (defaults to rentalCarBaseFilters)
 * @param {Record<string, string | string[] | undefined>} [searchParams] - URL search parameters for filtering
 * @returns {Promise<FilterConfig[]>} Filter configs with populated options including initialCount
 */
export async function getFilterOptionsServer(
  baseConfigs: FilterConfig[] = rentalCarBaseFilters,
  searchParams: Record<string, string | string[] | undefined> = {}
): Promise<FilterConfig[]> {
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
