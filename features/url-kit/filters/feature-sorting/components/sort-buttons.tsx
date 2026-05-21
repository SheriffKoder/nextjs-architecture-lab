/**
 * SortButtons Component
 * 
 * Purpose: Renders multiple sort buttons from configuration
 * Used in: Pages that need sorting for multiple fields
 * Why: Provides simple way to render multiple sort buttons from config
 * 
 * Features:
 * - Maps over sortConfig to render SortButton for each
 * - Flex row layout
 * - Reusable across different features
 */

'use client'

import React from 'react'
import { SortButton } from './sort-button'
import { useInitialSorts } from '../hooks/useInitialSorts'
import type { SortButtonsProps } from '../types'

/**
 * SortButtons component - renders multiple sort buttons from config
 * WHY: Provides simple way to render multiple sort buttons
 * HOW: Maps over sortConfig array and renders SortButton for each
 * @param {SortButtonsProps} props - Component props
 * @returns {React.ReactElement} Flex row of sort buttons
 */
export function SortButtons({
  sortConfig,
  className = ''
}: SortButtonsProps) {
  // Apply initial sorts if none exist
  useInitialSorts(sortConfig)
  
  return (
    <div className={`flex flex-row items-center gap-2 ${className}`}>
      {sortConfig.map((config) => (
        <SortButton
          key={config.key}
          sortKey={config.key}
          label={config.label}
        />
      ))}
    </div>
  )
}
