/**
 * Default Card Component
 * 
 * Purpose: Fallback card UI when no custom template is provided
 * Used in: components/dnd/draggable-card.tsx
 * Why: Provides clean, minimal default card design
 * 
 * Function Index:
 * - DefaultCard: Renders card with title, content, and optional date
 * 
 * Steps:
 * 1. Accept card data and display configuration
 * 2. Extract values from data object
 * 3. Render card with clean styling
 * 4. Show title, content, and formatted date
 */

'use client'

import React from 'react'

//////////////////////////////////
// Component Props
//////////////////////////////////

interface DefaultCardProps {
  data: any
  cardKey: string
  cardTitle?: string
  cardContent?: string
  dateKey?: string
  onAction?: (action: string) => void
}

//////////////////////////////////
// Default Card Component
//////////////////////////////////

/**
 * Default card component with minimal, clean design
 * Displays card title, content, and optional date
 * 
 * @param data - Card data object
 * @param cardKey - Property name for unique ID
 * @param cardTitle - Label for card header
 * @param cardContent - Property name for main content
 * @param dateKey - Property name for date field
 * @param onAction - Action handler callback
 */
const DefaultCard: React.FC<DefaultCardProps> = ({
  data,
  cardKey,
  cardTitle = 'Task',
  cardContent = 'summary',
  dateKey,
  onAction
}) => {
  //////////////////////////////////
  // Extract values from data
  //////////////////////////////////
  
  // Get unique ID
  const id = data[cardKey]
  
  // Get content to display
  const content = data[cardContent] || 'No content'
  
  // Get date if provided
  const date = dateKey ? data[dateKey] : null
  
  //////////////////////////////////
  // Format date for display
  //////////////////////////////////
  
  const formattedDate = date ? formatDate(date) : null
  
  //////////////////////////////////
  // Render card
  //////////////////////////////////
  
  return (
    <div className='w-full bg-background/80 dark:bg-tertiary/10 backdrop-blur-sm rounded-lg border border-border dark:border-[rgba(255,255,255,0.04)] p-3 shadow-sm hover:shadow-md transition-shadow duration-200'>
      
      {/* Card Header */}
      <div className='flex items-center justify-between mb-2'>
        <span className='text-xs font-semibold text-foreground uppercase tracking-wide'>
          {cardTitle}
        </span>
        <span className='text-xs text-foreground/70'>
          #{id.slice(-8)}
        </span>
      </div>
      
      {/* Card Content */}
      <div className='text-sm text-foreground/80 mb-2 leading-relaxed'>
        {content}
      </div>
      
      {/* Card Footer with Date */}
      {formattedDate && (
        <div className='text-xs text-foreground/70 mt-2 pt-2 border-t border-border'>
          {formattedDate}
        </div>
      )}
      
    </div>
  )
}

//////////////////////////////////
// Helper: Format date
//////////////////////////////////

/**
 * Formats date string or Date object for display
 * 
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if valid date
    if (isNaN(dateObj.getTime())) {
      return String(date)
    }
    
    // Format as relative time (e.g., "2 days ago")
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
      return `${diffDays} days ago`
    } else if (diffDays < -1 && diffDays > -7) {
      return `In ${Math.abs(diffDays)} days`
    } else {
      // Format as date string
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  } catch (error) {
    return String(date)
  }
}

export default DefaultCard

