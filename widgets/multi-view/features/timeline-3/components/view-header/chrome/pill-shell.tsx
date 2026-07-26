'use client'

import { cn } from '@/shared/lib/utils'

export interface PillShellProps {
  children: React.ReactNode
  className?: string
}

/** Stadium capsule chrome for the timeline view header. */
export function PillShell({ children, className }: PillShellProps) {
  return (
    <div
      className={cn(
        'inline-flex h-9 w-fit max-w-full items-center gap-1 rounded-md',
        'border border-foreground/10 bg-background/80 px-2 backdrop-blur-md',
        className,
      )}
    >
      {children}
    </div>
  )
}
