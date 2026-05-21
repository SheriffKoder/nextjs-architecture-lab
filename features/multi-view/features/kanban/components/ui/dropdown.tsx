/**
 * Dropdown Component
 * 
 * Purpose: Reusable dropdown/select component for UI
 * Used in: page.tsx, form components
 * Why: Provides consistent dropdown styling and behavior
 * 
 * Function Index:
 * - Dropdown: Main dropdown component with label and options
 * 
 * Layout:
 * - Native select element with custom styling
 * - Supports controlled and uncontrolled modes
 * - Accessible with proper labels
 * 
 * Steps:
 * 1. Accept options and value props
 * 2. Render select element with options
 * 3. Handle onChange events
 * 4. Apply consistent styling
 */

'use client'

import React from 'react'
import { cn } from '../../utils/cn'

//////////////////////////////////
// Component Props
//////////////////////////////////

export interface DropdownOption {
  value: string
  label: string
}

export interface DropdownProps {
  /**
   * Array of options to display
   */
  options: DropdownOption[]
  
  /**
   * Current selected value
   */
  value?: string
  
  /**
   * Default value (for uncontrolled mode)
   */
  defaultValue?: string
  
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string
  
  /**
   * Callback when value changes
   */
  onChange?: (value: string) => void
  
  /**
   * Label for the dropdown
   */
  label?: string
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Disable the dropdown
   */
  disabled?: boolean
  
  /**
   * HTML id attribute
   */
  id?: string
}

//////////////////////////////////
// Dropdown Component
//////////////////////////////////

/**
 * Reusable dropdown component
 * 
 * @param props - Dropdown configuration props
 * @returns Dropdown select element
 * 
 * @example
 * <Dropdown
 *   options={[
 *     { value: 'created_at', label: 'Created At' },
 *     { value: 'priority', label: 'Priority' }
 *   ]}
 *   value={selectedValue}
 *   onChange={(value) => setSelectedValue(value)}
 *   placeholder="Select field..."
 * />
 */
export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  defaultValue,
  placeholder = 'Select...',
  onChange,
  label,
  className,
  disabled = false,
  id,
}) => {
  //////////////////////////////////
  // Handle Change
  //////////////////////////////////
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value
    onChange?.(newValue)
  }
  
  //////////////////////////////////
  // Render
  //////////////////////////////////
  
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label
          htmlFor={id}
          className='text-sm font-medium text-gray-700 dark:text-gray-300'
        >
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-input/30 dark:border-input'
        )}
      >
        {placeholder && (
          <option value='' disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Dropdown

