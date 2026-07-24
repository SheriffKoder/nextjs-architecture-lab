/**
 * Filters Layout Demo Page
 * 
 * Purpose: Demonstration page with flex-row layout structure
 * Used in: Development/testing of filter components in row-based layout
 * Why: Shows filter components organized in horizontal rows
 */

import { Suspense } from "react"
import { FiltersBar, EmployeesTable, LoadingFiltersBar, SearchBar, PillFilter } from "../feature-filtering/components"
import { DropdownSearchBar } from "../feature-filtering/components/dropdown-filter/components/search-bar"
import { DropdownFilter } from "../feature-filtering/components/dropdown-filter"
import { DateFilterButton } from "../feature-filtering/components/single-date-filter"
import { FilterOptionsButtons } from "../feature-filtering/components/single-key"
import { PaginationWrapper } from "../feature-pagination/components"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { getPageData } from "../page-server/utils/get-page-data"
import { getFilterOptionsServer } from "../page-server/utils/get-filter-options-server"
import { employeeSearchConfig, employeeBaseFilters, employeeFilterIcons, employeePaginationConfig } from "../page-client/feature-config/employee-filter-config"

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
  const params = await searchParams
  
  // Get filter options dynamically from data
  const filters = await getFilterOptionsServer(employeeBaseFilters, params)
  
  // Fetch mock employees data with filtering, sorting, and pagination
  const { employees, pagination } = await getPageData(params)
  
  return (
    <div className="space-y-10">
      {/* Row 2: Search + Filters bar */}
      <div className="flex items-start gap-4 justify-between">
        <div className="">
          <Suspense fallback={<div className="h-9 w-full rounded-md border bg-muted animate-pulse" />}>
            <SearchBar config={employeeSearchConfig} />
          </Suspense>
        </div>
        <div className="">
          <Suspense fallback={<LoadingFiltersBar />}>
            <FiltersBar filters={filters} showInitialCount={false} />
          </Suspense>
        </div>
      </div>

      {/* Row 3: Pill filter + Single date filter */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <Suspense fallback={<LoadingFiltersBar />}>
            <PillFilter filters={filters} searchConfig={employeeSearchConfig} showInitialCount={false} />
          </Suspense>
        </div>
        <div className="flex-shrink-0">
          <DateFilterButton
            filterKey="createdAt"
            buttonText="Filter by Created Date"
            width="200px"
          />
        </div>
      </div>

      {/* Row 4: Search + Dropdown Filters (all) */}
      <div className="flex items-start gap-4 justify-between">
        <div className="">
          <Suspense fallback={<div className="h-9 w-full rounded-md border bg-muted animate-pulse" />}>
            <DropdownSearchBar config={employeeSearchConfig} />
          </Suspense>
        </div>
        <div className="">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <DropdownFilter
                key={filter.key}
                filter={filter}
                autoApply={false}
                showBadges={true}
                useFilterIcon={false}
                defaultRangeExpanded={false}
                showInitialCount={true}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Row 5: Option buttons (2nd) */}
      <div className="w-full flex justify-end">
        {filters.length > 1 && (
          <FilterOptionsButtons
            filterKey={filters[1].key}
            filterOptions={filters}
            selectType="single-select"
            isDropdown={false}
            showInitialCount={true}
          />
        )}
      </div>

      {/* Employees Table */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Employees</h2>
        <EmployeesTable employees={employees} />
      </div>

      {/* Pagination */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Pagination</h2>
        <PaginationWrapper
          totalItems={pagination.totalItems}
          config={employeePaginationConfig}
        />
      </div>
    </div>
  )
}

/**
 * Filters layout demo page component
 * WHY: Demonstrates filter components in flex-row layout
 * HOW: Organizes components in horizontal rows with flex layout
 */
export default function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Row 1: Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Filter Components Layout Demo</h1>
        <p className="text-muted-foreground mt-2">
          This page demonstrates the filter components organized in flex rows.
        </p>
      </div>

      {/* Filters Content (wrapped in Suspense for searchParams) */}
      <Suspense fallback={
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-1 h-9 rounded-md border bg-muted animate-pulse" />
            <div className="flex-1 h-9 rounded-md border bg-muted animate-pulse" />
          </div>
          <div className="h-64 w-full rounded-md border bg-muted animate-pulse" />
        </div>
      }>
        <FiltersContent searchParams={searchParams} />
      </Suspense>

      <ThemeSwitcher />
    </div>
  )
}