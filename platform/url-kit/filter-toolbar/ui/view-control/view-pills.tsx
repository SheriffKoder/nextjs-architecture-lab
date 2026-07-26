/**
 * Horizontal view pills — used on the mobile filter-toolbar row.
 */

'use client'

import { cn } from '@/shared/lib/utils'
import { resolveViewOptions } from './view-options'

export interface ViewPillsProps {
  availableViews: readonly string[]
  currentView: string
  onViewChange: (view: string) => void
  className?: string
  disabled?: boolean
}

export function ViewPills({
  availableViews,
  currentView,
  onViewChange,
  className,
  disabled = false,
}: ViewPillsProps) {
  const options = resolveViewOptions(availableViews)

  if (options.length <= 1) return null

  return (
    <div
      className={cn(
        'flex w-full items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className
      )}
      role="tablist"
      aria-label="Views"
    >
      {options.map((option) => {
        const Icon = option.icon
        const selected = currentView === option.key

        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={disabled}
            onClick={() => onViewChange(option.key)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              'disabled:pointer-events-none disabled:opacity-50',
              selected
                ? 'border-tertiary/40 bg-tertiary/15 text-tertiary'
                : 'border-input bg-transparent text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
            )}
          >
            <Icon aria-hidden className="size-3.5 shrink-0" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
