/**
 * Query Key Factory
 * 
 * Purpose: Centralized query key generation for TanStack Query
 * Used in: Query hooks to generate consistent query keys
 * Why: Ensures query keys are stable and follow a consistent pattern
 * 
 * Function Index:
 * - employees: Function that generates query keys for employee queries
 *   Example input: employees({ status: ['active'], role: 'admin' })
 *   Example output: ['employees', { status: ['active'], role: 'admin' }]
 * 
 * Steps:
 * 1. Define query key factory functions
 * 2. Include filters in query keys for automatic refetching
 * 3. Export for use in query hooks
 */

import type { SortSpec } from "../../feature-sorting/types"

/**
 * Employee filter parameters
 * WHY: Type-safe filter structure for employee queries
 * HOW: Defines optional status array, role array, department array, salary range, search query, sorts, and pagination
 */
export interface EmployeeFilters {
  status?: string[]
  role?: string[]
  department?: string[]
  salary?: {
    min?: number
    max?: number
  }
  q?: string // Search query
  sort?: SortSpec[] // Sort specifications (multi-level)
  page?: number // Page number (1-indexed)
  limit?: number // Items per page
}

/**
 * Generate query key for employees query
 * WHY: Centralized query key generation ensures consistency
 * HOW: Returns array with 'employees' and filters object
 * @param {EmployeeFilters} filters - Filter parameters for employees
 * @returns {Array} Query key array for TanStack Query
 */
export const employees = {
  /**
   * All employees query key
   * WHY: Base query key for all employees
   * HOW: Returns ['employees', 'all']
   */
  all: () => ["employees", "all"] as const,

  /**
   * Filtered employees query key
   * WHY: Query key that includes filters for automatic refetching
   * HOW: Returns ['employees', 'list', filters] where filters are part of the key
   * @param {EmployeeFilters} filters - Filter parameters
   * @returns {Array} Query key with filters
   */
  lists: (filters?: EmployeeFilters) =>
    ["employees", "list", filters] as const,
}
