/**
 * Filter Employees Utility
 * 
 * Purpose: Filters employee data based on URL search parameters
 * Used in: Server functions that need to filter employees based on URL params
 * Why: Centralizes filtering logic and ensures consistent filtering behavior
 * 
 * Function Index:
 * - filterEmployees: Filters employees array based on search parameters
 *   Example input: filterEmployees(employees, { status: "active,pending", role: "admin", salary: "80000_100000" })
 *   Example output: Filtered array of employees matching the criteria
 * 
 * Steps:
 * 1. Parse multi-select filters (comma-separated)
 * 2. Parse single-select filters
 * 3. Parse number-range filters (underscore-separated) for salary
 * 4. Apply filters to employees array
 * 5. Return filtered results
 */

import type { Employee } from "../../../page-client/feature-config/data-source"
import { filterBySearch } from "./filter-by-search"
import { employeeSearchConfig } from "../../../page-client/feature-config/employee-filter-config"

//////////////////////////////////
// Type Definitions
//////////////////////////////////

/**
 * Search parameters type
 * WHY: Type-safe search parameters object
 * HOW: Defines structure of URL search parameters
 */
type SearchParams = {
  [key: string]: string | string[] | undefined
}

//////////////////////////////////
// Helper Functions
//////////////////////////////////

/**
 * Parse comma-separated list from search params
 * WHY: Multi-select filters use comma-separated values
 * HOW: Extract value, split by comma, filter out empty strings
 * @param {SearchParams} params - Search parameters object
 * @param {string} key - Parameter key to extract
 * @returns {string[]} Array of values, empty array if not found
 */
function parseList(params: SearchParams, key: string): string[] {
  const value = params[key]
  if (!value) return []
  
  // Handle both string and string[] types
  const stringValue = Array.isArray(value) ? value[0] : value
  if (!stringValue) return []
  
  // Split by comma and filter out empty strings
  return stringValue.split(',').filter((v) => v.trim() !== '')
}

/**
 * Parse single value from search params
 * WHY: Single-select filters use a single value
 * HOW: Extract value and return as string or null
 * @param {SearchParams} params - Search parameters object
 * @param {string} key - Parameter key to extract
 * @returns {string | null} Value or null if not found
 */
function parseSingle(params: SearchParams, key: string): string | null {
  const value = params[key]
  if (!value) return null
  
  // Handle both string and string[] types
  return Array.isArray(value) ? value[0] : value
}

/**
 * Parse number range from search params (format: min_max)
 * WHY: Number ranges stored as underscore-separated values
 * HOW: Extract value, split by underscore, convert to numbers
 * @param {SearchParams} params - Search parameters object
 * @param {string} key - Parameter key to extract
 * @returns {{ min: number | undefined, max: number | undefined } | null} Number range or null if not found
 */
function parseNumberRange(
  params: SearchParams,
  key: string
): { min: number | undefined; max: number | undefined } | null {
  const value = parseSingle(params, key)
  if (!value) return null
  
  // Split underscore-separated range
  const [minStr, maxStr] = value.split('_')
  
  return {
    min: minStr ? Number(minStr) : undefined,
    max: maxStr ? Number(maxStr) : undefined,
  }
}

/**
 * Check if number is within range
 * WHY: Filter employees by salary range
 * HOW: Compare employee salary with min and max values
 * @param {number} salary - Employee salary
 * @param {number | undefined} min - Minimum value (optional)
 * @param {number | undefined} max - Maximum value (optional)
 * @returns {boolean} True if salary is within range
 */
function isNumberInRange(
  salary: number,
  min: number | undefined,
  max: number | undefined
): boolean {
  // If min is defined, salary must be >= min
  if (min !== undefined && salary < min) return false
  
  // If max is defined, salary must be <= max
  if (max !== undefined && salary > max) return false
  
  return true
}

//////////////////////////////////
// Main Filter Function
//////////////////////////////////

/**
 * Filter employees based on search parameters
 * WHY: Apply URL-based filters to employee data
 * HOW: Parse each filter type and filter employees array accordingly
 * @param {Employee[]} employees - Array of employees to filter
 * @param {SearchParams} searchParams - URL search parameters
 * @returns {Employee[]} Filtered array of employees
 */
