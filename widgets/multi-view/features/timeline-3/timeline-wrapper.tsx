"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react'
import TimelineContainer, { TimelineContainerRef } from './timeline-container'
import { MappingKeys } from './utils/mapping/timeline-mapping'
import { extractDateRange } from './utils/days/day-range-generator'
import { extractYearRange } from './utils/year-start-end-extractor'
import { getUserGmtOffset } from './utils/timezone-utils'
import { HeaderWrapper } from './components/view-header'

/*
Row 0: "Q2 2024 Development Sprint" (May 1 - June 1, 2024)
Row 1: "Q4 2024 Feature Release" with TWO spans:
First span: May 1 - June 1, 2024
Second span: November 1 - December 1, 2024
Row 2: "Q2 2025 Platform Upgrade" (May 1 - June 1, 2025)
Row 3: "Q4 2025 Integration Phase" (November 1 - December 1, 2025)

*/

const TimelineWrapper = ({ 
  timelineData, 
  mappingKeys,
  views = ['Year', 'Month', 'Week', 'Day'],
  groupByKey, // e.g., 'project_name', 'project_id', 'status'
  isGroupInline = true, // default true for backward compatibility
  showUnifiedEventOnCollapse = true, // default true, show unified event when collapsed
  selectedGroupBy, // Dynamic grouping state (overrides config)
  minimalControlsConfig, // Configuration for minimal controls
  onEventClick,
  onItemDrag,
  onItemResize
}: { 
  timelineData: any
  mappingKeys: any
  views?: string[]
  groupByKey?: string
  isGroupInline?: boolean // true = inline headers, false = sidebar
  showUnifiedEventOnCollapse?: boolean // show unified event when collapsed
  selectedGroupBy?: string | null // Dynamic grouping state
  minimalControlsConfig?: {
    availableColumnsForGrouping?: string[];
  }
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
}) => {
  // Determine effective groupByKey
  // If minimalControlsConfig is present, only use selectedGroupBy (ignore config)
  // Otherwise, use selectedGroupBy with config as fallback
  const isMinimalControlsEnabled = minimalControlsConfig !== undefined;
  const effectiveGroupByKey = isMinimalControlsEnabled 
    ? selectedGroupBy || undefined 
    : selectedGroupBy || groupByKey;
  // Use Month as default view, or first view if Month is not available
  const defaultView = (views && views.length > 0 
    ? (views.includes('Month') ? 'Month' : views[0])
    : 'Month') as 'Year' | 'Month' | 'Week' | 'Day'
  
  // State for view selection
  const [selectedView, setSelectedView] = useState<'Year' | 'Month' | 'Week' | 'Day'>(defaultView)
  
  // State for date selection
  const [selectedDate, setSelectedDate] = useState<string>('')
  
  // State to track current date position for preserving across view changes
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  
  // Ref to timeline container for programmatic scrolling
  const timelineRef = useRef<TimelineContainerRef>(null)
  // Per-view zoom factors (persist when switching views)
  // Initialize zoom factors for all available views
  const initialZoomFactors = views.reduce((acc, view) => {
    acc[view as keyof typeof acc] = 1
    return acc
  }, {} as { Year: number; Month: number; Week: number; Day: number })
  
  const [zoomFactors, setZoomFactors] = useState<{ Year: number; Month: number; Week: number; Day: number }>(
    initialZoomFactors || { Year: 1, Month: 1, Week: 1, Day: 1 }
  )

  // Base widths per view
  const BASE_WIDTHS = {
    Year: 50,   // yearWeekWidth (per week)
    Month: 50,  // monthDayWidth (per day)
    Week: 150,  // weekDayWidth (per day)
    Day: 100,   // hourColumnWidth (per hour)
  } as const

  // Effective widths derived from factors
  const effectiveYearWeekWidth = BASE_WIDTHS.Year * zoomFactors.Year
  const effectiveMonthDayWidth = BASE_WIDTHS.Month * zoomFactors.Month
  const effectiveWeekDayWidth = BASE_WIDTHS.Week * zoomFactors.Week
  const effectiveHourColumnWidth = BASE_WIDTHS.Day * zoomFactors.Day
  
  // Get GMT offset for date calculations
  const gmtShift = getUserGmtOffset()
  
  // Check if today is in the date range based on timeline data to disable today button if not in range
  const isTodayInRange = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return false
    
    const today = new Date()
    const todayYear = today.getFullYear()
    const normalizedToday = new Date(today)
    normalizedToday.setHours(0, 0, 0, 0)
    
    if (selectedView === 'Day') {
      // For Day view: check if today's date is in the date range from data
      const dateRange = extractDateRange(timelineData, mappingKeys.startDateKey, mappingKeys.endDateKey, gmtShift)
      if (!dateRange) return false
      
      const normalizedStart = new Date(dateRange.startDate)
      normalizedStart.setHours(0, 0, 0, 0)
      const normalizedEnd = new Date(dateRange.endDate)
      normalizedEnd.setHours(0, 0, 0, 0)
      
      return normalizedToday >= normalizedStart && normalizedToday <= normalizedEnd
    } else {
      // For Year/Month/Week views: check if today's year is in the year range from data
      const { startYear, endYear } = extractYearRange(timelineData, mappingKeys.startDateKey, mappingKeys.endDateKey)
      return todayYear >= startYear && todayYear <= endYear
    }
  }, [selectedView, timelineData, mappingKeys, gmtShift])
  
  // Navigation handlers
  const handleGoToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    console.log('🎯 Scroll to today requested:', today)
    timelineRef.current?.scrollToToday()
  }
  
  const handleGoToSpecificDate = () => {
    // May 01 2024 02:10
    const targetDate = new Date('2024-05-01T02:10:00')
    timelineRef.current?.scrollToDate(targetDate)
  }

  // Handle date input change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    setSelectedDate(dateValue)
    
    if (dateValue) {
      // Convert date string to Date object and scroll to it
      const targetDate = new Date(dateValue)
      setCurrentDate(targetDate)
      timelineRef.current?.scrollToDate(targetDate)
    }
  }

  // Scroll handlers for chevrons
  const scrollPixels = 100 // Number of pixels to scroll per click
  
  const handleScrollLeft = () => {
    timelineRef.current?.scrollBy(-scrollPixels)
  }
  
  const handleScrollRight = () => {
    timelineRef.current?.scrollBy(scrollPixels)
  }

  // Scroll to today on initial load (only once)
  const [hasInitialized, setHasInitialized] = useState(false)
  useEffect(() => {
    if (timelineRef.current && timelineData && timelineData.length > 0 && !hasInitialized) {
      // Small delay to ensure timeline is fully rendered
      const timeoutId = setTimeout(() => {
        const today = new Date()
        setCurrentDate(today)
        timelineRef.current?.scrollToToday()
        setHasInitialized(true)
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [timelineData, hasInitialized])

  // Preserve date position when switching views
  useEffect(() => {
    if (timelineRef.current && currentDate && hasInitialized) {
      // Small delay to ensure new view is fully rendered
      const timeoutId = setTimeout(() => {
        timelineRef.current?.scrollToDate(currentDate)
      }, 150)
      
      return () => clearTimeout(timeoutId)
    }
  }, [selectedView, currentDate, hasInitialized])




  return (
    <div className='flex h-full min-h-0 w-full flex-col relative isolate'>
      <div className='absolute bottom-4 right-4 z-10'>
      <HeaderWrapper
        views={views}
        selectedView={selectedView}
        onViewChange={setSelectedView}
        zoomFactor={zoomFactors[selectedView]}
        onZoomChange={(factor) =>
          setZoomFactors((prev) => ({ ...prev, [selectedView]: factor }))
        }
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        isTodayInRange={isTodayInRange}
        onGoToToday={handleGoToToday}
        onScrollLeft={handleScrollLeft}
        onScrollRight={handleScrollRight}
      />
      </div>
      {/* Timeline Mapper — min-h-0 so flex-1 can shrink and inner scrollport gets a real height */}
      <div className='flex min-h-0 w-full flex-1 flex-col relative isolate'>
        <TimelineContainer 
          ref={timelineRef}
          data={timelineData} 
          view={selectedView} 
          mappingKeys={mappingKeys}
          groupByKey={effectiveGroupByKey} // Use effectiveGroupByKey to respect selectedGroupBy and minimalControlsConfig
          isGroupInline={isGroupInline} // NEW
          showUnifiedEventOnCollapse={showUnifiedEventOnCollapse} // NEW
          hourColumnWidth={effectiveHourColumnWidth}
          weekDayWidth={effectiveWeekDayWidth}
          monthDayWidth={effectiveMonthDayWidth}
          yearWeekWidth={effectiveYearWeekWidth}
          onEventClick={onEventClick}
          onItemDrag={onItemDrag}
          onItemResize={onItemResize}
        />
      </div>
    </div>
  )
}

export default TimelineWrapper
