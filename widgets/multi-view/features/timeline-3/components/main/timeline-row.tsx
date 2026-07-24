import React, { useState, useMemo } from 'react'
import { MONTH_NAMES } from '../../utils/month-names'
import { MappedTimelineItem, MappingKeys } from '../../utils/mapping/timeline-mapping'
import DroppableTimelineCell from '../dnd/droppable-timeline-cell'
import DraggableTimelineItem from '../dnd/draggable-timeline-item'
import ResizeGhost from '../dnd/resize-ghost'
import {
  getUnifiedYearStartPosition,
  calculateUnifiedYearSpan,
  getDaysInYear
} from '../../utils/year/year-time-calculator'
import { unifiedYearPositionToDate } from '../../utils/year/year-time-calculator'
import {
  DROPPABLE_BUFFER_YEAR,
  DROPPABLE_BUFFER_MONTH,
  DROPPABLE_BUFFER_WEEK
} from '../../virtualization/timeline-config'
import { getMonthWidths, getTotalYearWidth } from '../../utils/year/month-width-calculator'

// Cell color configuration for this component
const CELL_COLORS = {
  borders: {
    leftFull: '1px solid hsl(var(--border) / 0.5)',
    rightFull: '1px solid hsl(var(--border) / 0.5)',
    bottomFull: '1px solid hsl(var(--border) / 0.5)',
  },
} as const

interface TimelineRowProps {
  yearsInRange: number[] // Array of all years in the unified grid
  visibleYearsInRange: number[] // Array of only visible years (virtualization)
  view: 'Year' | 'Month' | 'Week' | 'Day'
  yearWeekWidth: number
  monthDayWidth: number
  weekDayWidth: number
  cellWidth: number // Pre-calculated cell width (already calculated in parent)
  cellHeight?: number
  timelineIndex: number
  timelineData: MappedTimelineItem[] // Array of items for this timeline row
  mappingKeys: MappingKeys // Pass mapping keys to access generic properties
  cellStyle: any // Style configuration for timeline items
  onResizeLeft?: (item: MappedTimelineItem, daysChange: number) => void // Callback when resizing left edge
  onResizeRight?: (item: MappedTimelineItem, daysChange: number) => void // Callback when resizing right edge
  onEventClick?: (eventId: string) => void // callback when event/item is clicked
  isFirstRowInGroup?: boolean // NEW: indicates if this is the first data row in a group (sidebar mode only)
}

/**
 * TimelineRow Component
 * 
 * Renders Row 4+ - a unified CSS Grid spanning all years that maps timeline items to specific cells with spanning support.
 * Uses CSS Grid for proper cell positioning and timeline item spanning across multiple years.
 * 
 * Features:
 * - Unified CSS Grid layout across all years
 * - Timeline item spanning using unified position calculations
 * - Dynamic cell sizing based on view type
 * - Support for multiple timeline items per row
 * - Continuous spanning across year boundaries
 */