export function filterEmployees(employees: Employee[], searchParams: SearchParams): Employee[] {
  // Start with all employees
  // WHY: Apply filters incrementally
  // HOW: Use filter() method to reduce array based on conditions
  let filtered = [...employees]

  // Filter by status (multi-select)
  // WHY: Allow filtering by multiple statuses
  // HOW: Check if employee status is in the selected statuses list
  const statusFilter = parseList(searchParams, 'status')
  if (statusFilter.length > 0) {
    filtered = filtered.filter((employee) => statusFilter.includes(employee.status))
  }

  // Filter by role (multi-select)
  // WHY: Allow filtering by multiple roles
  // HOW: Check if employee role is in the selected roles list
  const roleFilter = parseList(searchParams, 'role')
  if (roleFilter.length > 0) {
    filtered = filtered.filter((employee) => roleFilter.includes(employee.role))
  }

  // Filter by department (multi-select)
  // WHY: Allow filtering by multiple departments
  // HOW: Check if employee department is in the selected departments list
  const departmentFilter = parseList(searchParams, 'department')
  if (departmentFilter.length > 0) {
    filtered = filtered.filter((employee) => departmentFilter.includes(employee.department))
  }

  // Filter by salary range (number range)
  // WHY: Allow filtering by salary range
  // HOW: Check if employee salary is within the specified range
  const salaryRange = parseNumberRange(searchParams, 'salary')
  if (salaryRange) {
    filtered = filtered.filter((employee) =>
      isNumberInRange(employee.salary, salaryRange.min, salaryRange.max)
    )
  }

  // Filter by search query
  // WHY: Allow searching across multiple fields (name, email, department)
  // HOW: Use generic search filter function with searchable fields
  const searchQuery = parseSingle(searchParams, 'q')
  if (searchQuery) {
    filtered = filterBySearch(
      filtered,
      searchQuery,
      employeeSearchConfig.searchableFields
    )
  }

  return filtered
}

/**
 * Filter employees by other columns (excluding a specific column)
 * WHY: Calculate initialCount for filter options
 * HOW: Apply all filters except the specified column
 * @param {Employee[]} employees - Array of employees to filter
 * @param {SearchParams} searchParams - URL search parameters
 * @param {string} excludeColumn - Column key to exclude from filtering
 * @returns {Employee[]} Filtered array of employees
 */
export function filterEmployeesExcludingColumn(
  employees: Employee[],
  searchParams: SearchParams,
  excludeColumn: string
): Employee[] {
  let filtered = [...employees]

  // Filter by status (if not excluded)
  if (excludeColumn !== 'status') {
    const statusFilter = parseList(searchParams, 'status')
    if (statusFilter.length > 0) {
      filtered = filtered.filter((employee) => statusFilter.includes(employee.status))
    }
  }

  // Filter by role (if not excluded)
  if (excludeColumn !== 'role') {
    const roleFilter = parseList(searchParams, 'role')
    if (roleFilter.length > 0) {
      filtered = filtered.filter((employee) => roleFilter.includes(employee.role))
    }
  }

  // Filter by department (if not excluded)
  if (excludeColumn !== 'department') {
    const departmentFilter = parseList(searchParams, 'department')
    if (departmentFilter.length > 0) {
      filtered = filtered.filter((employee) => departmentFilter.includes(employee.department))
    }
  }

  // Filter by salary range (if not excluded)
  if (excludeColumn !== 'salary') {
    const salaryRange = parseNumberRange(searchParams, 'salary')
    if (salaryRange) {
      filtered = filtered.filter((employee) =>
        isNumberInRange(employee.salary, salaryRange.min, salaryRange.max)
      )
    }
  }

  // Filter by date range (if not excluded)
  if (excludeColumn !== 'createdAt' && excludeColumn !== 'date') {
    const dateRange = parseSingle(searchParams, 'createdAt') || parseSingle(searchParams, 'date')
    if (dateRange) {
      const [start, end] = dateRange.split('_')
      if (start && end) {
        const startDate = new Date(start)
        const endDate = new Date(end)
        filtered = filtered.filter((employee) => {
          const employeeDate = new Date(employee.createdAt)
          return employeeDate >= startDate && employeeDate <= endDate
        })
      }
    }
  }

  // Filter by search query (always apply search)
  const searchQuery = parseSingle(searchParams, 'q')
  if (searchQuery) {
    filtered = filterBySearch(
      filtered,
      searchQuery,
      employeeSearchConfig.searchableFields
    )
  }

  return filtered
}
