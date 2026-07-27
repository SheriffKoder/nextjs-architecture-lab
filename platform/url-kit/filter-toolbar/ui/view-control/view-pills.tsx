/**
 * Horizontal view pills — used on the mobile filter-toolbar row.
 * **selection** variant, pill shape.
 */

'use client'

import { Button } from '@/components/ui/button'
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
          <Button
            key={option.key}
            type="button"
            role="tab"
            variant="selection"
            size="sm"
            selected={selected}
            disabled={disabled}
            onClick={() => onViewChange(option.key)}
            aria-selected={selected}
            className="shrink-0 gap-1.5 rounded-full px-3 py-1.5"
          >
            <Icon aria-hidden className="size-3.5 shrink-0" />
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
