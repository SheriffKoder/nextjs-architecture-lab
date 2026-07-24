/**
 * Employees Page with TanStack Query
 * 
 * Purpose: Client page demonstrating filtering employees using TanStack Query
 * Used in: Development/testing of filter system with TanStack Query
 * Why: Shows how to integrate URL filters with TanStack Query for client-side data fetching
 * 
 * Function Index:
 * - page: Main client page component that uses filters and TanStack Query
 *   Example input: Access via /development/filters/employees?status=active&role=admin
 *   Example output: Page with FiltersBar and filtered employee list
 * 
 * Steps:
 * 1. Use useUrlFilters to get filter values from URL
 * 2. Build filters object from URL params
 * 3. Pass filters to useEmployees TanStack Query hook
 * 4. Display employees in row format
 * 5. Filters automatically trigger refetch when URL changes
 */

'use client'

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { PillFilter, LoadingFiltersBar, EmployeesTable, SearchBar, FiltersBar } from "../feature-filtering/components"
import { DropdownFilter } from "../feature-filtering/components/dropdown-filter"
import { employeeFilterIcons, employeeSortConfig } from "./feature-config/employee-filter-config"
import { DateFilterButton } from "../feature-filtering/components/single-date-filter"
import { FilterOptionsButtons } from "../feature-filtering/components/single-key"
import { SortButtons } from "../feature-sorting/components"
import { PaginationWrapper } from "../feature-pagination/components"
import { useEmployees } from "./tanstack"
import { useUrlFilters } from "../feature-filtering/hooks/useUrlFilters"
import { useUrlSorting } from "../feature-sorting/hooks/useUrlSorting"
import { useUrlPagination } from "../feature-pagination/hooks"
import { QueryProvider } from "./tanstack/query-provider"
import type { FilterConfig } from "../feature-filtering/components/filter-types"
import { employeeSearchConfig, employeePaginationConfig, employeeQueryBuilderFields } from "./feature-config/employee-filter-config"

// for sorting control feature
import { SortingControl } from "../feature-sorting-builder-control/components"
// for QueryBuilder feature
import { QueryBuilder } from "../feature-query-builder-filter/components/query-builder"

//////////////////////////////////
// Filter Options Hook
//////////////////////////////////

/**
 * Hook to fetch filter options from API
 * WHY: Get dynamic filter options for client pages
 * HOW: Uses TanStack Query to fetch from /api/filters/options
 * @returns {Object} Query result with filter options data
 */
