/**
 * Filter Control Component
 * 
 * Purpose: Provides UI to filter table data via dropdown
 * Used in: FilteringWrapper below grouping control
 * Why: Clean, minimal filter control without search functionality
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import TableFilterList from "../PillFilter/TableFilterList";
import ColumnTitlesList from "../PillFilter/ColumnTitlesList";
import { TableColumn, FilterUniqueValuesMap } from "../../types";
import { getActiveFiltersForColumn, getDropdownSourceForColumn } from "../PillFilter/utils/column-filter-helpers";
import { Filter } from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Props for FilterControl component
 */
export interface FilterControlProps<T = any> {
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

/**
 * Filter Control Component
 * Provides dropdown to filter table data by columns
 */
function FilterControlComponent<T = any>({
  handleFilterChange,
  activeFilters,
  columns = [],
  autoApplyDropdown = true,
  showBadgesDropdown = true,
  rangeOpen = false,
  onFilterApply,
  filterUniqueValues = {},
  data,
  filteredData,
  getFilteredDataExcludingColumn,
}: FilterControlProps<T>) {
  // State for active column title
  const [activeColumnKey, setActiveColumnKey] = useState<string | null>(null);
  
  // State for tracking selected titles in order
  const [selectedTitlesOrder, setSelectedTitlesOrder] = useState<string[]>([]);
  
  // State for dropdown visibility
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

  // Effect to set default column when popover opens (only if no selected titles)
  useEffect(() => {
    if (isOpen && !activeColumnKey && selectedTitlesOrder.length === 0) {
      // Use first available column only when no titles have been selected before
      const firstAvailable = columns.find(col => !['date'].includes(col.key))?.key;
      
      if (firstAvailable) {
        setActiveColumnKey(firstAvailable);
      }
    }
  }, [isOpen, activeColumnKey, selectedTitlesOrder, columns]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {hasActiveFilters ? `Filters (${activeFilterCount})` : 'Filters'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="min-w-[calc(100vw-1.5rem)] lg:min-w-[600px] w-fit p-2"
      >
        <div className="flex gap-2 lg:gap-6">
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
              const { getDropdownItems, dropdownItemsFromParent } = getDropdownSourceForColumn(column as TableColumn<any>, filterUniqueValues);
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
                    activeFilters={getActiveFiltersForColumn(activeFilters, column as TableColumn<any>)}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export component with React.memo for performance optimization
// Use a type assertion to preserve generic type
const MemoizedFilterControl = React.memo(FilterControlComponent) as <T = any>(props: FilterControlProps<T>) => React.ReactElement | null;
export { MemoizedFilterControl as FilterControl };
export default MemoizedFilterControl;
