/**
 * Sort Direction Dropdown Component
 * 
 * Purpose: Dropdown for selecting sort direction (A->Z or Z->A)
 * Used in: SortRow component
 * Why: Provides direction selection UI matching grouping-control styling
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
import type { SortDirectionDropdownProps } from '../types'

/**
 * SortDirectionDropdown component - direction selection dropdown
 * WHY: Provides UI for selecting sort direction
 * HOW: Renders dropdown with A->Z (asc) and Z->A (desc) options
 */
export function SortDirectionDropdown({
  selectedDirection,
  onDirectionChange,
}: SortDirectionDropdownProps) {
  const directionLabel = selectedDirection === 'asc' ? 'A→Z' : 'Z→A'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-[65px] flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background">
          <span className="text-foreground truncate flex-1 text-left">{directionLabel}</span>
          <ChevronDown className="w-3 h-3 opacity-50 flex-shrink-0 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem
          onClick={() => onDirectionChange('asc')}
          className={selectedDirection === 'asc' ? 'bg-accent' : ''}
        >
          A→Z
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDirectionChange('desc')}
          className={selectedDirection === 'desc' ? 'bg-accent' : ''}
        >
          Z→A
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
