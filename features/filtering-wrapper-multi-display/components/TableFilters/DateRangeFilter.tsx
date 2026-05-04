import React, { useState, useEffect } from 'react';



interface DateRangeFilterProps<T> {
  data: T[];
  dateField: string;
  onFilteredDataChange: (filteredData: T[]) => void;
  className?: string;
  header?: string;
  startDate: string;
  endDate: string;
  isFilterActive: boolean;
  onFilterStateChange: (start: string, end: string, isActive: boolean) => void;
  onClearFilter: () => void;
  getFilterCount?: (item: T) => number;
  getFilteredDataExcludingColumn?: (column: string) => T[];
}

interface DateParts {
  month: string;
  day: string;
  year: string;
}

export function DateRangeFilter<T>({ 
  data, 
  dateField, 
  onFilteredDataChange,
  getFilteredDataExcludingColumn,
  className = '',
  header = 'Filter by date range',
  startDate: initialStartDate = "",
  endDate: initialEndDate = "",
  isFilterActive: initialIsFilterActive = false,
  onFilterStateChange,
  onClearFilter,
  getFilterCount
}: DateRangeFilterProps<T>) {
  // Use the prop value for initialization, but maintain our own state
  const [isFilterActiveState, setIsFilterActiveState] = useState<boolean>(initialIsFilterActive);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Parse start date into parts
  const [startDateParts, setStartDateParts] = useState<DateParts>(() => {
    if (!initialStartDate) return { month: '', day: '', year: '' };
    const parts = initialStartDate.split('/');
    return {
      month: parts[0] || '',
      day: parts[1] || '',
      year: parts[2] || ''
    };
  });

  // Parse end date into parts
  const [endDateParts, setEndDateParts] = useState<DateParts>(() => {
    if (!initialEndDate) return { month: '', day: '', year: '' };
    const parts = initialEndDate.split('/');
    return {
      month: parts[0] || '',
      day: parts[1] || '',
      year: parts[2] || ''
    };
  });

  // Update local state when props change
  useEffect(() => {
    if (initialStartDate) {
      const parts = initialStartDate.split('/');
      setStartDateParts({
        month: parts[0] || '',
        day: parts[1] || '',
        year: parts[2] || ''
      });
    } else {
      setStartDateParts({ month: '', day: '', year: '' });
    }
  }, [initialStartDate]);

  useEffect(() => {
    if (initialEndDate) {
      const parts = initialEndDate.split('/');
      setEndDateParts({
        month: parts[0] || '',
        day: parts[1] || '',
        year: parts[2] || ''
      });
    } else {
      setEndDateParts({ month: '', day: '', year: '' });
    }
  }, [initialEndDate]);

  // Combine date parts into MM/DD/YYYY format
  const formatDateString = (parts: DateParts): string => {
    if (!parts.month && !parts.day && !parts.year) return '';
    return `${parts.month.padStart(2, '0')}/${parts.day.padStart(2, '0')}/${parts.year}`;
  };

  const validateDates = (): boolean => {
    // Clear any previous errors
    setErrorMessage(null);

    // Check if at least one date has some parts filled
    const hasStartDate = startDateParts.month || startDateParts.day || startDateParts.year;
    const hasEndDate = endDateParts.month || endDateParts.day || endDateParts.year;

    if (!hasStartDate && !hasEndDate) {
      setErrorMessage("Please enter at least one date");
      return false;
    }

    // Check if dates are complete
    if (hasStartDate && (!startDateParts.month || !startDateParts.day || !startDateParts.year)) {
      setErrorMessage("Start date is incomplete");
      return false;
    }

    if (hasEndDate && (!endDateParts.month || !endDateParts.day || !endDateParts.year)) {
      setErrorMessage("End date is incomplete");
      return false;
    }

    // If both dates are provided, check if start date is before end date
    if (hasStartDate && hasEndDate) {
      const startDateStr = formatDateString(startDateParts);
      const endDateStr = formatDateString(endDateParts);
      
      const start = new Date(convertToISO(startDateStr));
      const end = new Date(convertToISO(endDateStr));

      if (isNaN(start.getTime())) {
        setErrorMessage("Invalid start date");
        return false;
      }

      if (isNaN(end.getTime())) {
        setErrorMessage("Invalid end date");
        return false;
      }

      if (start > end) {
        setErrorMessage("Start date must be before end date");
        return false;
      }
    }

    return true;
  };

  // Convert MM/DD/YYYY to YYYY-MM-DD for date comparison
  const convertToISO = (dateString: string): string => {
    if (!dateString) return '';
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    
    return `${parts[2]}-${parts[0]}-${parts[1]}`;
  };

  /**
   * Applies date filtering to the data based on current inputs
   */
  const applyFilter = () => {
    if (!validateDates()) return;

    const startDateStr = formatDateString(startDateParts);
    const endDateStr = formatDateString(endDateParts);

    // Get data filtered by other columns (if available)
    const dataToFilter = getFilteredDataExcludingColumn ? 
      getFilteredDataExcludingColumn(dateField as string) : 
      data;

    // Convert dates to Date objects for comparison
    const startDateObj = startDateStr ? new Date(convertToISO(startDateStr)) : null;
    const endDateObj = endDateStr ? new Date(convertToISO(endDateStr)) : null;

    // Filter the data
    const filteredData = dataToFilter.filter(item => {
      const value = item[dateField as keyof T];
      if (!value) return false;

      // Convert the value to a Date object
      const dateValue = new Date(convertToISO(value as string));
      
      // Skip invalid dates
      if (isNaN(dateValue.getTime())) return false;

      // Check if the date is within the range
      if (startDateObj && dateValue < startDateObj) return false;
      if (endDateObj) {
        // Set end date to end of day
        const endOfDay = new Date(endDateObj);
        endOfDay.setHours(23, 59, 59, 999);
        if (dateValue > endOfDay) return false;
      }

      return true;
    });

    // Check if we have any matches
    if (filteredData.length === 0) {
      setErrorMessage("No matches found for this date range");
      return;
    }

    // Clear any error messages
    setErrorMessage(null);

    // Update the filter state
    setIsFilterActiveState(true);
    
    // Notify parent of filter state change
    if (onFilterStateChange) {
      onFilterStateChange(startDateStr, endDateStr, true);
    }
    
    // Pass the filtered data back
    onFilteredDataChange(filteredData);
  };

  const handleClear = () => {
    console.log('handleClear');
    setStartDateParts({ month: '', day: '', year: '' });
    setEndDateParts({ month: '', day: '', year: '' });
    setErrorMessage(null);
    setIsFilterActiveState(false);
    onClearFilter();
  };

  // Handle input changes with validation
  const handleInputChange = (
    part: 'month' | 'day' | 'year', 
    value: string, 
    dateType: 'start' | 'end'
  ) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) return;

    // Apply specific validations
    if (part === 'month') {
      // Month should be 1-12
      const monthNum = parseInt(value);
      if (value !== '' && (monthNum < 1 || monthNum > 12)) return;
      if (value.length > 2) return;
    } else if (part === 'day') {
      // Day should be 1-31
      const dayNum = parseInt(value);
      if (value !== '' && (dayNum < 1 || dayNum > 31)) return;
      if (value.length > 2) return;
    } else if (part === 'year') {
      // Year should be 4 digits
      if (value.length > 4) return;
    }

    // Update the appropriate date part
    if (dateType === 'start') {
      setStartDateParts(prev => ({ ...prev, [part]: value }));
    } else {
      setEndDateParts(prev => ({ ...prev, [part]: value }));
    }
  };

  return (
    <div className={`p-3 ${className}`}>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-foreground/70 mb-1">Start Date</label>
          <div className="flex space-x-2">
            <div className="w-1/3">
              <input
                type="text"
                placeholder="MM"
                className="w-full p-1.5 bg-background/10 dark:bg-background/50 text-xs border border-border dark:border-border/50 rounded text-center"
                value={startDateParts.month}
                onChange={(e) => handleInputChange('month', e.target.value, 'start')}
                maxLength={2}
              />
              <div className="text-xs text-foreground/70 text-center mt-0.5">Month</div>
            </div>
            <div className="w-1/3">
              <input
                type="text"
                placeholder="DD"
                className="w-full p-1.5 bg-background/10 dark:bg-background/50 text-xs border border-border dark:border-border/50 rounded text-center"
                value={startDateParts.day}
                onChange={(e) => handleInputChange('day', e.target.value, 'start')}
                maxLength={2}
              />
              <div className="text-xs text-foreground/70 text-center mt-0.5">Day</div>
            </div>
            <div className="w-1/3">
              <input
                type="text"
                placeholder="YYYY"
                className="w-full p-1.5 bg-background/10 dark:bg-background/50 text-xs border border-border dark:border-border/50 rounded text-center"
                value={startDateParts.year}
                onChange={(e) => handleInputChange('year', e.target.value, 'start')}
                maxLength={4}
              />
              <div className="text-xs text-foreground/70 text-center mt-0.5">Year</div>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-foreground/70 mb-1">End Date</label>
          <div className="flex space-x-2">
            <div className="w-1/3">
              <input
                type="text"
                placeholder="MM"
                className="w-full p-1.5 bg-background/10 dark:bg-background/50 text-xs border border-border dark:border-border/50 rounded text-center"
                value={endDateParts.month}
                onChange={(e) => handleInputChange('month', e.target.value, 'end')}
                maxLength={2}
              />
              <div className="text-xs text-foreground/70 text-center mt-0.5">Month</div>
            </div>
            <div className="w-1/3">
              <input
                type="text"
                placeholder="DD"
                className="w-full p-1.5 bg-background/10 dark:bg-background/50 text-xs border border-border dark:border-border/50 rounded text-center"
                value={endDateParts.day}
                onChange={(e) => handleInputChange('day', e.target.value, 'end')}
                maxLength={2}
              />
              <div className="text-xs text-foreground/70 text-center mt-0.5">Day</div>
            </div>
            <div className="w-1/3">
              <input
                type="text"
                placeholder="YYYY"
                className="w-full p-1.5 bg-background/10 dark:bg-background/50 text-xs border border-border dark:border-border/50 rounded text-center"
                value={endDateParts.year}
                onChange={(e) => handleInputChange('year', e.target.value, 'end')}
                maxLength={4}
              />
              <div className="text-xs text-foreground/70 text-center mt-0.5">Year</div>
            </div>
          </div>
        </div>
        
        {errorMessage && (
          <div className="text-xs text-red-500">{errorMessage}</div>
        )}
        
        <div className="flex justify-between pt-1">
          <button
            onClick={handleClear}
            className="text-xs text-foreground/70 hover:text-foreground cursor-pointer underline"
            // disabled={!isFilterActiveState && 
            //   !startDateParts.month && !startDateParts.day && !startDateParts.year && 
            //   !endDateParts.month && !endDateParts.day && !endDateParts.year}
          >
            Clear
          </button>
          
          <button
            onClick={applyFilter}
            className="text-xs px-2 py-1 bg-tertiary text-background rounded hover:bg-tertiary/90"
            disabled={!startDateParts.month && !startDateParts.day && !startDateParts.year && 
              !endDateParts.month && !endDateParts.day && !endDateParts.year}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default DateRangeFilter; 