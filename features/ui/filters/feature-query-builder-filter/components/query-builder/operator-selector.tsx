/**
 * Operator Selector Component
 * 
 * Purpose: Dropdown for selecting filter operator
 * Used in: ConditionRow component
 * Why: Allows users to select how to compare field values
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
import { filterOperators } from '../../config/filter-operators'
import type { FieldType } from '../../types/field'

interface OperatorSelectorProps {
  value: string
  fieldType: FieldType | null
  onChange: (operator: string) => void
  className?: string
}

/**
 * Get operator label for display
 */
function getOperatorLabel(operator: string): string {
  const labels: Record<string, string> = {
    contains: 'Contains',
    does_not_contain: 'Does not contain',
    is: 'Is',
    is_not: 'Is not',
    is_empty: 'Is empty',
    is_not_empty: 'Is not empty',
    before: 'Before',
    after: 'After',
    on_or_before: 'On or before',
    on_or_after: 'On or after',
    eq: '=',
    neq: '≠',
    gt: '>',
    lt: '<',
    gte: '≥',
    lte: '≤',
  }
  return labels[operator] || operator
}

/**
 * OperatorSelector component - operator selection dropdown
 * WHY: Provides UI for selecting filter operator
 * HOW: Renders dropdown with operators based on field type
 */
export function OperatorSelector({
  value,
  fieldType,
  onChange,
  className,
}: OperatorSelectorProps) {
  const operators = fieldType ? filterOperators[fieldType] : []
  const displayLabel = value ? getOperatorLabel(value) : 'Select operator'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={`w-[140px] flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background ${className || ''}`}
          disabled={!fieldType}
        >
          <span className="text-foreground truncate flex-1 text-left">{displayLabel}</span>
          <ChevronDown className="w-3 h-3 opacity-50 flex-shrink-0 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {operators.map((operator) => (
          <DropdownMenuItem
            key={operator}
            onClick={() => onChange(operator)}
            className={value === operator ? 'bg-accent' : ''}
          >
            {getOperatorLabel(operator)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
