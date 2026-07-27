/**
 * Date Selector Dropdown Component
 * 
 * Purpose: Advanced date selection with multiple modes (Date, Week, Month, Range)
 * Used in: Dashboard page for selecting date ranges
 * Why: Provides flexible date selection options for different use cases
 * 
 * UPDATED default date handling in order to fix timezone inconsistency issues by using 
 * createLocalDate() utility function that creates Date objects at local midnight, 
 * ensuring calendar highlighting matches automatically selected current date
 * 
 * UPDATED date formatting to use formatDisplayDate() from utils for consistent
 * date display across the application
 * 
 * Implementation Steps:
 * 1. Create button with dropdown trigger
 * 2. Add mode selector buttons (Date, Week, Month, Range)
 * 3. Implement different calendar views for each mode
 * 4. Add Today button for quick date selection
 * 5. Handle range mode with a unified 2-month calendar view
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { DateRange } from 'react-date-range'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { createLocalDate, formatDisplayDate } from '../../../utils/formatting/date-formatter'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import './calendar.css'
import { useIsMobile } from './use-is-mobile'
/**
 * Date selection mode type
 */
type DateMode = 'day' | 'week' | 'month' | 'range'

/**
 * Date selector dropdown props interface
 * @interface DateSelectorDropdownProps
 */
interface DateSelectorDropdownProps {
  onDateRangeChange: (startDate: string, endDate: string, mode: 'day' | 'week' | 'month' | 'range') => void
  selectedStartDate?: string
  selectedEndDate?: string
  buttonText?: string
  width?: string
  selectedDateMode?: 'day' | 'week' | 'month' | 'range'
  setSelectedDateMode?: (mode: 'day' | 'week' | 'month' | 'range') => void
  initialStartDate?: string
  initialEndDate?: string
  onReset?: () => void
  setIsDropdownOpen?: (isOpen: boolean) => void
  showDateFilterHeader?: boolean
  /** Field label shown in the panel header (e.g. from FilterConfig.label). */
  filterLabel?: string
  /** Panel surface classes (default: translucent background). */
  panelClassName?: string
}

/**
 * Date selector dropdown component
 * @param {DateSelectorDropdownProps} props - Component props
 * @returns {JSX.Element} Date selector with dropdown
 */