const TimelineRow = ({ 
  yearsInRange,
  visibleYearsInRange,
  view, 
  yearWeekWidth, 
  monthDayWidth, 
  weekDayWidth,
  cellWidth,
  cellHeight = 40,
  timelineIndex,
  timelineData,
  mappingKeys,
  cellStyle,
  onResizeLeft,
  onResizeRight,
  onEventClick,
  isFirstRowInGroup = false // NEW: indicates if this is the first data row in a group
}: TimelineRowProps) => {
  //////////////////////////////////
  // Ghost State: Track resize preview
  //////////////////////////////////
  const [activeGhostItemIndex, setActiveGhostItemIndex] = useState<number | null>(null)
  const [ghostStartPos, setGhostStartPos] = useState<number | null>(null)
  const [ghostSpan, setGhostSpan] = useState<number | null>(null)
  
  //////////////////////////////////
  // Grid Calculations: Determine grid structure
  // Why: Maintain unified grid structure across all years for correct positioning
  //////////////////////////////////
  
  // Calculate total cells in unified grid
  // For Year view: Use week-based calculation to match headers, but adjust cellWidth to fit
  // For Month/Week views: Use day-based calculation
  let totalCells: number
  let actualRowWidth: number
  let adjustedCellWidth: number
  
  if (view === 'Year') {
    // Year view: Calculate width based on weeks (matching header calculation)
    // Sum up month widths using week-based calculation for each year
    const totalWidth = yearsInRange.reduce((sum, year) => {
      const monthWidths = getMonthWidths(year, view, yearWeekWidth, monthDayWidth)
      return sum + getTotalYearWidth(monthWidths)
    }, 0)
    
    // Calculate total cells based on days (for grid positioning)
    totalCells = yearsInRange.reduce((sum, year) => sum + getDaysInYear(year), 0)
    
    // Adjust cell width so total grid width matches week-based calculation
    adjustedCellWidth = totalWidth / totalCells
    actualRowWidth = totalWidth
  } else {
    // Month/Week views: Use day-based calculation
    totalCells = yearsInRange.reduce((sum, year) => sum + getDaysInYear(year), 0)
    adjustedCellWidth = cellWidth
    actualRowWidth = totalCells * cellWidth
  }
  
  // Helper: Check if year is visible
  const isYearVisible = (year: number): boolean => {
    return visibleYearsInRange.includes(year)
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
    return getUnifiedYearStartPosition(itemStart, yearsInRange)
  }
  
  // Calculate grid span for a timeline item in unified grid
  const getGridSpan = (item: MappedTimelineItem): number => {
    const itemStart = new Date(item.mapping.startDate)
    const itemEnd = new Date(item.mapping.endDate)
    return calculateUnifiedYearSpan(itemStart, itemEnd, yearsInRange)
  }
  
  const timelineItemsForRow = getTimelineItemsForRow()
  
  // Generate grid template columns for unified grid (all days across all years)
  // For Year view: Use day-based grid but with correct total width constraint
  const gridTemplateColumns = `repeat(${totalCells}, ${cellWidth}px)`
  
  // Check if a day is weekend (Saturday or Sunday)
  const isWeekend = (year: number, monthIndex: number, day: number) => {
    const date = new Date(year, monthIndex, day)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
  }

  // Check if a day is Sunday
  const isSunday = (year: number, monthIndex: number, day: number) => {
    const date = new Date(year, monthIndex, day)
    return date.getDay() === 0 // Sunday
  }

  // Check if a day is today
  const isToday = (year: number, monthIndex: number, day: number) => {
    const today = new Date()
    return (
      year === today.getFullYear() &&
      monthIndex === today.getMonth() &&
      day === today.getDate()
    )
  }
  
  //////////////////////////////////
  // Droppable Buffer: Calculate zones around task spans
  // Why: Major performance optimization - only use useDroppable hook around tasks
  // Performance impact: 60-97% fewer useDroppable hooks depending on view
  //////////////////////////////////
  const getDroppableBuffer = (): number => {
    if (view === 'Year') return DROPPABLE_BUFFER_YEAR
    if (view === 'Month') return DROPPABLE_BUFFER_MONTH
    if (view === 'Week') return DROPPABLE_BUFFER_WEEK
    return 5 // Default fallback
  }
  
  // Calculate droppable zones: [start - buffer, end + buffer] for each task
  const droppableZones = useMemo(() => {
    const buffer = getDroppableBuffer()
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
  }, [timelineItemsForRow, view, totalCells])
  
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
  // Cell Generation: Create droppable cells only for visible years
  // Why: Major performance optimization - only render cells in viewport
  // Performance impact: 80% reduction in DOM elements (e.g., 2,190 days → ~400 days)
  // 
  // Why useMemo: Prevents recalculating cells on every parent re-render
  // How it helps: Only regenerates when visible years or timeline index changes
  // Performance impact: Eliminates wasted cell generation on scroll state updates
  //////////////////////////////////
  const droppableCells = useMemo(() => {
    const cells: React.ReactElement[] = []
    
    // Debug: Log visible years for this row
    if (process.env.NODE_ENV === 'development' && timelineIndex === 0) {
      console.log('🔍 TimelineRow - Visible Years:', visibleYearsInRange, 'All Years:', yearsInRange)
    }
    
    // Calculate cumulative day offset for each year to maintain unified grid positioning
    let cumulativeDayOffset = 0
    const yearDayOffsets = new Map<number, number>()
    yearsInRange.forEach((year) => {
      yearDayOffsets.set(year, cumulativeDayOffset)
      cumulativeDayOffset += getDaysInYear(year)
    })
    
    // Loop through all years, but only generate cells for visible ones
    yearsInRange.forEach((year) => {
      const visible = isYearVisible(year)
      
      // Debug: Log each year check
      if (process.env.NODE_ENV === 'development' && timelineIndex === 0) {
        const dayOffset = yearDayOffsets.get(year) || 0
        console.log(`  Year ${year}: visible=${visible}, inVisibleArray=${visibleYearsInRange.includes(year)}, dayOffset=${dayOffset}`)
      }
      
      // Skip cell generation for non-visible years (major optimization)
      if (!visible) {
        return
      }
      
      // Get the day offset for this year in the unified grid
      const yearStartDayIndex = yearDayOffsets.get(year) || 0
      
      // Debug: Log cell generation start for visible year
      if (process.env.NODE_ENV === 'development' && timelineIndex === 0) {
        console.log(`  ✨ Generating cells for year ${year}, gridColumn starts at ${yearStartDayIndex + 1}`)
      }
      
      let dayOffsetWithinYear = 0 // Track day position within this year
      
      // Generate cells for visible year with explicit grid positioning
      MONTH_NAMES.forEach((month, monthIndex) => {
        if (view === 'Year' || view === 'Month' || view === 'Week') {
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
          
          for (let day = 1; day <= daysInMonth; day++) {
            const isWeekendDay = isWeekend(year, monthIndex, day)
            const isSundayDay = isSunday(year, monthIndex, day)
            const isTodayDay = isToday(year, monthIndex, day)
            const isFirstOfMonth = day === 1
            const cellId = `${timelineIndex}:${year}:${monthIndex + 1}:${day}`
            
            // Calculate this cell's position in the unified grid (1-based)
            const gridColumn = yearStartDayIndex + dayOffsetWithinYear + 1
            
            // Determine border styles based on view mode
            let borderLeft = 'none'
            let borderRight = 'none'
            
            if (view === 'Year') {
              // Year mode: rightFull border on Sundays
              // borderRight = isSundayDay ? CELL_COLORS.borders.rightFull : 'none'
            } else if (view === 'Month') {
              // Month mode: leftFull border on first of month
              borderLeft = isFirstOfMonth ? CELL_COLORS.borders.leftFull : 'none'
            } else if (view === 'Week') {
              // Week mode: rightFull border on Sundays
              borderRight = isSundayDay ? CELL_COLORS.borders.rightFull : 'none'
            }
            
            // Check if this cell should be droppable (only in zones around tasks)
            const { isDroppable, isBuffer } = isCellDroppable(gridColumn)
            
            if (isDroppable) {
              // Render droppable cell with transparent background (weekends use bg-foreground/10)
              cells.push(
                <DroppableTimelineCell
                  key={cellId}
                  cellId={cellId}
                  timelineIndex={timelineIndex}
                  year={year}
                  month={monthIndex + 1}
                  day={day}
                  isWeekend={isWeekendDay}
                  isSunday={isSundayDay}
                  isToday={isTodayDay}
                  view={view}
                  style={{ 
                    gridColumn,
                    borderLeft,
                    borderRight,
                    borderBottom: CELL_COLORS.borders.bottomFull
                  }}
                />
              )
            } else {
              // Render regular div (not droppable) for cells outside task zones
              // Transparent background, weekends use bg-foreground/5
              cells.push(
                <div
                  key={cellId}
                  className={`relative ${isWeekendDay ? 'bg-foreground/5' : ''}`}
                  style={{
                    gridColumn,
                    borderLeft,
                    borderRight,
                    borderBottom: CELL_COLORS.borders.bottomFull
                  }}
                >
                  {/* Vertical line indicator for today's cell (Year/Month/Week views) */}
                  {isTodayDay && (view === 'Year' || view === 'Month' || view === 'Week') && (
                    <div
                      className="absolute -top-0 bottom-0 h-[110%] left-1/2 -translate-x-[calc(50%+2px)] pointer-events-none"
                      style={{
                        width: '1px',
                        backgroundColor: 'hsl(var(--foreground))',
                      }}
                    />
                  )}
                  {/* Triangle indicator at top of first row for today's cell (Year view only) */}
                  {isTodayDay && timelineIndex === 0 && view === 'Year' && (
                    <div
                      className="absolute -top-0 left-1/2 -translate-x-[calc(50%+2px)] -translate-y-[1px] pointer-events-none"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid hsl(var(--foreground))',
                      }}
                    />
                  )}
                </div>
              )
            }
            
            dayOffsetWithinYear++
          }
        } else if (view === 'Day') {
          const cellId = `${timelineIndex}:${year}:${monthIndex + 1}:0`
          
          cells.push(
            <DroppableTimelineCell
              key={cellId}
              cellId={cellId}
              timelineIndex={timelineIndex}
              year={year}
              month={monthIndex + 1}
              day={0}
              isWeekend={false}
              view={view}
            />
          )
        }
      })
    })
    
    // Debug: Log total cells generated
    if (process.env.NODE_ENV === 'development' && timelineIndex === 0) {
      console.log(`📦 Total cells generated: ${cells.length}`)
    }
    
    return cells
  }, [visibleYearsInRange, yearsInRange, timelineIndex, view, droppableZones]) // Only regenerate when visible years or all years change
  
  return (
    <div 
      className={`border-r border-border/60 relative ${isFirstRowInGroup ? 'border-t' : ''}`}
      style={{ 
        height: `${cellHeight}px`,
        minHeight: `${cellHeight}px`,
        width: `${actualRowWidth}px`, // Use calculated width to prevent overflow
        display: 'grid',
        gridTemplateColumns: gridTemplateColumns,
        // visible: overflow:hidden breaks position:sticky for labels inside timeline items (scrollport is VirtualizedTimelineContainer)
        overflow: 'visible',
        ...(isFirstRowInGroup ? {
          borderTopColor: 'hsl(var(--foreground) / 0.2)',
          borderTopWidth: '1px',
          borderTopStyle: 'solid'
        } : {})
      }}
    >
      {/* Grid cells */}
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
          <DraggableTimelineItem
            key={`timeline-item-${index}`}
            item={item}
            startPos={startPos}
            span={span}
            mappingKeys={mappingKeys}
            cellStyle={cellStyle}
            view={view}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            onResizeLeft={onResizeLeft ? (daysChange) => onResizeLeft(item, daysChange) : undefined}
            onResizeRight={onResizeRight ? (daysChange) => onResizeRight(item, daysChange) : undefined}
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
        const startDate = unifiedYearPositionToDate(startPos, yearsInRange)
        const endDate = unifiedYearPositionToDate(endPos, yearsInRange)
        const fmt = (d: Date) => {
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const dd = String(d.getDate()).padStart(2, '0')
          return `${y}-${m}-${dd}`
        }
        return (
          <ResizeGhost
            startPos={ghostStartPos}
            span={ghostSpan}
            cellHeight={cellHeight}
            cellStyle={cellStyle}
            leftLabel={fmt(startDate)}
            rightLabel={fmt(endDate)}
          />
        )
      })()}
    </div>
  )
}

export default TimelineRow