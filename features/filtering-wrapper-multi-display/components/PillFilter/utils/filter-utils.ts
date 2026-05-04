/**
 * Filter Utility Functions
 * 
 * Purpose: Utility functions for table filtering operations
 * Used in: TableFilterDropdownOrchestrator and other filter components
 * Why: Centralized utility functions for consistent filtering behavior
 * 
 * Features:
 * - Time conversion utilities
 * - Date parsing and comparison
 * - Number formatting and validation
 * - Filter state management helpers
 * - Option sorting and filtering logic
 */

////////////////////////////////////
// Type Definitions: Utility function types
////////////////////////////////////

/**
 * Filter option with count information
 */
export interface FilterOption {
  value: string;
  rawValue: any;
  totalCount: number;
  columnIndependentCount: number;
  hasCount?: boolean;
}

/**
 * Item counts for display
 */
export interface ItemCounts {
  selectedCount: number;
  availableCount: number;
}

/**
 * Date range filter object
 */
export interface DateRangeFilter {
  start: string | null;
  end: string | null;
}

////////////////////////////////////
// Time Conversion Utilities
////////////////////////////////////

/**
 * Convert time string to minutes for comparison
 * Supports HH:MM:SS and HH:MM formats for chronological sorting
 * 
 * @param {string} timeStr - Time string to convert
 * @returns {number} Minutes since midnight, or -1 if invalid
 * 
 * @example
 * timeToMinutes("14:30:00") // Returns 870 (14*60 + 30)
 * timeToMinutes("09:15") // Returns 555 (9*60 + 15)
 * timeToMinutes("invalid") // Returns -1
 */
export const timeToMinutes = (timeStr: string): number => {
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
// Date Parsing Utilities
////////////////////////////////////

/**
 * Parse date string in MM/DD/YYYY format to YYYY-MM-DD for comparison
 * 
 * @param {string} dateStr - Date string in MM/DD/YYYY format
 * @returns {string} Date string in YYYY-MM-DD format, or empty string if invalid
 * 
 * @example
 * parseDateForComparison("12/25/2024") // Returns "2024-12-25"
 * parseDateForComparison("01/01/2024") // Returns "2024-01-01"
 */
export const parseDateForComparison = (dateStr: string): string => {
  const parts = dateStr.split('/');
  
  if (parts.length !== 3) return '';
  
  const month = parts[0].padStart(2, '0');
  const day = parts[1].padStart(2, '0');
  const year = parts[2];
  
  // Validate the date components
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);
  const yearNum = parseInt(year, 10);
  
  if (isNaN(monthNum) || isNaN(dayNum) || isNaN(yearNum)) return '';
  if (monthNum < 1 || monthNum > 12) return '';
  if (dayNum < 1 || dayNum > 31) return '';
  if (yearNum < 1900 || yearNum > 2100) return '';
  
  return `${year}-${month}-${day}`;
};

////////////////////////////////////
// Filter State Utilities
////////////////////////////////////

/**
 * Check if filters are active for a column
 * Handles both string arrays and DateRangeFilter objects
 * 
 * @param {any} activeFilters - Active filters for the column
 * @returns {boolean} True if filters are active
 * 
 * @example
 * isFilterActive(["option1", "option2"]) // Returns true
 * isFilterActive([]) // Returns false
 * isFilterActive({ start: "2024-01-01", end: "2024-12-31" }) // Returns true
 */
export const isFilterActive = (activeFilters: any): boolean => {
  if (Array.isArray(activeFilters)) {
    return activeFilters.length > 0;
  } else if (activeFilters && typeof activeFilters === 'object') {
    // Handle DateRangeFilter objects
    const dateFilter = activeFilters as DateRangeFilter;
    if ('start' in dateFilter || 'end' in dateFilter) {
      return dateFilter.start !== null || dateFilter.end !== null;
    }
  }
  return false;
};

////////////////////////////////////
// Option Sorting Utilities
////////////////////////////////////

/**
 * Sort options based on field type and selection status
 * 
 * @param {FilterOption[]} options - Options to sort
 * @param {string[]} selectedOptions - Currently selected option values
 * @param {boolean} hasOtherColumnFilters - Whether other columns have active filters
 * @param {boolean} isNumberField - Whether this is a number field
 * @param {boolean} isDateField - Whether this is a date field
 * @param {boolean} isTimeField - Whether this is a time field
 * @param {'asc' | 'desc'} sortDirection - Sort direction
 * @returns {FilterOption[]} Sorted options
 */
export const sortOptions = (
  options: FilterOption[],
  selectedOptions: string[],
  hasOtherColumnFilters: boolean,
  isNumberField: boolean,
  isDateField: boolean,
  isTimeField: boolean,
  sortDirection: 'asc' | 'desc'
): FilterOption[] => {
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
      const aDate = parseDateForComparison(a.value);
      const bDate = parseDateForComparison(b.value);
      
      if (aDate && bDate) {
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
};

////////////////////////////////////
// Option Filtering Utilities
////////////////////////////////////

/**
 * Filter options based on search term
 * 
 * @param {FilterOption[]} options - Options to filter
 * @param {string} searchTerm - Search term to filter by
 * @returns {FilterOption[]} Filtered options
 */
export const filterOptionsBySearch = (options: FilterOption[], searchTerm: string): FilterOption[] => {
  if (!searchTerm) return options;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return options.filter(option => 
    option.value.toLowerCase().includes(lowerSearchTerm)
  );
};

/**
 * Update option counts based on availableItemCounts
 * 
 * @param {FilterOption[]} options - Options to update
 * @param {Map<string, number> | undefined} availableItemCounts - Available item counts
 * @returns {FilterOption[]} Options with updated counts
 */
export const updateOptionCounts = (
  options: FilterOption[], 
  availableItemCounts?: Map<string, number>
): FilterOption[] => {
  if (!availableItemCounts) return options;
  
  return options.map(option => ({
    ...option,
    columnIndependentCount: availableItemCounts.get(option.value) || 0
  }));
};

////////////////////////////////////
// Display Calculation Utilities
////////////////////////////////////

/**
 * Calculate item counts for display
 * Provides selected and available item counts for the header badge
 * 
 * @param {string[]} selectedOptions - Currently selected options
 * @param {FilterOption[]} filteredOptions - Available filter options
 * @param {boolean} hasOtherColumnFilters - Whether other columns have active filters
 * @returns {ItemCounts} Item counts for display
 */
export const calculateItemCounts = (
  selectedOptions: string[],
  filteredOptions: FilterOption[],
  hasOtherColumnFilters: boolean
): ItemCounts => {
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
};

////////////////////////////////////
// Number Formatting Utilities
////////////////////////////////////

/**
 * Format number with specified decimal places
 * 
 * @param {number} value - Number to format
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (value: number, decimalPlaces: number = 2): string => {
  return value.toFixed(decimalPlaces);
};

/**
 * Validate if a string is a valid number
 * 
 * @param {string} value - String to validate
 * @returns {boolean} True if valid number
 */
export const isValidNumber = (value: string): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
};

////////////////////////////////////
// Export all utilities
////////////////////////////////////

export default {
  timeToMinutes,
  parseDateForComparison,
  isFilterActive,
  sortOptions,
  filterOptionsBySearch,
  updateOptionCounts,
  calculateItemCounts,
  formatNumber,
  isValidNumber
};
