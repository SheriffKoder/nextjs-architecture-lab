/**
 * TanStack Example API Route
 * 
 * Purpose: API endpoint that filters employees using centralized filtering logic
 * Used in: TanStack Query handler to fetch filtered employee data
 * Why: Demonstrates real API pattern where filtering happens on the server
 * 
 * Function Index:
 * - GET: Handles GET requests to filter employees based on query parameters
 *   Example input: GET /api/filters/tanstack-example?status=active,pending&role=admin&salary=80000_100000
 *   Example output: JSON array of filtered employees
 * 
 * Steps:
 * 1. Parse query parameters from request URL
 * 2. Import employees data from data-source
 * 3. Use filterEmployees utility to filter data
 * 4. Return filtered results as JSON
 */

import { connection } from "next/server"
import { NextResponse, type NextRequest } from "next/server"
import { employees } from "@/platform/url-kit/filters/page-client/feature-config/data-source"
import { filterEmployees } from "@/platform/url-kit/filters/page-server/utils/backend-simulate/filter-employees"
import { parseSorts, applySorts } from "@/platform/url-kit/filters/feature-sorting/utils"
import { parsePagination } from "@/platform/url-kit/filters/feature-pagination/utils"
import { employeePaginationConfig } from "@/platform/url-kit/filters/page-client/feature-config/employee-filter-config"
import { decodeFilters } from "@/platform/url-kit/filters/feature-query-builder-filter/utils/decode-filters"

/**
 * GET handler for filtering employees
 * WHY: Provides API endpoint that filters employees server-side
 * HOW: Parses query params, filters employees, returns JSON response
 * @param {NextRequest} request - Next.js request object with query parameters
 * @returns {Promise<NextResponse>} JSON response with filtered employees
 */
export async function GET(request: NextRequest) {
  await connection()
  try {
    // Parse query parameters from URL
    // WHY: Extract filter values from request URL
    // HOW: Use URLSearchParams to get query string parameters
    const { searchParams } = new URL(request.url)
    
    //////////////////////////////////////////
    // QUERY FILTER PARSING (for debugging)
    //////////////////////////////////////////
    const filterParam = searchParams.get('filter')
    console.log('//////////////////////////////////////////')
    console.log('QUERY FILTER - Raw param:', filterParam)
    const decodedFilter = decodeFilters(filterParam)
    console.log('QUERY FILTER - Decoded JSON:')
    console.log(JSON.stringify(decodedFilter, null, 2))
    console.log('//////////////////////////////////////////')
    //////////////////////////////////////////
    
    // Convert URLSearchParams to object format expected by filterEmployees
    // WHY: filterEmployees expects { [key: string]: string | string[] | undefined }
    // HOW: Build object from searchParams entries
    const params: { [key: string]: string | string[] | undefined } = {}
    searchParams.forEach((value, key) => {
      // If key already exists, convert to array (multiple values)
      if (params[key]) {
        const existing = params[key]
        params[key] = Array.isArray(existing) 
          ? [...existing, value] 
          : [existing as string, value]
      } else {
        params[key] = value
      }
    })

    // Filter employees using centralized filtering utility
    // WHY: Server-side filtering using shared logic
    // HOW: Call filterEmployees with all employees and parsed params
    let filteredEmployees = filterEmployees(employees, params)

    // Apply sorting if sort parameter exists
    // WHY: Sort filtered results based on URL sort parameter
    // HOW: Parse sort string and apply multi-level sorting
    const sortString = params.sort as string | undefined
    if (sortString) {
      const sorts = parseSorts(sortString)
      if (sorts.length > 0) {
        filteredEmployees = applySorts(filteredEmployees, sorts)
      }
    }

    // Parse pagination from search params
    // WHY: Get page and limit from URL parameters
    // HOW: Use parsePagination utility with searchParams
    const { page, limit } = parsePagination(searchParams, employeePaginationConfig.defaultPageSize )
    
    // Calculate pagination slice
    // WHY: Return only the items for the current page
    // HOW: Calculate start and end indices, slice the array
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex)

    // Return filtered, sorted, and paginated employees with pagination metadata
    // WHY: Provide filtered, sorted, and paginated data to client with metadata
    // HOW: Use NextResponse.json() to return JSON response with employees and pagination
    return NextResponse.json({
      employees: paginatedEmployees,
      pagination: {
        totalItems: filteredEmployees.length,
        page,
        limit
      }
    }, { status: 200 })
  } catch (error) {
    // Handle errors
    // WHY: Provide error feedback if filtering fails
    // HOW: Return error response with status 500
    console.error("[TanStack Example API] Error filtering employees:", error)
    return NextResponse.json(
      { error: "Failed to filter employees" },
      { status: 500 }
    )
  }
}
