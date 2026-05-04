/**
 * Logic Selector Component
 * 
 * Purpose: Dropdown for selecting AND/OR logic
 * Used in: ConditionRow and GroupNode components
 * Why: Allows users to specify logic between conditions
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
import type { Logic } from '../../types/filter'

interface LogicSelectorProps {
  value: Logic
  onChange: (logic: Logic) => void
  className?: string
}

/**
 * LogicSelector component - AND/OR selector dropdown
 * WHY: Provides UI for selecting logic operator
 * HOW: Renders dropdown with AND and OR options
 */
export function LogicSelector({
  value,
  onChange,
  className,
}: LogicSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background ${className || ''}`}>
          <span className="text-foreground">{value.toUpperCase()}</span>
          <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-32">
        <DropdownMenuItem
          onClick={() => onChange('and')}
          className={value === 'and' ? 'bg-accent' : ''}
        >
          AND
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange('or')}
          className={value === 'or' ? 'bg-accent' : ''}
        >
          OR
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
