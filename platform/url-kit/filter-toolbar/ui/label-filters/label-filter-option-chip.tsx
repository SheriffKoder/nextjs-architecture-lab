/**
 * Single option chip for the xl+ label-filters row — **selection** variant.
 */

'use client'

import { Button } from '@/components/ui/button'
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
    <Button
      type="button"
      variant="selection"
      size="sm"
      selected={selected}
      title={labelFilterOptionTitle(option, showInitialCount, isDisabled)}
      aria-label={labelFilterOptionAriaLabel(option, isDisabled, selected)}
      aria-pressed={selected}
      onClick={() => !isDisabled && onSelect(option.value)}
      disabled={isDisabled}
      className={cn(
        'px-3 py-1.5 font-medium',
        isDisabled && 'opacity-50',
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
                ? 'text-tertiary/80'
                : 'text-muted-foreground'
          )}
        >
          ({countText})
        </span>
      )}
    </Button>
  )
}
