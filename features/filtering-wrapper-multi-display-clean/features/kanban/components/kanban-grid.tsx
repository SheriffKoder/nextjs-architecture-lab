/**
 * Kanban Grid Component
 * 
 * Purpose: Renders the main Kanban grid with columns and draggable cards
 * Used in: kanban-container.tsx
 * Why: Organizes cards into columns with drag and drop functionality
 * 
 * Function Index:
 * - KanbanGrid: Main grid component rendering columns and cards
 * - renderColumn: Renders a single column with its cards
 * - renderCell: Renders a single cell (card or empty)
 * 
 * Layout:
 * - CSS Grid with equal-width columns
 * - Each column contains droppable cells
 * - Cells contain draggable cards or empty space
 * - Min height ensures consistent column heights
 * 
 * Steps:
 * 1. Accept grouped data and configuration
 * 2. Calculate column dimensions
 * 3. Render columns with droppable cells
 * 4. Place draggable cards in cells
 * 5. Show virtual placeholder for drop preview
 */

'use client'

import React from 'react'
import DroppableCell from './dnd/droppable-cell'
import DraggableCard from './dnd/draggable-card'
import { createCellId } from '../utils/dnd/position-calculator'
import { DEFAULT_MIN_CARDS, DEFAULT_GAP, SHOW_BOTTOM_DROP_ZONES, DROP_INDICATOR_HEIGHT } from '../constants/kanban-constants'
import type { ColumnConfig, VirtualPlaceholder } from '../types/kanban-types'

//////////////////////////////////
// Component Props
//////////////////////////////////

interface KanbanGridProps {
  groupedData: Record<string, any[]>
  columns: ColumnConfig[]
  cardKey: string
  cardTitle?: string
  cardContent?: string
  dateKey?: string
  minCards?: number
  hideEmptyColumns?: boolean
  activeId: string | null
  virtualPlaceholder: VirtualPlaceholder | null
  cardTemplate?: React.ComponentType<{ data: any; onAction?: (action: string) => void }>
  onCardAction?: (action: string, data: any) => void
  loadingItemIds?: string[]
}

//////////////////////////////////
// Kanban Grid Component
//////////////////////////////////

/**
 * Renders the main Kanban grid with draggable cards
 * Handles column layout and cell rendering
 * 
 * @param groupedData - Items grouped by column
 * @param columns - Column configurations
 * @param cardKey - Property name for card unique ID
 * @param cardTitle - Label for card header
 * @param cardContent - Property name for card content
 * @param dateKey - Property name for date field
 * @param minCards - Minimum rows per column
 * @param activeId - ID of currently dragged card
 * @param virtualPlaceholder - Drop indicator position
 * @param cardTemplate - Custom card template
 * @param onCardAction - Action handler callback
 */
