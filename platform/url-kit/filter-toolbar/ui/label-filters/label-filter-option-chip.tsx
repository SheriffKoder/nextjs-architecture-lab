/**
 * Single option chip for the xl+ label-filters row.
 */

'use client'

import { cn } from '@/shared/lib/utils'
import type { LabelFilterOption } from './types'
import {
  formatLabelFilterCount,
  labelFilterOptionAriaLabel,
  labelFilterOptionTitle,
} from './format-count'

export interface LabelFilterOptionChipProps {
  option: LabelFilterOption
  selected: boolean
  showInitialCount: boolean
  onSelect: (value: string) => void
}

export function LabelFilterOptionChip({
  option,
  selected,
  showInitialCount,
  onSelect,
}: LabelFilterOptionChipProps) {
  const isDisabled = (option.count ?? 0) === 0
  const countText = formatLabelFilterCount(option, showInitialCount)

  return (
    <button
      type="button"
      title={labelFilterOptionTitle(option, showInitialCount, isDisabled)}
      aria-label={labelFilterOptionAriaLabel(option, isDisabled, selected)}
      aria-pressed={selected}
      onClick={() => !isDisabled && onSelect(option.value)}
      disabled={isDisabled}
      className={cn(
        'px-3 py-1.5 text-xs rounded-md transition-colors font-medium',
        isDisabled
          ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
          : selected
            ? 'bg-tertiary text-background hover:bg-tertiary/90'
            : 'bg-muted text-foreground hover:bg-muted/80'
      )}
    >
      <span>{option.label}</span>
      {countText !== null && (
        <span
          className={cn(
            'ml-2 text-xs',
            isDisabled
              ? 'text-muted-foreground'
              : selected
                ? 'text-background/80'
                : 'text-muted-foreground'
          )}
        >
          ({countText})
        </span>
      )}
    </button>
  )
}
