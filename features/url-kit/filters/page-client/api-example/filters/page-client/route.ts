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

import { NextResponse, type NextRequest } from "next/server"
import { employees } from "@/app/development/filters/page-client/feature-config/data-source"
import { filterEmployees } from "@/app/development/filters/page-server/utils/backend-simulate/filter-employees"

/**
 * GET handler for filtering employees
 * WHY: Provides API endpoint that filters employees server-side
 * HOW: Parses query params, filters employees, returns JSON response
 * @param {NextRequest} request - Next.js request object with query parameters
 * @returns {Promise<NextResponse>} JSON response with filtered employees
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters from URL
    // WHY: Extract filter values from request URL
    // HOW: Use URLSearchParams to get query string parameters
    const { searchParams } = new URL(request.url)
    
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
    const filteredEmployees = filterEmployees(employees, params)

    // Return filtered employees as JSON
    // WHY: Provide filtered data to client
    // HOW: Use NextResponse.json() to return JSON response
    return NextResponse.json(filteredEmployees, { status: 200 })
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
