/**
 * DateSelectorFilter Component
 * 
 * Purpose: Wrapper component that integrates date-selector-dropdown.tsx with the existing filter system
 * Used in: VirtualizedTableFilterDropdown for date columns
 * Why: Converts string date output to DateRangeFilter objects that the filter system understands
 * 
 * Steps:
 * 1. Import required components and types
 * 2. Define component props interface
 * 3. Convert existing filter state to string format for DateSelectorDropdown
 * 4. Convert string dates back to DateRangeFilter for the filter system
 * 5. Render DateSelectorDropdown with proper props
 */

import React from 'react';
import DateSelectorDropdown from './ReactDateFilterDropDown';
import { DateRangeFilter } from '../../types/filter-types';

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the DateSelectorFilter component
 * Provides all necessary data and callbacks for date filtering
 */
interface DateSelectorFilterProps {
  // Column identifier for filtering
  columnKey: string;
  // Display name for the column
  columnName: string;
  // Callback to update filters in the table system
  onFilterChange: (columnKey: string, filterValue: DateRangeFilter) => void;
  // Currently active filters across all columns
  activeFilters: Record<string, any>;
  // Original data for filter calculations
  data: any[];
  // Whether to show filter title
  showFilterTitle?: boolean;
}

////////////////////////////////////
// Component Implementation: Date filter wrapper
////////////////////////////////////

/**
 * Date filter wrapper component that integrates date-selector-dropdown with the filter system
 * Converts between string dates (DateSelectorDropdown) and DateRangeFilter objects (filter system)
 * 
 * @param {DateSelectorFilterProps} props - Component props
 * @returns {JSX.Element} Date filter wrapper with DateSelectorDropdown
 * 
 * @example
 * ```tsx
 * <DateSelectorFilter
 *   columnKey="datepicker"
 *   columnName="Date Picker"
 *   onFilterChange={handleFilterChange}
 *   activeFilters={filters}
 *   data={tableData}
 * />
 * ```
 */
export function DateSelectorFilter({
  columnKey,
  columnName,
  onFilterChange,
  activeFilters,
  data,
  showFilterTitle = true
}: DateSelectorFilterProps) {
  
  ////////////////////////////////////
  // Filter State Conversion: Convert existing filter to string format
  ////////////////////////////////////
  
  /**
   * Get current date filter values from active filters
   * Converts DateRangeFilter objects to string format for DateSelectorDropdown
   */
  const getCurrentDates = () => {
    const currentFilter = activeFilters[columnKey];
    
    if (currentFilter && typeof currentFilter === 'object' && 'start' in currentFilter && 'end' in currentFilter) {
      const dateFilter = currentFilter as DateRangeFilter;
      
      // Convert Date objects to YYYY-MM-DD format for DateSelectorDropdown
      const formatDateToString = (date: Date | null): string => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      return {
        startDate: formatDateToString(dateFilter.start),
        endDate: formatDateToString(dateFilter.end)
      };
    }
    
    // Return empty strings if no filter is active
    return { startDate: '', endDate: '' };
  };

  ////////////////////////////////////
  // Filter Change Handler: Convert string dates to DateRangeFilter
  ////////////////////////////////////
  
  /**
   * Handle date range changes from DateSelectorDropdown
   * Converts string dates to DateRangeFilter objects for the filter system
   */
  const handleDateRangeChange = (startDate: string, endDate: string, mode: string) => {
    // Convert string dates to Date objects for DateRangeFilter
    const dateRangeFilter: DateRangeFilter = {
      start: startDate ? new Date(startDate) : null,
      end: endDate ? new Date(endDate) : null
    };
    
    // Call the filter system's change handler
    onFilterChange(columnKey, dateRangeFilter);
  };

  ////////////////////////////////////
  // Computed Values: Current filter state
  ////////////////////////////////////
  
  // Get current date values for the DateSelectorDropdown
  const currentDates = getCurrentDates();
  
  // Check if this filter is currently active
  const isFilterActive = currentDates.startDate || currentDates.endDate;

  ////////////////////////////////////
  // Main Render: Date filter wrapper
  ////////////////////////////////////
  
  return (
    <div className="flex flex-col gap-2">
      {/* Filter Title (optional) */}
      {showFilterTitle && (
        <div className="text-sm font-medium text-gray-700">
          {columnName} Filter
        </div>
      )}
      
      {/* Date Selector Dropdown */}
      <DateSelectorDropdown
        onDateRangeChange={handleDateRangeChange}
        selectedStartDate={currentDates.startDate}
        selectedEndDate={currentDates.endDate}
        buttonText={`Filter ${columnName}`}
        width="280px"
        selectedDateMode="range"
        initialStartDate={currentDates.startDate}
        initialEndDate={currentDates.endDate}
      />
      
      {/* Filter Status Indicator */}
      {isFilterActive && (
        <div className="text-xs text-blue-600">
          Active filter: {currentDates.startDate} to {currentDates.endDate}
        </div>
      )}
    </div>
  );
}

// Export component with React.memo for performance optimization
export default React.memo(DateSelectorFilter); 