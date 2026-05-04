/**
 * Droppable Cell Component
 * 
 * Purpose: Creates drop zones for draggable cards in the Kanban grid
 * Used in: components/kanban-grid.tsx
 * Why: Handles drop target functionality and visual feedback
 * 
 * Function Index:
 * - DroppableCell: Renders a cell that can receive dragged cards
 * 
 * Visual States:
 * - Normal: Transparent, contains card or empty
 * - Placeholder: Full card-sized placeholder (rendered in kanban-grid.tsx)
 * 
 * Steps:
 * 1. Accept cell ID and content
 * 2. Setup useDroppable hook
 * 3. Render cell with children
 * 4. Show drop indicator on hover
 */

'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'

//////////////////////////////////
// Component Props
//////////////////////////////////

interface DroppableCellProps {
  cellId: string
  columnKey: string
  rowIndex: number
  children?: React.ReactNode
  showDropIndicator?: boolean
  onClick?: () => void
}

//////////////////////////////////
// Droppable Cell Component
//////////////////////////////////

/**
 * Creates a droppable cell for the Kanban grid
 * Shows visual feedback when hovered during drag
 * 
 * @param cellId - Unique cell identifier (columnKey-rowIndex)
 * @param columnKey - Column identifier
 * @param rowIndex - Row position within column
 * @param children - Card or empty content
 * @param showDropIndicator - Whether to show drop indicator
 * @param onClick - Click handler for debugging
 */
const DroppableCell: React.FC<DroppableCellProps> = ({
  cellId,
  columnKey,
  rowIndex,
  children,
  showDropIndicator = false,
  onClick
}) => {
  //////////////////////////////////
  // Setup droppable functionality
  //////////////////////////////////
  
  /**
   * WHY: useDroppable makes the cell accept dropped cards
   * HOW: Provides drop detection and ref
   * IMPACT: Enables drop target detection and visual feedback
   */
  const { isOver, setNodeRef } = useDroppable({
    id: cellId,
    data: {
      type: 'cell',
      columnKey,
      rowIndex,
      cellId
    }
  })
  
  //////////////////////////////////
  // Handle cell click for debugging
  //////////////////////////////////
  
  const handleClick = () => {
    console.log('📦 CELL CLICKED:', cellId, { columnKey, rowIndex })
    onClick?.()
  }
  
  //////////////////////////////////
  // Render cell (placeholder is handled in kanban-grid.tsx)
  //////////////////////////////////
  
  return (
    <div
      ref={setNodeRef}
      className='relative w-full'
      onClick={handleClick}
    >
      {/* Cell content (card, placeholder, or empty) */}
      {/* Note: Placeholder rendering is handled in kanban-grid.tsx, not here */}
      <div className='w-full'>
        {children}
      </div>
    </div>
  )
}

export default DroppableCell

