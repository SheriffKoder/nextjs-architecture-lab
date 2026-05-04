/**
 * Sort Key Dropdown Component
 * 
 * Purpose: Dropdown for selecting sort key from available configs
 * Used in: SortRow component
 * Why: Provides key selection UI matching grouping-control styling
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
import type { SortKeyDropdownProps } from '../types'

/**
 * SortKeyDropdown component - key selection dropdown
 * WHY: Provides UI for selecting sort key
 * HOW: Renders dropdown with available keys (excluding already-used keys)
 */
export function SortKeyDropdown({
  selectedKey,
  availableConfigs,
  excludedKeys,
  onKeyChange,
}: SortKeyDropdownProps) {
  // Get available configs (exclude used keys, but include current selection)
  const availableConfigsFiltered = availableConfigs.filter(
    config => !excludedKeys.includes(config.key) || config.key === selectedKey
  )

  // Get display label for selected key
  const selectedConfig = availableConfigs.find(c => c.key === selectedKey)
  const selectedLabel = selectedConfig?.label || selectedKey

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-[140px] flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background">
          <span className="text-foreground truncate flex-1 text-left">{selectedLabel}</span>
          <ChevronDown className="w-3 h-3 opacity-50 flex-shrink-0 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {availableConfigsFiltered.map((config) => (
          <DropdownMenuItem
            key={config.key}
            onClick={() => onKeyChange(config.key)}
            className={selectedKey === config.key ? 'bg-accent' : ''}
          >
            {config.label || config.key}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
