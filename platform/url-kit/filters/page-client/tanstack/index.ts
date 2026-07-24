/**
 * TanStack Query Exports
 * 
 * Purpose: Centralized exports for TanStack Query setup
 * Used in: Pages and components that need employee data
 * Why: Provides clean import paths for all TanStack Query related code
 */

export { useEmployees } from "./use-employees"
export { employees as employeeKeys } from "./key-factory"
export { fetchEmployees } from "./handler"
export { QueryProvider } from "./query-provider"
export type { EmployeeFilters } from "./key-factory"
export type { Employee } from "../feature-config/data-source"
