/**
 * TableFilterList Component
 * 
 * Purpose: Displays filter options as an always-visible list (no dropdown or click behavior)
 * Used in: HeaderFiltersWrapper2 for column filtering
 * Why: Provides a cleaner, more accessible interface for filter selection
 * 
 * Features:
 * - Always-visible list interface (no dropdown, no click to show)
 * - Multi-select filtering with checkboxes
 * - Real-time filtering with other column dependencies
 * - Sortable filter options
 * - No search functionality (as requested)
 * - No click-to-show behavior (as requested)
 * 
 * Steps:
 * 1. Import required dependencies and types
 * 2. Define component props and state management
 * 3. Implement filtering logic and data processing
 * 4. Handle user interactions and state updates
 * 5. Render filter UI with always-visible list layout
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Check, X, ArrowUpDown, Search } from 'lucide-react';
import { 
  isFilterActive, 
  sortOptions, 
  calculateItemCounts
} from './utils/filter-utils';
import { DateRangeInput } from './components/DateRangeInput';
import { NumberRangeInput } from './components/NumberRangeInput';

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the TableFilterList component
 * Provides all necessary data and callbacks for filtering functionality
 */
type TableFilterListProps = {
  // Column identifier for filtering
  columnKey: string;
  // Display name for the column
  columnName: string;
  // Currently active filters for this column
  activeFilters: any[];
  // Callback to update filters
  onFilterChange: (columnKey: string, values: any) => void;
  // Whether this column contains numeric data
  isNumberField?: boolean;
  // Whether this column contains date data
  isDateField?: boolean;
  // Number of decimal places for numeric formatting
  decimalPlaces?: number;
  // Custom formatter for display values
  formatDisplayValue?: (value: any) => string;
  // Whether this is the last column (for positioning)
  isLastColumn?: boolean;
  // All active filters across all columns
  allActiveFilterColumns?: Record<string, any>;
  // Whether this column contains time data
  isTimeField?: boolean;
  // Whether to auto-apply filter changes (hides apply button)
  autoApplyDropdown?: boolean;
  // Whether to show count badges in filter dropdown
  showBadgesDropdown?: boolean;
  // Whether range filters should be open by default
  rangeOpen?: boolean;
  // Optional async function to fetch dropdown items from an API endpoint
  getDropdownItems?: (columnKey: string) => Promise<Array<{ id?: string | number; item: string | number; available?: number; total?: number; count?: number }>>;
  // Callback for when filter apply button is clicked
  onFilterApply?: (key: string, items: string[], type: string, columnConfig?: { filterApiParams?: { text?: string; number?: { from: string; to: string }; date?: { start: string; end: string }; isArray?: boolean } }) => void;
  // Column configuration for custom API parameter mapping
  columnConfig?: {
    filterApiParams?: {
      text?: string;
      number?: { from: string; to: string };
      date?: { start: string; end: string };
      isArray?: boolean;
      valueField?: 'id' | 'item';
    };
  };
  // Use a search bar as the filter content instead of a dropdown list
  isSearchFilter?: boolean;
  // When provided, use these items as the filter options instead of calling getDropdownItems (e.g. from main fetch uniqueValues).
  dropdownItemsFromParent?: Array<{ id?: string | number; item: string | number; available?: number; total?: number; count?: number }>;
  // Data array for extracting unique values (fallback when API sources aren't available)
  data?: any[];
  // Filtered data array (data filtered by other columns)
  filteredData?: any[];
  // Function to get filtered data excluding a specific column
  getFilteredDataExcludingColumn?: (excludeColumnKey: string) => any[];
  // Note: Filter button props removed since we use always-visible lists
};

////////////////////////////////////
// Component Implementation: Main filtering logic
////////////////////////////////////

/**
 * List-based filter component with multi-select filtering
 * Supports number, date, time, and text filtering with real-time updates
 * 
 * @param {TableFilterListProps} props - Component props
 * @returns {JSX.Element} Complete filter list with all functionality
 */
