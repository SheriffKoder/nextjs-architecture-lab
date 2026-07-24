/**
 * Employee Query Handler
 * 
 * Purpose: Fetch function for employee queries with filtering
 * Used in: TanStack Query hook to fetch employee data
 * Why: Calls API endpoint that handles filtering server-side
 * 
 * Function Index:
 * - fetchEmployees: Async function that fetches filtered employees from API
 *   Example input: fetchEmployees({ status: ['active'], role: 'admin' })
 *   Example output: Promise<Employee[]> filtered array of employees from API
 * 
 * Steps:
 * 1. Accept filters parameter
 * 2. Build query string from filters
 * 3. Call API endpoint
 * 4. Parse and return filtered employees
 */

import type { Employee } from "../feature-config/data-source"
import type { EmployeeFilters } from "./key-factory"

/**
 * Fetch employees with optional filtering, sorting, and pagination from API
 * WHY: Demonstrates real API pattern where filtering, sorting, and pagination happen server-side
 * HOW: Builds query string from filters and calls API endpoint
 * @param {EmployeeFilters} filters - Optional filter parameters including pagination
 * @returns {Promise<{employees: Employee[], pagination: {totalItems: number, page: number, limit: number}}>} Filtered, sorted, and paginated employees with pagination metadata
 */
export async function fetchEmployees(
  filters?: EmployeeFilters
): Promise<{
  employees: Employee[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}> {
  // Build query string from filters
  // WHY: Convert filters object to URL query parameters
  // HOW: Use URLSearchParams to build query string
  const params = new URLSearchParams()
  
  // Add status filter if provided (comma-separated for multi-select)
  if (filters?.status && filters.status.length > 0) {
    params.append("status", filters.status.join(","))
  }
  
  // Add role filter if provided (comma-separated for multi-select)
  if (filters?.role && filters.role.length > 0) {
    params.append("role", filters.role.join(","))
  }
  
  // Add department filter if provided (comma-separated for multi-select)
  if (filters?.department && filters.department.length > 0) {
    params.append("department", filters.department.join(","))
  }

  // Add salary filter if provided (format: min_max)
  if (filters?.salary) {
    const salaryStr = filters.salary.min !== undefined && filters.salary.max !== undefined
      ? `${filters.salary.min}_${filters.salary.max}`
      : filters.salary.min !== undefined
      ? `${filters.salary.min}_`
      : `_${filters.salary.max}`
    params.append("salary", salaryStr)
  }
  
  // Add search query if provided
  if (filters?.q && filters.q.trim()) {
    params.append("q", filters.q.trim())
  }

  // Add sort if provided (format: key:direction,key:direction)
  if (filters?.sort && filters.sort.length > 0) {
    const sortString = filters.sort.map(s => `${s.key}:${s.direction}`).join(',')
    params.append("sort", sortString)
  }

  // Add pagination params if provided
  if (filters?.page) {
    params.append("page", filters.page.toString())
  }
  if (filters?.limit) {
    params.append("limit", filters.limit.toString())
  }

  // Add query filter param from URL (query builder filter AST)
  // WHY: Include query builder filter AST in API call
  // HOW: Read from current URL and append to params
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const filterParam = urlParams.get('filter')
    if (filterParam) {
      params.append("filter", filterParam)
    }
  }

  // Build API URL with query parameters
  // WHY: Call API endpoint with filter parameters
  // HOW: Construct URL with query string
  const queryString = params.toString()
  const apiUrl = `/api/filters/page-client${queryString ? `?${queryString}` : ""}`

  // Fetch filtered employees from API
  // WHY: Get filtered data from server-side API
  // HOW: Use fetch() to call API endpoint
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  // Check if response is successful
  // WHY: Handle API errors gracefully
  // HOW: Check response.ok status
  if (!response.ok) {
    throw new Error(`Failed to fetch employees: ${response.statusText}`)
  }

  // Parse and return JSON response
  // WHY: Convert API response to employees and pagination metadata
  // HOW: Call response.json() to parse JSON
  const data: {
    employees: Employee[]
    pagination: {
      totalItems: number
      page: number
      limit: number
    }
  } = await response.json()
  return data
}
