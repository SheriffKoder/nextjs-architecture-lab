import React, { useState, useMemo } from 'react'
import { HOURS } from '../../utils/days/hours'
import { MappedTimelineItem, MappingKeys } from '../../utils/mapping/timeline-mapping'
import DraggableTimelineItemDay from '../dnd/draggable-timeline-item-day'
import DroppableTimelineCellDay from '../dnd/droppable-timeline-cell-day'
import ResizeGhost from '../dnd/resize-ghost'
import {
  MINUTE_INTERVALS,
  CELLS_PER_HOUR,
  getUnifiedStartPosition,
  getUnifiedEndPosition,
  calculateUnifiedSpan
} from '../../utils/days/day-time-calculator'
import { unifiedDayPositionToDate } from '../../utils/days/day-time-calculator'
import { DROPPABLE_BUFFER_DAY, MINUTE_GRANULARITY } from '../../virtualization/timeline-config'

// Cell color configuration for this component
const CELL_COLORS = {
  borders: {
    leftFull: '1px solid hsl(var(--border) / 0.5)',
    rightFull: '1px solid hsl(var(--border) / 0.5)',
    bottomFull: '1px solid hsl(var(--border) / 0.5)',
  },
} as const

interface TimelineRowDayProps {
  daysInRange: Date[] // Array of all days in the unified grid
  visibleDaysInRange: Date[] // Array of only visible days (virtualization)
  timelineIndex: number
  timelineData: MappedTimelineItem[] // Array of items for this timeline row
  mappingKeys: MappingKeys // Pass mapping keys to access generic properties
  hourColumnWidth: number // Width of each hour column in pixels
  cellWidth: number // Width of each 5-minute cell (already calculated in parent)
  rowHeight: number // Height of each timeline row
  cellStyle: any // Style configuration for timeline items
  onResizeLeft?: (item: MappedTimelineItem, intervalChange: number) => void // intervalChange = number of 5-minute intervals
  onResizeRight?: (item: MappedTimelineItem, intervalChange: number) => void // intervalChange = number of 5-minute intervals
  onEventClick?: (eventId: string) => void // callback when event/item is clicked
}

/**
 * TimelineRowDay Component
 * 
 * Purpose: Renders a single timeline row for Day view with unified grid across all days
 * Used in: day-view.tsx
 * Why: Single responsibility - handles day view timeline row rendering
 * 
 * Features:
 * - Displays unified grid spanning all days (days * 24 hours * 12 cells)
 * - Each hour contains 12 cells (0-55, with cell 55 extending to 59:59.999)
 * - Cell keys format: ${timelineIndex}:${year}:${month}:${day}:${hour}:${minute}
 * - Spans timeline items across 5-minute intervals and multiple days continuously
 */

