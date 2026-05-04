/**
 * StandardFilterDropdown Component
 * 
 * Purpose: Standard filter dropdown UI for non-range filter columns
 * Used in: TableFilterDropdownOrchestrator for standard multi-select filtering
 * Why: Extracted reusable component for consistent filter dropdown UI
 * 
 * Features:
 * - Multi-select filtering with checkboxes
 * - Search functionality
 * - Virtualized option list for performance
 * - Active filters display with badges
 * - Sort controls
 * - Apply/Cancel buttons
 */

import React, { useRef } from 'react';
import { Check, X, ArrowUpDown } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';

////////////////////////////////////
// Type Definitions
////////////////////////////////////

export interface FilterOption {
  value: string;
  rawValue: any;
  totalCount: number;
  columnIndependentCount: number;
  hasCount?: boolean;
}

interface StandardFilterDropdownProps {
  // Dropdown positioning
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  isLastColumn: boolean;
  
  // Column info
  columnKey: string;
  columnName: string;
  
  // Filter state
  activeFilters: any[];
  pendingSelections: string[];
  isFilterActive: boolean;
  
  // Options
  filteredOptions: FilterOption[];
  isOptionsLoaded: boolean;
  
  // Search
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  
  // Sort
  sortDirection: 'asc' | 'desc';
  onToggleSort: () => void;
  
  // Actions
  onToggleOption: (value: string) => void;
  onClearFilters: (apply?: boolean) => void;
  onRemoveFilter: (filterValue: string) => void;
  onApplyFilters: () => void;
  onCancel: () => void;
  
  // Display
  formatDisplayValue?: (value: any) => string;
  itemCounts: {
    selectedCount: number;
    availableCount: number;
  };
  
  // Configuration
  autoApplyDropdown?: boolean;
  showBadgesDropdown?: boolean;
  allActiveFilterColumns?: Record<string, any>;
  
  // Optional range filter content (for date, number, time fields)
  rangeFilterContent?: React.ReactNode;
}

////////////////////////////////////
// Component Implementation
////////////////////////////////////

/**
 * Standard filter dropdown component for multi-select filtering
 * Provides consistent UI for all non-range filter columns
 * 
 * @param {StandardFilterDropdownProps} props - Component props
 * @returns {JSX.Element} Complete filter dropdown UI
 */
