/**
 * Day View Component
 * 
 * Purpose: Renders timeline in Day view with horizontal day-level virtualization
 * Used in: timeline-container.tsx
 * Why: Implements day-level virtualization for performance with 100+ days
 * 
 * Key Features:
 * - Renders full DOM for visible days
 * - Renders minimal spacer divs for non-visible days
 * - Maintains width cascade: Row 2 → Row 1
 * - Preserves all existing styling for visible content
 * 
 * Steps:
 * 1. Consume visible range context to get visible days
 * 2. Calculate width for each day (visible and non-visible)
 * 3. For visible days: render full headers and timeline rows
 * 4. For non-visible days: render spacer divs to maintain width
 * 5. Pass only visible days to TimelineRowDay components
 */

"use client"

import React from 'react'
import { HOURS } from '../../utils/days/hours'
import { formatDayLabel } from '../../utils/days/day-formatter'
import { MappedTimelineItem, MappingKeys } from '../../utils/mapping/timeline-mapping'
import TimelineRowDay from './timeline-row-day'
import { CELLS_PER_HOUR, MINUTE_INTERVALS } from '../../utils/days/day-time-calculator'
import { useVisibleRange } from '../../virtualization/context/visible-range-context'
import { MIN_ROWS } from '../../virtualization/timeline-config'
import { formatDayKey } from '../../virtualization/utils/visible-day-calculator'
import GroupSidebar, { GroupSidebarInfo } from '../grouping/group-sidebar'

interface DayViewProps {
  daysInRange: Date[]
  dayColumnWidth: number
  hourColumnWidth: number
  timelineData: MappedTimelineItem[][] // Array of arrays where each sub-array contains items with the same ID
  mappingKeys: MappingKeys // Pass mapping keys to access generic properties
  rowHeight: number // Height of each timeline row
  cellStyle: any // Style configuration for timeline items
  onResizeLeft?: (item: MappedTimelineItem, daysChange: number) => void
  onResizeRight?: (item: MappedTimelineItem, daysChange: number) => void
  onEventClick?: (eventId: string) => void // callback when event/item is clicked
  groupByKey?: string // NEW: The field name used for grouping
  isGroupInline?: boolean // NEW: true = inline headers, false = sidebar
  groupSidebarData?: GroupSidebarInfo[] // NEW
  collapsedGroups?: Set<string | null> // NEW: Set of collapsed group keys
  handleGroupToggle?: (groupKey: string | null) => void // NEW: Handler for collapse/expand toggle
  view: 'Year' | 'Month' | 'Week' | 'Day'
}

