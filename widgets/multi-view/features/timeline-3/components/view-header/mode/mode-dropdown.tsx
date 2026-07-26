'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

export type TimelineViewMode = 'Year' | 'Month' | 'Week' | 'Day'

export interface ModeDropdownProps {
  views: string[]
  selectedView: TimelineViewMode
  onViewChange: (view: TimelineViewMode) => void
  className?: string
}

/** Plain-text view-mode trigger (e.g. `Month`) — no resting chevron. */
export function ModeDropdown({
  views,
  selectedView,
  onViewChange,
  className,
}: ModeDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-7 items-center rounded-full px-1.5 text-sm font-medium',
            'text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground',
            'outline-none focus-visible:ring-1 focus-visible:ring-foreground/20',
            className,
          )}
          aria-label={`View mode ${selectedView}`}
        >
          {selectedView}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[6rem]">
        <DropdownMenuRadioGroup
          value={selectedView}
          onValueChange={(next) => onViewChange(next as TimelineViewMode)}
        >
          {views.map((view) => (
            <DropdownMenuRadioItem
              key={view}
              value={view}
              className="cursor-pointer"
            >
              {view}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
