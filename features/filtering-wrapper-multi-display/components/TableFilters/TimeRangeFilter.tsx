"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TimeRangeFilterProps<T> {
  data: T[];
  timeField: keyof T;
  onFilteredDataChange: (filteredData: T[]) => void;
  className?: string;
  header?: string;
  startTime: string;
  endTime: string;
  isFilterActive: boolean;
  onFilterStateChange: (start: string, end: string, isActive: boolean) => void;
  onClearFilter: () => void;
  getFilteredDataExcludingColumn?: (column: string) => T[];
}

type TimeInputState = {
  hour: string;
  minute: string;
  isPM: boolean;
};

export function TimeRangeFilter<T>({ 
  data, 
  timeField, 
  onFilteredDataChange,
  getFilteredDataExcludingColumn,
  className = '',
  header = 'Filter by time range',
  startTime: initialStartTime = "",
  endTime: initialEndTime = "",
  isFilterActive: initialIsFilterActive = false,
  onFilterStateChange,
  onClearFilter
}: TimeRangeFilterProps<T>) {
  // Use the prop value for initialization, but maintain our own state
  const [isFilterActiveState, setIsFilterActiveState] = useState<boolean>(initialIsFilterActive);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Initialize time input states
  const [startTimeState, setStartTimeState] = useState<TimeInputState>({
    hour: "",
    minute: "",
    isPM: false
  });
  
  const [endTimeState, setEndTimeState] = useState<TimeInputState>({
    hour: "",
    minute: "",
    isPM: false
  });
  
  // Parse initial time values
  useEffect(() => {
    if (initialStartTime) {
      const parsedTime = parseTimeString(initialStartTime);
      if (parsedTime) {
        setStartTimeState(parsedTime);
      }
    }
    
    if (initialEndTime) {
      const parsedTime = parseTimeString(initialEndTime);
      if (parsedTime) {
        setEndTimeState(parsedTime);
      }
    }
  }, [initialStartTime, initialEndTime]);
  
  // Parse a time string (HH:MM) into hour, minute, and AM/PM
  const parseTimeString = (timeString: string): TimeInputState | null => {
    if (!timeString) return null;
    
    const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    let isPM = false;
    
    // Convert 24-hour format to 12-hour format with AM/PM
    if (hour >= 12) {
      isPM = true;
      hour = hour === 12 ? 12 : hour - 12;
    } else if (hour === 0) {
      hour = 12; // 00:00 becomes 12:00 AM
    }
    
    return {
      hour: hour.toString(),
      minute,
      isPM
    };
  };
  
  // Convert time input state to 24-hour format string (HH:MM)
  const formatTimeToString = (timeState: TimeInputState): string => {
    if (!timeState.hour && !timeState.minute) return "";
    
    // Default to 0 if empty
    const hour = timeState.hour === "" ? "0" : timeState.hour;
    const minute = timeState.minute === "" ? "0" : timeState.minute;
    
    // Convert to 24-hour format
    let hour24 = parseInt(hour, 10);
    
    if (timeState.isPM) {
      hour24 = hour24 === 12 ? 12 : hour24 + 12;
    } else {
      hour24 = hour24 === 12 ? 0 : hour24;
    }
    
    // Format with leading zeros
    const hourStr = hour24.toString().padStart(2, '0');
    const minuteStr = minute.padStart(2, '0');
    
    return `${hourStr}:${minuteStr}`;
  };
  
  // Convert time string to minutes for comparison (e.g., "13:45" -> 825 minutes)
  const timeToMinutes = (timeString: string): number => {
    if (!timeString) return -1;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return -1;
    
    return hours * 60 + minutes;
  };
  
  // Validate the time inputs
  const validateTimes = (): boolean => {
    // Clear previous error messages
    setErrorMessage(null);
    
    // Check if at least one field is filled for each time input that's being used
    const startHasValue = startTimeState.hour !== "" || startTimeState.minute !== "";
    const endHasValue = endTimeState.hour !== "" || endTimeState.minute !== "";
    
    // If start time has some value, make sure both hour and minute are valid
    if (startHasValue) {
      const hour = startTimeState.hour === "" ? 0 : parseInt(startTimeState.hour, 10);
      const minute = startTimeState.minute === "" ? 0 : parseInt(startTimeState.minute, 10);
      
      if (isNaN(hour) || hour < 0 || hour > 12) {
        setErrorMessage("Start hour must be between 0 and 12");
        return false;
      }
      
      if (isNaN(minute) || minute < 0 || minute > 59) {
        setErrorMessage("Start minute must be between 0 and 59");
        return false;
      }
    }
    
    // If end time has some value, make sure both hour and minute are valid
    if (endHasValue) {
      const hour = endTimeState.hour === "" ? 0 : parseInt(endTimeState.hour, 10);
      const minute = endTimeState.minute === "" ? 0 : parseInt(endTimeState.minute, 10);
      
      if (isNaN(hour) || hour < 0 || hour > 12) {
        setErrorMessage("End hour must be between 0 and 12");
        return false;
      }
      
      if (isNaN(minute) || minute < 0 || minute > 59) {
        setErrorMessage("End minute must be between 0 and 59");
        return false;
      }
    }
    
    // If both start and end times are provided, check that start time is before end time
    if (startHasValue && endHasValue) {
      const startTimeString = formatTimeToString(startTimeState);
      const endTimeString = formatTimeToString(endTimeState);
      
      const startMinutes = timeToMinutes(startTimeString);
      const endMinutes = timeToMinutes(endTimeString);
      
      if (startMinutes > endMinutes) {
        setErrorMessage("Start time cannot be after end time");
        return false;
      }
    }
    
    return true;
  };
  
  // Handle hour input change
  const handleHourChange = (value: string, isStart: boolean) => {
    // Allow empty input or numbers between 0 and 12
    if (value === "" || (/^\d+$/.test(value) && parseInt(value, 10) >= 0 && parseInt(value, 10) <= 12)) {
      if (isStart) {
        setStartTimeState(prev => ({ ...prev, hour: value }));
      } else {
        setEndTimeState(prev => ({ ...prev, hour: value }));
      }
      setErrorMessage(null);
    }
  };
  
  // Handle minute input change
  const handleMinuteChange = (value: string, isStart: boolean) => {
    // Allow empty input or numbers between 0 and 59
    if (value === "" || (/^\d+$/.test(value) && parseInt(value, 10) >= 0 && parseInt(value, 10) <= 59)) {
      if (isStart) {
        setStartTimeState(prev => ({ ...prev, minute: value }));
      } else {
        setEndTimeState(prev => ({ ...prev, minute: value }));
      }
      setErrorMessage(null);
    }
  };
  
  // Toggle AM/PM
  const toggleAmPm = (isStart: boolean) => {
    if (isStart) {
      setStartTimeState(prev => ({ ...prev, isPM: !prev.isPM }));
    } else {
      setEndTimeState(prev => ({ ...prev, isPM: !prev.isPM }));
    }
    setErrorMessage(null);
  };
  
  /**
   * Applies time filtering to the data based on current inputs
   */
  const applyFilter = () => {
    if (!validateTimes()) return;
    
    // Format time strings
    const startTimeString = formatTimeToString(startTimeState);
    const endTimeString = formatTimeToString(endTimeState);
    
    // Get data filtered by other columns (if available)
    const dataToFilter = getFilteredDataExcludingColumn ? 
      getFilteredDataExcludingColumn(timeField as string) : 
      data;
    
    // Convert times to minutes for comparison
    const startMinutes = startTimeString ? timeToMinutes(startTimeString) : null;
    const endMinutes = endTimeString ? timeToMinutes(endTimeString) : null;
    
    // Filter the data
    const filteredData = dataToFilter.filter(item => {
      const value = item[timeField];
      if (!value) return false;
      
      // Convert the value to minutes
      const timeMinutes = timeToMinutes(String(value));
      
      // Skip invalid times
      if (timeMinutes < 0) return false;
      
      // Check if the time is within the range
      if (startMinutes !== null && timeMinutes < startMinutes) return false;
      if (endMinutes !== null && timeMinutes > endMinutes) return false;
      
      return true;
    });
    
    // Check if we have any matches
    if (filteredData.length === 0) {
      setErrorMessage("No matches found for this time range");
      return;
    }
    
    // Clear any error messages
    setErrorMessage(null);
    
    // Set filter as active
    setIsFilterActiveState(true);
    
    // Notify parent of filter state change
    if (onFilterStateChange) {
      onFilterStateChange(startTimeString, endTimeString, true);
    }
    
    // Pass filtered data back to parent
    onFilteredDataChange(filteredData);
  };
  
  const handleClear = () => {
    setStartTimeState({ hour: "", minute: "", isPM: false });
    setEndTimeState({ hour: "", minute: "", isPM: false });
    setErrorMessage(null);
    setIsFilterActiveState(false);
    onClearFilter();
  };
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div className={`p-3 ${className}`}>
      <div className={`space-y-3`}>
        {/* Start Time Input */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            From
          </label>
          <div className="flex items-center space-x-1">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Hour"
              value={startTimeState.hour}
              onChange={(e) => handleHourChange(e.target.value, true)}
              className="w-16 p-1.5 text-xs border border-gray-300 rounded"
              maxLength={2}
            />
            <span className="text-xs">:</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Min"
              value={startTimeState.minute}
              onChange={(e) => handleMinuteChange(e.target.value, true)}
              className="w-16 p-1.5 text-xs border border-gray-300 rounded"
              maxLength={2}
            />
            <div className="relative rounded overflow-hidden">
              <div className="flex text-xs">
                <button
                  type="button"
                  onClick={() => toggleAmPm(true)}
                  className={`px-2 py-1 z-10 transition-colors duration-200 ${
                    !startTimeState.isPM ? 'text-white' : 'text-gray-700 bg-gray-100'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => toggleAmPm(true)}
                  className={`px-2 py-1 z-10 transition-colors duration-200 ${
                    startTimeState.isPM ? 'text-white' : 'text-gray-700 bg-gray-100'
                  }`}
                >
                  PM
                </button>
                <div 
                  className={`absolute top-0 h-full w-1/2 bg-primary transition-transform duration-200 ease-in-out ${
                    startTimeState.isPM ? 'translate-x-full' : 'translate-x-0'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* End Time Input */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            To
          </label>
          <div className="flex items-center space-x-1">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Hour"
              value={endTimeState.hour}
              onChange={(e) => handleHourChange(e.target.value, false)}
              className="w-16 p-1.5 text-xs border border-gray-300 rounded"
              maxLength={2}
            />
            <span className="text-xs">:</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Min"
              value={endTimeState.minute}
              onChange={(e) => handleMinuteChange(e.target.value, false)}
              className="w-16 p-1.5 text-xs border border-gray-300 rounded"
              maxLength={2}
            />
            <div className="relative rounded overflow-hidden">
              <div className="flex text-xs">
                <button
                  type="button"
                  onClick={() => toggleAmPm(false)}
                  className={`px-2 py-1 z-10 transition-colors duration-200 ${
                    !endTimeState.isPM ? 'text-white' : 'text-gray-700 bg-gray-100'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => toggleAmPm(false)}
                  className={`px-2 py-1 z-10 transition-colors duration-200 ${
                    endTimeState.isPM ? 'text-white' : 'text-gray-700 bg-gray-100'
                  }`}
                >
                  PM
                </button>
                <div 
                  className={`absolute top-0 h-full w-1/2 bg-primary transition-transform duration-200 ease-in-out ${
                    endTimeState.isPM ? 'translate-x-full' : 'translate-x-0'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {errorMessage && (
          <div className="text-xs text-red-500">{errorMessage}</div>
        )}
        
        <div className="flex justify-between pt-1">
          <button
            onClick={handleClear}
            className="text-xs text-gray-600 hover:text-gray-800"
            disabled={!isFilterActiveState && 
              !startTimeState.hour && !startTimeState.minute && 
              !endTimeState.hour && !endTimeState.minute}
          >
            Clear
          </button>
          
          <button
            onClick={applyFilter}
            className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90"
            disabled={!startTimeState.hour && !startTimeState.minute && 
              !endTimeState.hour && !endTimeState.minute}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeRangeFilter; 