const TimelineRowDay = ({
  daysInRange,
  visibleDaysInRange,
  timelineIndex,
  timelineData,
  mappingKeys,
  hourColumnWidth,
  cellWidth,
  rowHeight,
  cellStyle,
  onResizeLeft,
  onResizeRight,
  onEventClick
}: TimelineRowDayProps) => {
  //////////////////////////////////
  // Ghost State: Track resize preview
  //////////////////////////////////
  const [activeGhostItemIndex, setActiveGhostItemIndex] = useState<number | null>(null)
  const [ghostStartPos, setGhostStartPos] = useState<number | null>(null)
  const [ghostSpan, setGhostSpan] = useState<number | null>(null)
  
  //////////////////////////////////
  // Grid Calculations: Determine grid structure
  // Why: Maintain unified grid structure across all days for correct positioning
  //////////////////////////////////
  
  // Calculate total cells in unified grid (for entire grid, not just visible portion)
  const totalCells = daysInRange.length * HOURS.length * CELLS_PER_HOUR
  
  // Helper: Check if day is visible
  const isDayVisible = (day: Date): boolean => {
    return visibleDaysInRange.some(visibleDay => {
      const d1 = new Date(day)
      d1.setHours(0, 0, 0, 0)
      const d2 = new Date(visibleDay)
      d2.setHours(0, 0, 0, 0)
      return d1.getTime() === d2.getTime()
    })
  }

  // Get all timeline items for this row
  // NOTE: Data is already filtered by parent container based on visible date range
  // We just return all items passed to this row
  const getTimelineItemsForRow = (): MappedTimelineItem[] => {
    return timelineData
  }

  // Get start position for a timeline item in unified grid
  const getItemStartPosition = (item: MappedTimelineItem): number => {
    const itemStart = new Date(item.mapping.startDate)
    return getUnifiedStartPosition(itemStart, daysInRange)
  }

  // Calculate grid span for a timeline item in unified grid
  const getGridSpan = (item: MappedTimelineItem): number => {
    const itemStart = new Date(item.mapping.startDate)
    const itemEnd = new Date(item.mapping.endDate)
    return calculateUnifiedSpan(itemStart, itemEnd, daysInRange)
  }

  const timelineItemsForRow = getTimelineItemsForRow()

  //////////////////////////////////
  // Droppable Buffer: Calculate zones around task spans
  // Why: Major performance optimization - only use useDroppable hook around tasks
  // Performance impact: 83-96% fewer useDroppable hooks
  //////////////////////////////////
  
  // Calculate droppable zones: [start - buffer, end + buffer] for each task
  const droppableZones = useMemo(() => {
    const buffer = DROPPABLE_BUFFER_DAY
    const zones: Array<{ start: number; end: number; taskStart: number; taskEnd: number }> = []
    
    timelineItemsForRow.forEach((item) => {
      const taskStart = getItemStartPosition(item)
      const taskSpan = getGridSpan(item)
      
      if (taskStart > 0 && taskSpan > 0) {
        const taskEnd = taskStart + taskSpan - 1
        zones.push({
          start: Math.max(1, taskStart - buffer), // 1-based grid columns
          end: Math.min(totalCells, taskEnd + buffer),
          taskStart,
          taskEnd
        })
      }
    })
    
    return zones
  }, [timelineItemsForRow, totalCells])
  
  // Check if a cell position is in any droppable zone
  const isCellDroppable = (gridColumn: number): { isDroppable: boolean; isBuffer: boolean } => {
    for (const zone of droppableZones) {
      if (gridColumn >= zone.start && gridColumn <= zone.end) {
        const isBuffer = gridColumn < zone.taskStart || gridColumn > zone.taskEnd
        return { isDroppable: true, isBuffer }
      }
    }
    return { isDroppable: false, isBuffer: false }
  }

  //////////////////////////////////
  // Cell Generation: Create droppable cells only for visible days
  // Why useMemo: Prevents recalculating cells on every parent re-render
  // How it helps: Only regenerates when visible days or timeline index changes
  // Performance impact: Eliminates wasted cell generation on scroll/drag state updates
  //////////////////////////////////
  const droppableCells = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 TimelineRowDay - Visible Days:', visibleDaysInRange.length, 'All Days:', daysInRange.length)
    }
    
    const cells: React.ReactElement[] = []
    
    daysInRange.forEach((day, dayIndex) => {
      const visible = isDayVisible(day)
      
      if (process.env.NODE_ENV === 'development' && dayIndex % 10 === 0) {
        console.log(`  Day ${dayIndex}: ${day.toISOString().split('T')[0]}, visible=${visible}`)
      }
      
      // Skip cell generation for non-visible days (major optimization)
      if (!visible) {
        return
      }
      
      // Generate cells for visible day
      const normalizedDay = new Date(day)
      normalizedDay.setHours(0, 0, 0, 0)
      const year = normalizedDay.getFullYear()
      const month = normalizedDay.getMonth() + 1 // getMonth() returns 0-11, we need 1-12
      const dayOfMonth = normalizedDay.getDate()
      
      // Calculate base grid position for this day (1-indexed)
      const dayBaseGridColumn = dayIndex * HOURS.length * CELLS_PER_HOUR + 1
      
      HOURS.forEach((hourLabel, hourIndex) => {
        MINUTE_INTERVALS.forEach((minute, minuteIndex) => {
          const cellKey = `${timelineIndex}:${year}:${month}:${dayOfMonth}:${hourIndex}:${minute}`
          
          // Calculate exact grid column position
          // Formula: dayBase + (hour * cellsPerHour) + minuteIndex
          const gridColumn = dayBaseGridColumn + (hourIndex * CELLS_PER_HOUR) + minuteIndex
          
          // Check if this is the last interval of the hour (based on MINUTE_GRANULARITY)
          // Last interval = last value in MINUTE_INTERVALS array
          // For granularity 5: last interval is 55 (minuteIndex === MINUTE_INTERVALS.length - 1)
          // For granularity 15: last interval is 45 (minuteIndex === MINUTE_INTERVALS.length - 1)
          // For granularity 30: last interval is 30 (minuteIndex === MINUTE_INTERVALS.length - 1)
          const isLastInterval = minuteIndex === MINUTE_INTERVALS.length - 1
          
          // Apply borders: left border on last interval, no right border on all cells
          const borderLeft = null
          const borderRight = isLastInterval ? CELL_COLORS.borders.leftFull : 'none'
          
          // Check if this cell should be droppable (only in zones around tasks)
          const { isDroppable, isBuffer } = isCellDroppable(gridColumn)
          
          if (isDroppable) {
            // Render droppable cell with red background if it's in buffer zone (for testing)
            cells.push(
              <DroppableTimelineCellDay
                key={cellKey}
                cellId={cellKey}
                timelineIndex={timelineIndex}
                year={year}
                month={month}
                day={dayOfMonth}
                hour={hourIndex}
                minute={minute}
                style={{ 
                  gridColumn,
                  borderRight,
                  borderBottom: CELL_COLORS.borders.bottomFull,
                  // backgroundColor: isBuffer ? CELL_COLORS.backgrounds.buffer : undefined // Buffer cells (for testing)
                }}
              >
                {/* Empty cell - clicking is handled by the droppable cell */}
              </DroppableTimelineCellDay>
            )
          } else {
            // Render regular div (not droppable) for cells outside task zones
            // Transparent background for all cells in Day view
            cells.push(
              <div
                key={cellKey}
                style={{
                  gridColumn,
                  borderRight,
                  borderBottom: CELL_COLORS.borders.bottomFull
                }}
              />
            )
          }
        })
      })
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Generated ${cells.length} droppable cells for Day view`)
    }
    
    return cells
  }, [visibleDaysInRange, timelineIndex, daysInRange, droppableZones]) // Only regenerate when visible days or zones change

  return (
    <div
      key={`timeline-${timelineIndex}`}
      className='border-r border-border/60 relative'
      style={{ 
        height: `${rowHeight}px`,
        display: 'grid',
        gridTemplateColumns: `repeat(${totalCells}, ${cellWidth}px)` // Unified grid: days * 24 hours * 12 cells
      }}
    >
      {/* Generate droppable cells only for visible days in unified grid */}
      {/* Virtualization: Major performance optimization - only render cells in viewport */}
      {droppableCells}

      {/* Timeline items as spanning elements across unified grid */}
      {timelineItemsForRow.map((item, index) => {
        const startPos = getItemStartPosition(item)
        const span = getGridSpan(item)
        
        // Only render if item has valid position and span
        if (startPos === 0 || span === 0) {
          return null
        }
        
        return (
          <DraggableTimelineItemDay
            key={`timeline-item-${index}`}
            item={item}
            startPos={startPos}
            span={span}
            mappingKeys={mappingKeys}
            cellStyle={cellStyle}
            cellWidth={cellWidth}
            cellHeight={rowHeight}
            onResizeLeft={onResizeLeft ? (intervalChange) => onResizeLeft(item, intervalChange) : undefined}
            onResizeRight={onResizeRight ? (intervalChange) => onResizeRight(item, intervalChange) : undefined}
            onEventClick={onEventClick ? () => onEventClick(item[mappingKeys.uniqueIdKey as keyof MappedTimelineItem] as string) : undefined}
            onGhostUpdate={(newStartPos, newSpan) => {
              if (newStartPos !== null && newSpan !== null) {
                setActiveGhostItemIndex(index)
                setGhostStartPos(newStartPos)
                setGhostSpan(newSpan)
              } else {
                setActiveGhostItemIndex(null)
                setGhostStartPos(null)
                setGhostSpan(null)
              }
            }}
          />
        )
      })}

      {/* Resize Ghost - Rendered as sibling to draggable items so it can use grid */}
      {activeGhostItemIndex !== null && ghostStartPos !== null && ghostSpan !== null && (() => {
        const startPos = ghostStartPos
        const endPos = ghostStartPos + ghostSpan - 1
        const startDate = unifiedDayPositionToDate(startPos, daysInRange)
        const endDate = unifiedDayPositionToDate(endPos, daysInRange)
        const fmt12 = (d: Date) => {
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const dd = String(d.getDate()).padStart(2, '0')
          const h24 = d.getHours()
          const h12 = h24 % 12 || 12
          const ampm = h24 >= 12 ? 'PM' : 'AM'
          const mm = String(d.getMinutes()).padStart(2, '0')
          return `${y}-${m}-${dd} ${String(h12).padStart(2, '0')}:${mm} ${ampm}`
        }
        return (
          <ResizeGhost
            startPos={ghostStartPos}
            span={ghostSpan}
            cellHeight={rowHeight}
            cellStyle={cellStyle}
            leftLabel={fmt12(startDate)}
            rightLabel={fmt12(endDate)}
          />
        )
      })()}
    </div>
  )
}

export default TimelineRowDay

