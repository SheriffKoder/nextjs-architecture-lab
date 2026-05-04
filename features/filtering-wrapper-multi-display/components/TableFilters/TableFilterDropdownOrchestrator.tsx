/**
 * VirtualizedTableFilterDropdown Component
 * 
 * Purpose: Provides advanced filtering capabilities for virtualized table columns
 * Used in: VirtualizedTableHeader component for column filtering
 * Why: Enables users to filter table data by column values with search, multi-select, and range filtering
 * 
 * Features:
 * - Multi-select filtering with search functionality
 * - Number range filtering with min/max inputs
 * - Date range filtering with date pickers
 * - Time range filtering with time inputs
 * - Real-time filtering with other column dependencies
 * - Sortable filter options
 * - Virtualized option list for performance
 * - Configurable UI: Default filter icon or useFilterIcon
 * 
 * Steps:
 * 1. Import required dependencies and types
 * 2. Define component props and state management
 * 3. Implement filtering logic and data processing
 * 4. Handle user interactions and state updates
 * 5. Render filter UI with proper layout and styling
 * 6. Support both default filter icon and useFilterIcon modes
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ListFilter, Check, X, ArrowUpDown, Search } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import NumberRangeFilter from './NumberRangeFilter';
import DateRangeFilter from './DateRangeFilter';
import TimeRangeFilter from './TimeRangeFilter';
import DateSelectorDropdown from './ReactDateFilterDropDown';
import { FilterBoxButton } from './filter-box-button';
import { StandardFilterDropdown } from './StandardFilterDropdown';
import { NumberRangeInput } from '../PillFilter/components/NumberRangeInput';
import { DateRangeInput } from '../PillFilter/components/DateRangeInput';
import { DropdownOptionFromFacet } from '../../types/filter-facets';

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the VirtualizedTableFilterDropdown component
 * Provides all necessary data and callbacks for filtering functionality
 */
type VirtualizedTableFilterProps = {
  // Column identifier for filtering
  columnKey: string;
  // Display name for the column
  columnName: string;
  // Complete dataset for option generation
  data: any[];
  // Currently filtered dataset
  filteredData: any[];
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
  // Whether this is the last column (for dropdown positioning)
  isLastColumn?: boolean;
  // All active filters across all columns
  allActiveFilterColumns?: Record<string, any>;
  // Function to get data filtered by other columns
  getFilteredDataExcludingColumn?: (excludeColumnKey: string) => any[];
  // Pre-calculated item counts for performance
  availableItemCounts?: Map<string, number>;
  // Whether this column contains time data
  isTimeField?: boolean;
  // Whether to auto-apply filter changes (hides apply button)
  autoApplyDropdown?: boolean;
  // Whether to show count badges in filter dropdown
  showBadgesDropdown?: boolean;
  // Whether range filters should be open by default
  rangeOpen?: boolean;
  // Whether to use useFilterIcon instead of default filter icon
  useFilterIcon?: boolean;
  // Custom button text for useFilterIcon
  useFilterIconText?: string;
  // Custom width for useFilterIcon
  useFilterIconWidth?: string;
  // Optional Lucide icon component for filter buttons
  filterIcon?: React.ComponentType<{ size?: number; className?: string }>;
  // When provided, use as filter options (same as pill filters). Prefer over data-derived options.
  dropdownItemsFromParent?: DropdownOptionFromFacet[];
  // When provided and dropdownItemsFromParent is not set, fetch options from API/ENUMs (same as pill filters).
  getDropdownItems?: (columnKey: string) => Promise<DropdownOptionFromFacet[]>;
  // Callback when filter apply is clicked (same as pill filters). Used for API param mapping + refetch.
  onFilterApply?: (key: string, items: string[], type: string, columnConfig?: { filterApiParams?: { text?: string; number?: { from: string; to: string }; date?: { start: string; end: string }; isArray?: boolean; valueField?: 'id' | 'item' } }) => void;
  // Column config for API param mapping (filterApiParams).
  columnConfig?: { filterApiParams?: { text?: string; number?: { from: string; to: string }; date?: { start: string; end: string }; isArray?: boolean; valueField?: 'id' | 'item' } };
  // Use search bar as filter content instead of dropdown list (same as pill filters).
  isSearchFilter?: boolean;
};

////////////////////////////////////
// Component Implementation: Main filtering logic
////////////////////////////////////

/**
 * Advanced filter dropdown component with multi-select, range filtering, and search
 * Supports number, date, time, and text filtering with real-time updates
 * 
 * @param {VirtualizedTableFilterProps} props - Component props
 * @returns {JSX.Element} Complete filter dropdown with all functionality
 * 
 * @example
 * ```tsx
 * <VirtualizedTableFilterDropdown
 *   columnKey="name"
 *   columnName="Name"
 *   data={tableData}
 *   filteredData={filteredData}
 *   activeFilters={activeFilters}
 *   onFilterChange={handleFilterChange}
 *   isLastColumn={true}
 *   useFilterIcon={true}
 *   useFilterIconText="Filter Names"
 *   useFilterIconWidth="180px"
 * />
 * ```
 */
