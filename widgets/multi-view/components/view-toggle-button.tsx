/**
 * View Toggle Button Component
 * 
 * Purpose: Toggle button for switching between different view modes (Details/Table)
 * Used in: Pages requiring view mode switching with icons
 * Why: Provides consistent toggle UI with icons for view mode selection
 * 
 * Implementation Steps:
 * 1. Create toggle with smaller size and icon support
 * 2. Handle option selection with visual feedback
 * 3. Support icons next to text labels
 * 4. Match design system styling
 */

'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

/**
 * View toggle button props interface
 * @interface ViewToggleButtonProps
 */
interface ViewToggleButtonProps {
  value: number // 0 for first option, 1 for second option
  optionOne: string
  optionTwo: string
  iconOne: LucideIcon
  iconTwo: LucideIcon
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

/**
 * View toggle button component
 * @param {ViewToggleButtonProps} props - Component props
 * @returns {JSX.Element} View toggle button
 */
export default function ViewToggleButton({
  value,
  optionOne,
  optionTwo,
  iconOne: IconOne,
  iconTwo: IconTwo,
  onChange,
  disabled = false,
  className = ''
}: ViewToggleButtonProps) {
  ///////////////////////
  // Handle option selection
  const handleOptionSelect = (option: number) => {
    if (!disabled && option !== value) {
      onChange(option)
    }
  }

  ///////////////////////
  // Determine if option one is selected
  const isOptionOneSelected = value === 0

  return (
    <div className={`relative ${className}`}>
      {/* Container that looks like an input field */}
      <div className="w-full py-1 px-1 rounded-lg border border-tertiary/10 dark:border-foreground/10 bg-tertiary/10 backdrop-blur-sm relative overflow-hidden">
        {/* Sliding background element */}
        <div 
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-tertiary rounded-md transition-transform duration-300 ease-in-out ${
            isOptionOneSelected ? 'translate-x-0' : 'translate-x-full'
          }`}
        />
        
        <div className="flex gap-1 relative z-2 w-full">
          {/* Option One Button */}
          <button
            type="button"
            onClick={() => handleOptionSelect(0)}
            disabled={disabled}
            className={`w-[150px] py-2 px-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              isOptionOneSelected
                ? 'bg-tertiary/30 text-background'
                : 'text-foreground hover:bg-tertiary/10'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <IconOne className="w-4 h-4" />
            <span className="text-sm">{optionOne}</span>
          </button>

          {/* Option Two Button */}
          <button
            type="button"
            onClick={() => handleOptionSelect(1)}
            disabled={disabled}
            className={`w-[150px] py-2 px-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              !isOptionOneSelected
                ? 'bg-tertiary/30 text-background'
                : 'text-foreground hover:bg-tertiary/10'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <IconTwo className="w-4 h-4" />
            <span className="text-sm">{optionTwo}</span>
          </button>
        </div>
      </div>
    </div>
  )
} 