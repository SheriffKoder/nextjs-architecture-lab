/**
 * Field Selector Component
 * 
 * Purpose: Dropdown for selecting filter field
 * Used in: ConditionRow component
 * Why: Allows users to select which field to filter by
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
import type { FilterField } from '../../types/field'

interface FieldSelectorProps {
  value: string
  fields: FilterField[]
  onChange: (field: string) => void
  className?: string
}

/**
 * FieldSelector component - field selection dropdown
 * WHY: Provides UI for selecting filter field
 * HOW: Renders dropdown with available fields
 */
export function FieldSelector({
  value,
  fields,
  onChange,
  className,
}: FieldSelectorProps) {
  const selectedField = fields.find(f => f.key === value)
  const displayLabel = selectedField?.label || value || 'Select field'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`w-[140px] flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background ${className || ''}`}>
          <span className="text-foreground truncate flex-1 text-left">{displayLabel}</span>
          <ChevronDown className="w-3 h-3 opacity-50 flex-shrink-0 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {fields.map((field) => (
          <DropdownMenuItem
            key={field.key}
            onClick={() => onChange(field.key)}
            className={value === field.key ? 'bg-accent' : ''}
          >
            {field.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
