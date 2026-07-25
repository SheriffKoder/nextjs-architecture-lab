/**
 * Below-xl label filters — compact icon + label trigger + checkbox dropdown.
 */

'use client'

import { Tags, ChevronDown } from 'lucide-react'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import { cn } from '@/shared/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  FILTER_TOOLBAR_COMPACT_LABEL_TRIGGER_CLASS,
  FILTER_TOOLBAR_ICON_TRIGGER_SURFACE_CLASS,
} from '../../config/chrome'
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
}

export function LabelFilterDropdown({
  filter,
  selectedCount,
  showInitialCount,
  isSelected,
  onSelect,
}: LabelFilterDropdownProps) {
  const options = filter.options ?? []
  const triggerTitle =
    selectedCount > 0
      ? `${filter.label} (${selectedCount} selected)`
      : `Filter by ${filter.label}`

  return (
    <div className="xl:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title={triggerTitle}
            aria-label={triggerTitle}
            aria-haspopup="menu"
            className={cn(
              FILTER_TOOLBAR_COMPACT_LABEL_TRIGGER_CLASS,
              selectedCount > 0 && 'text-tertiary'
            )}
          >
            <span
              className={FILTER_TOOLBAR_ICON_TRIGGER_SURFACE_CLASS}
              aria-hidden
            />
            <span className="relative z-10 inline-flex items-center gap-1.5">
              <Tags aria-hidden className="size-3.5" />
              <span>
                {filter.label}
                {selectedCount > 0 ? ` (${selectedCount})` : ''}
              </span>
              <ChevronDown aria-hidden className="size-3.5 opacity-60" />
            </span>
          </button>
        </DropdownMenuTrigger>
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
