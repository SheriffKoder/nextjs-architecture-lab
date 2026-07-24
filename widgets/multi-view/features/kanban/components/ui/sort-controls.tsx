/**
 * Sort Controls Component
 * 
 * Purpose: Provides dropdown and direction buttons for sorting Kanban columns
 * Used in: page.tsx
 * Why: Allows users to sort columns by different fields with direction control
 * 
 * Function Index:
 * - SortControls: Main component with dropdown and arrow buttons
 * 
 * Features:
 * - Dropdown to select sort field
 * - Arrow up/down buttons for sort direction
 * - Disabled when manual sorting is enabled
 * - Handles string, number, and date types
 * 
 * Steps:
 * 1. Accept sort config options
 * 2. Render dropdown with field options
 * 3. Render arrow buttons for direction
 * 4. Handle changes and callbacks
 */

'use client'

import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from './button'
import SimpleDropdown from './simple-dropdown'
import { cn } from '../../utils/cn'

//////////////////////////////////
// Component Props
//////////////////////////////////

export interface SortFieldConfig {
  key: string
  label: string
  type?: 'string' | 'number' | 'date' // Optional type hint for better sorting
}

export interface SortControlsProps {
  /**
   * Available sort fields with labels
   */
  fields: SortFieldConfig[]
  
  /**
   * Currently selected sort key
   */
  sortKey?: string
  
  /**
   * Current sort direction
   */
  sortDirection?: 'asc' | 'desc'
  
  /**
   * Callback when sort key changes
   */
  onSortKeyChange?: (key: string) => void
  
  /**
   * Callback when sort direction changes
   */
  onSortDirectionChange?: (direction: 'asc' | 'desc') => void
  
  /**
   * Whether sorting is disabled (e.g., when manual sorting is enabled)
   */
  disabled?: boolean
  
  /**
   * Additional CSS classes
   */
  className?: string
}

//////////////////////////////////
// Sort Controls Component
//////////////////////////////////

/**
 * Sort controls with dropdown and direction buttons
 * 
 * @param props - Sort controls configuration
 * @returns Sort controls component
 * 
 * @example
 * <SortControls
 *   fields={[
 *     { key: 'created_at', label: 'Created At', type: 'date' },
 *     { key: 'priority', label: 'Priority', type: 'string' }
 *   ]}
 *   sortKey="created_at"
 *   sortDirection="asc"
 *   onSortKeyChange={(key) => setSortKey(key)}
 *   onSortDirectionChange={(dir) => setSortDirection(dir)}
 * />
 */
export const SortControls: React.FC<SortControlsProps> = ({
  fields,
  sortKey,
  sortDirection = 'asc',
  onSortKeyChange,
  onSortDirectionChange,
  disabled = false,
  className
}) => {
  //////////////////////////////////
  // Convert fields to dropdown items
  //////////////////////////////////
  
  const dropdownItems = fields.map((field, index) => ({
    id: field.key,
    label: field.label,
    value: field.key
  }))
  
  //////////////////////////////////
  // Handle dropdown change
  //////////////////////////////////
  
  const handleDropdownChange = (value: string) => {
    if (!disabled && onSortKeyChange) {
      onSortKeyChange(value)
    }
  }
  
  //////////////////////////////////
  // Handle direction button clicks
  //////////////////////////////////
  
  const handleDirectionClick = (direction: 'asc' | 'desc') => {
    if (!disabled && onSortDirectionChange) {
      onSortDirectionChange(direction)
    }
  }
  
  //////////////////////////////////
  // Render
  //////////////////////////////////
  
  return (
    <div className={cn('flex items-center gap-2', className)}>

      <h3 className='text-sm font-medium text-white mx-2'>Sort by</h3>
      {/* Dropdown */}
      <SimpleDropdown
        items={dropdownItems}
        selectedValue={sortKey || ''}
        onSelectionChange={handleDropdownChange}
        placeholder="Sort by..."
        disabled={disabled}
        className="w-48"
      />
      
      {/* Direction Buttons */}
      <div className="flex items-center bg-white rounded-md overflow-hidden border border-gray-500">
        <button
          type="button"
          onClick={() => handleDirectionClick('asc')}
          disabled={disabled || !sortKey}
          className={cn(
            'h-9 w-9 flex items-center justify-center transition-colors',
            sortDirection === 'asc' 
            ? 'bg-white text-blue-400 hover:bg-white/90'
            : 'bg-black text-white hover:bg-black/90' 

          )}
          aria-label="Sort ascending"
          title="Sort ascending"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={() => handleDirectionClick('desc')}
          disabled={disabled || !sortKey}
          className={cn(
            'h-9 w-9 flex items-center justify-center transition-colors',
            sortDirection === 'desc' 
            ? 'bg-white text-blue-400 hover:bg-white/90'
            : 'bg-black text-white hover:bg-black/90' 
          )}
          aria-label="Sort descending"
          title="Sort descending"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default SortControls

