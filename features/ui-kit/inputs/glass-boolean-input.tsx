/**
 * Glass Boolean Input Component
 * 
 * Purpose: Glassmorphic boolean input with Yes/No radio buttons
 * Used in: Forms requiring boolean/yes-no selections
 * Why: Provides consistent glassmorphic styling for boolean inputs
 * 
 * Function Index:
 * - GlassBooleanInput: Component that renders Yes/No radio buttons with glassmorphic styling
 * 
 * Steps:
 * 1. Accept value (boolean), onChange handler, label, and disabled state
 * 2. Render two radio buttons (Yes/No) with glassmorphic styling
 * 3. Handle selection changes
 */

'use client'

import React from 'react'

interface GlassBooleanInputProps {
  /** Current boolean value */
  value: boolean | undefined
  /** Change handler that receives the new boolean value */
  onChange: (value: boolean) => void
  /** Label for the input */
  label: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Optional className */
  className?: string
  /** Optional unique name for the radio group (defaults to label-based name) */
  name?: string
}

/**
 * Glass boolean input component
 * Renders Yes/No radio buttons with glassmorphic styling
 * 
 * @param {GlassBooleanInputProps} props - Component props
 * @returns {JSX.Element} Boolean input with Yes/No options
 */
const GlassBooleanInput = ({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
  name
}: GlassBooleanInputProps) => {
  /**
   * Handle radio button change
   * Converts string value to boolean and calls onChange
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === 'true'
    onChange(newValue)
  }

  // Determine checked states: only check if value is explicitly true or false
  const isTrue = value === true
  const isFalse = value === false
  
  // Use provided name or generate one from label
  const radioGroupName = name || `${label}-boolean`

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="block text-sm text-foreground/90 font-normal">
        {label}
      </label>
      
      {/* Toggle-style radio buttons container */}
      <div className="inline-flex items-center border border-foreground/10 rounded-md overflow-hidden bg-[rgba(255,255,255,0.25)] md:bg-[rgba(26,26,26,0.02)] dark:md:bg-background/10 dark:bg-background/50 w-fit">
        {/* Yes option */}
        <label className={`flex items-center justify-center py-2 px-4 cursor-pointer transition-colors ${
          isTrue 
            ? 'bg-tertiary/20 text-tertiary font-medium border-r border-foreground/10' 
            : 'text-foreground/70 hover:text-foreground/90 hover:bg-foreground/5'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            type="radio"
            name={radioGroupName}
            value="true"
            checked={isTrue}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
          />
          <span className="text-sm">Yes</span>
        </label>

        {/* No option */}
        <label className={`flex items-center justify-center py-2 px-4 cursor-pointer transition-colors ${
          isFalse 
            ? 'bg-tertiary/20 text-tertiary font-medium' 
            : 'text-foreground/70 hover:text-foreground/90 hover:bg-foreground/5'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            type="radio"
            name={radioGroupName}
            value="false"
            checked={isFalse}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
          />
          <span className="text-sm">No</span>
        </label>
      </div>
    </div>
  )
}

export default GlassBooleanInput
