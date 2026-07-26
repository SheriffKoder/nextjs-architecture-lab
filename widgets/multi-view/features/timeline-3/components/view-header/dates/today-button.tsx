'use client'

import { LocateFixed } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface TodayButtonProps {
  onClick: () => void
  isTodayInRange: boolean
  className?: string
}

/** Icon-only locate / crosshair — not the word “Today”. */
export function TodayButton({
  onClick,
  isTodayInRange,
  className,
}: TodayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={
        isTodayInRange ? 'Scroll to today' : 'Today is not in the date range'
      }
      aria-label={
        isTodayInRange ? 'Scroll to today' : 'Today is not in the date range'
      }
      disabled={!isTodayInRange}
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors',
        isTodayInRange
          ? 'cursor-pointer text-foreground/80 hover:bg-foreground/5 hover:text-foreground'
          : 'cursor-not-allowed text-foreground/30 opacity-50',
        className,
      )}
    >
      <LocateFixed className="size-4" strokeWidth={1.75} aria-hidden />
    </button>
  )
}
