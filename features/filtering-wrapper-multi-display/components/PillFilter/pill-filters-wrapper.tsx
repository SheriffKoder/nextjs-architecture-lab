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

import React, { useState, useEffect, useRef } from "react";
import TableFilterList from "./TableFilterList";
import ColumnTitlesList from "./ColumnTitlesList";
import { GlobalSearchBar } from "./GlobalSearchBar";
import { TableColumn, FilterUniqueValuesMap } from "../../types";
import { getActiveFiltersForColumn, getDropdownSourceForColumn } from "./utils/column-filter-helpers";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the RowFilters component
 * Provides all necessary data for rendering filter controls
 */
export interface HeaderFiltersWrapper2Props<T = any> {
  // Function to handle filter changes
  handleFilterChange: (columnKey: string, values: any) => void;
  // Currently active filters
  activeFilters: any;
  // Column definitions for table filtering
  columns?: TableColumn<T>[];
  // Whether to auto-apply filter changes
  autoApplyDropdown?: boolean;
  // Whether to show count badges in filter dropdown
  showBadgesDropdown?: boolean;
  // Whether range filters should be open by default
  rangeOpen?: boolean;
  // Global search props - now required for main search integration
  searchTerm?: string;
  isSearching?: boolean;
  hasSearchResults?: boolean;
  onSearchTermChange?: (searchText: string) => void;
  onClearSearch?: () => void;
  searchResultsCount?: number;
  totalItems?: number;
  // Callback for when filter apply button is clicked
  onFilterApply?: (key: string, items: string[], type: string, columnConfig?: { filterApiParams?: { text?: string; number?: { from: string; to: string }; date?: { start: string; end: string }; isArray?: boolean; valueField?: 'id' | 'item' } }) => void;
  // Unique value facets from the main fetch. Columns with uniqueValues use uniqueValues.key (e.g. company_unique_values) for filter options.
  filterUniqueValues?: FilterUniqueValuesMap;
  // Data array for extracting unique values (fallback when API sources aren't available)
  data?: T[];
  // Filtered data array (data filtered by other columns)
  filteredData?: T[];
  // Function to get filtered data excluding a specific column
  getFilteredDataExcludingColumn?: (excludeColumnKey: string) => T[];
}

////////////////////////////////////
// Component Implementation: Filter controls container
////////////////////////////////////

