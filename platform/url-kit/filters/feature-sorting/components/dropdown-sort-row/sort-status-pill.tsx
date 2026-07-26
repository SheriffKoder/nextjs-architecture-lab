'use client'

import { cn } from '@/shared/lib/utils'

export interface SortStatusPillProps {
  label: string
  /** 0-based sort priority from useUrlSorting; null when this key is not sorted */
  level: number | null
  className?: string
}

/** Status line: plain `Sort by Make` + optional pill around `level: N`. */
export function SortStatusPill({ label, level, className }: SortStatusPillProps) {
  const title =
    level !== null
      ? `Sort by ${label} (level: ${level + 1})`
      : `Sort by ${label}`

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 text-[11px] font-medium',
        className,
      )}
      title={title}
    >
      <span className="truncate">Sort by {label}</span>
      {level !== null ? (
        <span
          className={cn(
            'inline-flex shrink-0 rounded-full border border-tertiary/30',
            'bg-tertiary/15 px-2 py-0.5 text-tertiary',
          )}
        >
          level: {level + 1}
        </span>
      ) : null}
    </span>
  )
}
