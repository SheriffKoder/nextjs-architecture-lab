/**
 * Mock Data Server Function
 * 
 * Purpose: Provides mock employee data for development and testing
 * Used in: RSC pages that need to display employee data
 * Why: Provides sample data without requiring database or API setup
 * 
 * Function Index:
 * - getMockEmployees: Server function that returns filtered array of mock employees
 *   Example input: getMockEmployees({ status: "active,pending", role: "admin", salary: "80000_100000" })
 *   Example output: Filtered array of employee objects based on search parameters
 * 
 * Steps:
 * 1. Import Employee type and data from data-source
 * 2. Import filter utility function
 * 3. Export function that filters and returns mock data based on params
 */

import { employees, type Employee } from "../../page-client/feature-config/data-source"
import { filterEmployees } from "./backend-simulate/filter-employees"
import { parseSorts, applySorts } from "../../feature-sorting/utils"
import { parsePagination } from "../../feature-pagination/utils"
import { employeePaginationConfig } from "../feature-config-server/employee-filter-config"
import { decodeFilters } from "../../feature-query-builder-filter/utils/decode-filters"


/**
 * Get mock employees data with optional filtering, sorting, and pagination
 * WHY: Provides mock data for development with URL parameter filtering, sorting, and pagination
 * HOW: Processes searchParams through multiple steps: filter → sort → paginate
 * @param {Object} searchParams - URL search parameters for filtering, sorting, and pagination
 * @param {Object} searchParams.status - Comma-separated status values (optional)
 * @param {Object} searchParams.role - Single role value (optional)
 * @param {Object} searchParams.salary - Number range in format "min_max" (optional)
 * @param {Object} searchParams.sort - Sort string in format "key:direction,key:direction" (optional)
 * @param {Object} searchParams.page - Page number (optional, defaults to 1)
 * @param {Object} searchParams.limit - Items per page (optional, defaults to config default)
 * @returns {Promise<{employees: Employee[], pagination: {totalItems: number, page: number, limit: number}}>} Filtered, sorted, and paginated employees with pagination metadata
 */
export async function getPageData(
  searchParams: { [key: string]: string | string[] | undefined } = {}
): Promise<{
  employees: Employee[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}> {
  //////////////////////////////////////////
  // QUERY FILTER PARSING (for debugging)
  //////////////////////////////////////////
  const filterParam = typeof searchParams.filter === 'string' ? searchParams.filter : null
  const decodedFilter = decodeFilters(filterParam)
  console.log('//////////////////////////////////////////')
  console.log('QUERY FILTER - Decoded JSON:')
  console.log(JSON.stringify(decodedFilter, null, 2))
  console.log('//////////////////////////////////////////')
  //////////////////////////////////////////

  //////////////////////////////////
  // STEP 1: Filter employees based on URL parameters
  //////////////////////////////////
  // WHAT: Apply filters from searchParams to the full employee dataset
  // WHY: Users can filter by status, role, department, salary, date, search query, etc.
  // HOW: Pass all employees and searchParams to filterEmployees utility
  // INPUT: All employees + searchParams (e.g., { status: "active,pending", role: "admin" })
  // OUTPUT: Filtered array of employees matching the filter criteria
  const filtered = filterEmployees(employees, searchParams)
  
  //////////////////////////////////
  // STEP 2: Apply sorting to filtered results
  //////////////////////////////////
  // WHAT: Sort the filtered employees based on sort parameter from URL
  // WHY: Users can sort by multiple fields (e.g., status asc, department desc)
  // HOW: Parse sort string, then apply multi-level sorting
  // INPUT: Filtered employees + sort string (e.g., "status:asc,department:desc")
  // OUTPUT: Filtered and sorted array of employees
  
  // Extract sort string from searchParams
  // WHY: Sort parameter might be string or undefined
  // HOW: Check if sort exists and is a string, otherwise use empty string
  const sortString = typeof searchParams.sort === 'string' ? searchParams.sort : ''
  
  // Parse sort string into array of sort specifications
  // WHY: Convert URL format ("status:asc,department:desc") to usable data structure
  // HOW: Use parseSorts utility to split and parse the sort string
  const sorts = parseSorts(sortString)
  
  // Apply sorting if any sorts exist
  // WHY: Only sort if user has specified sort parameters
  // HOW: If sorts array has items, apply them using applySorts utility
  const filteredAndSorted = sorts.length > 0 ? applySorts(filtered, sorts) : filtered
  
  //////////////////////////////////
  // STEP 3: Parse pagination parameters from URL
  //////////////////////////////////
  // WHAT: Extract page number and items per page from searchParams
  // WHY: Users can navigate between pages and change page size
  // HOW: Convert searchParams to URLSearchParams format, then parse pagination
  // INPUT: searchParams object (e.g., { page: "2", limit: "20" })
  // OUTPUT: { page: 2, limit: 20 } with defaults applied
  
  // Convert searchParams to URLSearchParams format
  // WHY: parsePagination utility expects URLSearchParams format
  // HOW: Filter out undefined values, handle arrays (take first value), convert to string
  const params = new URLSearchParams(
    Object.entries(searchParams)
      .filter(([_, v]) => v !== undefined) // Remove undefined values
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] : v as string]) // Handle arrays and convert to string
  )
  
  // Parse pagination from URLSearchParams
  // WHY: Get current page number and items per page with defaults
  // HOW: Use parsePagination utility with default page size from config
  // RESULT: { page: number, limit: number } (defaults: page=1, limit=config.defaultPageSize)
  const { page, limit } = parsePagination(params, employeePaginationConfig.defaultPageSize || 20)
  
  //////////////////////////////////
  // STEP 4: Apply pagination slice to sorted results
  //////////////////////////////////
  // WHAT: Extract only the items for the current page from the sorted array
  // WHY: Return only the data needed for the current page view
  // HOW: Calculate start and end indices, then slice the array
  // INPUT: filteredAndSorted array + page number + limit
  // OUTPUT: Array slice containing only current page items
  
  // Calculate start index (0-based) for current page
  // WHY: Array.slice() uses 0-based indexing
  // HOW: (page - 1) * limit (e.g., page 2 with limit 20 = index 20)
  const startIndex = (page - 1) * limit
  
  // Calculate end index (exclusive) for current page
  // WHY: Array.slice(start, end) is exclusive of end
  // HOW: startIndex + limit (e.g., page 2 with limit 20 = index 40, so items 20-39)
  const endIndex = startIndex + limit
  
  // Slice the array to get only current page items
  // WHY: Return only the subset of data needed for this page
  // HOW: Use Array.slice() with calculated indices
  const paginatedEmployees = filteredAndSorted.slice(startIndex, endIndex)
  
  //////////////////////////////////
  // STEP 5: Return results with pagination metadata
  //////////////////////////////////
  // WHAT: Return paginated employees and pagination information
  // WHY: Client needs both the data and metadata (totalItems, current page, limit)
  // HOW: Return object with employees array and pagination object
  // OUTPUT: { employees: Employee[], pagination: { totalItems, page, limit } }
  
  return {
    // Paginated employees (only current page items)
    employees: paginatedEmployees,
    
    // Pagination metadata for UI (totalItems needed to calculate totalPages, etc.)
    pagination: {
      totalItems: filteredAndSorted.length, // Total after filtering/sorting (before pagination)
      page, // Current page number
      limit // Items per page
    }
  }
}