const KanbanGrid: React.FC<KanbanGridProps> = ({
  groupedData,
  columns,
  cardKey,
  cardTitle,
  cardContent,
  dateKey,
  minCards = DEFAULT_MIN_CARDS,
  hideEmptyColumns = false,
  activeId,
  virtualPlaceholder,
  cardTemplate,
  onCardAction,
  loadingItemIds
}) => {
  //////////////////////////////////
  // Filter columns if hideEmptyColumns is true
  //////////////////////////////////
  
  const visibleColumns = hideEmptyColumns
    ? columns.filter((col) => {
        const items = groupedData[col.key] || []
        return items.length > 0
      })
    : columns
  
  //////////////////////////////////
  // Calculate grid dimensions
  //////////////////////////////////
  
  const columnCount = visibleColumns.length
  const gridTemplateColumns = `repeat(${columnCount}, 1fr)`
  
  //////////////////////////////////
  // Helper functions for bottom drop zone logic
  //////////////////////////////////
  
  /**
   * Finds the column key where the dragged item is located
   */
  const getSourceColumn = (): string | null => {
    if (!activeId) return null
    
    for (const columnKey in groupedData) {
      const columnItems = groupedData[columnKey] || []
      const found = columnItems.find((item: any) => String(item[cardKey]) === activeId)
      
      if (found) {
        return columnKey
      }
    }
    
    return null
  }
  
  /**
   * Determines if the dragged item is the last item in its source column
   * Used to decide whether to show bottom drop zone for source column
   */
  const isDraggedItemLastInColumn = (): boolean => {
    if (!activeId) return false
    
    // Find which column contains the dragged item
    for (const columnKey in groupedData) {
      const columnItems = groupedData[columnKey] || []
      if (columnItems.length === 0) continue
      
      const lastItem = columnItems[columnItems.length - 1]
      if (lastItem && String(lastItem[cardKey]) === activeId) {
        return true
      }
    }
    
    return false
  }
  
  //////////////////////////////////
  // Render a single column
  //////////////////////////////////
  
  /**
   * Renders all cells in a column
   * 
   * @param column - Column configuration
   * @returns Array of cell elements
   */
  const renderColumn = (column: ColumnConfig) => {
    // Get items for this column
    const columnItems = groupedData[column.key] || []
    
    // Check if this is the source column (where item is being dragged from)
    const sourceColumn = activeId ? getSourceColumn() : null
    const isSourceColumn = sourceColumn === column.key
    
    // In source column, exclude the dragged item from rendering (it's shown in DragOverlay)
    const itemsToRender = isSourceColumn && activeId
      ? columnItems.filter((item: any) => String(item[cardKey]) !== activeId)
      : columnItems
    
    // Check if there's a virtual placeholder in this column
    const hasPlaceholder = virtualPlaceholder && virtualPlaceholder.columnKey === column.key
    
    // Find original position of dragged item in source column (for ghost placeholder)
    let draggedItemOriginalIndex: number | null = null
    if (isSourceColumn && activeId) {
      // Find the original index of the dragged item in the full columnItems array
      const originalIndex = columnItems.findIndex((item: any) => String(item[cardKey]) === activeId)
      if (originalIndex !== -1) {
        draggedItemOriginalIndex = originalIndex
      }
    }
    
    // Check if virtual placeholder is at the same position as the ghost (don't show ghost if so)
    const isGhostAtPlaceholderPosition = hasPlaceholder && 
      draggedItemOriginalIndex !== null &&
      virtualPlaceholder!.columnKey === column.key &&
      virtualPlaceholder!.rowIndex === draggedItemOriginalIndex
    
    // Create array to hold items with placeholder inserted
    const itemsWithPlaceholder: Array<{ type: 'item' | 'placeholder' | 'ghost'; data?: any; index: number }> = []
    
    // Build array with items, ghost, and virtual placeholder
    // We'll insert them in order based on their positions
    const allPositions: Array<{ type: 'item' | 'placeholder' | 'ghost'; data?: any; index: number; position: number }> = []
    
    // Add virtual placeholder FIRST (so it appears above items at the same position)
    if (hasPlaceholder) {
      const placeholderIndex = virtualPlaceholder!.rowIndex
      // Use a slightly lower position value so placeholder sorts before items at the same position
      allPositions.push({ type: 'placeholder', index: placeholderIndex, position: placeholderIndex - 0.5 })
    }
    
    // Add all items with their original positions in the full columnItems array
    itemsToRender.forEach((item) => {
      // Find original position in full columnItems array
      const originalPos = columnItems.findIndex((colItem: any) => 
        colItem === item || String(colItem[cardKey]) === String(item[cardKey])
      )
      if (originalPos !== -1) {
        allPositions.push({ type: 'item', data: item, index: originalPos, position: originalPos })
      }
    })
    
    // Add ghost placeholder at original position (if not at virtual placeholder position)
    if (isSourceColumn && draggedItemOriginalIndex !== null && !isGhostAtPlaceholderPosition) {
      allPositions.push({ type: 'ghost', index: draggedItemOriginalIndex, position: draggedItemOriginalIndex })
    }
    
    // Sort by position and build final array
    allPositions.sort((a, b) => a.position - b.position)
    allPositions.forEach((pos) => {
      itemsWithPlaceholder.push({ type: pos.type, data: pos.data, index: pos.index })
    })
    
    // Check if we should show bottom drop zone for this column
    const shouldShowBottomDropZone = activeId && SHOW_BOTTOM_DROP_ZONES
    
    // DO NOT show bottom drop zone if:
    // 1. This is the source column (where item is being dragged from)
    // 2. There's a virtual placeholder in this column (item is being dragged over it)
    // Only show bottom drop zones in OTHER columns that don't have a placeholder
    const showBottomZone = shouldShowBottomDropZone && 
      !isSourceColumn &&
      !hasPlaceholder
    
    // Calculate number of cells to render
    // In source column during drag: don't add empty cell (removed item already creates space)
    // If showing bottom drop zone: bottom zone replaces empty cell
    // Otherwise: add normal empty cell
    const cellCount = itemsWithPlaceholder.length > 0 
      ? itemsWithPlaceholder.length + (isSourceColumn && activeId ? 0 : showBottomZone ? 0 : 1)
      : Math.max(1, minCards)
    
    // Create array of cells
    const cells: React.ReactNode[] = []
    
    // Render each cell
    for (let rowIndex = 0; rowIndex < cellCount; rowIndex++) {
      const cellContent = itemsWithPlaceholder[rowIndex]
      const cellId = createCellId(column.key, rowIndex)
      
      // Skip placeholder in loop - it will be added separately like bottom drop zone
      if (cellContent?.type === 'placeholder') {
        continue
      }
      
      // Check if this card is being dragged
      const itemId = cellContent?.type === 'item' ? String(cellContent.data[cardKey]) : null
      const isDragging = itemId === activeId
      
      cells.push(
        <div key={cellId} className='w-full'>
          <DroppableCell
            cellId={cellId}
            columnKey={column.key}
            rowIndex={rowIndex}
            showDropIndicator={false} // We handle placeholder rendering separately
          >
            {cellContent?.type === 'item' && (
              <DraggableCard
                data={cellContent.data}
                cardKey={cardKey}
                cardTitle={cardTitle}
                cardContent={cardContent}
                dateKey={dateKey}
                isDragging={isDragging}
                isGhost={isDragging}
                isCardLoading={loadingItemIds?.includes(String(cellContent.data[cardKey]))}
                cardTemplate={cardTemplate}
                onCardAction={onCardAction}
              />
            )}

            {/* place placeholder */}
            {cellContent?.type === 'ghost' && (
              <div className='w-full border-2 border-dashed border-tertiary rounded-lg' style={{ height: `${DROP_INDICATOR_HEIGHT}px` }}>
                {/* Ghost placeholder (solid border, preserves space) */}
              </div>
            )}
            {/* {!cellContent && <div className='w-full border' style={{ minHeight: '20px' }} />} */}
          </DroppableCell>
        </div>
      )
    }
    
    // Allow empty columns blue boxes to be droppable
    // Add placeholder as separate cell (like bottom drop zone) if it exists
    if (hasPlaceholder) {
      const placeholderIndex = virtualPlaceholder!.rowIndex
      const placeholderCellId = createCellId(column.key, placeholderIndex)
      
      // Insert placeholder at correct position in cells array
      cells.splice(placeholderIndex, 0,
        <div key={`placeholder-${column.key}-${placeholderIndex}`} className='w-full'>
          <DroppableCell
            cellId={placeholderCellId}
            columnKey={column.key}
            rowIndex={placeholderIndex}
            showDropIndicator={false}
          >
            <div 
              className='w-full border-2 border-dashed border-tertiary rounded-lg' 
              style={{ height: `${DROP_INDICATOR_HEIGHT}px` }}
            >
              {/* Drop indicator placeholder (blue dashed) */}
            </div>
          </DroppableCell>
        </div>
      )
    }
    
    // Add bottom drop zone as the last cell if needed
    if (showBottomZone) {
      const lastRowIndex = itemsWithPlaceholder.length
      const bottomCellId = createCellId(column.key, lastRowIndex)
      
      cells.push(
        <div key={`bottom-${column.key}`} className='w-full'>
          <DroppableCell
            cellId={bottomCellId}
            columnKey={column.key}
            rowIndex={lastRowIndex}
            showDropIndicator={false}
          >
            <div className='w-full border-2 border-dashed border-tertiary rounded-lg opacity-50 hover:opacity-100 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200' style={{ height: `${DROP_INDICATOR_HEIGHT}px` }}>
              {/* Bottom drop zone - becomes active on hover */}
            </div>
          </DroppableCell>
        </div>
      )
    }
    
    return cells
  }
  
  //////////////////////////////////
  // Render grid
  //////////////////////////////////
  
  return (
    <div
      className='w-full h-full grid pb-4 pt-1'
      style={{
        gridTemplateColumns,
        gap: `${DEFAULT_GAP}px`,
        alignItems: 'start'
      }}
    >
      {/* Render each visible column */}
      {visibleColumns.map((column, index) => (
        <div
          key={column.key}
          className={`w-full flex flex-col gap-3 bg-foreground/5 dark:bg-[rgba(0,0,0,0.0.1)] backdrop-blur-sm flex-1 overflow-auto custom-scrollbar
            border border-t-0 rounded-b-lg border-border dark:border-[rgba(255,255,255,0.04)] shadow-sm
            h-full p-2`}
        >
          {renderColumn(column)}
        </div>
      ))}
    </div>
  )
}

export default KanbanGrid

