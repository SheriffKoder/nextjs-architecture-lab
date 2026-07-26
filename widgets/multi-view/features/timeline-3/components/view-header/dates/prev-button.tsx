'use client'

import { ArrowLeft } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface PrevButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
}

/** Icon-only thin left arrow — see view-header style expectations. */
export function PrevButton({ onClick, disabled, className }: PrevButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Scroll left"
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-full',
        'text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
    </button>
  )
}
