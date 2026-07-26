/**
 * Group section label — e.g. `Available (5)`.
 */

'use client'

import { cn } from '@/shared/lib/utils'

export interface GroupSectionHeaderProps {
  label: string
  count: number
  className?: string
}

export function GroupSectionHeader({
  label,
  count,
  className,
}: GroupSectionHeaderProps) {
  return (
    <div
      className={cn(
        'px-1 py-2 text-xs font-medium tracking-wide text-muted-foreground',
        className
      )}
    >
      {label}{' '}
      <span className="tabular-nums text-muted-foreground/80">({count})</span>
    </div>
  )
}