/**
 * Row filters component with date selector and extensible filter system
 * Provides a clean, organized interface for table filtering controls
 * 
 * @param {HeaderFiltersWrapper2Props} props - Component props
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
function PillFilterComponent<T = any>({
  handleFilterChange,
  activeFilters,
  columns = [],
  autoApplyDropdown = true,
  showBadgesDropdown = true,
  rangeOpen = false,
  searchTerm = "",
  isSearching = false,
  hasSearchResults = false,
  onSearchTermChange,
  onClearSearch,
  searchResultsCount = 0,
  totalItems = 0,
  onFilterApply,
  filterUniqueValues = {},
  data,
  filteredData,
  getFilteredDataExcludingColumn,
}: HeaderFiltersWrapper2Props<T>) {

  // State for active column title
  const [activeColumnKey, setActiveColumnKey] = useState<string | null>(null);
  
  // State for tracking selected titles in order
  const [selectedTitlesOrder, setSelectedTitlesOrder] = useState<string[]>([]);
  
  // State for filter layout visibility
  const [isFilterLayoutVisible, setIsFilterLayoutVisible] = useState<boolean>(false);
  
  // Ref for dropdown container
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if any filters are active to indicate if the filter button should be highlighted and show the count badge
  const hasActiveFilters = Object.values(activeFilters).some(filterValue => {
    if (Array.isArray(filterValue)) {
      return filterValue.length > 0;
    }
    // Handle date range filters - check if both start and end are null
    if (filterValue && typeof filterValue === 'object' && 'start' in filterValue && 'end' in filterValue) {
      return filterValue.start !== null || filterValue.end !== null;
    }
    // Handle other filter types
    return Boolean(filterValue);
  });

  // Count active filters to show in the count badge
  const activeFilterCount = Object.values(activeFilters).reduce((count: number, filterValue) => {
    if (Array.isArray(filterValue)) {
      return count + filterValue.length;
    }
    // Handle date range filters - count as 1 if either start or end is not null
    if (filterValue && typeof filterValue === 'object' && 'start' in filterValue && 'end' in filterValue) {
      return count + (filterValue.start !== null || filterValue.end !== null ? 1 : 0);
    }
    // Handle other filter types
    return count + (filterValue ? 1 : 0);
  }, 0);

  // Handle column title click
  const handleColumnClick = (columnKey: string) => {
    setActiveColumnKey(columnKey);
    
    // Add to selected titles order if not already selected
    setSelectedTitlesOrder(prev => {
      if (!prev.includes(columnKey)) {
        return [...prev, columnKey];
      }
      return prev;
    });
  };

  // Handle filter layout toggle
  const handleFilterToggle = () => {
    setIsFilterLayoutVisible(prev => {
      const newVisible = !prev;
      
      // Only initialize if opening dropdown, no active column, AND no selected titles
      if (newVisible && !activeColumnKey && selectedTitlesOrder.length === 0) {
        // Use first available column only when no titles have been selected before
        const firstAvailable = columns.find(col => !['date'].includes(col.key))?.key;
        
        if (firstAvailable) {
          setActiveColumnKey(firstAvailable);
        }
      }
      
      return newVisible;
    });
  };

  // Effect to set default column when dropdown opens (only if no selected titles)
  useEffect(() => {
    if (isFilterLayoutVisible && !activeColumnKey && selectedTitlesOrder.length === 0) {
      // Use first available column only when no titles have been selected before
      const firstAvailable = columns.find(col => !['date'].includes(col.key))?.key;
      
      if (firstAvailable) {
        setActiveColumnKey(firstAvailable);
      }
    }
  }, [isFilterLayoutVisible, activeColumnKey, selectedTitlesOrder, columns]);



  ////////////////////////////////////
  // Main Render: Filter controls container
  ////////////////////////////////////
  
  return (
    <div className="my-4 relative w-full lg:w-auto">
      
      {/* Filter Controls - Column Layout */}
      <div className="flex flex-col gap-4">

        {/* Filter Toggle and Search Row - Pill Style */}
        <div className="relative lg:w-[500px] border border-border rounded-lg">
          <div className="flex items-stretch h-full">
            {/* Filter Button - Pill shaped */}
            <button
              onClick={handleFilterToggle}
              className={`flex items-center rounded-l-lg gap-2 px-4 py-2 cursor-pointer transition-colors border-r border-border duration-200 ${
                isFilterLayoutVisible || hasActiveFilters
                  ? 'bg-tertiary text-tertiary-foreground hover:bg-tertiary/90'
                  : 'bg-tertiary text-tertiary-foreground hover:bg-tertiary/90'
              }`}
            >
              <Filter className="w-4 h-4 text-background" />
              <span className="text-xs font-medium text-background">Filter</span>
              {hasActiveFilters && (
                <span className="ml-1 px-3 py-0.5 text-xs bg-foreground/30 rounded-full min-w-[18px] text-center text-background">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Search Input Container */}
            <div className="relative flex-1 max-w-full">
              <GlobalSearchBar
                searchTerm={searchTerm}
                isSearching={isSearching}
                hasSearchResults={hasSearchResults}
                onSearchTermChange={onSearchTermChange || (() => {})}
                onClearSearch={onClearSearch || (() => {})}
                placeholder="Search..."
                resultsCount={searchResultsCount}
                totalItems={totalItems}
                className="w-full h-full"
              />
              <button
                onClick={handleFilterToggle}
                className="absolute z-[1] right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors duration-200"
              >
                {isFilterLayoutVisible ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
                )}
              </button>
            </div>
          </div>
        </div>

          {/* Absolute Dropdown Layout - Always in DOM, only visually hidden */}
          <div 
            ref={dropdownRef}
            className={`absolute min-w-[calc(100vw-1.5rem)] lg:min-w-[600px] w-fit top-full left-0 right-0 z-50 mt-2 border border-border rounded-lg shadow-lg transition-all duration-200
              bg-background/80 backdrop-blur-sm ${
              isFilterLayoutVisible 
                ? 'opacity-100 visible' 
                : 'opacity-0 invisible pointer-events-none'
            }`}
          >
            <div className="flex gap-2 lg:gap-6 p-2">
              {/* Left Side - All Column Titles */}
              <ColumnTitlesList
                columns={columns}
                hiddenColumns={['date']}
                activeColumnKey={activeColumnKey}
                selectedTitlesOrder={selectedTitlesOrder}
                activeFilters={activeFilters}
                onColumnClick={handleColumnClick}
              />

              {/* Right Side - All Filter Options (visually hide inactive ones) */}
              <div className="flex-1 space-y-2 lg:space-y-4">
                {columns.map((column, index) => {
                  if (['date'].includes(column.key)) return null;
                  const isActive = activeColumnKey === column.key;
                  const { getDropdownItems, dropdownItemsFromParent } = getDropdownSourceForColumn(column, filterUniqueValues);
                  return (
                    <div
                      key={column.key}
                      className={`transition-opacity duration-200 ${isActive ? 'block' : 'hidden'}`}
                    >
                      <TableFilterList
                        columnKey={column.key}
                        columnName={column.name}
                        columnConfig={column.filterApiParams ? { filterApiParams: column.filterApiParams } : undefined}
                        isSearchFilter={column.isSearchFilter}
                        activeFilters={getActiveFiltersForColumn(activeFilters as Record<string, string[]>, column as TableColumn<unknown>)}
                        onFilterChange={(key, values) => handleFilterChange(key, values)}
                        isNumberField={column.isNumberField}
                        isDateField={column.isDateField}
                        isTimeField={column.isTimeField}
                        decimalPlaces={column.decimalPlaces}
                        formatDisplayValue={column.formatter}
                        isLastColumn={index === columns.length - 1}
                        allActiveFilterColumns={activeFilters as Record<string, string[]>}
                        autoApplyDropdown={autoApplyDropdown}
                        showBadgesDropdown={showBadgesDropdown}
                        rangeOpen={rangeOpen}
                        getDropdownItems={getDropdownItems}
                        onFilterApply={onFilterApply}
                        dropdownItemsFromParent={dropdownItemsFromParent}
                        data={data}
                        filteredData={filteredData}
                        getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

// Export component with React.memo for performance optimization
// Use a type assertion to preserve generic type
const MemoizedPillFilter = React.memo(PillFilterComponent) as <T = any>(props: HeaderFiltersWrapper2Props<T>) => React.ReactElement | null;
export { MemoizedPillFilter as PillFilter };
export default MemoizedPillFilter; 