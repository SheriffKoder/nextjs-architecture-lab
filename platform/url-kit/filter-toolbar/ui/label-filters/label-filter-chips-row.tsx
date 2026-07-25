/**
 * xl+ label filters — filter name + option chips.
 */

'use client'

import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import { LabelFilterOptionChip } from './label-filter-option-chip'

export interface LabelFilterChipsRowProps {
  filter: FilterConfig
  showInitialCount: boolean
  isSelected: (value: string) => boolean
  onSelect: (value: string) => void
}

export function LabelFilterChipsRow({
  filter,
  showInitialCount,
  isSelected,
  onSelect,
}: LabelFilterChipsRowProps) {
  const options = filter.options ?? []

  return (
    <div className="hidden xl:flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-foreground">
        {filter.label}:
      </span>
      {options.map((option) => (
        <LabelFilterOptionChip
          key={option.value}
          option={option}
          selected={isSelected(option.value)}
          showInitialCount={showInitialCount}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
