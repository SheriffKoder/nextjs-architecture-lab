/**
 * Icon trigger that opens the PillFilter two-column dropdown panel.
 * Reuses FilterColumnList + FilterOptionsPanel only — not FiltersHeader / PillFilter shell.
 */

'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Filter } from 'lucide-react'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import { useUrlFilters } from '@/platform/url-kit/filters/feature-filtering/hooks/useUrlFilters'
import { FilterColumnList } from '@/platform/url-kit/filters/feature-filtering/components/PillFilter/filter-column-list'
import { FilterOptionsPanel } from '@/platform/url-kit/filters/feature-filtering/components/PillFilter/filter-options-panel'
import { cn } from '@/shared/lib/utils'
import { IconTriggerButton } from '../shared/icon-trigger-button'

export interface FilterControlProps {
  filters: FilterConfig[]
  showInitialCount?: boolean
  className?: string
  /** Dropdown panel surface (e.g. `bg-background`). */
  panelClassName?: string
}

export function FilterControl({
  filters,
  showInitialCount = false,
  className,
  panelClassName = 'bg-background/80 backdrop-blur-sm',
}: FilterControlProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null)
  const [selectedFiltersOrder, setSelectedFiltersOrder] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { getList, get, getRange, getNumberRange } = useUrlFilters()

  const activeFilterCount = filters.reduce((count, filter) => {
    if (filter.type === 'multi-select') {
      return count + getList(filter.key).length
    }
    if (filter.type === 'single-select') {
      return count + (get(filter.key) ? 1 : 0)
    }
    if (filter.type === 'date-range') {
      const range = getRange(filter.key)
      return count + (range?.start || range?.end ? 1 : 0)
    }
    if (filter.type === 'number-range') {
      const range = getNumberRange(filter.key)
      return (
        count +
        (range?.min !== undefined || range?.max !== undefined ? 1 : 0)
      )
    }
    return count
  }, 0)

  const hasActiveFilters = activeFilterCount > 0

  const handleFilterClick = (filterKey: string) => {
    setActiveFilterKey(filterKey)
    setSelectedFiltersOrder((prev) =>
      prev.includes(filterKey) ? prev : [...prev, filterKey]
    )
  }

  const handleFilterToggle = () => {
    setIsDropdownOpen((prev) => {
      const next = !prev
      if (next && !activeFilterKey && selectedFiltersOrder.length === 0) {
        const first = filters[0]
        if (first) setActiveFilterKey(first.key)
      }
      return next
    })
  }

  useEffect(() => {
    if (
      isDropdownOpen &&
      !activeFilterKey &&
      selectedFiltersOrder.length === 0
    ) {
      const first = filters[0]
      if (first) setActiveFilterKey(first.key)
    }
  }, [isDropdownOpen, activeFilterKey, selectedFiltersOrder, filters])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target)) return
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  if (filters.length === 0) return null

  return (
    <div className={cn('relative', className)}>
      <IconTriggerButton
        ref={buttonRef}
        active={hasActiveFilters || isDropdownOpen}
        onClick={handleFilterToggle}
        title={
          hasActiveFilters
            ? `Filters (${activeFilterCount} active)`
            : 'Filters'
        }
        aria-label={
          hasActiveFilters
            ? `Filters (${activeFilterCount} active)`
            : 'Open filters'
        }
        aria-expanded={isDropdownOpen}
        aria-haspopup="dialog"
      >
        <Filter aria-hidden className="w-4 h-4" />
      </IconTriggerButton>

      <div
        ref={dropdownRef}
        className={cn(
          'absolute min-w-[calc(100vw-1.5rem)] lg:min-w-[600px] w-fit top-full left-0 z-50 mt-2 border border-border rounded-lg shadow-lg transition-all duration-200',
          panelClassName,
          isDropdownOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none'
        )}
      >
        <div className="border-b border-border px-3 pt-3 pb-2">
          <p className="text-xs font-medium">Filters</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Narrow results by one or more fields, applied forward.
          </p>
        </div>
        <div className="flex gap-2 lg:gap-6 p-2">
          <FilterColumnList
            filters={filters}
            activeFilterKey={activeFilterKey}
            selectedFiltersOrder={selectedFiltersOrder}
            onFilterClick={handleFilterClick}
          />
          <FilterOptionsPanel
            filters={filters}
            activeFilterKey={activeFilterKey}
            showInitialCount={showInitialCount}
          />
        </div>
      </div>
    </div>
  )
}
