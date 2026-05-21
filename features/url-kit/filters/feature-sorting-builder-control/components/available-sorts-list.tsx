/**
 * Available Sorts List Component
 * 
 * Purpose: List of available sort keys that can be added
 * Used in: SortingControl component
 * Why: Provides UI for adding new sorts from available keys
 */

'use client'

import React from 'react'
import type { AvailableSortsListProps } from '../types'

/**
 * AvailableSortsList component - list of available sort keys
 * WHY: Provides UI for selecting and adding new sorts
 * HOW: Renders list of keys not currently in use, with hover styling
 */
export function AvailableSortsList({
  availableConfigs,
  usedKeys,
  onKeySelect,
}: AvailableSortsListProps) {
  // Filter out used keys
  const availableConfigsFiltered = availableConfigs.filter(
    config => !usedKeys.includes(config.key)
  )

  // Don't render if no available configs
  if (availableConfigsFiltered.length === 0) {
    return null
  }

  return (
    <div className="space-y-1">
      {availableConfigsFiltered.map((config) => (
        <div
          key={config.key}
          onClick={() => onKeySelect(config.key)}
          className="flex items-center py-1.5 px-2 rounded-md hover:bg-gradient-to-r hover:from-tertiary/10 hover:to-transparent cursor-pointer transition-colors"
        >
          <span className="text-xs text-foreground flex-1">
            {config.label || config.key}
          </span>
        </div>
      ))}
    </div>
  )
}
