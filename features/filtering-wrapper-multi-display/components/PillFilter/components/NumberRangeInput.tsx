/**
 * NumberRangeInput Component
 * 
 * Purpose: Reusable number range input component (from N to N)
 * Used in: TableFilterList for number field filtering
 * Why: Provides theme-aware number range inputs that update pending selections
 */

'use client'

import React, { useState, useEffect } from 'react'

interface NumberRangeInputProps {
  minValue?: string
  maxValue?: string
  decimalPlaces?: number
  onChange: (min: string, max: string) => void
}

export function NumberRangeInput({ 
  minValue = '', 
  maxValue = '', 
  decimalPlaces = 0,
  onChange 
}: NumberRangeInputProps) {
  const [minInput, setMinInput] = useState(minValue)
  const [maxInput, setMaxInput] = useState(maxValue)

  // Update when props change
  useEffect(() => {
    setMinInput(minValue)
  }, [minValue])

  useEffect(() => {
    setMaxInput(maxValue)
  }, [maxValue])

  // Handle input changes
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Allow empty input
    if (value === '') {
      setMinInput('')
      onChange('', maxInput)
      return
    }
    
    // Only allow numbers and decimal point
    if (!/^-?\d*\.?\d*$/.test(value)) {
      return
    }
    
    setMinInput(value)
    onChange(value, maxInput)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Allow empty input
    if (value === '') {
      setMaxInput('')
      onChange(minInput, '')
      return
    }
    
    // Only allow numbers and decimal point
    if (!/^-?\d*\.?\d*$/.test(value)) {
      return
    }
    
    setMaxInput(value)
    onChange(minInput, value)
  }

  return (
    <div className="w-full space-y-3">
      {/* From Number */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">From</label>
        <input
          type="text"
          placeholder="Min"
          className="w-full p-2 text-xs border border-border rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary"
          value={minInput}
          onChange={handleMinChange}
        />
      </div>

      {/* To Number */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">To</label>
        <input
          type="text"
          placeholder="Max"
          className="w-full p-2 text-xs border border-border rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary"
          value={maxInput}
          onChange={handleMaxChange}
        />
      </div>
    </div>
  )
}