const VirtualizedTableFilter: React.FC<VirtualizedTableFilterProps> = ({
  columnKey,
  columnName,
  data,
  filteredData,
  activeFilters,
  onFilterChange,
  isNumberField,
  isDateField,
  decimalPlaces,
  formatDisplayValue,
  isLastColumn,
  allActiveFilterColumns,
  getFilteredDataExcludingColumn,
  availableItemCounts,
  isTimeField = false,
  autoApplyDropdown = false,
  showBadgesDropdown = true,
  rangeOpen = true,
  useFilterIcon = true,
  useFilterIconText,
  useFilterIconWidth = "200px",
  filterIcon,
  dropdownItemsFromParent,
  getDropdownItems,
  onFilterApply,
  columnConfig,
  isSearchFilter = false,
}) => {
  ////////////////////////////////////
  // State Management: Component state and refs
  ////////////////////////////////////
  
  // Dropdown visibility state
  const [isOpen, setIsOpen] = useState(false);
  // Search term for filtering options
  const [searchTerm, setSearchTerm] = useState('');
  // Reference to dropdown container for click outside handling
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Reference to search input for auto-focus
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Reference to store the latest onFilterChange callback to prevent infinite loops
  const onFilterChangeRef = useRef(onFilterChange);
  // Track if this is the initial mount to prevent auto-apply from clearing initial filters
  const isInitialMountRef = useRef(true);
  // Currently selected filter options
  const [selectedOptions, setSelectedOptions] = useState<string[]>(activeFilters || []);
  // Whether filter options have been loaded
  const [isOptionsLoaded, setIsOptionsLoaded] = useState(false);
  // Pending selections before applying filters
  // Initialize from activeFilters to prevent autoApplyDropdown from clearing initial filters
  const [pendingSelections, setPendingSelections] = useState<string[]>(activeFilters || []);
  
  // Number range filter state
  const [minNumberInput, setMinNumberInput] = useState<string>("");
  const [maxNumberInput, setMaxNumberInput] = useState<string>("");
  const [isNumberFilterActive, setIsNumberFilterActive] = useState<boolean>(false);
  const [numberFilteredData, setNumberFilteredData] = useState<any[]>([]);
  
  // Date range filter state
  const [startDateInput, setStartDateInput] = useState<string>("");
  const [endDateInput, setEndDateInput] = useState<string>("");
  const [isDateFilterActive, setIsDateFilterActive] = useState<boolean>(false);
  const [dateFilteredData, setDateFilteredData] = useState<any[]>([]);
  
  // Time range filter state
  const [timeFilteredData, setTimeFilteredData] = useState<any[]>([]);
  
  // Sort direction for filter options
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Expandable sections state
  const [isTimeRangeExpanded, setIsTimeRangeExpanded] = useState(rangeOpen);
  const [isNumberRangeExpanded, setIsNumberRangeExpanded] = useState(rangeOpen);
  const [isDateRangeExpanded, setIsDateRangeExpanded] = useState(rangeOpen);

  // Options from getDropdownItems when dropdownItemsFromParent is not provided (align with pill filters)
  const [apiDropdownItems, setApiDropdownItems] = useState<DropdownOptionFromFacet[]>([]);

  ////////////////////////////////////
  // Effects: Side effects and lifecycle management
  ////////////////////////////////////

  /** Load options from getDropdownItems when dropdown opens and parent has not provided options. */
  useEffect(() => {
    if (!isOpen || dropdownItemsFromParent !== undefined || !getDropdownItems || isDateField || isNumberField || isSearchFilter) {
      return;
    }
    setApiDropdownItems([]);
    getDropdownItems(columnKey)
      .then((items) => setApiDropdownItems(items || []))
      .catch(() => setApiDropdownItems([]));
  }, [isOpen, columnKey, getDropdownItems, dropdownItemsFromParent, isDateField, isNumberField, isSearchFilter]);

  /**
   * Update selected options when activeFilters prop changes
   * Ensures component state stays in sync with external filter changes
   */
  useEffect(() => {
    setSelectedOptions(activeFilters || []);
  }, [activeFilters]);

  /**
   * Handle click outside dropdown to close it
   * Improves UX by allowing users to close dropdown by clicking elsewhere
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Auto-focus search input when dropdown opens
   * Improves UX by allowing immediate typing without clicking
   */
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Sync pendingSelections with activeFilters when they change
  // This ensures pendingSelections stays in sync with external filter changes (e.g., initial filters)
  useEffect(() => {
    // Only update if activeFilters actually changed and doesn't match pendingSelections
    // This prevents unnecessary updates and potential loops
    const currentActiveFilters = activeFilters || [];
    if (JSON.stringify(currentActiveFilters.sort()) !== JSON.stringify(pendingSelections.sort())) {
      setPendingSelections(currentActiveFilters);
    }
  }, [activeFilters]);

  // Initialize pendingSelections when the dropdown opens (fallback for when dropdown wasn't open during activeFilters change)
  useEffect(() => {
    if (isOpen) {
      setPendingSelections(activeFilters || []);
    }
  }, [isOpen]);

  // Update the ref when onFilterChange changes
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  ////////////////////////////////////
  // Computed Values: Derived state and calculations
  ////////////////////////////////////
  
  /**
   * Check if other columns have active filters
   * Used to determine if this column's options should be filtered by other columns
   */
  const hasOtherColumnFilters = useMemo(() => {
    if (!allActiveFilterColumns) return false;
    
    for (const [key, values] of Object.entries(allActiveFilterColumns)) {
      // Check if values is an array and has items, or if it's a non-null object (for date filters)
      if (key !== columnKey && values !== null && values !== undefined) {
        if (Array.isArray(values) && values.length > 0) {
          return true;
        } else if (typeof values === 'object' && !Array.isArray(values)) {
          // Handle date range filters or other object-based filters
          return true;
        }
      }
    }
    
    return false;
  }, [allActiveFilterColumns, columnKey]);

  /**
   * Get data filtered by other columns only
   * Used to calculate available options when other filters are active
   */
  const getFilteredDataForThisColumn = useMemo(() => {
    if (getFilteredDataExcludingColumn) {
      return getFilteredDataExcludingColumn(columnKey);
    }
    
    if (!allActiveFilterColumns || Object.keys(allActiveFilterColumns).length === 0) {
      return data;
    }
    
    // Use the filtered data as our base to ensure we respect all active filters
    return filteredData;
  }, [filteredData, data, columnKey, allActiveFilterColumns, getFilteredDataExcludingColumn]);

  /**
   * Generate filter options from data with counts
   * When dropdownItemsFromParent or getDropdownItems result is provided (same config as pill filters), use that.
   * Otherwise creates unique options from data with total and filtered counts.
   */
  const filterOptions = useMemo(() => {
    const fromParentOrApi = dropdownItemsFromParent !== undefined
      ? dropdownItemsFromParent
      : (getDropdownItems && apiDropdownItems.length > 0 ? apiDropdownItems : null);
    if (fromParentOrApi && isOpen) {
      const useIdAsValue = columnConfig?.filterApiParams?.valueField === 'id';
      return fromParentOrApi.map(({ id, item, count, available, total }) => {
        const safeAvailable = available ?? count ?? 0;
        const safeTotal = total ?? count ?? 0;
        const value = useIdAsValue && id != null ? String(id) : (formatDisplayValue ? formatDisplayValue(item) : String(item));
        const rawValue = item;
        return {
          value,
          rawValue,
          totalCount: safeTotal,
          columnIndependentCount: safeAvailable,
          hasCount: true
        };
      });
    }
    if (!isOpen || !isOptionsLoaded || !data || data.length === 0) return [];

    // Use a Map to track unique values and their counts
    const optionMap = new Map<string, { 
      rawValue: any;
      totalCount: number; 
      columnIndependentCount: number;
      hasCount: boolean;
    }>();
    
    // Helper function to extract display value from object or primitive
    // Uses formatter if available, otherwise falls back to object extraction
    // The formatter should revert the cellRenderer format for filtering to happen on the correct data format
    const extractDisplayValue = (value: any): string => {
      // Priority 1: Use formatter if available (converts raw → formatted display)
      if (formatDisplayValue) {
        return formatDisplayValue(value);
      }
      
      // Priority 2: Handle objects (extract meaningful display values)
      if (typeof value === 'object' && value !== null) {
        // For user objects, try to get a meaningful display value
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
      
      // Priority 3: Handle primitives (strings, numbers, booleans, etc.)
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
        // Use formatter to convert raw value to formatted display string
        // This ensures filter options show formatted values (e.g., "Jan 5, 2026")
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
    // Active filters are already formatted strings, so we need to find their raw values
    for (const filter of activeFilters) {
      const stringValue = String(filter);
      if (!optionMap.has(stringValue)) {
        // If filter is a formatted string, we need to store it as-is
        // The rawValue will be the filter itself (formatted string)
        optionMap.set(stringValue, { 
          rawValue: filter,
          totalCount: 0, 
          columnIndependentCount: 0,
          hasCount: true
        });
      }
    }
    
    // Calculate column-independent counts using the filtered data
    const dataFilteredByOtherColumns = getFilteredDataForThisColumn;
    
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
        // Use formatter to convert raw value to formatted display string for counting
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
        hasCount: info.hasCount
      }));
  }, [
    isOpen,
    isOptionsLoaded,
    data,
    getFilteredDataForThisColumn,
    columnKey,
    activeFilters,
    formatDisplayValue,
    dropdownItemsFromParent,
    getDropdownItems,
    apiDropdownItems,
    columnConfig,
  ]);

  ////////////////////////////////////
  // Utility Functions: Helper functions for data processing
  ////////////////////////////////////
  
  /**
   * Convert time string to minutes for comparison
   * Supports HH:MM:SS and HH:MM formats for chronological sorting
   * 
   * @param {string} timeStr - Time string to convert
   * @returns {number} Minutes since midnight, or -1 if invalid
   */
  const timeToMinutes = (timeStr: string): number => {
    // Check if the string matches the HH:MM:SS or HH:MM format
    const timeRegex = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/;
    const match = timeStr.match(timeRegex);
    
    if (!match) return -1;
    
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    // Seconds are optional
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return -1;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return -1;
    
    // Convert to total minutes (including fractional minutes for seconds)
    return hours * 60 + minutes + seconds / 60;
  };

  ////////////////////////////////////
  // Data Processing: Filter and sort options
  ////////////////////////////////////
  
  /**
   * Filter and sort options based on search term and field type
   * Applies search filtering and intelligent sorting based on data type
   */
  const filteredOptions = useMemo(() => {
    if (!filterOptions.length) return [];
    
    // First filter by search term
    let options = filterOptions;
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      options = options.filter(option => 
        option.value.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Update option counts based on availableItemCounts
    if (availableItemCounts) {
      options = options.map(option => ({
        ...option,
        columnIndependentCount: availableItemCounts.get(option.value) || 0,
        totalCount: option.totalCount, // preserve
        hasCount: option.hasCount // preserve
      }));
    }
    
    // Then sort based on field type and selection status
    let sortedOptions = options.sort((a, b) => {
      // First priority: selected items come first
      const aSelected = selectedOptions.includes(a.value);
      const bSelected = selectedOptions.includes(b.value);
      
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      
      // Second priority: if other filters are active, sort by availability
      if (hasOtherColumnFilters) {
        const aAvailable = a.columnIndependentCount > 0;
        const bAvailable = b.columnIndependentCount > 0;
        
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
      }
      
      // Third priority: for number fields, sort by numeric value
      if (isNumberField) {
        // Parse values as numbers for comparison
        const aValue = parseFloat(a.value);
        const bValue = parseFloat(b.value);
        
        // If both are valid numbers, sort numerically
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return aValue - bValue;
        }
        
        // If only one is a valid number, put the number first
        if (!isNaN(aValue)) return -1;
        if (!isNaN(bValue)) return 1;
      }
      // For date fields (MM/DD/YYYY format), sort chronologically
      else if (isDateField) {
        // Try to parse as dates (MM/DD/YYYY)
        const aParts = a.value.split('/');
        const bParts = b.value.split('/');
        
        if (aParts.length === 3 && bParts.length === 3) {
          // Convert to YYYY-MM-DD for proper string comparison
          const aDate = `${aParts[2]}-${aParts[0]}-${aParts[1]}`;
          const bDate = `${bParts[2]}-${bParts[0]}-${bParts[1]}`;
          return aDate.localeCompare(bDate);
        }
      }
      // For time fields (HH:MM:SS or HH:MM format), sort chronologically
      else if (isTimeField) {
        const aMinutes = timeToMinutes(a.value);
        const bMinutes = timeToMinutes(b.value);
        
        // If both are valid times, sort chronologically
        if (aMinutes >= 0 && bMinutes >= 0) {
          return aMinutes - bMinutes;
        }
        
        // If only one is a valid time, put the valid time first
        if (aMinutes >= 0) return -1;
        if (bMinutes >= 0) return 1;
      }
      
      // Fourth priority: for text fields, sort alphabetically
      const aStr = String(a.value).toLowerCase();
      const bStr = String(b.value).toLowerCase();
      
      // Try to detect if these are numbers in strings and sort numerically
      const aNum = parseFloat(aStr);
      const bNum = parseFloat(bStr);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      // Default to alphabetical sorting
      return aStr.localeCompare(bStr);
    });
    
    // Apply sort direction (reverse if descending)
    if (sortDirection === 'desc') {
      // Keep selected items at the top even in descending order
      const selectedItems = sortedOptions.filter(option => selectedOptions.includes(option.value));
      const unselectedItems = sortedOptions.filter(option => !selectedOptions.includes(option.value));
      
      // Reverse only the unselected items
      return [...selectedItems, ...unselectedItems.reverse()];
    }
    
    return sortedOptions;
  }, [
    filterOptions, 
    searchTerm, 
    selectedOptions, 
    hasOtherColumnFilters, 
    isNumberField,
    isDateField,
    isTimeField,
    availableItemCounts,
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
   * Auto-apply effect: Apply filters when pendingSelections change and autoApplyDropdown is enabled
   * Skips on initial mount to prevent clearing initial filters
   */
  useEffect(() => {
    // Skip on initial mount - initial filters are already set, don't override them
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    
    if (autoApplyDropdown) {
      setSelectedOptions(pendingSelections);
      onFilterChangeRef.current(columnKey, pendingSelections);
      onFilterApply?.(columnKey, pendingSelections, 'text', columnConfig);
    }
  }, [pendingSelections, autoApplyDropdown, columnKey, onFilterApply, columnConfig]);

  /**
   * Apply filters - simplified without date handling
   */
  const applyFilters = useCallback(() => {
    setSelectedOptions(pendingSelections);
    onFilterChangeRef.current(columnKey, pendingSelections);
    onFilterApply?.(columnKey, pendingSelections, 'text', columnConfig);
  }, [pendingSelections, columnKey, onFilterApply, columnConfig]);

  /**
   * Remove a single filter value
   * Removes the specified filter from active filters
   * 
   * @param {string} filterValue - The filter value to remove
   */
  const removeFilter = useCallback((filterValue: string) => {
    const newFilters = Array.isArray(activeFilters) 
      ? activeFilters.filter(f => f !== filterValue)
      : [];
    onFilterChangeRef.current(columnKey, newFilters);
    setSelectedOptions(newFilters);
    setPendingSelections(newFilters);
  }, [activeFilters, columnKey]);

  /**
   * Clear filters
   */
  const clearFilters = useCallback((apply: boolean = false) => {
    setPendingSelections([]);
    setSelectedOptions([]);
    onFilterChangeRef.current(columnKey, []);
    
    // ✅ Use the dedicated date clear function
    handleClearDateFilter();
    
    if (apply) {
      onFilterApply?.(columnKey, [], 'text', columnConfig);
    }
    // setIsOpen(false);
  }, [columnKey, onFilterApply, columnConfig]);

  ////////////////////////////////////
  // Range Filter Handlers: Number, date, and time range filtering
  ////////////////////////////////////
  
  /**
   * Handle number range filter data changes
   * Processes filtered data from number range component and applies filters
   * 
   * @param {any[]} filteredData - Data filtered by number range
   */
  const handleNumberFilteredData = (filteredData: any[]) => {
    // Create a set of values that match our number filter criteria
    const matchingValues = new Set<string>();
    filteredData.forEach(item => {
      const value = item[columnKey];
      if (value !== undefined && value !== null) {
        matchingValues.add(String(value));
      }
    });
    
    // Filter to only include values that are available based on current filters
    const availableFilteredValues = new Set<string>();
    if (availableItemCounts) {
      // Use the pre-calculated available item counts
      for (const [value, count] of availableItemCounts.entries()) {
        if (count > 0 && matchingValues.has(value)) {
          availableFilteredValues.add(value);
        }
      }
    } else {
      // Fallback to using the matching values directly
      matchingValues.forEach(value => availableFilteredValues.add(value));
    }
    
    // Convert to array
    const filteredValues = Array.from(availableFilteredValues);
    
    // Apply the filter
    setSelectedOptions(filteredValues);
    onFilterChangeRef.current(columnKey, filteredValues);
    onFilterApply?.(columnKey, [minNumberInput, maxNumberInput], 'number', columnConfig);
  };

  /**
   * Handle number range filter state changes
   * Updates local state for number range inputs
   * 
   * @param {string} min - Minimum value
   * @param {string} max - Maximum value
   * @param {boolean} isActive - Whether filter is active
   */
  const handleNumberFilterChange = (min: string, max: string, isActive: boolean) => {
    setMinNumberInput(min);
    setMaxNumberInput(max);
    setIsNumberFilterActive(isActive);
  };

  /**
   * Clear number range filter
   * Resets number filter state and clears applied filters
   */
  const handleClearNumberFilter = () => {
    // Reset the number filter state
    setMinNumberInput("");
    setMaxNumberInput("");
    setIsNumberFilterActive(false);
    
    // Clear the filter immediately
    setSelectedOptions([]);
    onFilterChangeRef.current(columnKey, []);
  };

  /**
   * Handle date range filter data changes
   * Processes filtered data from date range component and applies filters
   * 
   * @param {any[]} filteredData - Data filtered by date range
   */
  const handleDateFilteredData = (filteredData: any[]) => {
    // Create a set of values that match our date filter criteria
    const matchingValues = new Set<string>();
    filteredData.forEach(item => {
      const value = item[columnKey];
      if (value !== undefined && value !== null) {
        matchingValues.add(String(value));
      }
    });
    
    // Filter to only include values that are available based on current filters
    const availableFilteredValues = new Set<string>();
    if (availableItemCounts) {
      // Use the pre-calculated available item counts
      for (const [value, count] of availableItemCounts.entries()) {
        if (count > 0 && matchingValues.has(value)) {
          availableFilteredValues.add(value);
        }
      }
    } else {
      // Fallback to using the matching values directly
      matchingValues.forEach(value => availableFilteredValues.add(value));
    }
    
    // Convert to array
    const filteredValues = Array.from(availableFilteredValues);
    
    // Apply the filter
    setSelectedOptions(filteredValues);
    onFilterChangeRef.current(columnKey, filteredValues);
    onFilterApply?.(columnKey, [startDateInput, endDateInput], 'date', columnConfig);
  };

  /**
   * Handle date range filter state changes
   * Updates local state for date range inputs
   * 
   * @param {string} start - Start date
   * @param {string} end - End date
   * @param {boolean} isActive - Whether filter is active
   */
  const handleDateFilterChange = (start: string, end: string, isActive: boolean) => {
    setStartDateInput(start);
    setEndDateInput(end);
    setIsDateFilterActive(isActive);
  };

  /**
   * Clear date range filter
   * Resets date filter state and clears applied filters
   */
  const handleClearDateFilter = () => {
    // Reset the date filter state
    setStartDateInput("");
    setEndDateInput("");
    setIsDateFilterActive(false);
    
    // Clear the filter immediately
    setSelectedOptions([]);
    onFilterChangeRef.current(columnKey, []);
  };

  /**
   * Handle time range filter data changes
   * Processes filtered data from time range component and applies filters
   * 
   * @param {any[]} filteredData - Data filtered by time range
   */
  const handleTimeFilteredData = (filteredData: any[]) => {
    // Get the data that's already filtered by other columns
    const dataFilteredByOtherColumns = getFilteredDataExcludingColumn ? 
      getFilteredDataExcludingColumn(columnKey) : 
      data;
    
    // Create a set of values that are available in the data filtered by other columns
    const availableValues = new Set<string>();
    dataFilteredByOtherColumns.forEach(item => {
      const value = item[columnKey];
      if (value !== undefined && value !== null) {
        availableValues.add(String(value));
      }
    });
    
    // Now filter the time-filtered data to only include values that are available
    const finalFilteredValues = new Set<string>();
    filteredData.forEach(item => {
      const value = item[columnKey];
      if (value !== undefined && value !== null) {
        const stringValue = String(value);
        if (availableValues.has(stringValue)) {
          finalFilteredValues.add(stringValue);
        }
      }
    });
    
    // Convert to array
    const filteredValues = Array.from(finalFilteredValues);
    
    // Apply the filter
    setSelectedOptions(filteredValues);
    onFilterChangeRef.current(columnKey, filteredValues);
  };

  /**
   * Toggle sort direction for filter options
   * Switches between ascending and descending order
   */
  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  ////////////////////////////////////
  // Render Functions: UI component rendering
  ////////////////////////////////////
  
  /**
   * Render number range filter component
   * Provides expandable number range filtering interface
   * 
   * @returns {JSX.Element} Number range filter UI
   */
  const renderNumberRangeFilter = () => {
    return (
      <div className="border-t border-b border-border">
        <div 
          className="p-2 bg-background/10 flex justify-between items-center cursor-pointer"
          onClick={() => setIsNumberRangeExpanded(!isNumberRangeExpanded)}
        >
          <span className="text-sm font-medium">Filter by range</span>
          <button className="text-gray-500">
            {isNumberRangeExpanded ? '−' : '+'}
          </button>
        </div>
        
        {isNumberRangeExpanded && (
          <div className="">
            <NumberRangeFilter
              data={data}
              numberField={columnKey}
              onFilteredDataChange={handleNumberFilteredData}
              className="w-full"
              header={`Filter ${columnName} by range`}
              minValue=""
              maxValue=""
              isFilterActive={false}
              onFilterStateChange={(min, max, isActive) => {
                // Handle filter state change
              }}
              onClearFilter={() => {
                // Handle clear filter
              }}
              decimalPlaces={decimalPlaces || 2}
              getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
            />
          </div>
        )}
      </div>
    );
  };
  
  /**
   * Render date range filter component
   * Provides expandable date range filtering interface
   * 
   * @returns {JSX.Element} Date range filter UI
   */
  const renderDateRangeFilter = () => {
    return (
      <div className="border-t border-b border-border dark:border-border/50">
        <div 
          className="p-2 bg-background/10 flex justify-between items-center cursor-pointer"
          onClick={() => setIsDateRangeExpanded(!isDateRangeExpanded)}
        >
          <span className="text-sm font-medium">Filter by range</span>
          <button className="text-gray-500">
            {isDateRangeExpanded ? '−' : '+'}
          </button>
        </div>
        
        {isDateRangeExpanded && (
          <div className="">
            <DateRangeFilter
              data={data}
              dateField={columnKey}
              onFilteredDataChange={handleDateFilteredData}
              className="w-full"
              header={`Filter ${columnName} by date range`}
              startDate={startDateInput}
              endDate={endDateInput}
              isFilterActive={isDateFilterActive}
              onFilterStateChange={(start, end, isActive) => {
                // ✅ Update shared state when DateRangeFilter changes
                setStartDateInput(start);
                setEndDateInput(end);
                setIsDateFilterActive(isActive);
              }}
              onClearFilter={() => {
                // ✅ Use the same clear function
                handleClearDateFilter();
              }}
              getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
            />
          </div>
        )}
      </div>
    );
  };

  /**
   * Render time range filter component
   * Provides expandable time range filtering interface
   * 
   * @returns {JSX.Element} Time range filter UI
   */
  const renderTimeRangeFilter = () => {
    return (
      <div className="border-t border-b border-border dark:border-border/50">
        <div 
          className="p-2 bg-background/10 flex justify-between items-center cursor-pointer"
          onClick={() => setIsTimeRangeExpanded(!isTimeRangeExpanded)}
        >
          <span className="text-sm font-medium">Filter by time range</span>
          <button className="text-gray-500">
            {isTimeRangeExpanded ? '−' : '+'}
          </button>
        </div>
        
        {isTimeRangeExpanded && (
          <div className="">
            <TimeRangeFilter
              data={data}
              timeField={columnKey}
              onFilteredDataChange={handleTimeFilteredData}
              className="w-full"
              header={`Filter ${columnName} by time range`}
              startTime=""
              endTime=""
              isFilterActive={false}
              onFilterStateChange={(start, end, isActive) => {
                // Handle filter state change
              }}
              onClearFilter={() => {
                // Handle clear filter
              }}
              getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
            />
          </div>
        )}
      </div>
    );
  };

  /**
   * Render multi-select filter component
   * Placeholder for multi-select filtering (currently returns null)
   * 
   * @returns {JSX.Element | null} Multi-select filter UI
   */
  const renderMultiSelectFilter = () => {
    // Implementation of renderMultiSelectFilter
    return null; // Placeholder return, actual implementation needed
  };

  /**
   * Determine which filter content to render based on field type
   * Routes to appropriate filter component based on data type
   * 
   * @returns {JSX.Element | null} Appropriate filter component
   */
  const renderFilterContent = () => {
    if (isNumberField) {
      return renderNumberRangeFilter();
    } else if (isDateField) {
      return renderDateRangeFilter();
    } else if (isTimeField) {
      return renderTimeRangeFilter();
    } else {
      return renderMultiSelectFilter();
    }
  };

  ////////////////////////////////////
  // Helper Functions: Filter state utilities
  ////////////////////////////////////
  
  /**
   * Check if filters are active for this column
   * Handles both string arrays and DateRangeFilter objects
   */
  const isFilterActive = useMemo(() => {
    if (Array.isArray(activeFilters)) {
      return activeFilters.length > 0;
    } else if (activeFilters && typeof activeFilters === 'object') {
      // Handle DateRangeFilter objects
      const dateFilter = activeFilters as any;
      if ('start' in dateFilter || 'end' in dateFilter) {
        return dateFilter.start !== null || dateFilter.end !== null;
      }
    }
    return false;
  }, [activeFilters]);

  /**
   * Get the count of selected filters for display
   * Returns the number of selected options or 1 for date filters
   */
  const filterCount = useMemo(() => {
    if (Array.isArray(activeFilters)) {
      return activeFilters.length;
    } else if (activeFilters && typeof activeFilters === 'object') {
      // Handle DateRangeFilter objects - show 1 if active
      const dateFilter = activeFilters as any;
      if ('start' in dateFilter || 'end' in dateFilter) {
        return (dateFilter.start !== null || dateFilter.end !== null) ? 1 : 0;
      }
    }
    return 0;
  }, [activeFilters]);
  
  ////////////////////////////////////
  // Computed Values: Display calculations
  ////////////////////////////////////
  
  /**
   * Calculate item counts for display
   * Provides selected and available item counts for the header badge
   */
  const itemCounts = useMemo(() => {
    // Count of selected items
    const selectedCount = selectedOptions.length;
    
    // Count of available items (including selected ones)
    let availableCount = 0;
    
    if (!filteredOptions.length) {
      availableCount = 0;
    } else if (hasOtherColumnFilters) {
      // Count options that have at least one item available or are already selected
      availableCount = filteredOptions.filter(option => 
        option.columnIndependentCount > 0 || selectedOptions.includes(option.value)
      ).length;
    } else {
      // If no other filters are active, count all filtered options
      availableCount = filteredOptions.length;
    }
    
    return { selectedCount, availableCount };
  }, [selectedOptions, filteredOptions, hasOtherColumnFilters]);

  ////////////////////////////////////
  // Main Render: Complete component UI
  ////////////////////////////////////

  return (
    <div className="relative inline-block w-full lg:w-auto">
      {/* Filter button - closed state */}
              {!isOpen && (
          !useFilterIcon ? (
            <FilterBoxButton
              buttonText={
                // ✅ Show selected dates if available, otherwise show default text
                isDateFilterActive && startDateInput && endDateInput
                  ? `${startDateInput} - ${endDateInput}`
                  : useFilterIconText || `Filter ${columnName}`
              }
              isActive={isFilterActive}
              isOpen={isOpen}
              width={useFilterIconWidth || "100%"}
              chevronDown={false}
              icon={filterIcon}
              onClick={() => {
                setIsOpen(true);
                setIsOptionsLoaded(true);
              }}
            />
          ) : (
          <button
            onClick={() => {
              setIsOpen(true);
              setIsOptionsLoaded(true);
            }}
            className={`relative p-1 rounded-md hover:bg-foreground/10 focus:outline-none ${
              isFilterActive ? 'text-tertiary' : 'text-tertiary'
            }`}
            title={`Filter ${columnName}`}
          >
            <ListFilter strokeWidth={isFilterActive ? 2.5 : 2} size={14} className={isFilterActive ? 'fill-tertiary/20 text-tertiary' : 'text-tertiary'} />
            {filterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-tertiary text-background text-[8px] font-medium rounded-full h-3 w-3 flex items-center justify-center">
                {filterCount > 9 ? '9+' : filterCount}
              </span>
            )}
          </button>
        )
      )}

      {/* Filter button - open state (close button) */}
              {isOpen && (
          !useFilterIcon ? (
            <FilterBoxButton
              buttonText={
                // ✅ Show selected dates even when open, or "Close Filter" if no dates
                isDateFilterActive && startDateInput && endDateInput
                  ? `${startDateInput} - ${endDateInput}`
                  : "Close Filter"
              }
              isActive={isFilterActive}
              isOpen={true}
              width={useFilterIconWidth || "100%"}
              icon={filterIcon}
              onClick={() => {
                setIsOpen(false);
                setIsOptionsLoaded(false);
              }}
            />
          ) : (
          <button
            onClick={() => {
              setIsOpen(false);
              setIsOptionsLoaded(false);
            }}
            className={`cursor-pointer p-1 rounded-md hover:bg-tertiary/10 focus:outline-none ${
              isFilterActive ? 'text-blue-600' : 'text-gray-500'
            }`}
            title={`Filter ${columnName}`}
          >
            <X size={14} className={isFilterActive ? 'fill-tertiary/20 text-tertiary' : 'text-tertiary'} />
          </button>
        )
      )}

      {/* Filter dropdown - main content. Match pill filter: number/date/time show only range UI; search shows only search; else multi-select. */}
      {isOpen && (
        <>
          {isDateField ? (
            <div
              ref={dropdownRef}
              className={`absolute z-30 mt-1 bg-background dark:bg-background border border-border rounded shadow-lg overflow-hidden min-w-[240px] ${isLastColumn ? 'right-0' : 'left-0'}`}
            >
              <div className="p-2 border-b border-border flex justify-between items-center">
                <span className="text-sm font-medium">Filter: {columnName}</span>
                <button type="button" onClick={() => { setIsOpen(false); setIsOptionsLoaded(false); }} className="p-1 hover:bg-muted rounded" aria-label="Close"><X size={14} /></button>
              </div>
              <div className="p-3">
                <DateRangeInput
                  startDate={pendingSelections[0] ?? ''}
                  endDate={pendingSelections[1] ?? ''}
                  onChange={(start, end) => setPendingSelections([start, end])}
                />
                <div className="flex justify-between items-center gap-2 mt-4">
                  <button type="button" onClick={() => { setPendingSelections([]); onFilterChangeRef.current(columnKey, { start: null, end: null }); onFilterApply?.(columnKey, [], 'date', columnConfig); }} className="text-sm text-muted-foreground hover:text-foreground px-2 py-1">Clear</button>
                  <button
                    type="button"
                    onClick={() => {
                      const startStr = pendingSelections[0] ?? '';
                      const endStr = pendingSelections[1] ?? '';
                      const parseDate = (s: string): Date | null => {
                        if (!s?.trim()) return null;
                        const p = s.split('-');
                        if (p.length !== 3) return null;
                        return new Date(parseInt(p[2], 10), parseInt(p[0], 10) - 1, parseInt(p[1], 10));
                      };
                      onFilterChangeRef.current(columnKey, { start: parseDate(startStr), end: parseDate(endStr) });
                      onFilterApply?.(columnKey, [startStr, endStr], 'date', columnConfig);
                      setIsOpen(false);
                    }}
                    className="text-sm px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ) : isNumberField ? (
            <div
              ref={dropdownRef}
              className={`absolute z-30 mt-1 bg-background dark:bg-background border border-border rounded shadow-lg overflow-hidden min-w-[240px] ${isLastColumn ? 'right-0' : 'left-0'}`}
            >
              <div className="p-2 border-b border-border flex justify-between items-center">
                <span className="text-sm font-medium">Filter: {columnName}</span>
                <button type="button" onClick={() => { setIsOpen(false); setIsOptionsLoaded(false); }} className="p-1 hover:bg-muted rounded" aria-label="Close"><X size={14} /></button>
              </div>
              <div className="p-3">
                <NumberRangeInput
                  minValue={pendingSelections[0] ?? ''}
                  maxValue={pendingSelections[1] ?? ''}
                  decimalPlaces={decimalPlaces ?? 0}
                  onChange={(min, max) => setPendingSelections([min, max])}
                />
                <div className="flex justify-between items-center gap-2 mt-4">
                  <button type="button" onClick={() => { setPendingSelections([]); onFilterChangeRef.current(columnKey, { min: null, max: null }); onFilterApply?.(columnKey, [], 'number', columnConfig); }} className="text-sm text-muted-foreground hover:text-foreground px-2 py-1">Clear</button>
                  <button
                    type="button"
                    onClick={() => {
                      const minStr = pendingSelections[0] ?? '';
                      const maxStr = pendingSelections[1] ?? '';
                      onFilterChangeRef.current(columnKey, { min: minStr ? Number(minStr) : null, max: maxStr ? Number(maxStr) : null });
                      onFilterApply?.(columnKey, [minStr, maxStr], 'number', columnConfig);
                      setIsOpen(false);
                    }}
                    className="text-sm px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ) : isTimeField ? (
            <div
              ref={dropdownRef}
              className={`absolute z-30 mt-1 bg-background dark:bg-background border border-border rounded shadow-lg overflow-hidden min-w-[240px] ${isLastColumn ? 'right-0' : 'left-0'}`}
            >
              <div className="p-2 border-b border-border flex justify-between items-center">
                <span className="text-sm font-medium">Filter: {columnName}</span>
                <button type="button" onClick={() => { setIsOpen(false); setIsOptionsLoaded(false); }} className="p-1 hover:bg-muted rounded" aria-label="Close"><X size={14} /></button>
              </div>
              {renderTimeRangeFilter()}
            </div>
          ) : isSearchFilter ? (
            <div
              ref={dropdownRef}
              className={`absolute z-30 mt-1 bg-background dark:bg-background border border-border rounded shadow-lg overflow-hidden w-64 ${isLastColumn ? 'right-0' : 'left-0'}`}
            >
              <div className="p-2 border-b border-border flex justify-between items-center">
                <span className="text-sm font-medium">Filter: {columnName}</span>
                <button type="button" onClick={() => { setIsOpen(false); setIsOptionsLoaded(false); }} className="p-1 hover:bg-muted rounded" aria-label="Close"><X size={14} /></button>
              </div>
              <div className="p-3">
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={pendingSelections[0] ?? ''}
                    onChange={(e) => setPendingSelections([e.target.value])}
                    placeholder={`Search ${columnName.toLowerCase()}...`}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex justify-between items-center gap-2">
                  <button type="button" onClick={() => { setPendingSelections([]); onFilterChangeRef.current(columnKey, []); onFilterApply?.(columnKey, [], 'text', columnConfig); }} className="text-sm text-muted-foreground hover:text-foreground px-2 py-1">
                    Clear
                  </button>
                  <button type="button" onClick={() => { const v = pendingSelections[0] ?? ''; onFilterChangeRef.current(columnKey, v ? [v] : []); onFilterApply?.(columnKey, v ? [v] : [], 'text', columnConfig); setIsOpen(false); }} className="text-sm px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <StandardFilterDropdown
              dropdownRef={dropdownRef as React.RefObject<HTMLDivElement | null>}
              isLastColumn={isLastColumn || false}
              columnKey={columnKey}
              columnName={columnName}
              activeFilters={activeFilters}
              pendingSelections={pendingSelections}
              isFilterActive={isFilterActive}
              filteredOptions={filteredOptions}
              isOptionsLoaded={isOptionsLoaded}
              searchInputRef={searchInputRef as React.RefObject<HTMLInputElement | null>}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortDirection={sortDirection}
              onToggleSort={toggleSortDirection}
              onToggleOption={toggleOption}
              onClearFilters={clearFilters}
              onRemoveFilter={removeFilter}
              onApplyFilters={applyFilters}
              onCancel={() => {
                setIsOpen(false);
                setIsOptionsLoaded(false);
              }}
              formatDisplayValue={formatDisplayValue}
              itemCounts={itemCounts}
              autoApplyDropdown={autoApplyDropdown}
              showBadgesDropdown={showBadgesDropdown}
              allActiveFilterColumns={allActiveFilterColumns}
              rangeFilterContent={undefined}
            />
          )}
        </>
      )}
    </div>
  );
};

// Export component with React.memo for performance optimization
export default React.memo(VirtualizedTableFilter); 