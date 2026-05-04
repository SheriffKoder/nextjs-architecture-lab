/**
 * Value Input Component
 * 
 * Purpose: Dynamic value input based on field type and date type
 * Used in: ConditionRow component
 * Why: Provides appropriate input UI for different field types
 */

'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import type { FieldType } from '../../types/field'

interface ValueInputProps {
  fieldType: FieldType | null
  dateType?: string
  operator: string
  value: unknown
  onChange: (value: unknown) => void
  className?: string
}

/**
 * ValueInput component - dynamic value input
 * WHY: Provides appropriate input UI based on field type
 * HOW: Renders different inputs based on field type and date type
 */
export function ValueInput({
  fieldType,
  dateType,
  operator,
  value,
  onChange,
  className,
}: ValueInputProps) {
  // Hide input for empty operators
  if (operator === 'is_empty' || operator === 'is_not_empty') {
    return null
  }

  // Text field: text input
  if (fieldType === 'text') {
    return (
      <Input
        type="text"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter value"
        className={`w-[140px] text-xs h-6.5 ${className || ''}`}
      />
    )
  }

  // Number field: number input
  if (fieldType === 'number') {
    return (
      <Input
        type="number"
        value={(value as number) || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        placeholder="Enter number"
        className={`w-[140px] text-xs h-6.5 ${className || ''}`}
      />
    )
  }

  // Date field: conditional input based on date type
  if (fieldType === 'date') {
    // Exact date: date picker
    if (dateType === 'exact_date') {
      return (
        <Input
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-[140px] text-xs h-6.5 ${className || ''}`}
        />
      )
    }

    // Days ago/from now: number input for days
    if (dateType === 'days_ago' || dateType === 'days_from_now') {
      return (
        <Input
          type="number"
          value={(value as number) || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Days"
          min={0}
          className={`w-[140px] text-xs h-6.5 ${className || ''}`}
        />
      )
    }

    // Other relative dates: no input needed
    return null
  }

  // Default: text input
  return (
    <Input
      type="text"
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter value"
      className={`w-[140px] text-xs h-6.5 ${className || ''}`}
    />
  )
}
