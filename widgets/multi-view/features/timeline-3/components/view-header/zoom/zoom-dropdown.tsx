'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

export type ZoomOption = { label: string; value: number }

export const DEFAULT_ZOOM_OPTIONS: ZoomOption[] = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
]

export interface ZoomDropdownProps {
  value: number
  onZoomChange: (factor: number) => void
  options?: ZoomOption[]
  className?: string
}

/** Plain-text zoom trigger (e.g. `1x`) — no resting chevron. */
export function ZoomDropdown({
  value,
  onZoomChange,
  options = DEFAULT_ZOOM_OPTIONS,
  className,
}: ZoomDropdownProps) {
  const activeLabel =
    options.find((opt) => opt.value === value)?.label ?? `${value}x`

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
          aria-label={`Zoom ${activeLabel}`}
        >
          {activeLabel}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[6rem]">
        <DropdownMenuRadioGroup
          value={String(value)}
          onValueChange={(next) => onZoomChange(Number(next))}
        >
          {options.map((opt) => (
            <DropdownMenuRadioItem
              key={opt.value}
              value={String(opt.value)}
              className="cursor-pointer"
            >
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
