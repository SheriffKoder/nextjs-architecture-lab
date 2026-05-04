/**
 * Year Month Week View Component
 * 
 * Purpose: Renders timeline in Year, Month, or Week view with horizontal virtualization
 * Used in: timeline-container.tsx
 * Why: Main view component that implements year-level virtualization for performance
 * 
 * Key Features:
 * - Renders full DOM for visible years
 * - Renders minimal spacer divs for non-visible years
 * - Maintains width cascade: Row 3 → Row 2 → Row 1
 * - Preserves all existing styling for visible content
 * 
 * Steps:
 * 1. Consume visible range context to get visible years
 * 2. Calculate width for each year (visible and non-visible)
 * 3. For visible years: render full headers and timeline rows
 * 4. For non-visible years: render spacer divs to maintain width
 * 5. Pass only visible years to TimelineRow components
 */

"use client"

import React from 'react'
import { MONTH_NAMES, MONTH_NAMES_FULL } from '../../utils/month-names'
import WeekRow from '../header-rows/year/week-row'
import MonthRow from '../header-rows/month/month-row'
import WeekViewRow from '../header-rows/week/week-view-row'
import TimelineRow from './timeline-row'
import { getMonthWidths, getTotalYearWidth } from '../../utils/year/month-width-calculator'
import { MIN_ROWS } from '../../virtualization/timeline-config'
import { MappedTimelineItem, MappingKeys } from '../../utils/mapping/timeline-mapping'
import { getDaysInYear } from '../../utils/year/year-time-calculator'
import { useVisibleRange } from '../../virtualization/context/visible-range-context'
import { GroupedTimelineData, GroupSidebarInfo } from '../../timeline-container'
import GroupHeaderRow from '../header-rows/group-header-row'

interface YearMonthWeekViewProps {
  yearsInRange: number[]
  view: 'Year' | 'Month' | 'Week' | 'Day'
  yearWeekWidth: number
  monthDayWidth: number
  weekDayWidth: number
  totalTimelineWidth: number
  timelineData: MappedTimelineItem[][] // Array of arrays where each sub-array contains items with the same ID
  groupedTimelineData?: GroupedTimelineData[] // NEW
  groupByKey?: string // NEW
  isGroupInline?: boolean // NEW: true = inline headers, false = sidebar
  groupSidebarData?: GroupSidebarInfo[] // NEW
  collapsedGroups?: Set<string | null> // NEW: Set of collapsed group keys
  onGroupToggle?: (groupKey: string | null) => void // NEW: Handler for collapse/expand toggle
  mappingKeys: MappingKeys // Pass mapping keys to access generic properties
  rowHeight: number // Height of each timeline row
  cellStyle: any // Style configuration for timeline items
  onResizeLeft?: (item: MappedTimelineItem, daysChange: number) => void
  onResizeRight?: (item: MappedTimelineItem, daysChange: number) => void
  onEventClick?: (eventId: string) => void // callback when event/item is clicked
}

