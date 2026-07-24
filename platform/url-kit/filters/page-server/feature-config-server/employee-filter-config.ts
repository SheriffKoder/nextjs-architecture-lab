/**
 * Employee Filter Configuration
 * 
 * Purpose: Centralized configuration for employee filters used across RSC and client pages
 * Used in: API routes and server functions that need employee filter options
 * Why: Single source of truth for employee filter configs, data, and field mappings
 * 
 * Function Index:
 * - employeeBaseFilters: Base filter configurations without options
 * - employeeFieldMap: Mapping of filter keys to employee data fields
 * - employees: Employee data source
 * 
 * Steps:
 * 1. Define field mapping (filter keys -> data fields)
 * 2. Define base filter configs (structure without options)
 * 3. Export data source and type
 */

import { employees, type Employee } from "./data-source"
import type { FilterConfig } from "../../feature-filtering/components/filter-types"
import type { SearchConfig } from "../../feature-filtering/components/search-types"
import { 
  CircleCheck, 
  User, 
  Building2, 
  DollarSign, 
  Calendar 
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

//////////////////////////////////
// Field Mapping
//////////////////////////////////

/**
 * Field mapping for employee filters
 * WHY: Maps filter configuration keys to actual employee data fields
 * HOW: Object mapping filter key strings to employee property keys
 */
export const employeeFieldMap: Record<string, keyof Employee> = {
  status: "status",
  role: "role",
  department: "department",
  salary: "salary",
  createdAt: "createdAt",
  date: "createdAt", // Alternative key for date
}

//////////////////////////////////
// Base Filter Configurations
//////////////////////////////////

/**
 * Base filter configurations for employees
 * WHY: Centralized filter configs used by both API and server function
 * HOW: Array of FilterConfig objects without options (populated dynamically)
 */
export const employeeBaseFilters: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "multi-select",
  },
  {
    key: "role",
    label: "Role",
    type: "multi-select",
  },
  {
    key: "department",
    label: "Department",
    type: "multi-select",
  },
  {
    key: "salary",
    label: "Salary",
    type: "number-range",
    // showQuickSelect: true,
    // quickSelectType: "unique",
  },
  {
    key: "createdAt",
    label: "Created Date",
    type: "date-range",
    showQuickSelect: true,
    quickSelectType: "unique",
  },
]

//////////////////////////////////
// Icon Configuration
//////////////////////////////////

/**
 * Icon mapping for employee filters
 * WHY: Provides icons for each filter to display in FilterBoxButton
 * HOW: Maps filter keys to Lucide icon components
 */
export const employeeFilterIcons: Record<string, LucideIcon> = {
  status: CircleCheck,
  role: User,
  department: Building2,
  salary: DollarSign,
  createdAt: Calendar,
}

//////////////////////////////////
// Search Configuration
//////////////////////////////////

/**
 * Search configuration for employees
 * WHY: Defines which fields are searchable and search behavior
 * HOW: Specifies fields to search across and placeholder text
 */
export const employeeSearchConfig: SearchConfig<Employee> = {
  searchableFields: ["name", "email", "department"],
  placeholder: "Search employees by name, email, or department...",
  minLength: 0, // Search immediately (no minimum length requirement)
}

//////////////////////////////////
// Sort Configuration
//////////////////////////////////

/**
 * Sort configuration for employee fields
 * WHY: Defines which fields can be sorted and their display labels
 * HOW: Array of SortConfig objects with key and label
 */
import type { SortConfig } from "../../feature-sorting/types"

export const employeeSortConfig: SortConfig[] = [
  { key: "status", label: "Status", initial: true, initialOrder: "asc" },
  { key: "role", label: "Role", initial: true, initialOrder: "desc" },
  { key: "department", label: "Department" },
  { key: "salary", label: "Salary" },
  { key: "createdAt", label: "Created Date" },
]

//////////////////////////////////
// Pagination Configuration
//////////////////////////////////

import type { PaginationConfig } from "../../feature-pagination/types"

/**
 * Pagination configuration for employee pages
 * WHY: Define default page size and available options
 * HOW: Used by pagination hook and components
 */
export const employeePaginationConfig: PaginationConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  allowPageSizeChange: true
}

//////////////////////////////////
// Query Builder Configuration
//////////////////////////////////

import type { FilterField } from "../../feature-query-builder-filter/types/field"

/**
 * Query builder field configuration for employees
 * WHY: Defines which fields are available in the query builder dropdown
 * HOW: Array of FilterField objects with key, label, and type
 */
export const employeeQueryBuilderFields: FilterField[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "status", label: "Status", type: "text" },
  { key: "role", label: "Role", type: "text" },
  { key: "department", label: "Department", type: "text" },
  { key: "salary", label: "Salary", type: "number" },
  { key: "createdAt", label: "Created Date", type: "date" },
]

//////////////////////////////////
// Data Source Exports
//////////////////////////////////

/**
 * Export employee data source
 * WHY: Single import point for both config and data
 * HOW: Re-export from data-source.ts
 */
export { employees }
export type { Employee }
