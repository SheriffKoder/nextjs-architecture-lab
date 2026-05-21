'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ResizableBox } from 'react-resizable'
import { useDraggable } from '@dnd-kit/core'
import { MappedTimelineItem, MappingKeys } from '../../utils/mapping/timeline-mapping'
import ResizeGhost from './resize-ghost'
import { CELLS_PER_HOUR } from '../../utils/days/day-time-calculator'
import 'react-resizable/css/styles.css'

/**
 * DraggableTimelineItemDay Component
 * 
 * Purpose: Renders a draggable and resizable timeline event item for Day view
 * Used in: timeline-row-day.tsx
 * Why: Handles hour:minute precision for Day view (5-minute intervals) vs day-level precision
 * 
 * Features:
 * - Makes timeline items draggable using @dnd-kit
 * - Adds resize handles on left and right edges
 * - Visual feedback when dragging or resizing
 * - Shows resize indicators on hover
 * - Handles 5-minute interval changes (not days)
 * - Maintains timeline item styling and spanning
 */

interface DraggableTimelineItemDayProps {
  item: MappedTimelineItem
  startPos: number
  span: number
  mappingKeys: MappingKeys // Pass mapping keys to access generic properties
  cellStyle: any // Style configuration for timeline items
  cellWidth: number // Width of each 5-minute cell in pixels
  cellHeight?: number // Height of the timeline item row
  onResizeLeft?: (intervalChange: number) => void // Callback when resizing left edge (intervalChange = number of 5-min intervals)
  onResizeRight?: (intervalChange: number) => void // Callback when resizing right edge (intervalChange = number of 5-min intervals)
  onEventClick?: () => void // Callback when event/item is clicked
  onGhostUpdate?: (ghostStartPos: number | null, ghostSpan: number | null) => void // Callback to update ghost in parent
}

