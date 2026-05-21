/**
 * Drag Grip Icon Component
 * 
 * Purpose: Renders a vertical grip icon for dragging rows
 * Used in: DraggableRow component
 * 
 * Features:
 * - Vertical grip icon (using lucide-react GripVertical)
 * - Hover effects
 * - Proper cursor styling
 */

import React from 'react'
import { GripVertical } from 'lucide-react'

interface DragGripIconProps {
  /**
   * Whether the row is currently being dragged
   */
  isDragging?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Vertical grip icon for drag handle
 * 
 * @param props - Component props
 * @returns Grip icon element
 */
export function DragGripIcon({ 
  isDragging = false, 
  className = '' 
}: DragGripIconProps) {
  return (
    <div
      className={`px-2 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : 'opacity-60 hover:opacity-100'
      } transition-opacity ${className}`}
      style={{ touchAction: 'none' }}
    >
      <GripVertical 
        className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" 
        strokeWidth={2}
      />
    </div>
  )
}