export default function DateSelectorDropdown({ 
  setIsDropdownOpen,
  onDateRangeChange,
  selectedStartDate,
  selectedEndDate,
  buttonText = "Select Date Range",
  width = "200px",
  selectedDateMode = 'day',
  setSelectedDateMode,
  initialStartDate,
  initialEndDate,
  onReset,
  showDateFilterHeader = false,
  filterLabel,
  panelClassName = 'bg-background/80 backdrop-blur-sm',
}: DateSelectorDropdownProps) {
  // Helper function to get today's date in YYYY-MM-DD format using local time
  const getTodayString = () => {
    // Use static date for SSR compatibility, will be updated on client
    if (typeof window === 'undefined') {
      return '2024-01-01' // Static date for SSR
    }
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [mode, setMode] = useState<DateMode>(selectedDateMode)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  
  ///////////////////////
  // Date range state for react-date-range
  const [dateRange, setDateRange] = useState([
    {
      startDate: createLocalDate(selectedStartDate),
      endDate: createLocalDate(selectedEndDate),
      key: 'selection'
    }
  ])

  // Same initial value on server and client to avoid hydration mismatch; sync to real year in useEffect
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (selectedStartDate) {
      const date = createLocalDate(selectedStartDate)
      return date.getFullYear()
    }
    return 2024 // Static fallback; updated to current year after mount in useEffect
  })

  ///////////////////////
  // Update date range when props change
  useEffect(() => {
    setDateRange([
      {
        startDate: createLocalDate(selectedStartDate),
        endDate: createLocalDate(selectedEndDate),
        key: 'selection'
      }
    ])
    
    // Update selectedYear when dates change
    if (selectedStartDate) {
      const date = createLocalDate(selectedStartDate)
      setSelectedYear(date.getFullYear())
    }
  }, [selectedStartDate, selectedEndDate])

  // After mount, set year to current year when no date is selected (avoids hydration mismatch from using getFullYear() in initial state)
  useEffect(() => {
    if (!selectedStartDate) {
      setSelectedYear(new Date().getFullYear())
    }
  }, [])



  ///////////////////////
  // Get display text for button
  const getDisplayText = () => {
    const startDate = selectedStartDate || getTodayString()
    const endDate = selectedEndDate || getTodayString()
    
    if (startDate === endDate) {
      return formatDisplayDate(startDate)
    } else {
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
    }
  }

  ///////////////////////
  // Handle date selection from react-date-range
  const handleDateSelect = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange([{...dateRange[0], startDate, endDate }]);
    
    if (startDate && endDate) {
      // Fix timezone issue: use local date instead of UTC
      const formatDateToString = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      
      const startDateString = formatDateToString(startDate)
      const endDateString = formatDateToString(endDate)
      
      onDateRangeChange(startDateString, endDateString, mode)



    }
  }

  ///////////////////////
  // Handle week selection
  const handleWeekSelect = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday start
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
    
    const formatDateToString = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    onDateRangeChange(formatDateToString(weekStart), formatDateToString(weekEnd), mode)
  }

  ///////////////////////
  // Handle month selection
  const handleMonthSelect = (monthIndex: number, year: number) => {
    const monthStart = new Date(year, monthIndex, 1)
    const monthEnd = endOfMonth(monthStart)
    
    const formatDateToString = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    onDateRangeChange(formatDateToString(monthStart), formatDateToString(monthEnd), mode)
  }

  ///////////////////////
  // Handle Today button click
  const handleTodayClick = () => {
    const today = new Date()
    const formatDateToString = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    const todayString = formatDateToString(today)
    onDateRangeChange(todayString, todayString, mode)
  }

  ///////////////////////
  // Handle Reset button click
  const handleResetClick = () => {
    if (onReset) {
      // Use the external reset handler if provided
      onReset();
    } else {
      // Fallback to resetting to initial dates
      onDateRangeChange(initialStartDate || '', initialEndDate || '', mode);
    }
  }

  ///////////////////////
  // Get month names for month selector
  const getMonthNames = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(selectedYear, i, 1), 'MMM'),
      index: i
    }))
  }

  ///////////////////////
  // Render date mode calendar
  const renderDateMode = () => (
    <DateRange
      ranges={dateRange}
      onChange={handleDateSelect}
      rangeColors={['var(--color-primary)']}
      showDateDisplay={false}
      showMonthAndYearPickers={true}
      moveRangeOnFirstSelection={false}
      months={1}
      direction="horizontal"
      minDate={new Date('2020-01-01')}
      maxDate={new Date('2030-12-31')}
      weekStartsOn={1}
    />
  )

  ///////////////////////
  // Render week mode calendar
  const renderWeekMode = () => {
    // Calculate the week range for the currently selected dates
    const currentStartDate = createLocalDate(selectedStartDate)
    const currentEndDate = createLocalDate(selectedEndDate)
    
    return (
      <div className="space-y-4">
        {/* <p className="text-sm text-gray-600">Click on any date to select that week</p> */}
        <DateRange
          ranges={[{
            startDate: currentStartDate,
            endDate: currentEndDate,
            key: 'selection'
          }]}
          onChange={(ranges: any) => {
            // Handle single date selection for week mode
            if (ranges.selection && ranges.selection.startDate) {
              handleWeekSelect(ranges.selection.startDate)
            }
          }}
          rangeColors={['var(--color-primary)']}
          showDateDisplay={false}
          showMonthAndYearPickers={true}
          moveRangeOnFirstSelection={false}
          months={1}
          direction="horizontal"
          minDate={new Date('2020-01-01')}
          maxDate={new Date('2030-12-31')}
          weekStartsOn={1}
        />
      </div>
    )
  }

  ///////////////////////
  // Render month mode selector
  const renderMonthMode = () => {
    // Check if a month is currently selected
    const getSelectedMonth = () => {
      if (selectedStartDate && selectedEndDate) {
        const startDate = createLocalDate(selectedStartDate)
        const endDate = createLocalDate(selectedEndDate)
        // Check if it's a full month selection (start is first day, end is last day of same month)
        const isFullMonth = 
          startDate.getDate() === 1 &&
          startDate.getMonth() === endDate.getMonth() &&
          startDate.getFullYear() === endDate.getFullYear() &&
          endDate.getDate() === new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate()
        
        if (isFullMonth && startDate.getFullYear() === selectedYear) {
          return startDate.getMonth()
        }
      }
      return null
    }

    const selectedMonthIndex = getSelectedMonth()

    return (
      <div className="relative">
        {/* <p className="text-sm text-gray-600">Select a month to view all dates</p> */}
        
        {/* <button className="absolute top-0 right-0 cursor-pointer w-4 h-4" onClick={() => setIsDropdownOpen?.(false)}>
          <X className="cursor-pointer w-4 h-4" />
        </button> */}

        {/* Year Selector */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="cursor-pointer p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            <ChevronLeft className="cursor-pointer w-4 h-4" />
          </button>
          <span className="text-base font-medium text-foreground">
            {selectedYear}
          </span>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            className="cursor-pointer p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            <ChevronRight className="cursor-pointer w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5 mt-4">
          {getMonthNames().map((month) => {
            const isSelected = selectedMonthIndex === month.index
            return (
              <button
                key={month.index}
                onClick={() => handleMonthSelect(month.index, selectedYear)}
                className={`cursor-pointer px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-tertiary transition-colors ${
                  isSelected
                    ? 'bg-tertiary text-tertiary-foreground border-tertiary hover:bg-tertiary/90'
                    : 'border-border bg-background text-foreground hover:bg-muted hover:border-tertiary/50'
                }`}
              >
                {month.name}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  ///////////////////////
  // Render range mode with a 2-month calendar
  // Mobile: stack months vertically; desktop: side-by-side
  const renderRangeMode = () => (
    <DateRange
      onChange={(item: any) => handleDateSelect(item)}
      moveRangeOnFirstSelection={false}
      months={2}
      ranges={dateRange}
      direction={isMobile ? 'vertical' : 'horizontal'}
      weekStartsOn={1}
      rangeColors={['var(--color-primary)']}
    />
  );
  

  return (
    <div className="relative" ref={dropdownRef} style={{ width }}>
        <div
          className={`mt-1 w-full max-w-[calc(100vw-1rem)] border border-border rounded-lg shadow-lg z-50 ${panelClassName}`}
          style={{
          width: mode === 'range' || showDateFilterHeader ? 'fit-content' : '250px'
        }}>
          <div className="flex flex-col items-center justify-center p-3 md:p-4">
            {/* Header */}
            <div className={`mr-auto mb-2 w-full ${showDateFilterHeader ? 'block' : 'hidden'}`}>
              <p className="text-xs font-medium">
                {filterLabel || buttonText || 'Date'}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {filterLabel
                  ? `Filter results by day, week, month, or range`
                  : 'Filter results by day, week, month, or range'}
              </p>
              {/* Mode Selector Buttons */}
              <div className="mt-2 flex gap-1">
                {(['day', 'week', 'month', 'range'] as DateMode[]).map((modeOption) => (
                  <button
                    key={modeOption}
                    onClick={() => setMode(modeOption)}
                    className={`cursor-pointer px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      mode === modeOption
                        ? 'bg-tertiary text-background hover:bg-tertiary/90'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Content */}
            {mode === 'day' && renderDateMode()}
            {mode === 'week' && renderWeekMode()}
            {mode === 'month' && renderMonthMode()}
            {mode === 'range' && renderRangeMode()}

            <div className='flex justify-between mt-2 w-full'>
              {mode === 'day' && (
                <button
                  onClick={handleTodayClick}
                  className="cursor-pointer px-3 py-1 text-xs font-medium bg-tertiary text-background rounded-md hover:bg-tertiary/90 focus:outline-none focus:ring-2 focus:ring-tertiary transition-colors"
                >
                  Choose Today
                </button>
              )}


              <div className='flex gap-2 ml-auto'>
                <button
                  onClick={handleResetClick}
                  className="cursor-pointer px-3 py-1 text-xs font-medium bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-red-500 rounded-md hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-destructive transition-colors"
                >
                  Reset
                </button>

                <button className="cursor-pointer px-3 py-1 text-xs font-medium bg-muted text-foreground rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-tertiary transition-colors" onClick={() => setIsDropdownOpen?.(false)}>
                    Close
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
} 