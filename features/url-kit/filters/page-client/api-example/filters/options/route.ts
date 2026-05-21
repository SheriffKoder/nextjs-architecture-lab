/**
 * Filter Options API Route
 * 
 * Purpose: API endpoint that provides dynamic filter options for client pages
 * Used in: TanStack Query pages that need filter options
 * Why: Provides server-side extraction of unique values for filter options
 * 
 * Function Index:
 * - GET: Handles GET requests to return filter configs with populated options
 *   Example input: GET /api/filters/options
 *   Example output: JSON array of FilterConfig with options populated from data
 * 
 * Steps:
 * 1. Define base filter configs (without options)
 * 2. Call getFilterOptions utility
 * 3. Return populated filter configs as JSON
 */

import { NextResponse } from "next/server"
import { getFilterOptions } from "@/app/development/filters/page-client/utils/api/get-filter-options"
import { 
  employeeBaseFilters, 
  employees, 
  employeeFieldMap 
} from "@/app/development/filters/page-client/feature-config/employee-filter-config"
import { filterEmployeesExcludingColumn } from "@/app/development/filters/page-server/utils/backend-simulate/filter-employees"

/**
 * GET handler for filter options
 * WHY: Provides dynamic filter options for client pages with initialCount
 * HOW: Extracts unique values from data and returns filter configs with options
 * @param {Request} request - Request object with query parameters
 * @returns {Promise<NextResponse>} JSON response with filter configs
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters for other column filters
    const { searchParams } = new URL(request.url)
    
    // Convert searchParams to object for filterEmployeesExcludingColumn
    const paramsObject: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      paramsObject[key] = value
    })
    
    // For each filter config, calculate filtered data excluding that column
    const filtersWithOptions = await Promise.all(
      employeeBaseFilters.map(async (config) => {
        // Filter data excluding this column to calculate initialCount
        const filteredData = filterEmployeesExcludingColumn(
          employees,
          paramsObject,
          config.key
        )
        
        // Get options for this specific filter
        const [filterWithOptions] = await getFilterOptions({
          filterConfigs: [config],
          dataSource: employees, // Full data for count
          fieldMap: employeeFieldMap,
          filteredDataSource: filteredData // Filtered data for initialCount
        })
        
        return filterWithOptions
      })
    )
    
    // Return filter configs with populated options
    // WHY: Provide complete filter configuration to client
    // HOW: Use NextResponse.json() to return JSON
    return NextResponse.json(filtersWithOptions, { status: 200 })
  } catch (error) {
    // Handle errors
    // WHY: Provide error feedback if option extraction fails
    // HOW: Return error response with status 500
    console.error("[Filter Options API] Error:", error)
    return NextResponse.json(
      { error: "Failed to get filter options" },
      { status: 500 }
    )
  }
}
