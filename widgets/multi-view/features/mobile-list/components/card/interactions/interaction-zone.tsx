/**
 * Marks a region as card-interactive and stops open-drawer bubbling.
 */

'use client'

import type { ReactNode } from 'react'
import { stopCardInteractionPropagation } from '../../../lib/interactions'
import { cn } from '@/shared/lib/utils'

export interface InteractionZoneProps {
  children: ReactNode
  className?: string
}

export function InteractionZone({ children, className }: InteractionZoneProps) {
  return (
    <div
      data-mobile-card-interactive=""
      className={cn(className)}
      onClick={stopCardInteractionPropagation}
      onPointerDown={stopCardInteractionPropagation}
    >
      {children}
    </div>
  )
}
