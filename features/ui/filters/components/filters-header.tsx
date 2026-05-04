/**
 * Filters Header Component
 * 
 * Purpose: Reusable component for filter UI rows
 * Used in: Pages that need filter components in a consistent layout
 * Why: Provides consistent filter UI structure across pages
 */

import { Suspense } from "react"
import { FiltersBar, LoadingFiltersBar, SearchBar, PillFilter } from "../feature-filtering/components"
import { DropdownSearchBar } from "../feature-filtering/components/dropdown-filter/components/search-bar"
import { DropdownFilter } from "../feature-filtering/components/dropdown-filter"
import { DateFilterButton } from "../feature-filtering/components/single-date-filter"
import { FilterOptionsButtons } from "../feature-filtering/components/single-key"
import type { FilterConfig } from "../feature-filtering/components/filter-types"
import type { SearchConfig } from "../feature-filtering/components/search-types"
import type { FiltersHeaderConfig } from "./filters-header-config"

interface FiltersHeaderProps {
  filters: FilterConfig[]
  searchConfig: SearchConfig<any>
  config: FiltersHeaderConfig
  dateFilterKey?: string
  dateFilterButtonText?: string
  dateFilterWidth?: string
}

/**
 * FiltersHeader component - renders filter rows based on config
 * WHY: Provides flexible filter UI layout
 * HOW: Renders one of three filter row types (dropdown-1, pill, dropdown-2) plus optional column options
 */
export function FiltersHeader({
  filters,
  searchConfig,
  config,
  dateFilterKey = "createdAt",
  dateFilterButtonText = "Filter by Created Date",
  dateFilterWidth = "200px",
}: FiltersHeaderProps) {
  // Filter the filters array based on enabledFilterKeys if provided
  const displayedFilters = config.enabledFilterKeys
    ? filters.filter(f => config.enabledFilterKeys!.includes(f.key))
    : filters
  
  return (
    <div className="space-y-10 px-2">
      {/* Row 1: dropdown-1 - SearchBar + FiltersBar */}
      {config.filterType === 'dropdown-1' && (
        <div className="flex items-start gap-4 justify-between">
          {config.showSearch && (
            <div className="">
              <Suspense fallback={<div className="h-9 w-full rounded-md border bg-muted animate-pulse" />}>
                <SearchBar config={searchConfig} />
              </Suspense>
            </div>
          )}
          <div className="">
            <Suspense fallback={<LoadingFiltersBar />}>
              <FiltersBar filters={displayedFilters} showInitialCount={false} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Row 2: pill - PillFilter + DateFilterButton */}
      {config.filterType === 'pill' && (
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <Suspense fallback={<LoadingFiltersBar />}>
              <PillFilter filters={displayedFilters} searchConfig={searchConfig} showInitialCount={false} />
            </Suspense>
          </div>
          {config.showIndependentDateSelect && (
            <div className="flex-shrink-0">
              <DateFilterButton
                filterKey={dateFilterKey}
                buttonText={dateFilterButtonText}
                width={dateFilterWidth}
              />
            </div>
          )}
        </div>
      )}

      {/* Row 3: dropdown-2 - DropdownSearchBar + DropdownFilters */}
      {config.filterType === 'dropdown-2' && (
        <div className="flex items-start gap-4 justify-between">
          {config.showSearch && (
            <div className="">
              <Suspense fallback={<div className="h-9 w-full rounded-md border bg-muted animate-pulse" />}>
                <DropdownSearchBar config={searchConfig} />
              </Suspense>
            </div>
          )}
          <div className="">
            <div className="flex flex-wrap gap-2">
              {displayedFilters.map((filter) => (
                <DropdownFilter
                  key={filter.key}
                  filter={filter}
                  autoApply={false}
                  showBadges={true}
                  useFilterIcon={false}
                  showInitialCount={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Row 4: column-options - FilterOptionsButtons */}
      {config.showColumnOptions && (
        <div className="w-full flex justify-end">
          {displayedFilters.length > 0 && (
            <FilterOptionsButtons
              filterKey={config.columnOptionsKey || displayedFilters[1]?.key || displayedFilters[0]?.key || ''}
              filterOptions={displayedFilters}
              selectType="single-select"
              isDropdown={false}
              showInitialCount={true}
            />
          )}
        </div>
      )}
    </div>
  )
}