const DayView = ({ 
  daysInRange, 
  dayColumnWidth, 
  hourColumnWidth,
  timelineData,
  mappingKeys,
  rowHeight,
  cellStyle,
  onResizeLeft,
  onResizeRight,
  onEventClick,
  groupByKey,
  isGroupInline,
  groupSidebarData,
  collapsedGroups,
  handleGroupToggle,
  view
}: DayViewProps) => {
  //////////////////////////////////
  // Virtualization: Get visible days and rows from context
  // Why: Only render DOM elements for days in viewport (with overscan)
  // Performance impact: 80% reduction in DOM elements for day view
  //////////////////////////////////
  const { visibleDays, visibleRowIndices } = useVisibleRange()
  
  //////////////////////////////////
  // Width Calculations: Determine cell and total widths
  //////////////////////////////////
  
  // Calculate cell width (each hour divided into 12 cells)
  const cellWidth = hourColumnWidth / CELLS_PER_HOUR
  
  // Calculate total cells: days * hours * cells_per_hour
  const totalCells = daysInRange.length * HOURS.length * CELLS_PER_HOUR
  const totalWidth = daysInRange.length * HOURS.length * hourColumnWidth
  
  // Day width: 24 hours * hour column width
  const dayWidth = HOURS.length * hourColumnWidth
  
  //////////////////////////////////
  // Helper Function: Check if day is visible
  // Used to determine whether to render full DOM or spacer
  //////////////////////////////////
  const isDayVisible = (day: Date): boolean => {
    const dayKey = formatDayKey(day)
    return visibleDays.some(d => formatDayKey(d) === dayKey)
  }

  const isGrouped = !isGroupInline && groupByKey && groupSidebarData && groupSidebarData.length > 0


  return (
    <div className='flex min-h-full min-w-0 flex-row' style={{ width: `${totalWidth}px` }}>
      
        {/* Sidebar - outside horizontal scroll boundary */}
        {isGrouped && (
          (() => {
            // Calculate total height of timeline header rows
            // Year view: 3 rows (Year, Month, Week) = 3 * 24px = 72px
            // Month/Week/Day view: 2 rows = 2 * 24px = 48px
            const headerRowsHeight = view === 'Day' 
              ? 48 // 2 rows * 24px
              : 72 // 3 rows * 24px (Year, Month, Week views)
            
            return (
              <GroupSidebar 
                groups={groupSidebarData}
                rowHeight={rowHeight}
                groupByKey={groupByKey}
                headerRowsHeight={headerRowsHeight}
                collapsedGroups={collapsedGroups}
                onGroupToggle={handleGroupToggle}
              />
            )
          })()
        )}

      
      
      <div className='flex flex-col relative'> 
        <div className='flex flex-col sticky top-0 left-0 z-10 bg-[#f1f1f1] dark:bg-[#131313]'>
          {/* Header Row 1: Day labels - one per day */}
          {/* Virtualization: Render full labels for visible days, spacers for non-visible */}
          <div className='h-6 flex flex-row border-b border-border/60' style={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(${daysInRange.length}, ${dayWidth}px)`
          }}>
          {daysInRange.map((day, dayIndex) => {
            const visible = isDayVisible(day)
            
            // Visible day: render full label with styling
            if (visible) {
              return (
                <div 
                  key={`day-header-${dayIndex}`}
                  className='flex items-center justify-start text-xs font-bold text-foreground bg-[#f1f1f1] dark:bg-[#131313] border-r border-border/60'
                >
                  <span className={`ml-2 sticky ${isGrouped ? 'left-[208px]' : 'left-2'}`}>{formatDayLabel(day)}</span>
                </div>
              )
            }
            
            // Non-visible day: render minimal spacer (no styling, just width)
            return (
              <div
                key={`day-spacer-${dayIndex}`}
                style={{ width: `${dayWidth}px`, height: '100%' }}
              />
            )
          })}
        </div>

        {/* Header Row 2: Hours labels - repeating for each day */}
        {/* Virtualization: Render full hour labels for visible days, spacers for non-visible */}
        <div className='h-6 flex flex-row ' style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${totalCells / CELLS_PER_HOUR}, ${hourColumnWidth}px)`
        }}>
          {daysInRange.map((day, dayIndex) => {
            const visible = isDayVisible(day)
            
            // Non-visible day: render single spacer for entire day
            if (!visible) {
              return (
                <div
                  key={`hour-spacer-${dayIndex}`}
                  style={{ width: `${dayWidth}px`, height: '100%', gridColumn: `span ${HOURS.length}` }}
                />
              )
            }
            
            // Visible day: render all hour labels
            return HOURS.map((hour, hourIndex) => (
              <div
                key={`${dayIndex}-${hour}`}
                className={`flex flex-col items-center justify-center text-xs font-semibold text-foreground bg-[#f1f1f1] dark:bg-[#131313] ${isGrouped ? 'left-[208px]' : 'left-2'}`}
                style={{ width: `${hourColumnWidth}px` }}
              >
                <div className={`sticky top-0 ${isGrouped ? 'left-[208px]' : 'left-2'} w-full h-full -ml-6`}>{hour}</div>
                <div className='h-full w-full border-r border-b border-border/60'></div>
              </div>
            ))
          })}
        </div>
        </div>

        {/* Row 3+: Timeline rows - one per task, unified grid with vertical virtualization */}
        {/* Virtualization: Pass only visible days to timeline rows for cell rendering, render only visible rows vertically */}
        {/* Always show at least MIN_ROWS (default 10) to maintain grid styling and visual consistency */}
        {(() => {
          const totalRows = Math.max(MIN_ROWS, timelineData.length)
          const rowsToRender = timelineData.length >= MIN_ROWS 
            ? timelineData 
            : [...timelineData, ...Array(MIN_ROWS - timelineData.length).fill([])] // Pad with empty rows
          
          // Calculate visible indices including dummy rows
          const allVisibleIndices = visibleRowIndices.filter(i => i < totalRows)
          
          return (
            <div style={{ height: `${totalRows * rowHeight}px`, position: 'relative' }}>
              {allVisibleIndices.map(index => (
                <div 
                  key={`row-${index}`} 
                  style={{ position: 'absolute', top: `${index * rowHeight}px`, width: '100%' }}
                >
                  <TimelineRowDay
                    daysInRange={daysInRange}
                    visibleDaysInRange={visibleDays}
                    timelineIndex={index}
                    timelineData={rowsToRender[index] || []}
                    mappingKeys={mappingKeys}
                    hourColumnWidth={hourColumnWidth}
                    cellWidth={cellWidth}
                    rowHeight={rowHeight}
                    cellStyle={cellStyle}
                    onResizeLeft={onResizeLeft}
                    onResizeRight={onResizeRight}
                    onEventClick={onEventClick}
                  />
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default DayView

