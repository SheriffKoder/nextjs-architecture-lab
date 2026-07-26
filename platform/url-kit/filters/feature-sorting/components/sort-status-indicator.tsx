'use client'

import { MoveUp, MoveDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useUrlSorting } from '../hooks/useUrlSorting'

export interface SortStatusIndicatorProps {
  sortKey: string
  label?: string
  className?: string
}

/**
 * Compact header indicator: direction glyph + level badge.
 * Renders nothing when this key is not in the URL sort list.
 */
export function SortStatusIndicator({
  sortKey,
  label,
  className,
}: SortStatusIndicatorProps) {
  const { getSort, getSortLevel } = useUrlSorting()
  const direction = getSort(sortKey)
  const level = getSortLevel(sortKey)

  if (!direction) return null

  const displayLabel = label || sortKey
  const title = `Sorted by ${displayLabel} (${direction}, level ${level !== null ? level + 1 : '?'})`

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center',
        className,
      )}
      title={title}
      aria-label={title}
    >
      {direction === 'asc' ? (
        <MoveUp
          size={12}
          strokeWidth={2.5}
          className="text-primary"
          aria-hidden
        />
      ) : (
        <MoveDown
          size={12}
          strokeWidth={2.5}
          className="text-primary"
          aria-hidden
        />
      )}
      {level !== null ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-tertiary text-[8px] font-medium text-background">
          {level + 1}
        </span>
      ) : null}
    </span>
  )
}
