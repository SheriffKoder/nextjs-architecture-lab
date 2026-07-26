/**
 * Toggle for shared row-expansion (lifted sibling card), separate from Show more.
 */

'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { stopCardInteractionPropagation } from '../../../lib/interactions'
import { cn } from '@/shared/lib/utils'
import { InteractionZone } from '../interactions'

export interface CardRowExpansionToggleProps {
  isExpanded: boolean
  onToggle: () => void
  disabled?: boolean
  className?: string
}

export function CardRowExpansionToggle({
  isExpanded,
  onToggle,
  disabled,
  className,
}: CardRowExpansionToggleProps) {
  return (
    <InteractionZone className={className}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
        title={isExpanded ? 'Collapse details' : 'Expand details'}
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-xs font-medium text-muted-foreground transition-colors',
          'hover:bg-muted hover:text-foreground',
          disabled && 'cursor-not-allowed opacity-40'
        )}
        onClick={(e) => {
          stopCardInteractionPropagation(e)
          if (!disabled) onToggle()
        }}
      >
        {isExpanded ? 'Hide details' : 'Details'}
        {isExpanded ? (
          <ChevronUp className="size-3.5" strokeWidth={1.75} />
        ) : (
          <ChevronDown className="size-3.5" strokeWidth={1.75} />
        )}
      </button>
    </InteractionZone>
  )
}
