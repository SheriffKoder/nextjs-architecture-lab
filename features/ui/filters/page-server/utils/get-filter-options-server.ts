/**
 * Get Filter Options Server Function
 * 
 * Purpose: Server-side wrapper for getting filter options in RSC pages (employees)
 * Used in: RSC pages that need dynamic filter options
 * Why: Provides server function that can be called directly in RSC components
 * 
 * Function Index:
 * - getFilterOptionsServer: Server function that returns filter configs with options
 *   Example input: getFilterOptionsServer([{ key: "status", type: "multi-select", ... }])
 *   Example output: Promise<FilterConfig[]> with options populated from data
 * 
 * Steps:
 * 1. Accept base filter configs (defaults to employee configs)
 * 2. Call core getFilterOptions utility with employee data and field map
 * 3. Return populated filter configs
 */

import { getFilterOptions } from "./backend-simulate/get-filter-options"
import { 
  employeeBaseFilters, 
  employees, 
  employeeFieldMap 
} from "../feature-config-server/employee-filter-config"
import { filterEmployeesExcludingColumn } from "./backend-simulate/filter-employees"
import type { FilterConfig } from "../../feature-filtering/components/filter-types"
import type { Employee } from "../feature-config-server/data-source"

/**
 * Server function to get filter options for RSC pages (employees)
 * WHY: Provides dynamic filter options for server components with initialCount calculation
 * HOW: Calls getFilterOptions with employee data and config, calculates filtered data for initialCount
 * @param {FilterConfig[]} [baseConfigs] - Optional base configs (defaults to employeeBaseFilters)
 * @param {Record<string, string | string[] | undefined>} [searchParams] - URL search parameters for filtering
 * @returns {Promise<FilterConfig[]>} Filter configs with populated options including initialCount
 */
export async function getFilterOptionsServer(
  baseConfigs: FilterConfig[] = employeeBaseFilters,
  searchParams: Record<string, string | string[] | undefined> = {}
): Promise<FilterConfig[]> {
  // Calculate filtered data for each filter to get proper initialCount
  return Promise.all(
    baseConfigs.map(async (config) => {
      // Filter data excluding this column to calculate initialCount
      const filteredData = filterEmployeesExcludingColumn(
        employees,
        searchParams,
        config.key
      )
      
      // Get options for this specific filter
      const [filterWithOptions] = await getFilterOptions<Employee>({
        filterConfigs: [config],
        dataSource: employees, // Full data for count
        fieldMap: employeeFieldMap as Record<string, keyof Employee>,
        filteredDataSource: filteredData // Filtered data for initialCount
      })
      
      return filterWithOptions
    })
  )
}
