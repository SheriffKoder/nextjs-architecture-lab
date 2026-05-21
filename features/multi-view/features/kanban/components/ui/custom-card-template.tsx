/**
 * Custom Card Template Component
 * 
 * Purpose: Custom card design with status-based left border color
 * Used in: app/development/kanban/page.tsx
 * Why: Demonstrates custom card template with visual status indicators
 * 
 * Function Index:
 * - CustomCardTemplate: Renders card with colored left border
 * - getStatusBorderColor: Returns border color class based on status
 * - getPriorityBadgeColor: Returns badge color class based on priority
 * 
 * Features:
 * - Left border color indicates status
 * - Priority badge with color coding
 * - Date formatting with relative time
 * - Action buttons (edit, delete)
 * - Hover effects
 * 
 * Steps:
 * 1. Extract data properties
 * 2. Determine status-based border color
 * 3. Render card with styled components
 * 4. Add action buttons if onAction provided
 */

'use client'

import React from 'react'
import { Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react'

//////////////////////////////////
// Component Props
//////////////////////////////////

interface CustomCardTemplateProps {
  data: any
  onAction?: (action: string) => void
}

//////////////////////////////////
// Custom Card Template Component
//////////////////////////////////

/**
 * Custom card template with status-based left border
 * 
 * @param data - Card data object
 * @param onAction - Action handler callback
 */
const CustomCardTemplate: React.FC<CustomCardTemplateProps> = ({ data, onAction }) => {
  //////////////////////////////////
  // Extract data properties
  //////////////////////////////////
  
  const id = data.id
  const status = data.status || 'default'
  const summary = data.summary || 'No summary'
  const priority = data.priority || 'medium'
  const createdAt = data.created_at
  
  //////////////////////////////////
  // Get status-based border color
  //////////////////////////////////
  
  const borderColor = getStatusBorderColor(status)
  const priorityColor = getPriorityBadgeColor(priority)
  
  //////////////////////////////////
  // Format date
  //////////////////////////////////
  
  const formattedDate = formatRelativeDate(createdAt)
  
  //////////////////////////////////
  // Render card
  //////////////////////////////////
  
  return (
    <div 
      className={`w-full bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${borderColor}`}
    >
      {/* Card Header */}
      <div className='p-4 pb-3'>
        <div className='flex items-start justify-between mb-3'>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityColor}`}>
            {priority.toUpperCase()}
          </span>
          <button 
            className='text-gray-400 hover:text-gray-600 transition-colors'
            onClick={() => onAction?.('menu')}
          >
            <MoreVertical className='w-4 h-4' />
          </button>
        </div>
        
        {/* Card Content */}
        <p className='text-sm font-medium text-gray-800 leading-relaxed mb-3'>
          {summary}
        </p>
        
        {/* Card Footer */}
        <div className='flex items-center justify-between text-xs text-gray-500'>
          <div className='flex items-center gap-1.5'>
            <Calendar className='w-3.5 h-3.5' />
            <span>{formattedDate}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-gray-400'>#{id}</span>
            <div className='flex items-center gap-1'>
              <button
                className='p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors'
                onClick={(e) => {
                  e.stopPropagation()
                  onAction?.('edit')
                }}
                title='Edit'
              >
                <Edit className='w-3.5 h-3.5' />
              </button>
              <button
                className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
                onClick={(e) => {
                  e.stopPropagation()
                  onAction?.('delete')
                }}
                title='Delete'
              >
                <Trash2 className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

//////////////////////////////////
// Helper: Get status border color
//////////////////////////////////

/**
 * Returns Tailwind border class based on status
 * 
 * @param status - Status value (todo, in-progress, review, done)
 * @returns Tailwind border class
 */
function getStatusBorderColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'todo':
      return 'border-l-4 border-l-blue-500'
    case 'in-progress':
      return 'border-l-4 border-l-yellow-500'
    case 'review':
      return 'border-l-4 border-l-purple-500'
    case 'done':
      return 'border-l-4 border-l-green-500'
    default:
      return 'border-l-4 border-l-gray-400'
  }
}

//////////////////////////////////
// Helper: Get priority badge color
//////////////////////////////////

/**
 * Returns Tailwind classes for priority badge
 * 
 * @param priority - Priority value (high, medium, low)
 * @returns Tailwind classes for badge
 */
function getPriorityBadgeColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-700 border border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-700 border border-green-200'
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
}

//////////////////////////////////
// Helper: Format relative date
//////////////////////////////////

/**
 * Formats date as relative time (e.g., "2 days ago")
 * 
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
function formatRelativeDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays === -1) {
      return 'Tomorrow'
    } else if (diffDays > 1 && diffDays < 7) {
      return `${diffDays}d ago`
    } else if (diffDays < -1 && diffDays > -7) {
      return `In ${Math.abs(diffDays)}d`
    } else {
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  } catch (error) {
    return String(date)
  }
}

export default CustomCardTemplate

