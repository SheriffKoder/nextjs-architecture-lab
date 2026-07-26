'use client'

import { cn } from '@/shared/lib/utils'

export interface PillSeparatorProps {
  className?: string
}

/** Short vertical rule — does not touch top/bottom of the pill. */
export function PillSeparator({ className }: PillSeparatorProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'mx-1 inline-block h-4 w-px shrink-0 self-center bg-foreground/15',
        className,
      )}
    />
  )
}