function useFilterOptions() {
  return useQuery({
    queryKey: ["filter-options"],
    queryFn: async () => {
      const response = await fetch("/api/filters/options")
      if (!response.ok) {
        throw new Error("Failed to fetch filter options")
      }
      return response.json() as Promise<FilterConfig[]>
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - options don't change often
  })
}

//////////////////////////////////
// Main Page Component
//////////////////////////////////

/**
 * Employees page content component
 * WHY: Inner component that uses TanStack Query hooks
 * HOW: Uses useUrlFilters to get filters from URL, passes to useEmployees hook
 * @returns {React.ReactElement} Page content with filters and employee list
 */
function EmployeesPageContent() {
  // Get filter functions from useUrlFilters hook
  // WHY: Need to read filter values from URL
  // HOW: Hook reads from URL searchParams
  const { getList, get, getSearch } = useUrlFilters()
  
  // Get sort functions from useUrlSorting hook
  // WHY: Need to read sort values from URL
  // HOW: Hook reads from URL searchParams
  const { getSorts } = useUrlSorting()

  // Get pagination functions from useUrlPagination hook
  // WHY: Need to read pagination values from URL
  // HOW: Hook reads from URL searchParams
  const { page, limit } = useUrlPagination(employeePaginationConfig)

  // Fetch filter options dynamically
  // WHY: Get filter options from actual data instead of static values
  // HOW: Use TanStack Query to fetch from API
  const { data: filterOptions, isLoading: isLoadingFilters } = useFilterOptions()

  // Get sorts from URL
  // WHY: Need sort specifications for query key and API call
  // HOW: Get all active sorts from URL
  const sorts = getSorts()
  
  // Build filters object from URL params
  // WHY: TanStack Query needs filters object for query key
  // HOW: Get status, role, and department as arrays, search query, sorts, and pagination from URL
  const filters = {
    status: getList("status"),
    role: getList("role"),
    department: getList("department"),
    q: getSearch() || undefined, // Search query
    sort: sorts.length > 0 ? sorts : undefined, // Sort specifications
    page, // Current page number
    limit, // Items per page
  }

  // Fetch employees using TanStack Query
  // WHY: Automatic refetching when filters, sorts, or pagination change
  // HOW: useEmployees hook with filters, query key includes filters
  const { data, isLoading, error } = useEmployees(filters)
  
  // Extract employees and pagination from response
  // WHY: API now returns both employees and pagination metadata
  // HOW: Destructure the response data
  const employees = data?.employees
  const pagination = data?.pagination
  
  // State for dropdown open/close
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
  
  // Get all active filter columns for selectability logic
  const allActiveFilterColumns: Record<string, any> = useMemo(() => {
    return {
      status: filters.status.length > 0 ? filters.status : undefined,
      role: filters.role.length > 0 ? filters.role : undefined,
      department: filters.department.length > 0 ? filters.department : undefined,
      q: filters.q || undefined,
    }
  }, [filters.status, filters.role, filters.department, filters.q])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Employees</h1>
        <p className="text-muted-foreground mt-2">
          Filter employees by status and role. Filters are synced with URL
          parameters and automatically trigger data refetch.
        </p>
      </div>

      {/* Search Bar */}
      {/* WHY: Allows users to search across multiple fields */}
      {/* HOW: Updates URL 'q' parameter which triggers TanStack Query refetch */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Search</h2>
        <SearchBar config={employeeSearchConfig}/>
      </div>

      {/* Filters Bar */}
      {/* WHY: Allows users to filter employees with dynamic options */}
      {/* HOW: FiltersBar updates URL, which triggers TanStack Query refetch */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Filters</h2>
        {isLoadingFilters ? (
          <LoadingFiltersBar />
        ) : filterOptions ? (
          <FiltersBar filters={filterOptions} showInitialCount={true} />
        ) : null}
      </div>

      {/* Pill Filter */}
      {/* WHY: Allows users to filter employees with dynamic options and search */}
      {/* HOW: PillFilter updates URL, which triggers TanStack Query refetch */}
      {isLoadingFilters ? (
        <LoadingFiltersBar />
      ) : filterOptions ? (
        <PillFilter filters={filterOptions} searchConfig={employeeSearchConfig} showInitialCount={true} />
      ) : null}

      {/* Sort Buttons */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Sorting (Simple Buttons)</h2>
        <SortButtons sortConfig={employeeSortConfig} />
      </div>

      {/* Sorting Control */}
      {/* WHY: Provides advanced dropdown-based sorting control */}
      {/* HOW: Renders SortingControl component with dropdown UI for managing multiple sorts */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Sorting Control (Advanced)</h2>
        <SortingControl sortConfig={employeeSortConfig} placeholder="Sort by..." />
      </div>

      {/* Query Builder */}
      {/* WHY: Provides advanced query builder with nested groups and conditions */}
      {/* HOW: Renders QueryBuilder component with dropdown UI for building complex filters */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Query Builder (Advanced Filter)</h2>
        <QueryBuilder fields={employeeQueryBuilderFields} placeholder="Advanced Filter" />
      </div>

      {/* Dropdown Filters Row */}
      {/* WHY: Provides dropdown-style filtering alongside pill filters */}
      {/* HOW: Renders DropdownFilter for each filter config */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Dropdown Filters (useFilterIcon=false) and with iconConfig and with showInitialCount=true ( count / initial count)</h2>
        {isLoadingFilters ? (
          <LoadingFiltersBar />
        ) : filterOptions ? (
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <DropdownFilter
                key={filter.key}
                filter={filter}
                isOpen={openDropdowns[filter.key] || false}
                onOpenChange={(open) => {
                  setOpenDropdowns(prev => ({ ...prev, [filter.key]: open }))
                }}
                dataSource={[]}
                autoApply={false}
                showBadges={true}
                useFilterIcon={false}
                allActiveFilterColumns={allActiveFilterColumns}
                showInitialCount={true}
                iconConfig={employeeFilterIcons}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Dropdown Filters Row */}
      {/* WHY: Provides dropdown-style filtering alongside pill filters */}
      {/* HOW: Renders DropdownFilter for each filter config with options from server */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Dropdown Filters (useFilterIcon=true)</h2>
        <div className="flex flex-wrap gap-2">
          {filterOptions?.map((filter) => (
            <DropdownFilter
              key={filter.key}
              filter={filter} // filter already has options populated from getFilterOptionsServer
              autoApply={false}
              showBadges={true}
              useFilterIcon={true}
              defaultRangeExpanded={false}
              showInitialCount={false}
            />
          ))}
        </div>
      </div>

      {/* Single Date Filter */}
      {/* WHY: Provides single date filter button with advanced date selection */}
      {/* HOW: Renders DateFilterButton component that opens ReactDateFilterDropDown */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Single Date Filter</h2>
        <DateFilterButton
          filterKey="createdAt"
          buttonText="Filter by Created Date"
          width="200px"
        />
      </div>

      {/* Filter Options Buttons - Department (Buttons/Multi-Select) */}
      {/* WHY: Provides quick filter selection for department as button row */}
      {/* HOW: Renders FilterOptionsButtons component with isDropdown=false */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Option buttons, isDropdown=true, (multi-select) with showInitialCount=false</h2>
      {isLoadingFilters ? (
          <LoadingFiltersBar />
        ) : filterOptions ? (
            <FilterOptionsButtons
            filterKey="role"
            filterOptions={filterOptions}
            selectType="multi-select"
            isDropdown={true}
            showInitialCount={false}
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Option buttons, isDropdown=false, (single-select) with showInitialCount=true ( count / initial count)</h2>
      {isLoadingFilters ? (
          <LoadingFiltersBar />
        ) : filterOptions ? (
          <FilterOptionsButtons
          filterKey="role"
          filterOptions={filterOptions}
          selectType="single-select"
          isDropdown={false}
          showInitialCount={true}
        />
        ) : null}
      </div>

      {/* Employee Table */}
      {/* WHY: Displays filtered employees */}
      {/* HOW: Renders EmployeesTable component with employee data from TanStack Query */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Employees</h2>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading employees...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            Error loading employees: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : employees && employees.length > 0 ? (
          <>
            <EmployeesTable employees={employees} />
            {/* Results count */}
            {/* WHY: Shows how many employees match current filters */}
            {/* HOW: Display count from employees array length */}
            <div className="text-sm text-muted-foreground">
              Showing {employees.length} employee{employees.length !== 1 ? "s" : ""}
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No employees found matching the current filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {/* WHY: Allows users to navigate between pages of employees */}
      {/* HOW: Renders PaginationWrapper component that uses useUrlPagination hook */}
      {pagination && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Pagination</h2>
          <PaginationWrapper
            totalItems={pagination.totalItems}
            config={employeePaginationConfig}
            textDisplay={false}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Employees page component
 * WHY: Wraps page content with QueryProvider for TanStack Query
 * HOW: Provides QueryClient context to child components
 * @returns {React.ReactElement} Page wrapped with QueryProvider
 */
export default function EmployeesPage() {
  return (
    <QueryProvider>
      <EmployeesPageContent />
    </QueryProvider>
  )
}
