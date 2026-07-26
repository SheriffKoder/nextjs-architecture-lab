'use client'

import { cn } from '@/shared/lib/utils'
import type { SortDirection } from '../../types'

export interface SortDirectionActionsProps {
  /** Current direction for this column key, or null when unset */
  direction: SortDirection | null
  hasAnySorts: boolean
  onAsc: () => void
  onDesc: () => void
  onNone: () => void
  onClearAll: () => void
  className?: string
}

type ActionId = 'asc' | 'desc' | 'none'

function ActionButton({
  id,
  label,
  selected,
  onClick,
  disabled,
}: {
  id: ActionId | 'clear-all'
  label: string
  selected?: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      data-sort-action={id}
      className={cn(
        'rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        selected
          ? 'bg-primary text-primary-foreground'
          : 'bg-foreground/5 text-foreground hover:bg-foreground/10',
      )}
    >
      {label}
    </button>
  )
}

/** Radio trio Asc / Desc / None for one column, plus global Clear all. */
export function SortDirectionActions({
  direction,
  hasAnySorts,
  onAsc,
  onDesc,
  onNone,
  onClearAll,
  className,
}: SortDirectionActionsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      <ActionButton
        id="asc"
        label="Asc"
        selected={direction === 'asc'}
        onClick={onAsc}
      />
      <ActionButton
        id="desc"
        label="Desc"
        selected={direction === 'desc'}
        onClick={onDesc}
      />
      <ActionButton
        id="none"
        label="None"
        selected={direction === null}
        onClick={onNone}
      />
      <ActionButton
        id="clear-all"
        label="Clear all"
        onClick={onClearAll}
        disabled={!hasAnySorts}
      />
    </div>
  )
}
