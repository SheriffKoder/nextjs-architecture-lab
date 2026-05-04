"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

// Create a simple version of the useFormattedNumberInput hook if it doesn't exist
const useFormattedNumberInput = ({ initialValue = "", decimalPlaces = 2 }) => {
  const [formattedValue, setFormattedValue] = useState(initialValue);
  const [rawValue, setRawValue] = useState(initialValue);

  useEffect(() => {
    if (initialValue) {
      setRawValue(initialValue);
      
      // Format the initial value
      const num = parseFloat(initialValue);
      if (!isNaN(num)) {
        setFormattedValue(num.toFixed(decimalPlaces));
      } else {
        setFormattedValue(initialValue);
      }
    } else {
      setRawValue("");
      setFormattedValue("");
    }
  }, [initialValue, decimalPlaces]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input
    if (value === "") {
      setFormattedValue("");
      setRawValue("");
      return;
    }
    
    // Only allow numbers and decimal point
    if (!/^-?\d*\.?\d*$/.test(value)) {
      return;
    }
    
    setRawValue(value);
    
    // Format the value if it's a valid number
    const num = parseFloat(value);
    if (!isNaN(num)) {
      // Don't format while typing (keep the raw input)
      setFormattedValue(value);
    } else {
      setFormattedValue(value);
    }
  };

  return {
    formattedValue,
    rawValue,
    handleChange
  };
};

interface NumberRangeFilterProps<T> {
  data: T[];
  numberField: keyof T;
  onFilteredDataChange: (filteredData: T[]) => void;
  getFilteredDataExcludingColumn?: (column: string) => T[];
  className?: string;
  header: string;
  minValue: string;
  maxValue: string;
  isFilterActive: boolean;
  onFilterStateChange: (min: string, max: string, isActive: boolean) => void;
  onClearFilter: () => void;
  decimalPlaces?: number;
  getFilterCount?: (item: any) => number;
}

export function NumberRangeFilter<T>({ 
  data, 
  numberField, 
  onFilteredDataChange,
  getFilteredDataExcludingColumn,
  className,
  header,
  minValue: initialMinValue = "",
  maxValue: initialMaxValue = "",
  isFilterActive: initialIsFilterActive = false,
  onFilterStateChange,
  onClearFilter,
  decimalPlaces = 2
}: NumberRangeFilterProps<T>) {
  const [isFilterActiveState, setIsFilterActiveState] = useState<boolean>(initialIsFilterActive);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [noMatchesMessage, setNoMatchesMessage] = useState<string | null>(null);
  
  const minInputHandler = useFormattedNumberInput({
    initialValue: initialMinValue,
    decimalPlaces
  });
  
  const maxInputHandler = useFormattedNumberInput({
    initialValue: initialMaxValue,
    decimalPlaces
  });
  
  /**
   * Applies number filtering to the data based on current inputs
   */
  const applyNumberFilter = () => {
    // Validate inputs
    const minNum = minInputHandler.rawValue ? parseFloat(minInputHandler.rawValue) : null;
    const maxNum = maxInputHandler.rawValue ? parseFloat(maxInputHandler.rawValue) : null;
    
    // Validate range if both values are provided
    if (minNum !== null && maxNum !== null && minNum > maxNum) {
      setNoMatchesMessage("Min value cannot be greater than max value");
      return;
    }
    
    // Get data filtered by other columns (if available)
    const dataToFilter = getFilteredDataExcludingColumn ? 
      getFilteredDataExcludingColumn(numberField as string) : 
      data;
    
    // Apply the filter to the data
    const filteredData = dataToFilter.filter(item => {
      const value = item[numberField];
      if (value === undefined || value === null) return false;
      
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(numValue)) return false;
      
      if (minNum !== null && numValue < minNum) return false;
      if (maxNum !== null && numValue > maxNum) return false;
      
      return true;
    });
    
    // Check if we have any matches
    if (filteredData.length === 0) {
      setNoMatchesMessage("No matches found for this range");
      return;
    }
    
    // Clear any error messages
    setNoMatchesMessage(null);
    
    // Set filter as active
    setIsFilterActiveState(true);
    
    // Notify parent of filter state change
    if (onFilterStateChange) {
      onFilterStateChange(
        minInputHandler.rawValue || '',
        maxInputHandler.rawValue || '',
        true
      );
    }
    
    // Pass filtered data back to parent
    onFilteredDataChange(filteredData);
  };

  // Clear the filter
  const clearFilter = () => {
    minInputHandler.handleChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    maxInputHandler.handleChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    setNoMatchesMessage(null);
    setIsFilterActiveState(false);
    onClearFilter();
  };

  // Format a number for display
  const formatNumber = (value: number): string => {
    return value.toFixed(decimalPlaces);
  };

  return (
    <div className={`number-range-filter ${className}`}>

      {/* Expanded content */}
        <div className="p-2 pt-0">
          <div className="flex space-x-2 mt-2">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Min"
                className="w-full p-1.5 bg-background/10 dark:bg-background/50 text-xs border border-border dark:border-border/50 rounded text-center"
                value={minInputHandler.rawValue}
                onChange={minInputHandler.handleChange}
                step={decimalPlaces > 0 ? `0.${'0'.repeat(decimalPlaces-1)}1` : '1'}
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                placeholder="Max"
                className="w-full p-1.5 bg-background/10 dark:bg-background/50 text-xs border border-border dark:border-border/50 rounded text-center"
                value={maxInputHandler.rawValue}
                onChange={maxInputHandler.handleChange}
                step={decimalPlaces > 0 ? `0.${'0'.repeat(decimalPlaces-1)}1` : '1'}
              />
            </div>
            <button
              className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90"
              onClick={applyNumberFilter}
              disabled={!minInputHandler.rawValue || !maxInputHandler.rawValue}
            >
              Apply
            </button>
          </div>
          
          {/* Error message */}
          {noMatchesMessage && (
            <div className="text-red-500 text-xs mt-1">{noMatchesMessage}</div>
          )}
          
        </div>
    </div>
  );
}

export default NumberRangeFilter; 