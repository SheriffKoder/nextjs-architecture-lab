'use client'

import React from 'react'

/**
 * ResizeGhost Component
 * 
 * Purpose: Visual feedback during resize operations (changing item duration)
 * Used in: timeline-row.tsx (rendered as sibling to draggable items in grid)
 * Why: Provides smooth visual feedback while resizing without affecting actual data until mouse release
 * 
 * Features:
 * - White border ghost overlay with semi-transparent dark background
 * - Smooth span updates during resize (independent from actual item)
 * - Updates both startPos (for left resize) and span (for both directions)
 * - Positioned using CSS Grid (gridColumn) for proper alignment
 * - Only visible during active resize operations
 * 
 * Code Flow:
 * 1. User clicks resize handle (left/right edge) -> handleResizeStart in draggable-timeline-item.tsx
 * 2. Draggable item calls onGhostUpdate(startPos, span) with initial dimensions
 * 3. timeline-row.tsx receives callback and sets ghost state (activeGhostItemIndex, ghostStartPos, ghostSpan)
 * 4. timeline-row.tsx renders this ResizeGhost component as sibling in grid
 * 5. As user drags resize handle -> handleResizeLeft/handleResizeRight continuously called
 * 6. Dimensions calculated (newSpan from width/cellWidth) and onGhostUpdate called with new values
 * 7. timeline-row.tsx updates ghost state, causing smooth re-render of ghost
 * 8. On mouse release -> handleResizeStop calculates final daysChange
 * 9. Actual item data updates via onResizeLeft/onResizeRight (only on mouse release)
 * 10. onGhostUpdate(null, null) called to hide ghost
 * 
 * Key Design:
 * - Ghost state is managed in timeline-row.tsx (parent) not in draggable item (child)
 * - This allows ghost to be rendered at grid level, enabling proper gridColumn spanning
 * - Actual item data only updates on mouse release (handleResizeStop), not during drag
 * - Provides live visual feedback while maintaining data integrity
 * 
 * Visual Appearance:
 * - White 2px border with rounded corners
 * - Semi-transparent dark background (rgba(0, 0, 0, 0.6))
 * - Subtle white shadow for depth
 * - Height matches timeline item row (cellHeight - 4px for padding)
 * - Spans grid columns dynamically based on resize direction
 */

interface ResizeGhostProps {
  startPos: number
  span: number
  cellHeight: number
  cellStyle: any
  leftLabel?: string
  rightLabel?: string
}

const ResizeGhost = ({ 
  startPos, 
  span, 
  cellHeight,
  cellStyle,
  leftLabel,
  rightLabel
}: ResizeGhostProps) => {
  const itemHeight = cellHeight - 4 // Subtract top: 2px + bottom: 2px

  return (
    <div
      className="absolute pointer-events-none z-20 
      border border-tertiary
      bg-tertiary/20"
      style={{
        gridColumn: `${startPos} / span ${span}`,
        top: '2px',
        left: '2px',
        right: '2px',
        height: `${itemHeight}px`,
        // border: '2px solid #808080',
        borderRadius: '4px',
        // gray-500
        // background: '#808080',
        // boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.5)',
      }}
    >
      {leftLabel && (
        <div
          className="absolute -left-1 translate-x-[-100%] top-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap text-center"
          style={{ minWidth: '96px' }}
        >
          {leftLabel}
        </div>
      )}
      {rightLabel && (
        <div
          className="absolute -right-1 translate-x-[100%] top-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap text-center"
          style={{ minWidth: '96px' }}
        >
          {rightLabel}
        </div>
      )}
    </div>
  )
}

export default ResizeGhost

