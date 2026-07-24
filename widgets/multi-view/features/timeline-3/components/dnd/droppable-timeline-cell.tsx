'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useVisibleRange } from '../../virtualization/context/visible-range-context'

// Cell color configuration for this component
const CELL_COLORS = {
  backgrounds: {
    dragOver: '#bfdbfe',
  },
  borders: {
    dragOver: '#3b82f6',
    dragOverWidth: '2px',
  },
} as const

/**
 * DroppableTimelineCell Component
 * 
 * Purpose: Renders a droppable timeline cell for drag and drop functionality
 * Used in: timeline-row.tsx
 * Why: Single responsibility - only handles cell dropping for timeline events
 * 
 * Features:
 * - Makes timeline cells droppable using @dnd-kit
 * - Visual feedback when hovering over cell
 * - Console logs when cell is hovered
 * - Maintains cell styling and dimensional ID display
 */

interface DroppableTimelineCellProps {
  cellId: string
  timelineIndex: number
  year: number
  month: number
  day: number
  isWeekend?: boolean
  isSunday?: boolean // For Week view: apply gray-400 border to Sundays
  isToday?: boolean // For Month/Week views: highlight today's cell
  children?: React.ReactNode
  view?: 'Year' | 'Month' | 'Week' | 'Day' // View type to conditionally apply styles
  style?: React.CSSProperties // Allow passing custom styles (e.g., gridColumn for positioning)
}

const DroppableTimelineCell = ({ 
  cellId, 
  timelineIndex, 
  year, 
  month, 
  day, 
  isWeekend = false,
  isSunday = false,
  isToday = false,
  children,
  view,
  style
}: DroppableTimelineCellProps) => {
  // Get drag state from context (shared across all cells - single source of truth)
  const { isDragging } = useVisibleRange()
  
  // Always call useDroppable (hooks must be called unconditionally)
  // But disable it when not dragging to reduce overhead
  const { isOver, setNodeRef } = useDroppable({
    id: isDragging ? cellId : `disabled-${cellId}`, // Use disabled ID when not dragging
    disabled: !isDragging, // Disable when not dragging
    data: isDragging ? { 
      cellId, 
      timelineIndex, 
      year, 
      month, 
      day,
      dimensionalId: `${timelineIndex}:${year}:${month}:${day}`
    } : undefined
  })

  // Debug: Log when cell is hovered
  if (isOver) {
    console.log('🎯 TIMELINE CELL HOVERED:', { 
      cellId, 
      timelineIndex, 
      year, 
      month, 
      day,
      dimensionalId: `${timelineIndex}:${year}:${month}:${day}`
    })
  }

  // Conditionally apply border-r:
  // - Year view: no border
  // - Week view: thicker border for Sundays, normal for others
  // - Other views (Month, Day): normal border
  let borderClass = ''
  if (view === 'Year') {
    borderClass = ''
  } else if (view === 'Week' && isSunday) {
    borderClass = 'border-r-2 border-border/60'
  } else if (view === 'Week' || view === 'Month' || view === 'Day') {
    borderClass = 'border-r border-border/60'
  }
  
  // Get background color based on state
  // Transparent for normal, bg-foreground/5 for weekends, dragOver color when dragging
  const backgroundColor = isOver 
    ? CELL_COLORS.backgrounds.dragOver 
    : undefined // Let className handle background

  // Get border styles when dragging over
  const dragOverBorderStyle = isOver 
    ? { 
        border: `${CELL_COLORS.borders.dragOverWidth} solid ${CELL_COLORS.borders.dragOver}` 
      }
    : {}

  return (
    <div
      ref={setNodeRef}
      className={`${borderClass} relative transition-colors duration-200 ${isWeekend ? 'bg-foreground/5' : ''}`}
      style={{
        backgroundColor,
        ...dragOverBorderStyle,
        ...style
      }}
    >
      {/* Dimensional ID indicator */}
      {/* <div className='absolute top-1 left-1 text-xs text-gray-500 font-mono'>
        {day}
      </div> */}
      {/* Vertical line indicator for today's cell (Year/Month/Week views) */}
      {isToday && (view === 'Year' || view === 'Month' || view === 'Week') && (
        <div
          className="absolute -top-0 bottom-0 h-[110%] left-1/2 -translate-x-[calc(50%+2px)] pointer-events-none"
          style={{
            width: '1px',
            backgroundColor: 'hsl(var(--foreground))',
          }}
        />
      )}
      {/* Triangle indicator at top of first row for today's cell (Year view only) */}
      {isToday && timelineIndex === 0 && view === 'Year' && (
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
      {children}
    </div>
  )
}

export default DroppableTimelineCell
