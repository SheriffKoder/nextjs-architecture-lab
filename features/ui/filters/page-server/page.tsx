/**
 * Filters Demo Page
 * 
 * Purpose: Demonstration page for the reusable filter component system
 * Used in: Development/testing of filter components
 * Why: Provides a working example of how to use FiltersBar in an RSC page
 * 
 * Function Index:
 * - page: Main RSC page component that renders FiltersBar and displays filter values
 *   Example input: Access via /development/filters?status=open,in-progress&date=2025-01-01_2025-01-31
 *   Example output: Page with FiltersBar and current filter values displayed
 * 
 * Steps:
 * 1. Define filter configurations for different filter types
 * 2. Read searchParams from URL (RSC can access searchParams directly)
 * 3. Render FiltersBar with filter configurations
 * 4. Display current filter values from searchParams for demonstration
 */

import { Suspense } from "react"
import { FiltersBar, EmployeesTable, LoadingFiltersBar, SearchBar, PillFilter } from "../feature-filtering/components"
import { DropdownFilter } from "../feature-filtering/components/dropdown-filter"
import { DateFilterButton } from "../feature-filtering/components/single-date-filter"
import { FilterOptionsButtons } from "../feature-filtering/components/single-key"
import { SortButtons } from "../feature-sorting/components"
import { PaginationWrapper } from "../feature-pagination/components"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { getPageData } from "./utils/get-page-data"
import { getFilterOptionsServer } from "./utils/get-filter-options-server"
import { employeeSearchConfig, employeeBaseFilters, employeeFilterIcons, employeeSortConfig, employeePaginationConfig, employeeQueryBuilderFields } from "./feature-config-server/employee-filter-config"

// for SortingControl feature
import { SortingControl } from "../feature-sorting-builder-control/components"
// for QueryBuilder feature
import { QueryBuilder } from "../feature-query-builder-filter/components/query-builder"



//////////////////////////////////
// Main Page Component
//////////////////////////////////

/**
 * Data fetching component that uses searchParams
 * WHY: Extracts searchParams usage into a Suspense boundary (Next.js 15 requirement)
 * HOW: Wraps all searchParams-dependent logic in a separate component
 */
async function FiltersContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await searchParams (Next.js 15+ requires awaiting searchParams)
  // WHY: searchParams is now a Promise in Next.js 15
  // HOW: Await the Promise to get the actual search parameters
  const params = await searchParams
  
  // Get filter options dynamically from data
  // WHY: Populate filter options from actual employee data with initialCount
  // HOW: Call server function to extract unique values and populate options, passing searchParams for initialCount calculation
  const filters = await getFilterOptionsServer(employeeBaseFilters, params)
  
  // Fetch mock employees data with filtering, sorting, and pagination
  // WHY: Demonstrate server-side data fetching with filtering, sorting, and pagination in RSC
  // HOW: Call server function with awaited searchParams to filter, sort, and paginate employees
  const { employees, pagination } = await getPageData(params)
  console.log("[Page] Mock Employees (Filtered, Sorted, Paginated):", employees)
  console.log("[Page] Pagination:", pagination)
  
  return (
    <>
      {/* Pill Filter */}
      {/* WHY: Renders pill-shaped filter container with integrated search */}
      {/* HOW: Passes filter configurations with options populated from data */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Filters</h2>
        <Suspense fallback={<LoadingFiltersBar />}>
          <FiltersBar filters={filters} showInitialCount={false} />
        </Suspense>
      </div>

      <Suspense fallback={<LoadingFiltersBar />}>
        <PillFilter filters={filters} searchConfig={employeeSearchConfig} showInitialCount={false} />
      </Suspense>

      {/* Sort Buttons */}
      {/* WHY: Allows users to sort employees by different fields */}
      {/* HOW: Renders SortButtons component that updates URL sort parameter */}
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
      {/* HOW: Renders DropdownFilter for each filter config with options from server */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Dropdown Filters (useFilterIcon=false) and with showInitialCount=true ( count / initial count)</h2>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <DropdownFilter
              key={filter.key}
              filter={filter} // filter already has options populated from getFilterOptionsServer
              autoApply={false}
              showBadges={true}
              useFilterIcon={false}
              defaultRangeExpanded={false}
              showInitialCount={true}
            />
          ))}
        </div>
      </div>


      {/* Dropdown Filters Row */}
      {/* WHY: Provides dropdown-style filtering alongside pill filters */}
      {/* HOW: Renders DropdownFilter for each filter config with options from server */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Dropdown Filters</h2>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
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

      {/* Filter Options Buttons - Role (Dropdown/Single-Select) */}
      {/* WHY: Provides quick filter selection for role as dropdown */}
      {/* HOW: Renders FilterOptionsButtons component with isDropdown=true and selectType=single-select */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Option buttons, isDropdown=true, (multi-select) with showInitialCount=false</h2>
        <FilterOptionsButtons
          filterKey="role"
          filterOptions={filters}
          selectType="multi-select"
          isDropdown={true}
          showInitialCount={false}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Option buttons, isDropdown=false, (single-select) with showInitialCount=true ( count / initial count)</h2>
        <FilterOptionsButtons
          filterKey="role"
          filterOptions={filters}
          selectType="single-select"
          isDropdown={false}
          showInitialCount={true}
        />
      </div>

      {/* Employees Table */}
      {/* WHY: Displays employees data in a table format */}
      {/* HOW: Renders EmployeesTable component with fetched employees */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Employees</h2>
        <EmployeesTable employees={employees} />
      </div>

      {/* Pagination */}
      {/* WHY: Allows users to navigate between pages of employees */}
      {/* HOW: Renders PaginationWrapper component that uses useUrlPagination hook */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Pagination</h2>
        <PaginationWrapper
          totalItems={pagination.totalItems}
          config={employeePaginationConfig}
        />
      </div>
    </>
  )
}

/**
 * Filters demo page component
 * WHY: Demonstrates FiltersBar usage in an RSC page
 * HOW: Wraps searchParams usage in Suspense boundary (Next.js 15 requirement)
 * @param {Object} props - Next.js page props with searchParams
 * @param {Promise<Object>} props.searchParams - URL search parameters (Promise in Next.js 15+)
 * @returns {React.ReactElement} Page with FiltersBar and filter values display
 */
export default function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Filter Components Demo</h1>
        <p className="text-muted-foreground mt-2">
          This page demonstrates the reusable filter component system. Select
          filters below and see the URL parameters update automatically.
        </p>
      </div>

      {/* Search Bar */}
      {/* WHY: Allows users to search across multiple fields */}
      {/* HOW: Updates URL 'q' parameter which filters data server-side */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Search</h2>
        <Suspense fallback={<div className="h-9 w-full rounded-md border bg-muted animate-pulse" />}>
          <SearchBar config={employeeSearchConfig} />
        </Suspense>
      </div>

      {/* Filters Content (wrapped in Suspense for searchParams) */}
      {/* WHY: Next.js 15 requires searchParams usage to be in Suspense boundary */}
      {/* HOW: Extract searchParams-dependent logic into separate component */}
      <Suspense fallback={
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Filters</h2>
            <LoadingFiltersBar />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Employees</h2>
            <div className="h-64 w-full rounded-md border bg-muted animate-pulse" />
          </div>
        </div>
      }>
        <FiltersContent searchParams={searchParams} />
      </Suspense>

      <ThemeSwitcher />
    </div>
  )
}