const TableFilterList: React.FC<TableFilterListProps> = ({
  columnKey,
  columnName,
  activeFilters,
  onFilterChange,
  isNumberField,
  isDateField,
  formatDisplayValue,
  isLastColumn,
  allActiveFilterColumns,
  isTimeField = false,
  autoApplyDropdown = false,
  showBadgesDropdown = true,
  rangeOpen = true,
  getDropdownItems,
  onFilterApply,
  columnConfig,
  isSearchFilter = false,
  dropdownItemsFromParent,
  data,
  filteredData,
  getFilteredDataExcludingColumn,
}) => {
  ////////////////////////////////////
  // State Management: Component state and refs
  ////////////////////////////////////
  
  // Reference to store the latest onFilterChange callback to prevent infinite loops
  const onFilterChangeRef = useRef(onFilterChange);
  // Currently selected filter options (applied filters)
  const [selectedOptions, setSelectedOptions] = useState<string[]>(activeFilters || []);
  // Pending selections before applying filters (start with current active filters)
  const [pendingSelections, setPendingSelections] = useState<string[]>(activeFilters || []);
  
  // Sort direction for filter options
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for API-fetched dropdown items
  const [apiDropdownItems, setApiDropdownItems] = useState<Array<{ id?: string | number; item: string | number; available?: number; total?: number; count?: number }>>([]);
  const [isLoadingApiItems, setIsLoadingApiItems] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  ////////////////////////////////////
  // Effects: Side effects and lifecycle management
  ////////////////////////////////////
  
  /**
   * Update selected options when activeFilters prop changes
   * Ensures component state stays in sync with external filter changes (e.g. from table-header apply).
   * For range columns (number/date), use a value-based key so we sync when min/max or start/end change
   * even if the array reference is reused by the parent.
   */
  const activeFiltersArr = Array.isArray(activeFilters) ? activeFilters : [];
  const rangeValueKey = (isNumberField || isDateField)
    ? `${String(activeFiltersArr[0] ?? '')}|${String(activeFiltersArr[1] ?? '')}`
    : null;
  useEffect(() => {
    const next = Array.isArray(activeFilters) ? activeFilters : [];
    setSelectedOptions(next);
    setPendingSelections(next);
  }, [
    rangeValueKey,
    isNumberField,
    isDateField,
    // For non-range columns, react when parent passes new activeFilters. For range columns,
    // rangeValueKey above already tracks min/max or start/end changes when the array ref is reused.
    activeFilters,
  ]);

  /**
   * Update onFilterChangeRef when onFilterChange prop changes
   * Prevents stale closure issues
   */
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  /**
   * Auto-apply effect: Apply filters when pendingSelections change and autoApplyDropdown is enabled
   */
  useEffect(() => {
    if (autoApplyDropdown) {
      setSelectedOptions(pendingSelections);
      onFilterChangeRef.current(columnKey, pendingSelections);
    }
  }, [pendingSelections, autoApplyDropdown, columnKey]);

  /**
   * Prefer parent-provided options (from main fetch uniqueValues) when column has uniqueValues config.
   * Otherwise use getDropdownItems when provided. When dropdownItemsFromParent is passed (including []),
   * use it and do not call getDropdownItems.
   */
  useEffect(() => {
    if (dropdownItemsFromParent !== undefined) {
      setApiDropdownItems(dropdownItemsFromParent);
      setIsLoadingApiItems(false);
      setApiError(null);
      return;
    }
    if (getDropdownItems && !isDateField && !isNumberField && !isSearchFilter) {
      setIsLoadingApiItems(true);
      setApiError(null);
      getDropdownItems(columnKey)
        .then((items) => {
          setApiDropdownItems(items);
          setIsLoadingApiItems(false);
        })
        .catch((error) => {
          console.error(`Error fetching dropdown items for ${columnKey}:`, error);
          setApiError('Failed to load filter options');
          setIsLoadingApiItems(false);
          setApiDropdownItems([]);
        });
    }
  }, [getDropdownItems, columnKey, isDateField, isNumberField, isSearchFilter, dropdownItemsFromParent]);

  ////////////////////////////////////
  // Computed Values: Derived state and calculations
  ////////////////////////////////////
  
  /**
   * Check if other columns have active filters
   * Used to determine if this column's options should be filtered by other columns
   */
  const hasOtherColumnFilters = useMemo(() => {
    if (!allActiveFilterColumns) return false;
    
    return Object.entries(allActiveFilterColumns).some(([key, values]) => 
      key !== columnKey && Array.isArray(values) && values.length > 0
    );
  }, [allActiveFilterColumns, columnKey]);

  /**
   * Generate filter options from API, parent-provided dropdown items, or data extraction fallback
   * Transforms to filter options format { value, rawValue, totalCount, ... }
   */
  const filterOptions = useMemo(() => {
    // Priority 1: Use parent-provided dropdown items (from filterUniqueValues)
    // Priority 2: Use API-fetched dropdown items
    const fromParentOrApi = dropdownItemsFromParent !== undefined
      ? dropdownItemsFromParent
      : (getDropdownItems && apiDropdownItems.length > 0 ? apiDropdownItems : null);
    
    if (fromParentOrApi && fromParentOrApi.length > 0) {
      const useIdAsValue = columnConfig?.filterApiParams?.valueField === 'id';
      return fromParentOrApi.map(({ id, item, count, available, total }) => {
      const safeAvailable = available ?? count ?? 0;
      const safeTotal = total ?? count ?? 0;
        const value = useIdAsValue && id != null ? String(id) : (formatDisplayValue ? formatDisplayValue(item) : String(item));
        const rawValue = item;
      return {
        id,
          value,
          rawValue,
        totalCount: safeTotal,
        columnIndependentCount: safeAvailable,
        hasCount: true
      };
    });
    }
    
    // Priority 3: Fallback to data extraction when API sources aren't available
    if (!data || data.length === 0) return [];

    // Use a Map to track unique values and their counts
    const optionMap = new Map<string, { 
      rawValue: any;
      totalCount: number; 
      columnIndependentCount: number;
      hasCount: boolean;
      id?: string | number;
    }>();
    
    // Helper function to extract display value from object or primitive
    const extractDisplayValue = (value: any): string => {
      // Priority 1: Use formatter if available
      if (formatDisplayValue) {
        return formatDisplayValue(value);
      }
      
      // Priority 2: Handle objects (extract meaningful display values)
      if (typeof value === 'object' && value !== null) {
        if (value.username) {
          return value.username;
        } else if (value.name) {
          return value.name;
        } else if (value.email) {
          return value.email;
        } else if (value.id) {
          return String(value.id);
        } else {
          // Fallback to JSON string for complex objects
          return JSON.stringify(value);
        }
      }
      
      // Priority 3: Handle primitives
      return String(value);
    };
    
    // First pass: collect unique values from the data
    for (const item of data) {
      const rawValue = item[columnKey];
      if (rawValue === undefined || rawValue === null) continue;
      
      // Handle arrays by flattening and extracting unique values
      let valuesToProcess: any[] = [];
      if (Array.isArray(rawValue)) {
        valuesToProcess = rawValue.filter(val => val !== null && val !== undefined);
      } else {
        valuesToProcess = [rawValue];
      }
      
      // Process each value
      for (const value of valuesToProcess) {
        const stringValue = extractDisplayValue(value);
        
        if (!optionMap.has(stringValue)) {
          optionMap.set(stringValue, { 
            rawValue: value,
            totalCount: 1, 
            columnIndependentCount: 0,
            hasCount: true
          });
        } else {
          const option = optionMap.get(stringValue)!;
          option.totalCount++;
        }
      }
    }
    
    // Make sure active filters are included in the options
    for (const filter of activeFilters) {
      const stringValue = String(filter);
      if (!optionMap.has(stringValue)) {
        optionMap.set(stringValue, { 
          rawValue: filter,
          totalCount: 0, 
          columnIndependentCount: 0,
          hasCount: true
        });
      }
    }
    
    // Calculate column-independent counts using the filtered data
    const dataFilteredByOtherColumns = getFilteredDataExcludingColumn 
      ? getFilteredDataExcludingColumn(columnKey)
      : (filteredData || []);
    
    // Create a map to count occurrences of each value in the filtered data
    const filteredValueCounts: Record<string, number> = {};
    
    for (const item of dataFilteredByOtherColumns) {
      const rawValue = item[columnKey];
      if (rawValue === undefined || rawValue === null) continue;
      
      // Handle arrays by flattening and extracting unique values
      let valuesToProcess: any[] = [];
      if (Array.isArray(rawValue)) {
        valuesToProcess = rawValue.filter(val => val !== null && val !== undefined);
      } else {
        valuesToProcess = [rawValue];
      }
      
      // Process each value
      for (const value of valuesToProcess) {
        const stringValue = extractDisplayValue(value);
        filteredValueCounts[stringValue] = (filteredValueCounts[stringValue] || 0) + 1;
      }
    }
    
    // Update the column-independent counts
    for (const [stringValue, option] of optionMap.entries()) {
      option.columnIndependentCount = filteredValueCounts[stringValue] || 0;
    }
    
    return Array.from(optionMap.entries())
      .map(([stringValue, info]) => ({ 
        value: stringValue,
        rawValue: info.rawValue,
        totalCount: info.totalCount,
        columnIndependentCount: info.columnIndependentCount,
        hasCount: info.hasCount,
        id: info.id
      }));
  }, [
    dropdownItemsFromParent,
    getDropdownItems,
    apiDropdownItems,
    data,
    filteredData,
    getFilteredDataExcludingColumn,
    columnKey,
    activeFilters,
    formatDisplayValue,
    columnConfig
  ]);

  /**
   * Filter and sort options based on field type
   * Applies intelligent sorting based on data type
   */
  const filteredOptions = useMemo(() => {
    if (!filterOptions.length) return [];
    
    // Sort based on field type and selection status
    return sortOptions(
      filterOptions,
      selectedOptions,
      hasOtherColumnFilters,
      isNumberField || false,
      isDateField || false,
      isTimeField || false,
      sortDirection
    );
  }, [
    filterOptions, 
    selectedOptions, 
    hasOtherColumnFilters, 
    isNumberField,
    isDateField,
    isTimeField,
    sortDirection
  ]);

  ////////////////////////////////////
  // Event Handlers: User interaction handlers
  ////////////////////////////////////
  
  /**
   * Toggle selection of a filter option
   * Handles adding/removing options from pending selections
   * Auto-applies changes if autoApplyDropdown is enabled
   * 
   * @param {string} value - The option value to toggle
   */
  const toggleOption = useCallback((value: string) => {
    // Use a functional update to avoid state issues
    setPendingSelections(prev => {
      return prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value];
    });
  }, []);

  /**
   * Display filter key and values (for now, instead of applying)
   */
  const displayFilterValues = useCallback(() => {
    // Determine column type
    const columnType = isDateField ? 'date' : isNumberField ? 'number' : 'text';
    
    // Always use pending selections as the source of truth when applying
    // This ensures deselections are properly handled
    const itemsToSend = pendingSelections;
    
    // For text filters, map selected values to the specified field (id or item)
    let itemsForApi = itemsToSend;
    if (!isDateField && !isNumberField) {
      const valueField = columnConfig?.filterApiParams?.valueField || 'item';
      
      if (valueField === 'id') {
        // Map selected display values to IDs
        itemsForApi = itemsToSend.map(selectedValue => {
          const option = filterOptions.find(opt => opt.value === selectedValue);
          // Use ID if available, otherwise use the value
          return option?.id !== undefined ? String(option.id) : selectedValue;
        });
      } else {
        // Use the item/rawValue as-is
        itemsForApi = itemsToSend.map(selectedValue => {
          const option = filterOptions.find(opt => opt.value === selectedValue);
          // Use rawValue (item) if available, otherwise use the display value
          return option?.rawValue !== undefined ? String(option.rawValue) : selectedValue;
        });
      }
    }
    
    // Update local state immediately so UI reflects the change
    setSelectedOptions(itemsToSend);
    setPendingSelections(itemsToSend);
    
    // Update FilteringWrapper's filter state so UI shows active filters
    if (isDateField || isNumberField) {
      // For range filters, convert [start, end] to FilterValue format
      const start = itemsToSend[0] || '';
      const end = itemsToSend[1] || '';
      if (isDateField) {
        // Date range filter: { start: Date | null, end: Date | null }
        // Parse MM-DD-YYYY format to Date object
        const parseDate = (dateStr: string): Date | null => {
          if (!dateStr || !dateStr.trim()) return null;
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const [month, day, year] = parts;
            // Create date in local timezone (month is 0-indexed in JS Date)
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
          return null;
        };
        onFilterChange(columnKey, {
          start: parseDate(start),
          end: parseDate(end),
        });
      } else {
        // Number range filter: { min: number | null, max: number | null }
        onFilterChange(columnKey, {
          min: start ? Number(start) : null,
          max: end ? Number(end) : null,
        });
      }
    } else {
      // For text filters, pass array of selected strings
      onFilterChange(columnKey, itemsToSend);
    }
    
    // Call the API callback function if provided
    // Pass columnConfig so the callback can use custom API parameter mapping
    // Use itemsForApi (with IDs) instead of itemsToSend (with names) for array parameters
    if (onFilterApply) {
      onFilterApply(columnKey, itemsForApi, columnType, columnConfig);
    }
  }, [pendingSelections, selectedOptions, columnKey, isDateField, isNumberField, onFilterApply, onFilterChange, columnConfig, filterOptions]);

  /**
   * Clear all filters for this column (set to none)
   */
  const clearFilters = useCallback(() => {
    const emptyValue = (isDateField || isNumberField) ? ['', ''] : [];
    setPendingSelections(emptyValue);
    setSelectedOptions(emptyValue);
    
    // Update FilteringWrapper's filter state
    if (isDateField || isNumberField) {
      if (isDateField) {
        onFilterChangeRef.current(columnKey, { start: null, end: null });
      } else {
        onFilterChangeRef.current(columnKey, { min: null, max: null });
      }
    } else {
      onFilterChangeRef.current(columnKey, emptyValue);
    }
    
    // Always trigger API callback to remove the filter
    if (onFilterApply) {
      console.log(`[TableFilterList] ${columnKey} - Triggering onFilterApply with empty values`);
      const columnType = isDateField ? 'date' : isNumberField ? 'number' : 'text';
      onFilterApply(columnKey, emptyValue, columnType, columnConfig);
    }
  }, [autoApplyDropdown, columnKey, isDateField, isNumberField, onFilterApply, columnConfig]);

  /**
   * Cancel pending changes and revert to current active filters
   */
  const cancelFilters = useCallback(() => {
    setPendingSelections(selectedOptions);
  }, [selectedOptions]);

  /**
   * Toggle sort direction
   */
  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  /**
   * Handle range input changes (date/number)
   */
  const handleRangeChange = useCallback((start: string, end: string) => {
    setPendingSelections([start, end]);
    if (autoApplyDropdown) {
      setSelectedOptions([start, end]);
      onFilterChangeRef.current(columnKey, [start, end]);
    }
  }, [autoApplyDropdown, columnKey]);

  ////////////////////////////////////
  // Helper Functions: Filter state utilities
  ////////////////////////////////////
  
  /**
   * Check if filters are active for this column
   * Handles both string arrays and DateRangeFilter objects
   */
  const isFilterActiveValue = useMemo(() => {
    return isFilterActive(activeFilters);
  }, [activeFilters]);
  
  ////////////////////////////////////
  // Computed Values: Display calculations
  ////////////////////////////////////
  
  /**
   * Calculate item counts for display
   * Provides selected and available item counts for the header badge
   */
  const itemCounts = useMemo(() => {
    return calculateItemCounts(selectedOptions, filteredOptions, hasOtherColumnFilters);
  }, [selectedOptions, filteredOptions, hasOtherColumnFilters]);

  ////////////////////////////////////
  // Main Render: Complete component UI
  ////////////////////////////////////

  // Show range inputs for date/number types, search bar for search-filter columns, list for other text types
  const showRangeInputs = isDateField || isNumberField;
  const currentStart = showRangeInputs ? (pendingSelections[0] || '') : '';
  const currentEnd = showRangeInputs ? (pendingSelections[1] || '') : '';
  const searchValue = isSearchFilter ? (pendingSelections[0] || '') : '';

  return (
    <div className="w-full">
      {showRangeInputs ? (
        /* Range Inputs for Date/Number */
        <div className="w-full p-3">
          <div className="flex justify-end items-center mb-3">
            {isFilterActiveValue && (
              <button
                onClick={clearFilters}
                className="p-1 hover:bg-muted text-muted-foreground"
                title="Clear filters"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {isDateField ? (
            <DateRangeInput
              startDate={currentStart}
              endDate={currentEnd}
              onChange={handleRangeChange}
            />
          ) : (
            <NumberRangeInput
              minValue={currentStart}
              maxValue={currentEnd}
              onChange={handleRangeChange}
            />
          )}
          {!autoApplyDropdown && (
            <div className="flex justify-between items-center mt-4 gap-2">
              <button
                onClick={clearFilters}
                className="cursor-pointer rounded text-sm text-muted-foreground hover:text-foreground px-2 py-1 hover:bg-muted"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={cancelFilters}
                  className="cursor-pointer rounded text-sm text-muted-foreground hover:text-foreground px-3 py-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentStart === (selectedOptions[0] || '') && currentEnd === (selectedOptions[1] || '')}
                >
                  Cancel
                </button>
                <button
                  onClick={displayFilterValues}
                  className="cursor-pointer rounded text-sm px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentStart === (selectedOptions[0] || '') && currentEnd === (selectedOptions[1] || '')}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      ) : isSearchFilter ? (
        /* Search bar for search-filter columns */
        <div className="w-full p-3">
          <div className="flex justify-end items-center mb-3">
            {isFilterActiveValue && (
              <button
                onClick={clearFilters}
                className="p-1 hover:bg-muted text-muted-foreground"
                title="Clear filter"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setPendingSelections([e.target.value])}
              placeholder={`Search ${columnName.toLowerCase()}...`}
              className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          {!autoApplyDropdown && (
            <div className="flex justify-between items-center mt-4 gap-2">
              <button
                onClick={clearFilters}
                className="cursor-pointer rounded text-sm text-muted-foreground hover:text-foreground px-2 py-1 hover:bg-muted"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={cancelFilters}
                  className="cursor-pointer rounded text-sm text-muted-foreground hover:text-foreground px-3 py-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={searchValue === (selectedOptions[0] || '')}
                >
                  Cancel
                </button>
                <button
                  onClick={displayFilterValues}
                  className="cursor-pointer rounded text-sm px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={searchValue === (selectedOptions[0] || '')}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Filter options list for Text types */
        <div className="w-full">
          {/* Header with sort controls - Clean, minimal design */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSortDirection}
                className="p-1 hover:bg-muted text-muted-foreground"
                title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown size={14} />
              </button>
              {isFilterActiveValue && (
                <button
                  onClick={clearFilters}
                  className="p-1 hover:bg-muted text-muted-foreground"
                  title="Clear filters"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-64 overflow-y-auto">
            {isLoadingApiItems ? (
              <div className="p-4 text-center text-muted-foreground text-xs">Loading options...</div>
            ) : apiError ? (
              <div className="p-4 text-center text-xs text-destructive">{apiError}</div>
            ) : filteredOptions.length > 0 ? (
              <div className="space-y-1">
                {filteredOptions.map((option, index) => {
                  const isPending = pendingSelections.includes(option.value);
                  const isSelected = selectedOptions.includes(option.value);
                  
                  // 1. If it has available matches (available > 0), it's selectable
                  // 2. If it is 0, it's disabled per user request
                  const isSelectable = option.columnIndependentCount > 0 || isPending || isSelected;
                  const shouldGreyOut = option.columnIndependentCount === 0 && !isPending && !isSelected;

                  // Use formatDisplayValue for display if provided
                  const displayValue = formatDisplayValue ? formatDisplayValue(option.rawValue) : option.value;

                  return (
                    <div 
                      key={option.value}
                      className={`flex items-center py-1 px-2 rounded-l-md ${
                        isPending ? 'bg-gradient-to-r from-tertiary/20 to-transparent' : ''
                      } ${
                        isSelectable ? 'hover:bg-gradient-to-r from-tertiary/10 to-transparent cursor-pointer' : 'cursor-not-allowed opacity-50'
                      }`}
                      onClick={() => isSelectable ? toggleOption(option.value) : null}
                    >
                      <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                        isPending ? 'bg-tertiary/80 dark:bg-tertiary/20 border-tertiary/30 dark:border-tertiary' : shouldGreyOut ? 'border-muted-foreground/30 bg-muted' : 'border-border'
                      }`}>
                        {isPending && <Check size={12} className="text-tertiary-foreground" />}
                      </div>
                      <span className={`truncate flex-grow text-left text-xs ${
                        shouldGreyOut ? 'text-muted-foreground' : isPending ? 'font-medium text-tertiary' : 'text-foreground'
                      }`}>
                        {displayValue}
                      </span>
                      
                      {/* Badge showing count - Only show if count was provided by the API */}
                      {showBadgesDropdown && (
                        <div className="ml-2">
                          {isPending ? (
                            // Pending items show available/total
                            <span className="text-xs text-center px-3 py-1 rounded-full bg-tertiary/50 border border-tertiary/30 text-foreground">
                              {option.columnIndependentCount}/{option.totalCount}
                            </span>
                          ) : (
                            // Show available/total
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              shouldGreyOut 
                                ? 'bg-muted text-muted-foreground' 
                                : isSelected
                                  ? 'bg-tertiary text-tertiary-foreground'
                                  : 'bg-green-500/10 text-green-500 border border-green-500/20'
                            }`}>
                              {option.columnIndependentCount}/{option.totalCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-xs">No options available</div>
            )}
          </div>
          
          {/* Apply/Cancel/Clear buttons */}
          {!autoApplyDropdown && (
            <div className="flex justify-between items-center mt-3 gap-2">
              <button
                onClick={clearFilters}
                className="cursor-pointer rounded text-sm text-muted-foreground hover:text-foreground px-2 py-1 hover:bg-muted"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={cancelFilters}
                  className="cursor-pointer rounded text-sm text-muted-foreground hover:text-foreground px-3 py-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={JSON.stringify(pendingSelections.sort()) === JSON.stringify(selectedOptions.sort())}
                >
                  Cancel
                </button>
                <button
                  onClick={displayFilterValues}
                  className="cursor-pointer rounded text-sm px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={JSON.stringify(pendingSelections.sort()) === JSON.stringify(selectedOptions.sort())}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Export component with React.memo for performance optimization
export default React.memo(TableFilterList);
