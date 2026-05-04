'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useVisibleRange } from '../../virtualization/context/visible-range-context'

// Cell color configuration for this component
const CELL_COLORS = {
  backgrounds: {
    dragOver: '#bfdbfe',
    hover: '#eff6ff',
  },
  borders: {
    dragOver: '#3b82f6',
    dragOverWidth: '2px',
    right: 'hsl(var(--border) / 0.5)', // Theme-aware border color
  },
} as const

/**
 * DroppableTimelineCellDay Component
 * 
 * Purpose: Renders a droppable timeline cell for Day view with hour:minute precision
 * Used in: timeline-row-day.tsx
 * Why: Single responsibility - handles cell dropping for timeline events in Day view
 * 
 * Features:
 * - Makes timeline cells droppable using @dnd-kit
 * - Visual feedback when hovering over cell
 * - Includes hour and minute in cell data for precise positioning
 * - Maintains cell styling and hover states
 */

interface DroppableTimelineCellDayProps {
  cellId: string // Format: `${timelineIndex}:${year}:${month}:${day}:${hour}:${minute}`
  timelineIndex: number
  year: number
  month: number
  day: number
  hour: number // Hour index (0-23)
  minute: number // Minute interval (0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60)
  style?: React.CSSProperties // Allow external styling for grid positioning
  children?: React.ReactNode
}

const DroppableTimelineCellDay = ({ 
  cellId, 
  timelineIndex, 
  year, 
  month, 
  day,
  hour,
  minute,
  style,
  children
}: DroppableTimelineCellDayProps) => {
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
      hour,
      minute,
      dimensionalId: `${timelineIndex}:${year}:${month}:${day}:${hour}:${minute}`
    } : undefined
  })

  // Debug: Log when cell is hovered
  if (isOver) {
    console.log('🎯 DAY VIEW TIMELINE CELL HOVERED:', { 
      cellId, 
      timelineIndex, 
      year, 
      month, 
      day,
      hour,
      minute,
      dimensionalId: `${timelineIndex}:${year}:${month}:${day}:${hour}:${minute}`
    })
  }

  // Handle cell click
  const handleCellClick = () => {
    console.log('🖱️ DAY VIEW TIMELINE CELL CLICKED:', { 
      cellId, 
      timelineIndex, 
      year, 
      month, 
      day,
      hour,
      minute,
      dimensionalId: `${timelineIndex}:${year}:${month}:${day}:${hour}:${minute}`,
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    })
  }
  
  // Get background color based on state
  // Transparent for normal, dragOver color when dragging
  const backgroundColor = isOver 
    ? CELL_COLORS.backgrounds.dragOver 
    : undefined // Transparent background

  // Get border styles when dragging over
  const dragOverBorderStyle = isOver 
    ? { 
        border: `${CELL_COLORS.borders.dragOverWidth} solid ${CELL_COLORS.borders.dragOver}`,
        borderBottom: `1px solid ${CELL_COLORS.borders.right}`
      }
    : { borderBottom: `1px solid ${CELL_COLORS.borders.right}` }

  return (
    <div
      ref={setNodeRef}
      className="cursor-pointer transition-colors"
      style={{ 
        width: '100%',
        height: '100%',
        backgroundColor,
        ...dragOverBorderStyle,
        ...style // Apply external styles (e.g., gridColumn for positioning)
      }}
      onMouseEnter={(e) => {
        if (!isOver) {
          e.currentTarget.style.backgroundColor = CELL_COLORS.backgrounds.hover
        }
      }}
      onMouseLeave={(e) => {
        if (!isOver) {
          e.currentTarget.style.backgroundColor = '' // Transparent
        }
      }}
      onClick={handleCellClick}
    >
      {children}
    </div>
  )
}

export default DroppableTimelineCellDay

