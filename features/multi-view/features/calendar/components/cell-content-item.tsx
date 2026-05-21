/**
 * Cell Content Item Component
 * 
 * Purpose: Individual content item within a calendar cell
 * Used in: app/development/calendar/components/cell-content-item.tsx
 * Why: Reusable component for displaying content items in calendar cells
 * 
 * Function Index:
 * CellContentItem: Main component that renders individual content items
 * 
 * Steps:
 * 1. Accept content data and styling props
 * 2. Render content item with appropriate styling
 * 3. Handle different content types (tasks, events, etc.)
 * 4. Apply consistent styling and layout
 */

'use client'

interface CellContentItemProps {
  content?: string
  color?: string
  className?: string
}

const CellContentItem = ({ 
  content = '', 
  color = '#6b7280', 
  className = ''
}: CellContentItemProps) => {
  return (
    <div 
      className={`text-xs px-2 py-1 rounded mb-1 truncate ${className}`}
      style={{ 
        backgroundColor: color,
        color: '#ffffff'
      }}
    >
      {content}
    </div>
  )
}

export default CellContentItem
