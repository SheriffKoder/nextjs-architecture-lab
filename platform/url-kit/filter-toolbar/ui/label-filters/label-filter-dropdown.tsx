/**
 * Below-xl label filters — compact icon + label trigger + checkbox dropdown.
 * When `iconOnly`, matches other toolbar icon triggers (no text / chevron).
 */

'use client'

import { Tags, ChevronDown } from 'lucide-react'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { IconTriggerButton } from '../shared/icon-trigger-button'
import {
  formatLabelFilterCount,
  labelFilterOptionTitle,
} from './format-count'

export interface LabelFilterDropdownProps {
  filter: FilterConfig
  selectedCount: number
  showInitialCount: boolean
  isSelected: (value: string) => boolean
  onSelect: (value: string) => void
  /** Square Tags icon only — used by the mobile toolbar row */
  iconOnly?: boolean
}

export function LabelFilterDropdown({
  filter,
  selectedCount,
  showInitialCount,
  isSelected,
  onSelect,
  iconOnly = false,
}: LabelFilterDropdownProps) {
  const options = filter.options ?? []
  const triggerTitle =
    selectedCount > 0
      ? `${filter.label} (${selectedCount} selected)`
      : `Filter by ${filter.label}`

  const trigger = iconOnly ? (
    <IconTriggerButton
      active={selectedCount > 0}
      title={triggerTitle}
      aria-label={triggerTitle}
      aria-haspopup="menu"
      className="relative"
    >
      <Tags aria-hidden className="h-4 w-4" />
      {selectedCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 z-20 flex h-3 min-w-3 items-center justify-center rounded-full bg-tertiary px-0.5 text-[8px] font-medium text-background">
          {selectedCount > 9 ? '9+' : selectedCount}
        </span>
      ) : null}
    </IconTriggerButton>
  ) : (
    <Button
      type="button"
      variant="control"
      size="compact"
      active={selectedCount > 0}
      title={triggerTitle}
      aria-label={triggerTitle}
      aria-haspopup="menu"
    >
      <Tags aria-hidden className="size-3.5" />
      <span>
        {filter.label}
        {selectedCount > 0 ? ` (${selectedCount})` : ''}
      </span>
      <ChevronDown aria-hidden className="size-3.5 opacity-60" />
    </Button>
  )

  return (
    <div className="xl:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((option) => {
            const optionSelected = isSelected(option.value)
            const isDisabled = (option.count ?? 0) === 0
            const countText = formatLabelFilterCount(option, showInitialCount)

            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={optionSelected}
                disabled={isDisabled}
                title={labelFilterOptionTitle(
                  option,
                  showInitialCount,
                  isDisabled
                )}
                onCheckedChange={() => {
                  if (!isDisabled) onSelect(option.value)
                }}
                className={cn(isDisabled && 'opacity-50 cursor-not-allowed')}
              >
                <div className="flex w-full items-center justify-between">
                  <span className={cn(isDisabled && 'text-muted-foreground')}>
                    {option.label}
                  </span>
                  {countText !== null && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({countText})
                    </span>
                  )}
                </div>
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
