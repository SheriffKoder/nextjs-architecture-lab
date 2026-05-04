/**
 * DateFilterButton Component
 * 
 * Purpose: Button that opens ReactDateFilterDropdown for a selected column
 * Used in: virtualized-table.tsx beside HeaderFiltersWrapper2
 * Why: Provides date filtering capability for specific columns
 * 
 * Features:
 * - Configurable column key for filtering
 * - Opens ReactDateFilterDropdown on click
 * - Integrates with existing filtering logic
 * - Consistent styling with other filter components
 * - Shows active state when date filter is applied
 */

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import ReactDateFilterDropDown from "../TableFilters/ReactDateFilterDropDown";
import { TableColumn } from "../../features/subheadings/types/table-column";
import { DateRangeFilter } from "../../types/filter-types";
import { createLocalDate } from "../../utils/formatting/date-formatter";
import { formatDateFilterDisplay, DateFilterMode, detectDateFilterMode } from "./date-display-utils";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the DateFilterButton component
 */
interface DateFilterButtonProps {
  // Column configuration for filtering
  column: TableColumn<any>;
  // Currently active filters
  activeFilters: Record<string, any>;
  // Function to handle filter changes
  onFilterChange: (key: string, values: DateRangeFilter) => void;
  // Button text (defaults to column name)
  buttonText?: string;
  // Custom width for the button
  width?: string;
  // Whether the button is currently open
  isOpen?: boolean;
  // Callback when dropdown opens/closes
  onToggle?: (isOpen: boolean) => void;
  // Whether to show the date filter header (mode selector)
  showDateFilterHeader?: boolean;
}

////////////////////////////////////
// Component Implementation: Date filter button with dropdown
////////////////////////////////////

/**
 * Date filter button component that opens ReactDateFilterDropdown
 * 
 * @param {DateFilterButtonProps} props - Component props
 * @returns {JSX.Element} Date filter button with dropdown
 * 
 * @example
 * ```tsx
 * <DateFilterButton
 *   column={dateColumn}
 *   activeFilters={filters}
 *   onFilterChange={handleFilterChange}
 *   buttonText="Filter by Date"
 *   width="200px"
 * />
 * ```
 */
export function DateFilterButton({
  column,
  activeFilters,
  onFilterChange,
  buttonText,
  width = "200px",
  isOpen = false,
  onToggle,
  showDateFilterHeader = false
}: DateFilterButtonProps) {
  ////////////////////////////////////
  // State Management: Internal dropdown state
  ////////////////////////////////////
  
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(isOpen);
  const [selectedMode, setSelectedMode] = useState<DateFilterMode | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if this column has active date filters
  const hasActiveFilters = activeFilters[column.key] && 
    activeFilters[column.key] !== null &&
    (activeFilters[column.key].start || activeFilters[column.key].end);
  
  // Get current date values from active filters
  const currentStartDate = activeFilters[column.key]?.start ? 
    activeFilters[column.key].start.toISOString().split('T')[0] : "";
  const currentEndDate = activeFilters[column.key]?.end ? 
    activeFilters[column.key].end.toISOString().split('T')[0] : "";

  // Detect mode from existing filters when component mounts or filters change
  useEffect(() => {
    if (hasActiveFilters && currentStartDate && currentEndDate && !selectedMode) {
      const detectedMode = detectDateFilterMode(currentStartDate, currentEndDate);
      if (detectedMode) {
        setSelectedMode(detectedMode);
      }
    } else if (!hasActiveFilters) {
      // Clear mode when filters are cleared
      setSelectedMode(undefined);
    }
  }, [hasActiveFilters, currentStartDate, currentEndDate, selectedMode]);
  
  ////////////////////////////////////
  // Helper Functions: Format display text
  ////////////////////////////////////
  
  /**
   * Get the formatted display text for the button based on selected date range and mode
   */
  const getButtonDisplayText = (): string => {
    if (!hasActiveFilters || !currentStartDate || !currentEndDate) {
      return buttonText || column.name;
    }
    
    // Use the utility function to format the display text
    return formatDateFilterDisplay({
      startDate: currentStartDate,
      endDate: currentEndDate,
      mode: selectedMode,
      defaultText: buttonText || column.name
    });
  };
  
  ////////////////////////////////////
  // Event Handlers: Dropdown and filter management
  ////////////////////////////////////
  
  /**
   * Handle button click to toggle dropdown
   */
  const handleClick = () => {
    const newOpenState = !isDropdownOpen;
    setIsDropdownOpen(newOpenState);
    onToggle?.(newOpenState);
  };
  
  /**
   * Handle date range changes from ReactDateFilterDropdown
   */
  const handleDateRangeChange = (startDate: string, endDate: string, mode: DateFilterMode) => {
    // Store the selected mode for display formatting
    setSelectedMode(mode);
    
    // Convert string dates to Date objects for the filter system
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    // Update the filter with the correct DateRangeFilter structure
    onFilterChange(column.key, {
      start,
      end
    });
  };

  /**
   * Handle reset/clear date filter
   */
  const handleReset = () => {
    // Clear the selected mode
    setSelectedMode(undefined);
    
    // Clear the date filter by setting both start and end to null
    onFilterChange(column.key, {
      start: null,
      end: null
    });
  };
  
  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        onToggle?.(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, onToggle]);
  
  ////////////////////////////////////
  // Main Render: Date filter button with dropdown
  ////////////////////////////////////
  
  return (
    <div className="relative w-full lg:w-auto" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={handleClick}
        className={`w-[200px] cursor-pointer flex items-center justify-between px-3 py-[10px] text-xs border rounded-lg transition-colors duration-200
          ${
            hasActiveFilters
              ? 'bg-tertiary text-background hover:bg-tertiary/90 border-tertiary'
              : 'bg-tertiary/10 text-foreground hover:bg-tertiary/80 border-tertiary/40 dark:border-tertiary/20 hover:border-tertiary/50'
            }
          ${isDropdownOpen ? 'border-tertiary' : ''}
        `}
        // style={{ width }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} className={hasActiveFilters ? 'text-background' : 'text-foreground/80'} />
          <span className={`text-xs font-medium ${hasActiveFilters ? 'text-background' : 'text-foreground/80'}`}>
            {getButtonDisplayText()}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''} ${
            hasActiveFilters ? 'text-background' : 'text-foreground/80'
          }`} 
        />
      </button>

      {/* Date Filter Dropdown - Always rendered, hidden with CSS to preserve state */}
      <div className={`absolute top-full right-1/2 lg:right-0 translate-x-[-0%] lg:translate-x-[-25%] z-50 mt-1 transition-opacity duration-200 ${
        isDropdownOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none invisible'
      }`}>
        <ReactDateFilterDropDown
          onDateRangeChange={handleDateRangeChange}
          selectedStartDate={currentStartDate}
          selectedEndDate={currentEndDate}
          buttonText={buttonText || column.name}
          width={width}
          selectedDateMode="month"
          setSelectedDateMode={() => {}} // Not used in this context
          initialStartDate={currentStartDate}
          initialEndDate={currentEndDate}
          onReset={handleReset}
          setIsDropdownOpen={setIsDropdownOpen}
          showDateFilterHeader={showDateFilterHeader}
        />
      </div>
    </div>
  );
}

// Export component with React.memo for performance optimization
export default React.memo(DateFilterButton);
