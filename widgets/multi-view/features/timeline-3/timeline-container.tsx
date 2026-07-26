"use client"
/**
 * Timeline Mapper Component
 * 
 * Purpose: Renders timeline visualization with year range extraction and display
 * Used in: app/development/timeline-2/page.tsx
 * Why: Provides a visual timeline interface that shows data across a calculated year range
 * 
 * Function Index:
 * TimelineMapper: Main component that displays timeline with extracted year range
 * 
 * Example input: timelineData: [{created_at: '2023-01-15', due_date: '2024-06-20'}, ...]
 * Example output: Timeline visualization with start/end years
 * 
 * Steps:
 * 1. Extract year range from timelineData using utility function
 * 2. Console log the extracted years for debugging
 * 3. Render timeline interface with year information
 */

import React, { useEffect, useState, useMemo, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useDndMonitor, useSensor, useSensors } from '@dnd-kit/core'
import { extractYearRange } from './utils/year-start-end-extractor' // to extract the start and end years from the data ex: startYear: 2023, endYear: 2025 this means we have 3 years in the timeline: 2023, 2024, 2025
import { generateYearsInRange } from './utils/years-in-range' // ex: [2023, 2024, 2025]
import { extractDateRange, generateDaysInRange } from './utils/days/day-range-generator' // for day view
import { groupDaysByMonth } from './utils/days/day-formatter' // for day view formatting
import DayView from './components/main/day-view' // day view component
import YearMonthWeekView from './components/main/year-month-week-view' // year/month/week view component
import VirtualizedTimelineContainer, { VirtualizedTimelineContainerRef } from './virtualization/components/virtualized-timeline-container' // virtualized container
import GroupSidebar from './components/grouping/group-sidebar' // sidebar grouping component
import { getTotalYearWidth, getMonthWidths } from './utils/year/month-width-calculator' // for dynamic width calculation
import { mapTimelineDataToCellIds, MappingKeys, MappedTimelineItem } from './utils/mapping/timeline-mapping' // for mapping data to cell IDs

// Grouped timeline data structure
export interface GroupedTimelineData {
  groupKey: string | null // The value to group by (e.g., "Project A", "Project B")
  items: MappedTimelineItem[][] // The actual timeline rows for this group
  isHeader: boolean // true for header rows, false for data rows
}

// Group metadata for sidebar mode
export interface GroupSidebarInfo {
  groupKey: string | null // The value to group by (e.g., "Project A", "Project B")
  startRowIndex: number // First row index for this group
  itemCount: number // Number of items (rows) in this group
  height: number // Total height: itemCount * rowHeight
}
import { calculateNewDates } from './utils/dnd/timeline-item-updater'
import { updateDayTimelineItemDates, calculateDayResizeLeftDates, calculateDayResizeRightDates } from './utils/dnd/day-view-item-updater'
import DragPreviewOverlay from './components/dnd/drag-preview-overlay' // for updating item dates (Year/Month/Week views and Day view)
import VisibleRangeContext from './virtualization/context/visible-range-context' // context for virtualization
import { useVisibleYears } from './virtualization/hooks/use-visible-years' // hook for year virtualization
import { useVisibleDays } from './virtualization/hooks/use-visible-days' // hook for day virtualization
import { useVisibleRows } from './virtualization/hooks/use-visible-rows' // hook for row virtualization
import { OVERSCAN_YEARS, OVERSCAN_DAYS, OVERSCAN_ROWS, MIN_ROWS } from './virtualization/timeline-config' // import overscan configuration
import { getUserGmtOffset } from './utils/timezone-utils' // get user's timezone offset
import { filterDataByYear, filterDataByMonth, filterDataByDay } from './utils/filtering/timeline-data-filter' // data filtering utilities

/**
 * TimelineContainer Ref Interface
 * 
 * Purpose: Exposes imperative methods for programmatic timeline navigation
 * Used by: parent components (page.tsx) to trigger scroll-to-date actions
 */
export interface TimelineContainerRef {
  scrollToToday: () => void
  scrollToDate: (date: Date) => void
  scrollBy: (deltaX: number) => void        // Scroll by pixel amount (positive = right, negative = left)
}

interface TimelineContainerProps {
  data: any[]
  view: 'Year' | 'Month' | 'Week' | 'Day'
  mappingKeys: MappingKeys
  groupByKey?: string // NEW
  isGroupInline?: boolean // NEW: true = inline headers, false = sidebar
  showUnifiedEventOnCollapse?: boolean // NEW: default true, show unified event when collapsed
  hourColumnWidth?: number // width per hour for Day view (px). Defaults to 100
  weekDayWidth?: number // width per day in Week view (px)
  monthDayWidth?: number // width per day in Month view (px)
  yearWeekWidth?: number // width per week in Year view (px)
  onEventClick?: (eventId: string) => void // callback when event/item is clicked
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void // callback when item is dragged
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void // callback when item is resized
}