const YearMonthWeekView = ({ 
  yearsInRange, 
  view, 
  yearWeekWidth, 
  monthDayWidth, 
  weekDayWidth, 
  totalTimelineWidth,
  timelineData,
  groupedTimelineData, // NEW
  groupByKey, // NEW
  isGroupInline, // NEW
  groupSidebarData, // NEW
  collapsedGroups = new Set(), // NEW
  onGroupToggle, // NEW
  mappingKeys,
  rowHeight,
  cellStyle,
  onResizeLeft,
  onResizeRight,
  onEventClick
}: YearMonthWeekViewProps) => {
  //////////////////////////////////
  // Virtualization: Get visible years and rows from context
  // Why: Only render DOM elements for years in viewport (with overscan)
  // Performance impact: 80% reduction in DOM elements
  //////////////////////////////////
  const { visibleYears, visibleRowIndices } = useVisibleRange()
  
  //////////////////////////////////
  // Cell Width Calculation: Determine cell width based on view
  //////////////////////////////////
  let calculatedCellWidth: number
  if (view === 'Year') {
    calculatedCellWidth = yearWeekWidth / 7 // day width
  } else if (view === 'Month') {
    calculatedCellWidth = monthDayWidth
  } else if (view === 'Week') {
    calculatedCellWidth = weekDayWidth
  } else {
    calculatedCellWidth = 100 // default for Day view (not used here)
  }

  // Calculate total days across all years for unified grid
  const totalDays = yearsInRange.reduce((sum, year) => sum + getDaysInYear(year), 0)

  // Calculate day widths per year for headers
  const dayWidth = view === 'Year' ? yearWeekWidth / 7 : undefined
  
  //////////////////////////////////
  // Helper Function: Check if year is visible
  // Used to determine whether to render full DOM or spacer
  //////////////////////////////////
  const isYearVisible = (year: number): boolean => {
    return visibleYears.includes(year)
  }
  
  //////////////////////////////////
  // Helper Function: Calculate year width
  // Used for both visible years (full render) and non-visible years (spacer)
  //////////////////////////////////
  const calculateYearWidth = (year: number): number => {
    if (view === 'Year') {
      const daysInYear = getDaysInYear(year)
      return daysInYear * (dayWidth || 0)
    } else {
      const monthWidths = getMonthWidths(year, view, yearWeekWidth, monthDayWidth, weekDayWidth)
      return getTotalYearWidth(monthWidths)
    }
  }

  return (
    <div className='h-[60vh] flex flex-col' style={{ width: `${totalTimelineWidth}px` }}>
      
      <div className='flex flex-col sticky top-0 left-0 z-30 bg-[#f1f1f1] dark:bg-[#131313]'>
        {/* Header Row 1: Year labels - one per year */}
        {/* Virtualization: Render full labels for visible years, spacers for non-visible */}
        <div className='h-6 flex flex-row border-b border-border/60'>
          {yearsInRange.map((year, yearIndex) => {
            const yearWidth = calculateYearWidth(year)
            const visible = isYearVisible(year)
            
            // Visible year: render full label with styling
            if (visible) {
              return (
                <div
                  key={`year-header-${year}`}
                  className='flex items-center justify-start text-xs font-bold text-foreground bg-[#f1f1f1] dark:bg-[#131313] border-r border-border/60'
                  style={{ width: `${yearWidth}px` }}
                >
                  <span className='ml-2 sticky left-2'>{year}</span>
                </div>
              )
            }
            
            // Non-visible year: render minimal spacer (no styling, just width)
            return (
              <div
                key={`year-spacer-${year}`}
                style={{ width: `${yearWidth}px`, height: '100%' }}
              />
            )
          })}
        </div>

        {/* Header Row 2: Month labels - repeating for each year */}
        {/* Virtualization: Render full month labels for visible years, spacers for non-visible */}
        {(view === 'Year' || view === 'Month' || view === 'Week') && (
          <div className='h-6 flex flex-row border-b border-border/60'>
            {yearsInRange.map((year) => {
              const visible = isYearVisible(year)
              const yearWidth = calculateYearWidth(year)
              
              // Non-visible year: render single spacer for entire year
              if (!visible) {
                return (
                  <div
                    key={`month-spacer-${year}`}
                    style={{ width: `${yearWidth}px`, height: '100%' }}
                  />
                )
              }
              
              // Visible year: render all month labels
              const monthWidths = view === 'Year' 
                ? MONTH_NAMES.map((_, monthIndex) => {
                    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
                    return daysInMonth * (dayWidth || 0)
                  })
                : getMonthWidths(year, view, yearWeekWidth, monthDayWidth, weekDayWidth)
              
              return MONTH_NAMES.map((month, monthIndex) => {
                // Use full month names for Month and Week views, abbreviated for Year view
                const monthLabel = (view === 'Month' || view === 'Week') 
                  ? MONTH_NAMES_FULL[monthIndex] 
                  : month
                
                return (
                  <div
                    key={`month-${year}-${monthIndex}`}
                    className='flex items-center justify-start text-xs font-semibold text-foreground bg-[#f1f1f1] dark:bg-[#131313] border-r-2 border-border/60'
                    style={{ width: `${monthWidths[monthIndex]}px` }}
                  >
                    <span className='sticky top-0 left-2 ml-2'>{monthLabel}</span>
                  </div>
                )
              })
            })}
          </div>
        )}

        {/* Header Row 3: Days/Weeks - repeating for each year */}
        {/* Virtualization: Render full week/day headers for visible years, spacers for non-visible */}
        {view === 'Year' && (
          <div className='flex flex-row border-b border-border/60'>
            {yearsInRange.map((year) => {
              const visible = isYearVisible(year)
              const yearWidth = calculateYearWidth(year)
              
              // Non-visible year: render spacer
              if (!visible) {
                return (
                  <div
                    key={`week-spacer-${year}`}
                    style={{ width: `${yearWidth}px`, height: '100%' }}
                  />
                )
              }
              
              // Visible year: render full week row
              return (
                <WeekRow 
                  key={`week-row-${year}`}
                  year={year}
                  yearWeekWidth={yearWeekWidth}
                  isFirstYear={year === yearsInRange[0]}
                />
              )
            })}
          </div>
        )}
        {view === 'Month' && (
          <div className='flex flex-row border-b border-border/60'>
            {yearsInRange.map((year) => {
              const visible = isYearVisible(year)
              const yearWidth = calculateYearWidth(year)
              
              // Non-visible year: render spacer
              if (!visible) {
                return (
                  <div
                    key={`month-day-spacer-${year}`}
                    style={{ width: `${yearWidth}px`, height: '100%' }}
                  />
                )
              }
              
              // Visible year: render full month row
              return (
                <MonthRow 
                  key={`month-row-${year}`}
                  year={year}
                  monthDayWidth={monthDayWidth}
                />
              )
            })}
          </div>
        )}
        {view === 'Week' && (
          <div className='flex flex-row border-b border-border/60'>
            {yearsInRange.map((year) => {
              const visible = isYearVisible(year)
              const yearWidth = calculateYearWidth(year)
              
              // Non-visible year: render spacer
              if (!visible) {
                return (
                  <div
                    key={`week-day-spacer-${year}`}
                    style={{ width: `${yearWidth}px`, height: '100%' }}
                  />
                )
              }
              
              // Visible year: render full week view row
              return (
                <WeekViewRow 
                  key={`weekview-row-${year}`}
                  year={year}
                  weekDayWidth={weekDayWidth}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Row 4+: Timeline rows - unified grid with vertical virtualization */}
      {/* Virtualization: Pass only visible years to timeline rows for cell rendering, render only visible rows vertically */}
      {/* Always show at least MIN_ROWS (default 10) to maintain grid styling and visual consistency */}
      {(() => {
        // If grouping is enabled, use grouped data structure
        if (groupedTimelineData && groupedTimelineData.length > 0 && isGroupInline) {
          // Existing inline grouping logic (with header rows)
          let currentRowIndex = 0
          const rowsToRender: React.ReactElement[] = []
          
          groupedTimelineData.forEach((group, groupIndex) => {
            if (group.isHeader) {
              // Render background row with overlay label (only if visible)
              // Row index is reserved - no pills will render here
              if (visibleRowIndices.includes(currentRowIndex)) {
                rowsToRender.push(
                  <div
                    key={`group-header-${groupIndex}`}
                    style={{ 
                      position: 'absolute', 
                      top: `${currentRowIndex * rowHeight}px`, 
                      width: '100%',
                      zIndex: 10 // Lower than pills but above background
                    }}
                  >
                    <GroupHeaderRow
                      groupKey={group.groupKey}
                      yearsInRange={yearsInRange}
                      visibleYearsInRange={visibleYears}
                      view={view}
                      yearWeekWidth={yearWeekWidth}
                      monthDayWidth={monthDayWidth}
                      weekDayWidth={weekDayWidth}
                      calculatedCellWidth={calculatedCellWidth}
                      rowHeight={rowHeight}
                      totalTimelineWidth={totalTimelineWidth}
                      timelineIndex={currentRowIndex}
                      mappingKeys={mappingKeys}
                      collapsedGroups={collapsedGroups}
                      onGroupToggle={onGroupToggle}
                    />
                  </div>
                )
              }
              currentRowIndex++ // Row index is reserved - no pills will render here
            } else {
              // Check if this group is collapsed - if so, skip rendering data rows
              const isGroupCollapsed = collapsedGroups.has(group.groupKey)
              
              if (!isGroupCollapsed) {
                // Render timeline rows for this group (only if not collapsed)
                group.items.forEach((itemGroup) => {
                  if (visibleRowIndices.includes(currentRowIndex)) {
                    rowsToRender.push(
                      <div
                        key={`row-${currentRowIndex}`}
                        style={{ 
                          position: 'absolute', 
                          top: `${currentRowIndex * rowHeight}px`, 
                          width: '100%' 
                        }}
                      >
                        <TimelineRow 
                          yearsInRange={yearsInRange}
                          visibleYearsInRange={visibleYears}
                          view={view}
                          yearWeekWidth={yearWeekWidth}
                          monthDayWidth={monthDayWidth}
                          weekDayWidth={weekDayWidth}
                          cellWidth={calculatedCellWidth}
                          cellHeight={rowHeight}
                          timelineIndex={currentRowIndex}
                          timelineData={itemGroup}
                          mappingKeys={mappingKeys}
                          cellStyle={cellStyle}
                          onResizeLeft={onResizeLeft}
                          onResizeRight={onResizeRight}
                          onEventClick={onEventClick}
                        />
                      </div>
                    )
                  }
                  currentRowIndex++
                })
              }
              // If collapsed, don't increment currentRowIndex (no rows rendered)
            }
          })
          
          const totalRows = currentRowIndex
          return (
            <div style={{ height: `${totalRows * rowHeight}px`, position: 'relative' }}>
              {rowsToRender}
            </div>
          )
        } else if (groupSidebarData && groupSidebarData.length > 0 && !isGroupInline) {
          // Sidebar grouping: render timeline rows normally (no header rows, sidebar is rendered at container level)
          // Create a Set of startRowIndices for quick lookup to identify first rows in groups
          // Exclude the first group (index 0) - only groups at index 1+ get border-top
          const firstRowIndices = new Set(
            groupSidebarData
              .filter((g, index) => index > 0) // Exclude first group (index 0)
              .map(g => g.startRowIndex)
          )
          
          const totalRows = Math.max(MIN_ROWS, timelineData.length)
          const rowsToRender = timelineData.length >= MIN_ROWS 
            ? timelineData 
            : [...timelineData, ...Array(MIN_ROWS - timelineData.length).fill([])]
          
          const allVisibleIndices = visibleRowIndices.filter(i => i < totalRows)
          
          return (
            <div style={{ height: `${totalRows * rowHeight}px`, position: 'relative' }}>
              {allVisibleIndices.map(index => (
                <div 
                  key={`row-${index}`} 
                  style={{ position: 'absolute', top: `${index * rowHeight}px`, width: '100%' }}
                >
                  <TimelineRow 
                    yearsInRange={yearsInRange}
                    visibleYearsInRange={visibleYears}
                    view={view}
                    yearWeekWidth={yearWeekWidth}
                    monthDayWidth={monthDayWidth}
                    weekDayWidth={weekDayWidth}
                    cellWidth={calculatedCellWidth}
                    cellHeight={rowHeight}
                    timelineIndex={index}
                    timelineData={rowsToRender[index] || []}
                    mappingKeys={mappingKeys}
                    cellStyle={cellStyle}
                    onResizeLeft={onResizeLeft}
                    onResizeRight={onResizeRight}
                    onEventClick={onEventClick}
                    isFirstRowInGroup={firstRowIndices.has(index)} // NEW: Add border-top to first row in each group
                  />
                </div>
              ))}
            </div>
          )
        } else {
          // Original rendering logic (no grouping)
          const totalRows = Math.max(MIN_ROWS, timelineData.length)
          const rowsToRender = timelineData.length >= MIN_ROWS 
            ? timelineData 
            : [...timelineData, ...Array(MIN_ROWS - timelineData.length).fill([])] // Pad with empty rows
          
          const allVisibleIndices = visibleRowIndices.filter(i => i < totalRows)
          
          return (
            <div style={{ height: `${totalRows * rowHeight}px`, position: 'relative' }}>
              {allVisibleIndices.map(index => (
                <div 
                  key={`row-${index}`} 
                  style={{ position: 'absolute', top: `${index * rowHeight}px`, width: '100%' }}
                >
                  <TimelineRow 
                    yearsInRange={yearsInRange}
                    visibleYearsInRange={visibleYears}
                    view={view}
                    yearWeekWidth={yearWeekWidth}
                    monthDayWidth={monthDayWidth}
                    weekDayWidth={weekDayWidth}
                    cellWidth={calculatedCellWidth}
                    cellHeight={rowHeight}
                    timelineIndex={index}
                    timelineData={rowsToRender[index] || []}
                    mappingKeys={mappingKeys}
                    cellStyle={cellStyle}
                    onResizeLeft={onResizeLeft}
                    onResizeRight={onResizeRight}
                    onEventClick={onEventClick}
                  />
                </div>
              ))}
            </div>
          )
        }
      })()}
    </div>
  )
}

export default YearMonthWeekView

