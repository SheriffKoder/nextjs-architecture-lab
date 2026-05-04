/**
 * RowFilters Component
 * 
 * Purpose: Container for table filtering controls including date selector and future filter dropdowns
 * Used in: VirtualizedTable page above the table header
 * Why: Provides a centralized location for all table filtering controls with consistent styling
 * 
 * Features:
 * - Date range filtering with multiple modes (day, week, month, range)
 * - Direct integration with table's filter system
 * - Smart filter descriptions based on selected mode
 * - Extensible design for future filter types
 * 
 * Steps:
 * 1. Import required components and types
 * 2. Define component props interface
 * 3. Create filter container with proper styling
 * 4. Integrate date selector dropdown with internal filtering
 * 5. Prepare for future filter additions
 */

import React, { useState } from "react";
import DateSelectorDropdown from "./TableFilters/ReactDateFilterDropDown";
import VirtualizedTableHeader from "../components/filtering-table-header";
import { GlobalSearchBar, GlobalSearchResults } from "../components/GlobalSearch";
import { useGlobalSearch } from "../hooks/search";
import { TableColumn, FilterUniqueValuesMap } from "../types";
import { SearchableColumn } from "../types/search";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the RowFilters component
 * Provides all necessary data for rendering filter controls
 */
interface HeaderFiltersWrapperProps {
  // Function to handle filter changes
  handleFilterChange: (columnKey: string, values: any) => void;
  // Currently active filters
  activeFilters: any;
  // Column definitions for table filtering
  columns?: TableColumn<any>[];
  // Original data for filter options
  data?: any[];
  // Currently filtered data
  filteredData?: any[];
  // Function to get filtered data excluding a specific column
  getFilteredDataExcludingColumn: (excludeColumnKey: string) => any[];
  // Whether to auto-apply filter changes
  autoApplyDropdown?: boolean;
  // Whether to show count badges in filter dropdown
  showBadgesDropdown?: boolean;
  // Whether range filters should be open by default
  rangeOpen?: boolean;
  // Callback when global search results change
  onGlobalSearchResults?: (results: any[]) => void;
  // Callback when global search text changes
  onGlobalSearchTextChange?: (searchText: string) => void;
  // Sort configuration and handler (optional, for compatibility)
  sortConfig?: { key: string; direction: "ascending" | "descending" | "none" };
  handleSort?: (key: string) => void;
  // Placeholder text for the global search bar
  searchPlaceholder?: string;
  // Whether to hide the top level filter sorting
  hideTopLevelFilterSorting?: boolean;
  // Whether to hide the top level search bar
  hideTopLevelSearch?: boolean;
  // If top level filters, not in table
  isHeadLevel?: boolean;
  // If grouped/subheading component used/visible
  isSubHeadingsView?: boolean;
  // Unique value facets from main fetch (same as pill filters). Columns with uniqueValues use this.
  filterUniqueValues?: FilterUniqueValuesMap;
  // Callback when filter apply is clicked (same as pill filters). Used for API param mapping + refetch.
  onFilterApply?: (key: string, items: string[], type: string, columnConfig?: { filterApiParams?: { text?: string; number?: { from: string; to: string }; date?: { start: string; end: string }; isArray?: boolean; valueField?: 'id' | 'item' } }) => void;
}

////////////////////////////////////
// Component Implementation: Filter controls container
////////////////////////////////////

/**
 * Row filters component with date selector and extensible filter system
 * Provides a clean, organized interface for table filtering controls
 * 
 * @param {HeaderFiltersWrapperProps} props - Component props
 * @returns {JSX.Element} Filter controls container
 * 
 * @example
 * ```tsx
 * <RowFilters
 *   onDateRangeChange={handleDateRangeChange}
 *   initialStartDate="2024-01-01"
 *   initialEndDate="2024-12-31"
 *   initialDateMode="range"
 *   showDateFilter={true}
 * />
 * ```
 */
export function HeaderFiltersWrapper({
  handleFilterChange,
  activeFilters,
  columns = [],
  data = [],
  filteredData = [],
  getFilteredDataExcludingColumn,
  autoApplyDropdown = true,
  showBadgesDropdown = true,
  rangeOpen = false,
  handleSort,
  sortConfig,
  onGlobalSearchResults,
  onGlobalSearchTextChange,
  searchPlaceholder = "Search",
  hideTopLevelFilterSorting = false,
  hideTopLevelSearch = false,
  isHeadLevel = false,
  isSubHeadingsView = false,
  filterUniqueValues,
  onFilterApply,
}: HeaderFiltersWrapperProps) {

    
  // Global search functionality
  const {
    searchState,
    actions: searchActions,
    stats: searchStats
  } = useGlobalSearch(data, columns as SearchableColumn<any>[], {
    callbacks: {
      onSearchResults: (results: any) => {
        // Pass search results to parent component for table data filtering
        if (onGlobalSearchResults && results.stats.isActive) {
          const searchResultItems = results.results.map((r: any) => r.item);
          console.log("Global search results:", searchResultItems.length, "items");
          onGlobalSearchResults(searchResultItems);
        }
      },
      onSearchStart: (query: string) => {
        // Notify parent about search text change
        if (onGlobalSearchTextChange) {
          onGlobalSearchTextChange(query);
        }
      },
      onSearchClear: () => {
        // Clear global search by passing original data back
        if (onGlobalSearchResults) {
          console.log("Clearing global search, restoring original data");
          onGlobalSearchResults(data);
        }
        // Also notify parent about text change
        if (onGlobalSearchTextChange) {
          onGlobalSearchTextChange('');
        }
      }
    }
  });


  ////////////////////////////////////
  // Main Render: Filter controls container
  ////////////////////////////////////
  
  return (
    <div className="w-full">
      
      {/* Filter Controls */}
      <div className="flex flex-col gap-4">

        {/* Custom Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
        
        {!hideTopLevelSearch && (
        <GlobalSearchBar
            searchTerm={searchState.searchTerm}
            isSearching={searchStats.isSearching}
            hasSearchResults={searchStats.hasResults}
            onSearchTermChange={searchActions.setSearchTerm}
            onClearSearch={searchActions.clearSearch}
            placeholder={searchPlaceholder}
            resultsCount={searchStats.matchingItems}
            totalItems={searchStats.totalItems}
            className="w-[400px]"
          />
        )}

        {/* Table Column Filters */}
        {columns.length > 0 && data.length > 0 && (
        <div className="lg:w-auto min-w-0 w-full">
            <VirtualizedTableHeader
            columns={columns}
            activeFilters={activeFilters}
            handleFilterChange={handleFilterChange}
            data={data}
            filteredData={filteredData}
            getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
            autoApplyDropdown={autoApplyDropdown}
            showBadgesDropdown={showBadgesDropdown}
            rangeOpen={rangeOpen}
            sortConfig={sortConfig || { key: "", direction: "ascending" }}
            handleSort={handleSort || (() => {})}
            useFilterIcon={false}
            showFilterTitle={false}
            hiddenColumns={['date']}
            showSortButton={!hideTopLevelFilterSorting}
            useEqualWidths={true}
            isFilterRow={true}
            isHeadLevel={isHeadLevel}
            isSubHeadingsView={isSubHeadingsView}
            filterUniqueValues={filterUniqueValues}
            onFilterApply={onFilterApply}
            />  
        </div>
        )}
        </div>
        

      </div>
    </div>
  );
}

// Export component with React.memo for performance optimization
export default React.memo(HeaderFiltersWrapper); 