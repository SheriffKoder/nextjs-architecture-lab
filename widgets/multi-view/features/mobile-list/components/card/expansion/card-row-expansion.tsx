/**
 * Lifted sibling card for shared `rowExpansion` content.
 * Sits below the main card with a different surface and slight upward offset.
 */

'use client'

import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { InteractionZone } from '../interactions'

export interface CardRowExpansionProps {
  children: ReactNode
  isLoading?: boolean
  className?: string
  /** Vertical lift toward the parent card (px). Default 8. */
  liftPx?: number
}

export function CardRowExpansion({
  children,
  isLoading,
  className,
  liftPx = 8,
}: CardRowExpansionProps) {
  return (
    <div className={cn('relative z-0', className)} style={{ marginTop: -liftPx }}>
      <InteractionZone
        className={cn(
          'rounded-lg border border-border/50 bg-muted/80 px-3 py-2.5 shadow-sm',
          'dark:bg-muted/50'
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
            Loading…
          </div>
        ) : (
          children
        )}
      </InteractionZone>
    </div>
  )
}
