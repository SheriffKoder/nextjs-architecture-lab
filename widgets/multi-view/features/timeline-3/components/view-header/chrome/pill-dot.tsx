'use client'

import { cn } from '@/shared/lib/utils'

export interface PillDotProps {
  className?: string
}

/** Decorative interpunct between mode and zoom. */
export function PillDot({ className }: PillDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'select-none px-0.5 text-sm font-medium text-foreground/40',
        className,
      )}
    >
      ·
    </span>
  )
}
