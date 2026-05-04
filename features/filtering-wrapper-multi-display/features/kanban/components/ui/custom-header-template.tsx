/**
 * Custom Column Header Template Component
 * 
 * Purpose: Custom column header design with status-based background color
 * Used in: app/development/kanban/page.tsx
 * Why: Demonstrates custom header template with visual status indicators
 * 
 * Function Index:
 * - CustomHeaderTemplate: Renders header with colored background
 * - getStatusBackgroundColor: Returns background color classes based on status
 * - getStatusIcon: Returns status icon element
 * 
 * Features:
 * - Background gradient based on status/column
 * - Status icon indicators
 * - Item count badge
 * - Sort toggle with icon
 * - Smooth hover effects
 * 
 * Steps:
 * 1. Extract column configuration
 * 2. Determine status-based colors
 * 3. Render header with gradient background
 * 4. Add add button if onAddItem provided
 */

'use client'

import React from 'react'
import { Plus, Circle, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import type { ColumnConfig } from '../../types/kanban-types'

//////////////////////////////////
// Component Props
//////////////////////////////////

interface CustomHeaderTemplateProps {
  column: ColumnConfig
  itemCount?: number
  onAddItem?: (columnKey: string) => void
}

//////////////////////////////////
// Custom Header Template Component
//////////////////////////////////

/**
 * Custom header template with status-based background
 * 
 * @param column - Column configuration
 * @param itemCount - Number of items in column
 * @param onAddItem - Add item handler callback
 */
const CustomHeaderTemplate: React.FC<CustomHeaderTemplateProps> = ({
  column,
  itemCount = 0,
  onAddItem
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
  // Get status-based styling
  //////////////////////////////////
  
  const backgroundColors = getStatusBackgroundColor(column.key)
  const StatusIcon = getStatusIcon(column.key)
  
  //////////////////////////////////
  // Render header
  //////////////////////////////////
  
  return (
    <div className={`w-full ${backgroundColors} px-4 py-3.5 rounded-t-lg border-b-2 border-white/20`}>
      <div className='flex items-center justify-between'>
        
        {/* Left side: Icon, Label, and Count */}
        <div className='flex items-center gap-2.5'>
          <StatusIcon className='w-4 h-4 text-white' />
          <h3 className='text-sm font-bold text-white uppercase tracking-wider'>
            {column.label}
          </h3>
          <span className='text-xs font-semibold text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full min-w-[24px] text-center'>
            {itemCount}
          </span>
        </div>
        
        {/* Right side: Add button */}
        {onAddItem && (
          <button
            onClick={handleAddClick}
            className='p-1 text-white/90 hover:text-white hover:bg-white/10 rounded transition-colors duration-150'
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

//////////////////////////////////
// Helper: Get status background color
//////////////////////////////////

/**
 * Returns Tailwind gradient classes based on status
 * 
 * @param statusKey - Status/column key (todo, in-progress, review, done)
 * @returns Tailwind gradient classes
 */
function getStatusBackgroundColor(statusKey: string): string {
  switch (statusKey.toLowerCase()) {
    case 'todo':
      return 'bg-gradient-to-r from-blue-500 to-blue-600'
    case 'in-progress':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    case 'review':
      return 'bg-gradient-to-r from-purple-500 to-purple-600'
    case 'done':
      return 'bg-gradient-to-r from-green-500 to-green-600'
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600'
  }
}

//////////////////////////////////
// Helper: Get status icon
//////////////////////////////////

/**
 * Returns appropriate icon component based on status
 * 
 * @param statusKey - Status/column key
 * @returns Lucide icon component
 */
function getStatusIcon(statusKey: string): React.FC<{ className?: string }> {
  switch (statusKey.toLowerCase()) {
    case 'todo':
      return Circle
    case 'in-progress':
      return Clock
    case 'review':
      return AlertCircle
    case 'done':
      return CheckCircle
    default:
      return Circle
  }
}

export default CustomHeaderTemplate