const DraggableTimelineItemDay = ({ 
  item, 
  startPos, 
  span, 
  mappingKeys,
  cellStyle,
  cellWidth,
  cellHeight = 40,
  onResizeLeft,
  onResizeRight,
  onEventClick,
  onGhostUpdate
}: DraggableTimelineItemDayProps) => {
  // Check if this is a unified collapsed event
  const isUnifiedEvent = (item as any)._isUnifiedCollapsedEvent === true
  
  // Format date for display (MM/DD/YYYY HH:MM AM/PM for day view)
  const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    const hours24 = date.getHours()
    const hours12 = hours24 % 12 || 12
    const ampm = hours24 >= 12 ? 'PM' : 'AM'
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}/${day}/${year} ${hours12}:${minutes} ${ampm}`
  }
  
  // Get display text: date range for unified events, title for regular events
  const displayText = isUnifiedEvent && (item as any)._originalItemCount
    ? `${formatDate(item.mapping.startDate)} - ${formatDate(item.mapping.endDate)} (${(item as any)._originalItemCount} items)`
    : item[mappingKeys.titleKey] || ''
  
  // State to track if we're currently resizing
  const [isResizing, setIsResizing] = useState(false)
  // State to track hover areas
  const [hoverArea, setHoverArea] = useState<'left' | 'right' | null>(null)
  // Track initial width when resize starts to calculate relative changes
  const [initialResizeWidth, setInitialResizeWidth] = useState<number | null>(null)
  // Ghost span state - updates smoothly during resize for visual feedback
  const [ghostSpan, setGhostSpan] = useState<number>(span)
  // Ghost startPos state - updates for left resize
  const [ghostStartPos, setGhostStartPos] = useState<number>(startPos)
  // Track which direction we're resizing
  const [resizeDirection, setResizeDirection] = useState<'left' | 'right' | null>(null)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `timeline-item-day-${item.mapping.timelineIndex}-${item.mapping.startCellId}`,
      data: { 
      item,
      startCellId: item.mapping.startCellId,
      endCellId: item.mapping.endCellId,
      title: displayText,
      type: item[mappingKeys.typeKey],
      status: item[mappingKeys.statusKey]
    }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  // Calculate spanning width (span * cellWidth)
  const spanWidth = span * cellWidth
  
  // Ref to measure text width
  const textMeasureRef = useRef<HTMLSpanElement>(null)
  const [textFits, setTextFits] = useState(false)
  
  // Measure text width to determine if it fits
  useEffect(() => {
    if (textMeasureRef.current) {
      const textWidth = textMeasureRef.current.offsetWidth
      // Account for padding - typically 8px on each side (from titleStyle padding)
      const availableWidth = spanWidth - 16 // Subtract padding (8px left + 8px right)
      setTextFits(textWidth <= availableWidth && spanWidth >= 50) // Also check minimum width
    }
  }, [spanWidth, displayText, cellStyle.titleStyle])

  // Update ghost span and startPos when item changes (on mount or when item is updated)
  useEffect(() => {
    setGhostSpan(span)
    setGhostStartPos(startPos)
  }, [span, startPos])

  // Handle resize events - left edge (only updates ghost, not actual data)
  const handleResizeLeft = (event: any, { size }: { size: { width: number; height: number } }) => {
    if (initialResizeWidth === null) return
    
    // Calculate new span based on width
    const newSpan = Math.round(size.width / cellWidth)
    // Calculate how many 5-minute intervals we've expanded/contracted
    const spanChange = newSpan - span
    // For left resize: if expanding (positive spanChange), startPos moves left (decreases)
    // if contracting (negative spanChange), startPos moves right (increases)
    const newStartPos = startPos - spanChange
    // Update ghost span and startPos for visual feedback
    setGhostSpan(newSpan)
    setGhostStartPos(newStartPos)
    // Notify parent to update ghost
    if (onGhostUpdate) {
      onGhostUpdate(newStartPos, newSpan)
    }
  }

  // Handle resize events - right edge (only updates ghost, not actual data)
  const handleResizeRight = (event: any, { size }: { size: { width: number; height: number } }) => {
    if (initialResizeWidth === null) return
    
    // Calculate new span based on width
    const newSpan = Math.round(size.width / cellWidth)
    // Update ghost span for visual feedback
    setGhostSpan(newSpan)
    // Notify parent to update ghost
    if (onGhostUpdate) {
      onGhostUpdate(startPos, newSpan)
    }
  }

  // Handle resize start
  const handleResizeStart = (event: any, { size }: { size: { width: number; height: number } }, direction: 'left' | 'right') => {
    setIsResizing(true)
    setResizeDirection(direction)
    setInitialResizeWidth(size.width) // Store the width when resize starts
    setGhostSpan(span) // Reset ghost to current span
    setGhostStartPos(startPos) // Reset ghost to current startPos
    // Notify parent to show ghost
    if (onGhostUpdate) {
      onGhostUpdate(startPos, span)
    }
  }

  // Handle resize stop - only now do we update the actual data
  const handleResizeStop = (event: any, { size }: { size: { width: number; height: number } }) => {
    if (initialResizeWidth === null) {
      setIsResizing(false)
      setResizeDirection(null)
      return
    }

    // Calculate the final interval change (number of 5-minute intervals)
    const widthChange = size.width - initialResizeWidth
    const intervalChange = Math.round(widthChange / cellWidth)
    
    // Only update if there's an actual change
    if (intervalChange !== 0) {
      if (resizeDirection === 'left' && onResizeLeft) {
        onResizeLeft(intervalChange)
      } else if (resizeDirection === 'right' && onResizeRight) {
        onResizeRight(intervalChange)
      }
    }

    // Reset states
    setIsResizing(false)
    setResizeDirection(null)
    setInitialResizeWidth(null)
    setGhostSpan(span) // Reset ghost to match new span (will be updated by useEffect)
    setGhostStartPos(startPos) // Reset ghost startPos (will be updated by useEffect)
    // Notify parent to hide ghost
    if (onGhostUpdate) {
      onGhostUpdate(null, null)
    }
  }

  // Debug: Log when item is dragged
  if (isDragging) {
    console.log('🎯 DAY VIEW TIMELINE ITEM DRAGGED:', { 
      item: displayText,
      startCellId: item.mapping.startCellId,
      endCellId: item.mapping.endCellId,
      type: item[mappingKeys.typeKey],
      status: item[mappingKeys.statusKey]
    })
  }

  // Calculate actual item height (accounting for top/bottom padding)
  const itemHeight = cellHeight - 4 // Subtract top: 2px + bottom: 2px
  
  return (
    <div 
      className="absolute"
      style={{
        gridColumn: `${startPos} / span ${span}`,
        top: '2px',
        bottom: '2px',
        left: '2px',
        right: '2px',
        ...style // Apply drag transform
      }}
    >

      {/* Blue Resizable Overlay - Handles Left Resizing */}
      <div 
        className={`absolute flex items-center justify-center transition-opacity ${
          isResizing || hoverArea === 'left' ? 'opacity-0' : 'opacity-0'
        }`}
        style={{
          width: '15px',
          height: '100%',
          left: '0%',
          top: '0%',
          zIndex: 30
        }}
        onMouseEnter={() => setHoverArea('left')}
        onMouseLeave={() => setHoverArea(null)}
      >
        <ResizableBox
          width={spanWidth} // Start at actual item width
          height={itemHeight} // Use actual item height
          minConstraints={[cellWidth, itemHeight]} // Minimum 1 cell width (5 minutes)
          maxConstraints={[spanWidth * 3, itemHeight]} // Maximum 3x original width
          onResize={handleResizeLeft}
          onResizeStart={(e: any, data: any) => handleResizeStart(e, data, 'left')}
          onResizeStop={handleResizeStop}
          resizeHandles={['w']} // Only left edge resize handle
          handle={
            <div className="absolute left-0 top-0 w-[15px] h-full bg-blue-500 cursor-ew-resize opacity-100" />
          }
        >
          <div className="w-full h-full bg-blue-400 bg-opacity-100 rounded-lg" />
        </ResizableBox>
      </div>

      {/* Green Resizable Overlay - Handles Right Resizing */}
      <div 
        className={`absolute flex items-center justify-center transition-opacity ${
          isResizing || hoverArea === 'right' ? 'opacity-0' : 'opacity-0'
        }`}
        style={{
          width: '15px',
          height: '100%',
          right: '0%',
          top: '0%',
          zIndex: 30
        }}
        onMouseEnter={() => setHoverArea('right')}
        onMouseLeave={() => setHoverArea(null)}
      >
        <ResizableBox
          width={spanWidth} // Start at actual item width
          height={itemHeight} // Use actual item height
          minConstraints={[cellWidth, itemHeight]} // Minimum 1 cell width (5 minutes)
          maxConstraints={[spanWidth * 3, itemHeight]} // Maximum 3x original width
          onResize={handleResizeRight}
          onResizeStart={(e: any, data: any) => handleResizeStart(e, data, 'right')}
          onResizeStop={handleResizeStop}
          resizeHandles={['e']} // Only right edge resize handle
          handle={
            <div className="absolute right-0 top-0 w-[15px] h-full bg-green-500 cursor-ew-resize opacity-100" />
          }
        >
          <div className="w-full h-full bg-green-400 bg-opacity-100 rounded-lg" />
        </ResizableBox>
      </div>

      {/* Main Draggable Item - Handles Dragging (no transform — enables position:sticky vs timeline scrollport) */}
      <div
        ref={setNodeRef}
        className={`absolute inset-0 z-10 flex items-center justify-start overflow-visible bg-tertiary/50 text-foreground ${
          isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          ...cellStyle,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          height: '100%',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
        onClick={(e) => {
          // Only trigger click if not dragging and not resizing
          if (!isDragging && !isResizing && onEventClick) {
            e.stopPropagation()
            onEventClick()
          }
        }}
        {...attributes}
        {...listeners}
      >
        {/* Hidden text for width measurement */}
        <span
          ref={textMeasureRef}
          style={{
            ...cellStyle.titleStyle,
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'nowrap',
            height: 'auto',
            width: 'auto',
            pointerEvents: 'none',
          }}
        >
          {displayText}
        </span>
        <span
          className={`text-foreground bg-tertiary/0 sticky left-0 z-20 ${
            textFits ? 'min-w-0 max-w-full truncate' : 'whitespace-nowrap pointer-events-none'
          }`}
          style={cellStyle.titleStyle}
          title={!textFits ? displayText : undefined}
        >
          {displayText}
        </span>
      </div>

      {/* Left Handle Indicator - Shows on hover over left 25% */}
      <div
        className={`absolute left-[5px] top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
          hoverArea === 'left' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 20 }}
        onMouseEnter={() => setHoverArea('left')}
        onMouseLeave={() => setHoverArea(null)}
      >
        <div
          className='w-2 bg-gray-200 rounded-full cursor-ew-resize'
          style={{ height: `${itemHeight * 0.5}px` }}
        />
      </div>

      {/* Right Handle Indicator - Shows on hover over right 25% */}
      <div
        className={`absolute right-[5px] top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
          hoverArea === 'right' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 20 }}
        onMouseEnter={() => setHoverArea('right')}
        onMouseLeave={() => setHoverArea(null)}
      >
        <div
          className='w-2 bg-gray-200 rounded-full cursor-ew-resize'
          style={{ height: `${itemHeight * 0.5}px` }}
        />
      </div>
    </div>
  )
}

export default DraggableTimelineItemDay

