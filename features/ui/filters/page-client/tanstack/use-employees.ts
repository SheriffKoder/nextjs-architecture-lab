/**
 * Employees Query Hook
 * 
 * Purpose: TanStack Query hook for fetching employees with filters
 * Used in: Client pages that need to fetch and filter employees
 * Why: Provides reactive data fetching that automatically refetches when filters change
 * 
 * Function Index:
 * - useEmployees: Hook that returns employees data with loading/error states
 *   Example input: useEmployees({ status: ['active'], role: 'admin' })
 *   Example output: { data, isLoading, error } from TanStack Query
 * 
 * Steps:
 * 1. Accept filters parameter
 * 2. Generate query key using key factory
 * 3. Use TanStack Query useQuery hook
 * 4. Return data, loading, and error states
 */

'use client'

import { useQuery } from "@tanstack/react-query"
import { employees as employeeKeys } from "./key-factory"
import { fetchEmployees } from "./handler"
import type { EmployeeFilters } from "./key-factory"

/**
 * Hook for fetching employees with filters
 * WHY: Provides reactive data fetching that refetches when filters change
 * HOW: Uses TanStack Query with filters in query key
 * @param {EmployeeFilters} filters - Optional filter parameters
 * @returns {Object} Query result with data, isLoading, error, etc.
 */
export function useEmployees(filters?: EmployeeFilters) {
  // Use TanStack Query to fetch employees
  // WHY: Automatic refetching when filters change, caching, loading states
  // HOW: useQuery hook with queryKey that includes filters
  return useQuery({
    // Query key includes filters so it refetches when filters change
    // WHY: TanStack Query refetches when query key changes
    // HOW: Use key factory to generate consistent query keys
    queryKey: employeeKeys.lists(filters),
    
    // Query function that fetches employees
    // WHY: Async function that returns employee data
    // HOW: Call fetchEmployees with filters
    queryFn: () => fetchEmployees(filters),
    
    // Stale time: 5 minutes
    // WHY: Prevent unnecessary refetches for 5 minutes
    // HOW: Data considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  })
}
