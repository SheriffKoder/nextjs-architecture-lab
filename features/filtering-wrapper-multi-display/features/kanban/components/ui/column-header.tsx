/**
 * Column Header Component
 * 
 * Purpose: Displays column header with label and add button
 * Used in: kanban-container.tsx
 * Why: Provides column identification and add item functionality
 * 
 * Function Index:
 * - ColumnHeader: Renders column header with add button
 * 
 * Features:
 * - Displays column label
 * - Shows item count
 * - Add item button
 * - Supports custom template
 * 
 * Steps:
 * 1. Accept column configuration
 * 2. Display label and item count
 * 3. Show add button if onAddItem provided
 */

'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import type { ColumnConfig } from '../../types/kanban-types'

//////////////////////////////////
// Component Props
//////////////////////////////////

interface ColumnHeaderProps {
  column: ColumnConfig
  itemCount?: number
  onAddItem?: (columnKey: string) => void
  columnHeaderTemplate?: React.ComponentType<{
    column: ColumnConfig
    itemCount?: number
    onAddItem?: (columnKey: string) => void
  }>
}

//////////////////////////////////
// Column Header Component
//////////////////////////////////

/**
 * Renders column header with add button
 * Displays label, item count, and add controls
 * 
 * @param column - Column configuration
 * @param itemCount - Number of items in column
 * @param onAddItem - Add item handler callback
 * @param columnHeaderTemplate - Custom header template
 */
const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  column,
  itemCount = 0,
  onAddItem,
  columnHeaderTemplate: CustomTemplate
}) => {
  //////////////////////////////////
  // Handle add item click
  //////////////////////////////////
  
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddItem) {
      console.log('➕ ADD ITEM:', column.key)
      onAddItem(column.key)
    }
  }
  
  //////////////////////////////////
  // Render custom template if provided
  //////////////////////////////////
  
  if (CustomTemplate) {
    return (
      <CustomTemplate
        column={column}
        itemCount={itemCount}
        onAddItem={onAddItem}
      />
    )
  }
  
  //////////////////////////////////
  // Render default header
  //////////////////////////////////
  
  // Use custom header colors if provided, otherwise use default
  const headerClassName = column.headerColors 
    ? `w-full backdrop-blur-sm px-4 py-3 rounded-t-lg border ${column.headerColors}`
    : 'w-full bg-tertiary/30 backdrop-blur-sm text-foreground px-4 py-3 rounded-t-lg'
  
  return (
    <div className={headerClassName}>
      <div className='flex items-center justify-between'>
        
        {/* Column label and count */}
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold uppercase tracking-wide'>
            {column.label}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            column.headerColors 
              ? 'bg-background/30 border border-current/30' 
              : 'text-foreground/70 bg-tertiary/30 border border-tertiary/20'
          }`}>
            {itemCount}
          </span>
        </div>
        
        {/* Action buttons: Add */}
        {onAddItem && (
          <button
            onClick={handleAddClick}
            className={`p-1 rounded transition-colors duration-150 ${
              column.headerColors
                ? 'hover:bg-background/20'
                : 'text-foreground hover:text-foreground/80 hover:bg-tertiary/10'
            }`}
            aria-label={`Add item to ${column.label}`}
            title='Add item'
          >
            <Plus className='w-4 h-4' />
          </button>
        )}
        
      </div>
    </div>
  )
}

export default ColumnHeader

