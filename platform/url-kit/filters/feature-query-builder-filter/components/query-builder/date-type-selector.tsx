/**
 * Date Type Selector Component
 * 
 * Purpose: Dropdown for selecting date value type
 * Used in: ConditionRow component (only for date fields)
 * Why: Allows users to select relative or exact date values
 */

'use client'

import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { dateValues } from '../../config/date-values'

interface DateTypeSelectorProps {
  value: string
  onChange: (dateType: string) => void
  className?: string
}

/**
 * DateTypeSelector component - date value type selection dropdown
 * WHY: Provides UI for selecting date value type (today, exact_date, etc.)
 * HOW: Renders dropdown with date value options
 */
export function DateTypeSelector({
  value,
  onChange,
  className,
}: DateTypeSelectorProps) {
  const selectedOption = dateValues.find(d => d.value === value)
  const displayLabel = selectedOption?.label || 'Select date type'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`w-[140px] flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background ${className || ''}`}>
          <span className="text-foreground truncate flex-1 text-left">{displayLabel}</span>
          <ChevronDown className="w-3 h-3 opacity-50 flex-shrink-0 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {dateValues.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={value === option.value ? 'bg-accent' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