const TimelineContainer = forwardRef<TimelineContainerRef, TimelineContainerProps>(
  ({ data, view, mappingKeys, groupByKey, isGroupInline = true, showUnifiedEventOnCollapse = true, hourColumnWidth: hourWidthProp, weekDayWidth: weekWidthProp, monthDayWidth: monthWidthProp, yearWeekWidth: yearWeekWidthProp, onEventClick, onItemDrag, onItemResize }, ref) => {
  //////////////////////////////////
  // State management: initialize with passed data and manage timeline state
  //////////////////////////////////
  // store original data, this will be updated on user interaction and this does update the mapped timeline data
  const [rawData, setRawData] = useState<any[]>(data)

  const [startYear, setStartYear] = useState<number | null>(null)
  const [endYear, setEndYear] = useState<number | null>(null)
  
  // Ex: [2023, 2024, 2025]
  const [yearsInRange, setYearsInRange] = useState<number[]>([])

  // Store mapped timeline data (array of arrays grouped by ID) 
  // mapped data have metadata object for cell positioning with format like startCellId (x-axis span start), endCellId (x-axis span end), timlineIndex (y-axis index)
  const [timelineData, setTimelineData] = useState<MappedTimelineItem[][]>([])
  
  // Grouped timeline data for grouping feature
  const [groupedTimelineData, setGroupedTimelineData] = useState<GroupedTimelineData[]>([])
  
  // Group sidebar data for sidebar grouping mode
  const [groupSidebarData, setGroupSidebarData] = useState<GroupSidebarInfo[]>([])
  
  // Collapsed groups state for sidebar grouping
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string | null>>(new Set())
  
  // Day view state
  const [daysInRange, setDaysInRange] = useState<Date[]>([]) // Array of all days in date range
  const [daysGroupedByMonth, setDaysGroupedByMonth] = useState<any[]>([]) // Days grouped by month
  
  // DnD state
  const [activeItem, setActiveItem] = useState<MappedTimelineItem | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ cellId: string, year: number, month: number, day: number, hour?: number, minute?: number } | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false) // Track global drag state for optimizing droppables

  //////////////////////////////////
  // Virtualization state: track scroll position for visible range calculation
  // Why: Enable year/day-level virtualization and row virtualization to reduce DOM elements
  //////////////////////////////////
  const [scrollOffset, setScrollOffset] = useState<number>(0)       // Horizontal scroll
  const [viewportWidth, setViewportWidth] = useState<number>(0)
  const [scrollTop, setScrollTop] = useState<number>(0)              // Vertical scroll
  const [viewportHeight, setViewportHeight] = useState<number>(0)
  const scrollContainerRef = useRef<VirtualizedTimelineContainerRef>(null)

  // Get user's GMT offset dynamically
  const gmtShift = getUserGmtOffset();

  // Configure sensors with activation constraints
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
      tolerance: 20
    }
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 20
    }
  })
  const sensors = useSensors(mouseSensor, touchSensor)


  //////////////////////////////////
  // Configuration constants: make timeline fully configurable
  //////////////////////////////////
  const rowHeight = 40 // px
  
  // Calculate widths based on view
  // Year View - Width for each week cell in Year view
  const yearWeekWidth = yearWeekWidthProp ?? 50 // px

  // Month View - Width for each day cell in Month view
  const monthDayWidth = monthWidthProp ?? 50 // px

  // Week View - Width for each day cell in Week view
  const weekDayWidth = weekWidthProp ?? 150 // px

  // Day View - Width for each day cell in Day view - not used
  const dayColumnWidth = 1000 // px

  // Day View - Width for each hour cell in Day view
  const hourColumnWidth = hourWidthProp ?? 100 // px

  
  // Calculate total timeline width based on view
  // This is used by VirtualizedTimelineContainer and YearMonthWeekView for proper rendering
  let totalTimelineWidth: number
  if (view === 'Day') {
    // Day view calculates its own width dynamically per day
    totalTimelineWidth = daysInRange.length * dayColumnWidth
  } else {
    // Year/Month/Week views use dynamic month widths
    totalTimelineWidth = yearsInRange.reduce((total, year) => {
      const monthWidths = view === 'Week' 
        ? getMonthWidths(year, view, yearWeekWidth, monthDayWidth, weekDayWidth)
        : getMonthWidths(year, view, yearWeekWidth, monthDayWidth)
      return total + getTotalYearWidth(monthWidths)
    }, 0)
  }

  /** Match GroupSidebar min width (200px) + base title inset (8px) when sidebar grouping is active */
  const isSidebarGrouped =
    !isGroupInline && Boolean(groupByKey) && groupSidebarData.length > 0
  const titleStickyLeftPx = isSidebarGrouped ? 208 : 8

  const cellStyle = useMemo(
    () => ({
      borderRadius: '6px',
      height: '80%',
      width: '100%',
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      padding: '4px 8px',
      margin: '0',
      display: 'flex',
      alignItems: 'start',
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      className: 'timeline-item-custom',
      titleClassName: 'timeline-title-custom',
      titleStyle: {
        fontSize: '12px',
        position: 'sticky' as const,
        top: '1px',
        left: `${titleStickyLeftPx}px`,
      },
    }),
    [titleStickyLeftPx]
  )

  //////////////////////////////////
  // Virtualization: Calculate visible years and days based on scroll position
  // Why useMemo: Only recalculate when scroll, viewport, or data changes
  // How it helps: Prevents unnecessary re-renders and calculations
  // Performance impact: 80% reduction in DOM elements (e.g., 2,190 days → ~400 days rendered)
  //////////////////////////////////
  
  // Calculate visible years for Year/Month/Week views
  const visibleYearsData = useVisibleYears({
    allYears: yearsInRange,
    view: view === 'Day' ? 'Month' : view, // Use Month as fallback for Day view
    scrollOffset,
    viewportWidth,
    yearWeekWidth,
    monthDayWidth,
    weekDayWidth,
    overscanCount: OVERSCAN_YEARS // Use centralized config (currently 0)
  })

  // Calculate visible days for Day view
  const visibleDaysData = useVisibleDays({
    allDays: daysInRange,
    scrollOffset,
    viewportWidth,
    hourColumnWidth,
    overscanCount: OVERSCAN_DAYS // Use centralized config (currently 0)
  })

  // Calculate visible rows for vertical virtualization
  // For sidebar mode, no header rows are included
  const totalRowsForVirtualization = groupByKey && !isGroupInline && groupSidebarData.length > 0
    ? timelineData.length // No header rows in sidebar mode
    : groupByKey && isGroupInline && groupedTimelineData.length > 0
      ? groupedTimelineData.length // Includes header rows in inline mode
      : Math.max(MIN_ROWS, timelineData.length)
  const visibleRowsData = useVisibleRows({
    scrollTop,
    viewportHeight,
    rowHeight,
    totalRows: totalRowsForVirtualization,
    overscanCount: OVERSCAN_ROWS // Use centralized config (5 rows)
  })

  //////////////////////////////////
  // Scroll Handler: Update scroll state from VirtualizedTimelineContainer
  // Updated to handle both horizontal and vertical scroll
  //////////////////////////////////
  const handleScroll = (newScrollLeft: number, newScrollTop: number, newViewportWidth: number, newViewportHeight: number) => {
    setScrollOffset(newScrollLeft)
    setViewportWidth(newViewportWidth)
    setScrollTop(newScrollTop)
    setViewportHeight(newViewportHeight)
  }

  //////////////////////////////////
  // Group Toggle Handler: Toggle collapse state for sidebar groups
  //////////////////////////////////
  const handleGroupToggle = useCallback((groupKey: string | null) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }, [])

  //////////////////////////////////
  // Imperative Methods: Expose scroll-to-date functionality via ref
  //////////////////////////////////
  
  // Helper function to scroll to a specific date (memoized to prevent re-creation)
  const scrollToDateInternal = useCallback((targetDate: Date) => {
    if (!scrollContainerRef.current) return

    console.log('🎯 Scroll to date requested:', {
      targetDate: targetDate.toISOString(),
      view
    })

    // Get viewport width for centering calculation
    // Use getViewportWidth() from ref, fallback to state if ref method not available
    const currentViewportWidth = scrollContainerRef.current.getViewportWidth() || viewportWidth || 800
    const halfViewport = currentViewportWidth / 2
    // Align scroll-to-date with visible timeline when group sidebar (200px) sits inside scroll content
    const groupSidebarScrollAdjust =
      !isGroupInline && groupByKey && groupSidebarData.length > 0 ? -300 : 0

    if (view === 'Day') {
      // Day view: calculate scroll position based on day index
      const targetDayIndex = daysInRange.findIndex(day => {
        const normalizedDay = new Date(day)
        normalizedDay.setHours(0, 0, 0, 0)
        const normalizedTarget = new Date(targetDate)
        normalizedTarget.setHours(0, 0, 0, 0)
        return normalizedDay.getTime() === normalizedTarget.getTime()
      })

      if (targetDayIndex !== -1) {
        // CRITICAL FIX: Day view uses hourColumnWidth, not dayColumnWidth
        // Each day width = 24 hours × hourColumnWidth
        const dayWidth = 24 * hourColumnWidth
        const hour = targetDate.getHours()
        const targetPosition = (targetDayIndex * dayWidth) + (hour * hourColumnWidth)
        
        // Center the target position in the viewport (subtract when group sidebar consumes left width)
        const scrollX = Math.max(0, targetPosition - halfViewport - groupSidebarScrollAdjust)
        
        console.log('📍 Day view scroll calculation:', {
          targetDayIndex,
          hour,
          dayWidth,
          hourColumnWidth,
          targetPosition,
          viewportWidth: currentViewportWidth,
          scrollX,
          formula: `max(0, ${targetPosition} - ${halfViewport} - ${groupSidebarScrollAdjust}) = ${scrollX}`
        })
        
        scrollContainerRef.current.scrollTo(scrollX)
      } else {
        console.warn('❌ Target day not found in daysInRange:', {
          targetDate: targetDate.toISOString(),
          totalDays: daysInRange.length,
          firstDay: daysInRange[0]?.toISOString(),
          lastDay: daysInRange[daysInRange.length - 1]?.toISOString()
        })
      }
    } else {
      // Year/Month/Week view: calculate scroll position based on year + month + day
      const targetYear = targetDate.getFullYear()
      const targetMonth = targetDate.getMonth() + 1 // 1-12
      const targetDay = targetDate.getDate() // 1-31
      
      const yearPosition = visibleYearsData.yearPositions.get(targetYear)
      
      if (yearPosition) {
        // Get month widths for this year to calculate precise position
        const monthWidths = view === 'Week'
          ? getMonthWidths(targetYear, view, yearWeekWidth, monthDayWidth, weekDayWidth)
          : getMonthWidths(targetYear, view, yearWeekWidth, monthDayWidth)
        
        // Calculate offset within the year
        let offsetInYear = 0
        
        // Add width of all months before target month
        for (let m = 0; m < targetMonth - 1; m++) {
          offsetInYear += monthWidths[m]
        }
        
        // Add offset within the target month based on view
        if (view === 'Month' || view === 'Week') {
          // In Month/Week view, add width for days before target day
          const daysInMonth = new Date(targetYear, targetMonth, 0).getDate()
          const cellWidth = view === 'Month' ? monthDayWidth : weekDayWidth
          const dayOffset = (targetDay - 1) * cellWidth
          offsetInYear += dayOffset
        }
        // In Year view, we scroll to the start of the month (weeks don't align with specific days)
        
        const targetPosition = yearPosition.startX + offsetInYear
        
        // Center the target position in the viewport (subtract when group sidebar consumes left width)
        const scrollX = Math.max(0, targetPosition - halfViewport - groupSidebarScrollAdjust)
        
        console.log('📍 Year/Month/Week scroll calculation:', {
          targetYear,
          targetMonth,
          targetDay,
          yearStartX: yearPosition.startX,
          offsetInYear,
          targetPosition,
          viewportWidth: currentViewportWidth,
          scrollX,
          view,
          monthWidths,
          groupSidebarScrollAdjust
        })
        
        scrollContainerRef.current.scrollTo(scrollX)
      } else {
        console.warn('❌ Target year not found in yearPositions:', {
          targetYear,
          availableYears: Array.from(visibleYearsData.yearPositions.keys())
        })
      }
    }
  }, [view, daysInRange, hourColumnWidth, visibleYearsData.yearPositions, yearWeekWidth, monthDayWidth, weekDayWidth, viewportWidth, isGroupInline, groupByKey, groupSidebarData.length])
  
  useImperativeHandle(ref, () => ({
    scrollToToday: () => {
      const today = new Date()
      scrollToDateInternal(today)
    },
    scrollToDate: (targetDate: Date) => {
      scrollToDateInternal(targetDate)
    },
    scrollBy: (deltaX: number) => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy(deltaX)
      }
    }
  }), [scrollToDateInternal])

  //////////////////////////////////
  // Context Value: Provide visible range data to all child components
  // Memoized to prevent unnecessary context updates
  //////////////////////////////////
  const visibleRangeContextValue = useMemo(() => ({
    // Year-level virtualization
    visibleYears: visibleYearsData.visibleYears,
    allYears: yearsInRange,
    yearPositions: visibleYearsData.yearPositions,
    
    // Day-level virtualization
    visibleDays: visibleDaysData.visibleDays,
    allDays: daysInRange,
    dayPositions: visibleDaysData.dayPositions,
    
    // Horizontal scroll metadata
    scrollOffset,
    viewportWidth,
    
    // Vertical scroll metadata
    scrollTop,
    viewportHeight,
    
    // Row virtualization
    visibleRowIndices: visibleRowsData.visibleRowIndices,
    totalRows: totalRowsForVirtualization, // Includes MIN_ROWS when data is less than minimum
    
    // Dynamic range expansion for drag operations
    expandVisibleRange: (targetYear?: number, targetDay?: Date) => {
      // TODO: Implement dynamic expansion if drag extends beyond overscan
      // For now, 1-year overscan handles most cases
      console.log('Expand visible range:', { targetYear, targetDay })
    },
    
    // Drag state (for optimizing droppable hook usage)
    isDragging
  }), [
    visibleYearsData.visibleYears,
    visibleYearsData.yearPositions,
    yearsInRange,
    visibleDaysData.visibleDays,
    visibleDaysData.dayPositions,
    daysInRange,
    scrollOffset,
    viewportWidth,
    scrollTop,
    viewportHeight,
    visibleRowsData.visibleRowIndices,
    timelineData.length,
    isDragging
  ])

  //////////////////////////////////
  // Update raw data when props.data changes
  //////////////////////////////////
  useEffect(() => {
    setRawData(data)
  }, [data])
  

  //////////////////////////////////
  // Map and extract year/day ranges from raw data
  // Step 1: Map data and extract date ranges (independent of visible range)
  //////////////////////////////////
  const [mappedData, setMappedData] = useState<MappedTimelineItem[][]>([])
  
  useEffect(() => {
    // Log the selected view for debugging
    console.log('Selected view:', view)
    
    // Map timeline data to cell IDs using utility function (apply GMT shift for display)
    const mapped = mapTimelineDataToCellIds(rawData || [], mappingKeys, gmtShift)
    setMappedData(mapped)
    console.log('📊 MAPPED TIMELINE DATA:', mapped)
    
    if (view === 'Day') {
      // For Day view: extract date range and generate days (apply GMT shift for display)
      const dateRange = extractDateRange(rawData || [], mappingKeys.startDateKey, mappingKeys.endDateKey, gmtShift)
      if (dateRange) {
        const days = generateDaysInRange(dateRange.startDate, dateRange.endDate)
        setDaysInRange(days)
        
        const grouped = groupDaysByMonth(days)
        setDaysGroupedByMonth(grouped)
        
        console.log('Days in range:', days.length)
        console.log('Days grouped by month:', grouped)
      }
    } else {
      // For Year/Month/Week views: extract year range
      const { startYear, endYear } = extractYearRange(rawData || [], mappingKeys.startDateKey, mappingKeys.endDateKey)
      setStartYear(startYear)
      setEndYear(endYear)
      
      // Generate years array for timeline display
      const years = generateYearsInRange(startYear, endYear)
      setYearsInRange(years)
    }
    
  }, [rawData, view, mappingKeys, gmtShift]) // Only re-run when raw data or view changes
  
  //////////////////////////////////
  // Create stable references for visible years/days to prevent infinite loops
  // Convert arrays to strings for dependency comparison
  //////////////////////////////////
  const visibleYearsString = useMemo(() => 
    visibleYearsData.visibleYears.join(','), 
    [visibleYearsData.visibleYears]
  )
  
  const visibleDaysString = useMemo(() => 
    visibleDaysData.visibleDays.map(d => d.toISOString()).join(','), 
    [visibleDaysData.visibleDays]
  )
  
  //////////////////////////////////
  // Filter mapped data based on visible date range (horizontal virtualization)
  // Step 2: Filter based on visible years/days (runs when scroll position changes)
  // NOTE: Always show all data initially - filtering only applies during horizontal scroll
  //////////////////////////////////
  useEffect(() => {
    if (mappedData.length === 0) {
      setTimelineData([])
      setGroupedTimelineData([])
      return
    }
    
    // IMPORTANT: Show ALL data initially, only filter when we have valid visible range data
    // This prevents the "no data on refresh" issue
    let filteredData = mappedData
    
    // Only filter if we have a valid visible range (not empty arrays)
    const hasValidYearRange = visibleYearsData.visibleYears.length > 0 && yearsInRange.length > 0
    const hasValidDayRange = visibleDaysData.visibleDays.length > 0 && daysInRange.length > 0
    
    if (view === 'Year' && hasValidYearRange) {
      // Year view: filter by visible years
      console.log(`\n${'='.repeat(60)}`)
      console.log(`📊 YEAR VIEW - Filtering Data`)
      console.log(`${'='.repeat(60)}`)
      filteredData = filterDataByYear(mappedData, visibleYearsData.visibleYears, mappingKeys)
      console.log('🔍 Filter Result:', mappedData.length, '→', filteredData.length, 'items')
      console.log(`${'='.repeat(60)}\n`)
    } else if ((view === 'Month' || view === 'Week') && hasValidYearRange) {
      // Month/Week view: filter by visible months
      console.log(`\n${'='.repeat(60)}`)
      console.log(`📊 ${view.toUpperCase()} VIEW - Filtering Data`)
      console.log(`${'='.repeat(60)}`)
      console.log('📅 Visible Years (base):', visibleYearsData.visibleYears.sort((a, b) => a - b).join(', '))
      filteredData = filterDataByMonth(
        mappedData,
        visibleYearsData.visibleYears,
        scrollOffset,
        visibleYearsData.yearPositions,
        mappingKeys,
        viewportWidth
      )
      console.log('🔍 Filter Result:', mappedData.length, '→', filteredData.length, 'items')
      console.log(`${'='.repeat(60)}\n`)
    } else if (view === 'Day' && hasValidDayRange) {
      // Day view: filter by visible days
      console.log(`\n${'='.repeat(60)}`)
      console.log(`📊 DAY VIEW - Filtering Data`)
      console.log(`${'='.repeat(60)}`)
      filteredData = filterDataByDay(mappedData, visibleDaysData.visibleDays, mappingKeys)
      console.log('🔍 Filter Result:', mappedData.length, '→', filteredData.length, 'items')
      console.log(`${'='.repeat(60)}\n`)
    } else {
      // No valid range yet OR initial load - show all data
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Showing ALL data (no filtering yet):', mappedData.length, 'items')
      }
    }
    
    // Sort filtered data by start date (earliest start date in each group)
    // Get the earliest start date from each group (helper function)
    const getEarliestStartDate = (group: MappedTimelineItem[]): Date => {
      return group.reduce((earliest, item) => {
        const itemStart = new Date(item.mapping.startDate)
        return itemStart < earliest ? itemStart : earliest
      }, new Date(group[0].mapping.startDate))
    }
    
    // Sort groups by earliest start date (ascending - earliest dates first)
    const sortedData = [...filteredData].sort((groupA, groupB) => {
      const earliestA = getEarliestStartDate(groupA)
      const earliestB = getEarliestStartDate(groupB)
      return earliestA.getTime() - earliestB.getTime()
    })
    
    // Sort items within each group by start date (ascending)
    const finalData = sortedData.map(group => {
      return [...group].sort((a, b) => {
        const dateA = new Date(a.mapping.startDate).getTime()
        const dateB = new Date(b.mapping.startDate).getTime()
        return dateA - dateB
      })
    })
    
    // If groupByKey is provided, group the filtered data
    if (groupByKey) {
      // Group items by the specified key
      const groupMap = new Map<string | null, MappedTimelineItem[][]>()
      
      finalData.forEach((itemGroup) => {
        // Get the group value from the first item in the group
        const firstItem = itemGroup[0]
        const groupValue = firstItem?.[groupByKey] || null
        
        if (!groupMap.has(groupValue)) {
          groupMap.set(groupValue, [])
        }
        groupMap.get(groupValue)!.push(itemGroup)
      })
      
      if (isGroupInline) {
        // Inline grouping: create header rows
        const grouped: GroupedTimelineData[] = []
        groupMap.forEach((items, groupKey) => {
          // Add header row
          grouped.push({
            groupKey,
            items: [],
            isHeader: true
          })
          // Add data rows
          items.forEach(itemGroup => {
            grouped.push({
              groupKey,
              items: [itemGroup],
              isHeader: false
            })
          })
        })
        
        setGroupedTimelineData(grouped)
        setGroupSidebarData([])
        // Also update timelineData for backward compatibility (flatten grouped data)
        setTimelineData(grouped.filter(g => !g.isHeader).flatMap(g => g.items))
      } else {
        // Sidebar grouping: calculate group metadata, no header rows
        const sidebarGroups: GroupSidebarInfo[] = []
        let currentRowIndex = 0
        const filteredTimelineData: MappedTimelineItem[][] = []
        
        groupMap.forEach((items, groupKey) => {
          const isCollapsed = collapsedGroups.has(groupKey)
          const originalItemCount = items.length
          let displayItemCount: number
          let groupData: MappedTimelineItem[][]
          
          if (isCollapsed) {
            if (showUnifiedEventOnCollapse && items.length > 0) {
              // Create unified event from earliest start to latest end
              // Flatten all items from all item groups in this group
              const allItems = items.flat()
              
              // Find earliest start date and latest end date
              const allStartDates = allItems.map(item => item.mapping.startDate)
              const allEndDates = allItems.map(item => item.mapping.endDate)
              
              const earliestStart = new Date(Math.min(...allStartDates.map(d => d.getTime())))
              const latestEnd = new Date(Math.max(...allEndDates.map(d => d.getTime())))
              
              // Use the first item as a template for the unified event
              const firstItem = allItems[0]
              
              // Create unified item with merged date range
              const unifiedItem: MappedTimelineItem = {
                ...firstItem,
                // Override with unified dates (keep as Date objects for mapping)
                [mappingKeys.startDateKey]: earliestStart.toISOString(),
                [mappingKeys.endDateKey]: latestEnd.toISOString(),
                // Update mapping metadata
                mapping: {
                  ...firstItem.mapping,
                  startDate: earliestStart,
                  endDate: latestEnd,
                  startCellId: `${currentRowIndex}:${earliestStart.getFullYear()}:${earliestStart.getMonth() + 1}:${earliestStart.getDate()}`,
                  endCellId: `${currentRowIndex}:${latestEnd.getFullYear()}:${latestEnd.getMonth() + 1}:${latestEnd.getDate()}`,
                  timelineIndex: currentRowIndex
                },
                // Add metadata to identify this as a unified collapsed event
                _isUnifiedCollapsedEvent: true,
                _originalItemCount: originalItemCount
                // Title is not modified - will be replaced with date range in draggable component
              }
              
              groupData = [[unifiedItem]] // Single unified event in array format
              displayItemCount = 1
            } else {
              // Original behavior: empty row (when showUnifiedEventOnCollapse is false)
              groupData = []
              displayItemCount = 1
            }
          } else {
            // Expanded: show all items
            groupData = items
            displayItemCount = originalItemCount
          }
          
          const displayHeight = displayItemCount * rowHeight
          
          sidebarGroups.push({
            groupKey,
            startRowIndex: currentRowIndex,
            itemCount: originalItemCount, // Keep original count for display/tooltip
            height: displayHeight
          })
          
          // Add the group data (unified event or all items or empty)
          filteredTimelineData.push(...groupData)
          
          currentRowIndex += displayItemCount
        })
        
        setGroupSidebarData(sidebarGroups)
        setGroupedTimelineData([]) // No inline headers
        // Use filtered data based on collapse state
        setTimelineData(filteredTimelineData)
      }
    } else {
      // No grouping
      setGroupedTimelineData([])
      setGroupSidebarData([])
      setTimelineData(finalData)
    }
    
  }, [mappedData, view, visibleYearsString, visibleDaysString, scrollOffset, viewportWidth, mappingKeys, visibleYearsData.visibleYears, visibleDaysData.visibleDays, visibleYearsData.yearPositions, yearsInRange.length, daysInRange.length, groupByKey, isGroupInline, rowHeight, collapsedGroups, showUnifiedEventOnCollapse]) // Use string versions for stable comparison

  //////////////////////////////////
  // DnD handler: handle drag start
  //////////////////////////////////
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const item = active.data.current?.item as MappedTimelineItem
    if (item) {
      setActiveItem(item)
      setIsDragging(true) // Enable droppables globally
      console.log('🎯 DRAG START:', { item: item[mappingKeys.titleKey], startCellId: item.mapping.startCellId })
    }
  }

  //////////////////////////////////
  // DnD handler: handle drag end
  //////////////////////////////////
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && over.data.current && activeItem) {
      const droppedCell = over.data.current
      
      console.log('🎯 DROP SUCCESS:', {
        item: activeItem[mappingKeys.titleKey],
        droppedOn: droppedCell.dimensionalId,
        cellId: droppedCell.cellId,
        timelineIndex: droppedCell.timelineIndex,
        year: droppedCell.year,
        month: droppedCell.month,
        day: droppedCell.day
      })
      
      // Update raw data with new dates
      // Mapping assigns timelineIndex by array position: mappedItems have timelineIndex: index of the array
      // This is critical for updating the correct item instance when an item has multiple spans (same ID but different timespans)
      // Dragging either instance preserves that timelineIndex. Updating by timelineIndex targets the exact entry: newData[itemIndex] = updatedItem  // ← Updates ONLY that specific instance
      // Updating by ID would overwrite all entries with that ID, losing the specific instance's data.
      let updatedRawData
      
      if (view === 'Day') {
        // Day view: droppedCell should have hour and minute
        // Debug: Log dropped cell data
        console.log('🎯 DROP SUCCESS - DAY VIEW:', {
          droppedCell,
          hour: droppedCell.hour,
          minute: droppedCell.minute,
          cellId: droppedCell.cellId
        })
        
        // Construct dropped cell ID with hour:minute: `${timelineIndex}:${year}:${month}:${day}:${hour}:${minute}`
        const droppedCellId = droppedCell.hour !== undefined && droppedCell.minute !== undefined
          ? `${droppedCell.timelineIndex}:${droppedCell.year}:${droppedCell.month}:${droppedCell.day}:${droppedCell.hour}:${droppedCell.minute}`
          : `${droppedCell.timelineIndex}:${droppedCell.year}:${droppedCell.month}:${droppedCell.day}:0:0` // Fallback to midnight
        
        console.log('🎯 CONSTRUCTED DROPPED CELL ID:', droppedCellId)
        
        // Note: updateDayTimelineItemDates works with display dates (already adjusted)
        // We need to handle GMT shift adjustment after calculating new dates
        const tempUpdatedData = updateDayTimelineItemDates(
          rawData,
          activeItem,
          droppedCellId,
          mappingKeys
        )
        
        // The dates in tempUpdatedData are calculated from display dates, but we need to save with GMT shift added back
        // Update the dates to add GMT shift back
        updatedRawData = tempUpdatedData.map((rawItem, index) => {
          if (index === activeItem.mapping.timelineIndex) {
            const displayStartDate = new Date(rawItem[mappingKeys.startDateKey])
            const displayEndDate = new Date(rawItem[mappingKeys.endDateKey])
            
            // Debug: Log before GMT shift
            console.log('🔄 Before GMT shift:', {
              displayStartDate: displayStartDate.toISOString(),
              displayEndDate: displayEndDate.toISOString(),
              displayStartHour: displayStartDate.getHours(),
              displayStartMinute: displayStartDate.getMinutes()
            })
            
            displayStartDate.setHours(displayStartDate.getHours() + gmtShift)
            displayEndDate.setHours(displayEndDate.getHours() + gmtShift)
            
            // Debug: Log after GMT shift
            console.log('🔄 After GMT shift:', {
              saveStartDate: displayStartDate.toISOString(),
              saveEndDate: displayEndDate.toISOString(),
              saveStartHour: displayStartDate.getHours(),
              saveStartMinute: displayStartDate.getMinutes()
            })
            
            return {
              ...rawItem,
              [mappingKeys.startDateKey]: displayStartDate.toISOString(),
              [mappingKeys.endDateKey]: displayEndDate.toISOString()
            }
          }
          return rawItem
        })
      } else {
        // Year/Month/Week views: preserve time-of-day on save
        // 1) Compute day delta using date-only cell math
        const droppedCellId = `${droppedCell.timelineIndex}:${droppedCell.year}:${droppedCell.month}:${droppedCell.day}`
        const { newStartDate } = calculateNewDates(
          activeItem.mapping.startCellId,
          activeItem.mapping.endCellId,
          droppedCellId
        )

        // 2) Apply the delta days to the display-adjusted Date objects (preserve hours/minutes)
        const originalDisplayStart = new Date(activeItem.mapping.startDate)
        const originalDisplayEnd = new Date(activeItem.mapping.endDate)
        
        // Get the original time components BEFORE any date calculations
        const originalStartHours = originalDisplayStart.getHours()
        const originalStartMinutes = originalDisplayStart.getMinutes()
        const originalStartSeconds = originalDisplayStart.getSeconds()
        const originalStartMs = originalDisplayStart.getMilliseconds()
        
        const originalEndHours = originalDisplayEnd.getHours()
        const originalEndMinutes = originalDisplayEnd.getMinutes()
        const originalEndSeconds = originalDisplayEnd.getSeconds()
        const originalEndMs = originalDisplayEnd.getMilliseconds()
        
        // Calculate offset days from the dropped cell
        const originalDisplayStartMidnight = new Date(originalDisplayStart)
        originalDisplayStartMidnight.setHours(0, 0, 0, 0)
        const droppedDateMidnight = new Date(newStartDate)
        droppedDateMidnight.setHours(0, 0, 0, 0)
        const dayMs = 24 * 60 * 60 * 1000
        const offsetDays = Math.round((droppedDateMidnight.getTime() - originalDisplayStartMidnight.getTime()) / dayMs)

        // 3) Create new dates at the dropped position, then restore the original time
        const newDisplayStart = new Date(newStartDate)
        newDisplayStart.setHours(originalStartHours, originalStartMinutes, originalStartSeconds, originalStartMs)
        
        const newDisplayEnd = new Date(originalDisplayEnd)
        newDisplayEnd.setDate(newDisplayEnd.getDate() + offsetDays)
        newDisplayEnd.setHours(originalEndHours, originalEndMinutes, originalEndSeconds, originalEndMs)

        // 4) Add GMT shift back for saving
        const saveStartDate = new Date(newDisplayStart)
        const saveEndDate = new Date(newDisplayEnd)
        saveStartDate.setHours(saveStartDate.getHours() + gmtShift)
        saveEndDate.setHours(saveEndDate.getHours() + gmtShift)

        // 4) Persist
        updatedRawData = rawData.map((rawItem, index) => {
          if (index === activeItem.mapping.timelineIndex) {
            return {
              ...rawItem,
              [mappingKeys.startDateKey]: saveStartDate.toISOString(),
              [mappingKeys.endDateKey]: saveEndDate.toISOString()
            }
          }
          return rawItem
        })
      }
      
      setRawData(updatedRawData)
      console.log('📝 UPDATED RAW DATA:', updatedRawData)

      // Call callback with updated item for database persistence
      if (onItemDrag && activeItem) {
        const updatedItem = updatedRawData[activeItem.mapping.timelineIndex]
        const uniqueIdKey = mappingKeys.uniqueIdKey || 'id'
        onItemDrag({
          id: updatedItem[uniqueIdKey],
          start_date: updatedItem[mappingKeys.startDateKey],
          end_date: updatedItem[mappingKeys.endDateKey]
        })
      }
    }
    
    setActiveItem(null)
    setIsDragging(false) // Disable droppables when drag ends
  }

  //////////////////////////////////
  // Resize handlers: handle timeline item resizing
  //////////////////////////////////
  const handleResizeLeft = (item: MappedTimelineItem, intervalOrDaysChange: number) => {
    console.log('🔧 LEFT RESIZE:', { 
      item: item[mappingKeys.titleKey],
      intervalOrDaysChange,
      view,
      startCellId: item.mapping.startCellId,
      endCellId: item.mapping.endCellId
    })

    if (view === 'Day') {
      // Day view: intervalOrDaysChange is number of 5-minute intervals
      // Note: item.mapping.startDate/endDate are already adjusted for display (GMT shift subtracted)
      // When saving, we need to add the GMT shift back to store the original timezone
      const displayStartDate = new Date(item.mapping.startDate)
      const displayEndDate = new Date(item.mapping.endDate)
      const { newStartDate, newEndDate } = calculateDayResizeLeftDates(
        displayStartDate,
        displayEndDate,
        intervalOrDaysChange
      )

      // Add GMT shift back before saving (revert the display adjustment)
      const saveStartDate = new Date(newStartDate)
      const saveEndDate = new Date(newEndDate)
      saveStartDate.setHours(saveStartDate.getHours() + gmtShift)
      saveEndDate.setHours(saveEndDate.getHours() + gmtShift)

      // Update raw data with new dates (saved with GMT shift added back)
      const updatedRawData = rawData.map((rawItem, index) => {
        if (index === item.mapping.timelineIndex) {
          return {
            ...rawItem,
            [mappingKeys.startDateKey]: saveStartDate.toISOString(),
            [mappingKeys.endDateKey]: saveEndDate.toISOString()
          }
        }
        return rawItem
      })

      setRawData(updatedRawData)
      console.log('📝 UPDATED RAW DATA (LEFT RESIZE - DAY VIEW):', updatedRawData)
      
      // Call callback with updated item for database persistence
      if (onItemResize) {
        const updatedItem = updatedRawData[item.mapping.timelineIndex]
        const uniqueIdKey = mappingKeys.uniqueIdKey || 'id'
        onItemResize({
          id: updatedItem[uniqueIdKey],
          start_date: updatedItem[mappingKeys.startDateKey],
          end_date: updatedItem[mappingKeys.endDateKey]
        })
      }
    } else {
      // Year/Month/Week views: preserve time-of-day on left resize (adjust start only)
      const displayStartDate = new Date(item.mapping.startDate)
      const displayEndDate = new Date(item.mapping.endDate)
      
      // Preserve time components before date manipulation
      const startHours = displayStartDate.getHours()
      const startMinutes = displayStartDate.getMinutes()
      const startSeconds = displayStartDate.getSeconds()
      const startMs = displayStartDate.getMilliseconds()
      
      const endHours = displayEndDate.getHours()
      const endMinutes = displayEndDate.getMinutes()
      const endSeconds = displayEndDate.getSeconds()
      const endMs = displayEndDate.getMilliseconds()
      
      // Adjust date
      const newDisplayStart = new Date(displayStartDate)
      newDisplayStart.setDate(newDisplayStart.getDate() - intervalOrDaysChange)
      // Restore time components
      newDisplayStart.setHours(startHours, startMinutes, startSeconds, startMs)

      const saveStartDate = new Date(newDisplayStart)
      const saveEndDate = new Date(displayEndDate)
      saveEndDate.setHours(endHours, endMinutes, endSeconds, endMs)
      saveStartDate.setHours(saveStartDate.getHours() + gmtShift)
      saveEndDate.setHours(saveEndDate.getHours() + gmtShift)

      const updatedRawData = rawData.map((rawItem, index) => {
        if (index === item.mapping.timelineIndex) {
          return {
            ...rawItem,
            [mappingKeys.startDateKey]: saveStartDate.toISOString(),
            [mappingKeys.endDateKey]: saveEndDate.toISOString()
          }
        }
        return rawItem
      })

      setRawData(updatedRawData)
      console.log('📝 UPDATED RAW DATA (LEFT RESIZE - Y/M/W):', updatedRawData)
      
      // Call callback with updated item for database persistence
      if (onItemResize) {
        const updatedItem = updatedRawData[item.mapping.timelineIndex]
        const uniqueIdKey = mappingKeys.uniqueIdKey || 'id'
        onItemResize({
          id: updatedItem[uniqueIdKey],
          start_date: updatedItem[mappingKeys.startDateKey],
          end_date: updatedItem[mappingKeys.endDateKey]
        })
      }
    }
  }

  const handleResizeRight = (item: MappedTimelineItem, intervalOrDaysChange: number) => {
    console.log('🔧 RIGHT RESIZE:', { 
      item: item[mappingKeys.titleKey],
      intervalOrDaysChange,
      view,
      startCellId: item.mapping.startCellId,
      endCellId: item.mapping.endCellId
    })

    if (view === 'Day') {
      // Day view: intervalOrDaysChange is number of 5-minute intervals
      // Note: item.mapping.startDate/endDate are already adjusted for display (GMT shift subtracted)
      // When saving, we need to add the GMT shift back to store the original timezone
      const displayStartDate = new Date(item.mapping.startDate)
      const displayEndDate = new Date(item.mapping.endDate)
      const { newStartDate, newEndDate } = calculateDayResizeRightDates(
        displayStartDate,
        displayEndDate,
        intervalOrDaysChange
      )

      // Add GMT shift back before saving (revert the display adjustment)
      const saveStartDate = new Date(newStartDate)
      const saveEndDate = new Date(newEndDate)
      saveStartDate.setHours(saveStartDate.getHours() + gmtShift)
      saveEndDate.setHours(saveEndDate.getHours() + gmtShift)

      // Update raw data with new dates (saved with GMT shift added back)
      const updatedRawData = rawData.map((rawItem, index) => {
        if (index === item.mapping.timelineIndex) {
          return {
            ...rawItem,
            [mappingKeys.startDateKey]: saveStartDate.toISOString(),
            [mappingKeys.endDateKey]: saveEndDate.toISOString()
          }
        }
        return rawItem
      })

      setRawData(updatedRawData)
      console.log('📝 UPDATED RAW DATA (RIGHT RESIZE - DAY VIEW):', updatedRawData)
      
      // Call callback with updated item for database persistence
      if (onItemResize) {
        const updatedItem = updatedRawData[item.mapping.timelineIndex]
        const uniqueIdKey = mappingKeys.uniqueIdKey || 'id'
        onItemResize({
          id: updatedItem[uniqueIdKey],
          start_date: updatedItem[mappingKeys.startDateKey],
          end_date: updatedItem[mappingKeys.endDateKey]
        })
      }
    } else {
      // Year/Month/Week views: preserve time-of-day on right resize (adjust end only)
      const displayStartDate = new Date(item.mapping.startDate)
      const displayEndDate = new Date(item.mapping.endDate)
      
      // Preserve time components before date manipulation
      const startHours = displayStartDate.getHours()
      const startMinutes = displayStartDate.getMinutes()
      const startSeconds = displayStartDate.getSeconds()
      const startMs = displayStartDate.getMilliseconds()
      
      const endHours = displayEndDate.getHours()
      const endMinutes = displayEndDate.getMinutes()
      const endSeconds = displayEndDate.getSeconds()
      const endMs = displayEndDate.getMilliseconds()
      
      // Adjust date
      const newDisplayEnd = new Date(displayEndDate)
      newDisplayEnd.setDate(newDisplayEnd.getDate() + intervalOrDaysChange)
      // Restore time components
      newDisplayEnd.setHours(endHours, endMinutes, endSeconds, endMs)

      const saveStartDate = new Date(displayStartDate)
      saveStartDate.setHours(startHours, startMinutes, startSeconds, startMs)
      const saveEndDate = new Date(newDisplayEnd)
      saveStartDate.setHours(saveStartDate.getHours() + gmtShift)
      saveEndDate.setHours(saveEndDate.getHours() + gmtShift)

      const updatedRawData = rawData.map((rawItem, index) => {
        if (index === item.mapping.timelineIndex) {
          return {
            ...rawItem,
            [mappingKeys.startDateKey]: saveStartDate.toISOString(),
            [mappingKeys.endDateKey]: saveEndDate.toISOString()
          }
        }
        return rawItem
      })

      setRawData(updatedRawData)
      console.log('📝 UPDATED RAW DATA (RIGHT RESIZE - Y/M/W):', updatedRawData)
      
      // Call callback with updated item for database persistence
      if (onItemResize) {
        const updatedItem = updatedRawData[item.mapping.timelineIndex]
        const uniqueIdKey = mappingKeys.uniqueIdKey || 'id'
        onItemResize({
          id: updatedItem[uniqueIdKey],
          start_date: updatedItem[mappingKeys.startDateKey],
          end_date: updatedItem[mappingKeys.endDateKey]
        })
      }
    }
  }

  // Inner component to use useDndMonitor (must be inside DndContext)
  const DragMonitor = ({ onHoveredCell }: { onHoveredCell: (cell: { cellId: string, year: number, month: number, day: number, hour?: number, minute?: number } | null) => void }) => {
    useDndMonitor({
      onDragOver(event) {
        if (event.active && event.over && event.over.data.current) {
          const overData = event.over.data.current as any
          
          // Debug: Log raw drag over data for Day view
          if (view === 'Day' && overData.hour !== undefined && overData.minute !== undefined) {
            console.log('🎯 DRAG OVER DAY VIEW CELL:', {
              cellId: overData.cellId,
              hour: overData.hour,
              minute: overData.minute,
              rawData: overData
            })
          }
          
          if (overData.year && overData.month && overData.day !== undefined) {
            // Check if this is a Day view cell (has hour and minute)
            if (overData.hour !== undefined && overData.minute !== undefined) {
              onHoveredCell({
                cellId: overData.cellId,
                year: overData.year,
                month: overData.month,
                day: overData.day,
                hour: overData.hour,
                minute: overData.minute
              })
            } else {
              // Year/Month/Week view cells
              onHoveredCell({
                cellId: overData.cellId,
                year: overData.year,
                month: overData.month,
                day: overData.day
              })
            }
          }
        } else {
          onHoveredCell(null)
        }
      },
      onDragEnd() {
        onHoveredCell(null)
      }
    })
    return null
  }

  return (
    <div className='flex h-full min-h-0 w-full flex-col'>
      {/* Provide visible range context to all child components for virtualization */}
      <VisibleRangeContext.Provider value={visibleRangeContextValue}>
        {/* DndContext renders only context providers (no element); this flex child receives flex-1 from the outer column */}
        <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
        <DndContext 
          sensors={sensors} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setIsDragging(false) // Disable droppables when drag is cancelled
            setActiveItem(null)
          }}
        >
          <div className='flex min-h-0 flex-1 flex-col'>
            <DragMonitor onHoveredCell={setHoveredCell} />
            <div className='flex min-h-0 flex-1 flex-col rounded-lg border border-border/50'>
              {/* Flex container: sidebar + timeline */}
              <div className='flex min-h-0 w-full flex-1'>

              
              {/* Timeline container — scroll lives in VirtualizedTimelineContainer */}
              <div className='min-h-0 min-w-0 flex-1 overflow-hidden'>
                <VirtualizedTimelineContainer 
                  ref={scrollContainerRef}
                  totalWidth={totalTimelineWidth}
                  onScroll={handleScroll}
                >
                  {view === 'Day' ? (
                    <DayView 
                      daysInRange={daysInRange}
                      dayColumnWidth={dayColumnWidth}
                      hourColumnWidth={hourColumnWidth}
                      timelineData={timelineData}
                      mappingKeys={mappingKeys}
                      rowHeight={rowHeight}
                      cellStyle={cellStyle}
                      onResizeLeft={handleResizeLeft}
                      onResizeRight={handleResizeRight}
                      onEventClick={onEventClick}
                      //
                      groupSidebarData={groupSidebarData}
                      groupByKey={groupByKey}
                      collapsedGroups={collapsedGroups}
                      handleGroupToggle={handleGroupToggle}
                      isGroupInline={isGroupInline}
                      view={view}
                    />
                  ) : (
                    <YearMonthWeekView 
                      yearsInRange={yearsInRange}
                      view={view}
                      yearWeekWidth={yearWeekWidth}
                      monthDayWidth={monthDayWidth}
                      weekDayWidth={weekDayWidth}
                      totalTimelineWidth={totalTimelineWidth}
                      timelineData={timelineData}
                      groupedTimelineData={groupedTimelineData} // NEW
                      groupByKey={groupByKey} // NEW
                      isGroupInline={isGroupInline} // NEW
                      groupSidebarData={groupSidebarData} // NEW
                      collapsedGroups={collapsedGroups} // NEW
                      onGroupToggle={handleGroupToggle} // NEW
                      mappingKeys={mappingKeys}
                      rowHeight={rowHeight}
                      cellStyle={cellStyle}
                      onResizeLeft={handleResizeLeft}
                      onResizeRight={handleResizeRight}
                      onEventClick={onEventClick}
                      //
                      handleGroupToggle={handleGroupToggle}
                    />
                  )}
                </VirtualizedTimelineContainer>
              </div>
            </div>
          </div>
          </div>
          
          <DragOverlay>
            <DragPreviewOverlay 
              view={view}
              activeItem={activeItem}
              hoveredCell={hoveredCell}
              mappingKeys={mappingKeys}
            />
          </DragOverlay>
        </DndContext>
        </div>
      </VisibleRangeContext.Provider>
    </div>
  )
})

TimelineContainer.displayName = 'TimelineContainer'

export default TimelineContainer