export function StandardFilterDropdown({
  dropdownRef,
  isLastColumn,
  columnKey,
  columnName,
  activeFilters,
  pendingSelections,
  isFilterActive,
  filteredOptions,
  isOptionsLoaded,
  searchInputRef,
  searchTerm,
  onSearchChange,
  sortDirection,
  onToggleSort,
  onToggleOption,
  onClearFilters,
  onRemoveFilter,
  onApplyFilters,
  onCancel,
  formatDisplayValue,
  itemCounts,
  autoApplyDropdown = true,
  showBadgesDropdown = true,
  allActiveFilterColumns = {},
  rangeFilterContent
}: StandardFilterDropdownProps) {
  
  // Check if other columns have active filters
  const hasOtherColumnFilters = Object.entries(allActiveFilterColumns)
    .some(([key, values]) => {
      if (key === columnKey) return false;
      if (values === null || values === undefined) return false;
      if (Array.isArray(values)) return values.length > 0;
      if (typeof values === 'object') return true; // Handle date range filters
      return false;
    });

  return (
    <div
      ref={dropdownRef}
      className={`absolute z-30 mt-1 bg-background/80 backdrop-blur-sm border border-border dark:border-border/50 rounded shadow-lg overflow-hidden w-64 ${
        isLastColumn ? 'right-0' : 'left-0'
      }`}
    >
      {/* Header with title and sort controls */}
      <div className="p-3 border-b border-border dark:border-border/50 bg-tertiary/20 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-tertiary">Filter: {columnName}</h3>
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-tertiary/20 text-tertiary rounded-full">
            {itemCounts.selectedCount}/{itemCounts.availableCount}
          </span>
        </div>
        <div className="flex items-center">
          <button
            onClick={onToggleSort}
            className="p-1 rounded-md hover:bg-primary-foreground/20 focus:outline-none"
            title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown size={14} className={`text-tertiary transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Active filters display */}
      {isFilterActive && showBadgesDropdown && (
        <div className="p-3 pb-2 bg-foreground/5 border-b border-border dark:border-border/50">
          <div className="flex items-center justify-between">
            <div className="text-xs mb-1 text-foreground">Active Filters:</div>
            <button 
              className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onClearFilters(true)}
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap mt-1 max-h-16 overflow-y-auto pr-1">
            {Array.isArray(activeFilters) ? (
              // Handle string array filters
              activeFilters.map((filter, index) => {
                // Find the raw value from filteredOptions to properly format the badge
                const option = filteredOptions.find(opt => opt.value === String(filter));
                const rawValue = option?.rawValue ?? filter;
                
                // Format the display value using the raw value if formatter is available
                const displayValue = formatDisplayValue ? formatDisplayValue(rawValue) : String(filter);
                const countPart = option && option.hasCount ? ` (${option.columnIndependentCount}/${option.totalCount})` : '';
                  
                return (
                  <span key={index} className="text-xs inline-flex items-center bg-tertiary/50 border border-tertiary/20 text-background rounded px-1 py-0.5 mr-1 mb-1">
                    {displayValue}{countPart}
                    <button 
                      className="ml-1 hover:bg-tertiary/30 rounded-full cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFilter(filter);
                      }}
                    >
                      <X size={12}/>
                    </button>
                  </span>
                );
              })
            ) : (
              // Handle DateRangeFilter objects
              activeFilters && typeof activeFilters === 'object' && 'start' in activeFilters && (
                <span className="inline-flex items-center bg-tertiary/50 border border-tertiary/30 text-foreground rounded px-1 py-0.5 mr-1 mb-1">
                  Date Range Filter
                  <button 
                    className="ml-1 hover:bg-tertiary/30 rounded-full cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearFilters();
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )
            )}
          </div>
        </div>
      )}
      
      {/* Range filter content (date range, number range, etc.) */}
      {rangeFilterContent && (
        <div className="border-b border-border dark:border-border/50">
          {rangeFilterContent}
        </div>
      )}
      
      {/* Search input */}
      <div className="p-3 border-b border-border dark:border-border/50">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search..."
          className="w-full p-2 bg-transparent text-foreground border-b border-border dark:border-border/50 text-sm focus:outline-none focus:border-b-tertiary dark:focus:border-b-tertiary/50 transition-colors duration-200 placeholder:text-muted-foreground"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Main content area with flex layout */}
      <div className="flex flex-col">
        {/* Filter options list - scrollable area */}
        <div className="flex-1 min-h-0 p-2 overflow-y-auto">
          {!isOptionsLoaded ? (
            <div className="p-4 text-center text-muted-foreground text-xs">Loading options...</div>
          ) : filteredOptions.length > 0 ? (
            <div className="h-[23vh] max-h-[224px]">
              <List
                height={224}
                itemCount={filteredOptions.length}
                itemSize={35}
                width="100%"
                className="overflow-y-auto"
              >
                {({ index, style }) => {
                  const option = filteredOptions[index];
                  const isSelected = pendingSelections.includes(option.value);
                  
                  // In independent facet mode, disable if 0 per user request
                  const isSelectable = option.columnIndependentCount > 0 || isSelected;
                  const shouldGreyOut = option.columnIndependentCount === 0 && !isSelected;

                  // Use formatDisplayValue for display if provided
                  const displayValue = formatDisplayValue ? formatDisplayValue(option.rawValue) : option.value;

                  return (
                    <div 
                      style={style}
                      className={`flex items-center py-1 px-2 rounded-l-md group ${
                        isSelected ? 'bg-gradient-to-r from-tertiary/20 to-transparent' : ''
                      } ${
                        isSelectable ? 'hover:bg-gradient-to-r from-tertiary/10 to-transparent cursor-pointer' : 'cursor-not-allowed opacity-50'
                      }`}
                      onClick={() => isSelectable ? onToggleOption(option.value) : null}
                    >
                      <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                        isSelected ? 'bg-tertiary/80 dark:bg-tertiary/20 border-tertiary/30 dark:border-tertiary' : shouldGreyOut ? 'border-muted-foreground/30 bg-muted' : 'border-foreground/40 group-hover:border-tertiary/60 transition-colors duration-200'
                      }`}>
                        {isSelected && <Check size={12} className="text-tertiary-foreground" />}
                      </div>
                      <span className={`truncate flex-grow text-left text-xs ${
                        shouldGreyOut ? 'text-muted-foreground' : isSelected ? 'font-medium text-tertiary' : 'text-foreground'
                      }`}>
                        {displayValue}
                      </span>
                      
                      {/* Badge showing count */}
                      {showBadgesDropdown && (
                        <div className="ml-2">
                          {/* Show available/total */}
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            isSelected 
                              ? 'bg-tertiary text-tertiary-foreground' :
                            shouldGreyOut 
                              ? 'bg-muted text-muted-foreground' : 
                              'bg-green-500/10 text-green-500 border border-green-500/20'
                          }`}>
                            {option.columnIndependentCount}/{option.totalCount}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }}
              </List>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-xs">No results found</div>
          )}
        </div>
        
        {/* Apply/Clear buttons - separate row with proper spacing */}
        <div className="p-3 border-t border-border dark:border-border/50 bg-foreground/5 flex justify-between items-center z-10">
          <button
            onClick={() => onClearFilters(true)}
            className="cursor-pointer text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-background"
          >
            Clear
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="cursor-pointer text-sm px-3 py-1 text-foreground rounded hover:bg-background"
            >
              Cancel
            </button>
            {!autoApplyDropdown && (
              <button
                onClick={onApplyFilters}
                className="cursor-pointer text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={pendingSelections.length === 0 && !isFilterActive}
              >
                Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

