/**
 * Icon trigger that opens the PillFilter two-column dropdown panel.
 * Reuses FilterColumnList + FilterOptionsPanel only — not FiltersHeader / PillFilter shell.
 * Panel: portaled + `useAnchoredPanelPosition` (avoids right-edge / overflow clip).
 */

'use client'

import { useCallback, useEffect, useState, type Ref } from 'react'
import { createPortal } from 'react-dom'
import { Filter } from 'lucide-react'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import { useUrlFilters } from '@/platform/url-kit/filters/feature-filtering/hooks/useUrlFilters'
import { FilterColumnList } from '@/platform/url-kit/filters/feature-filtering/components/PillFilter/filter-column-list'
import { FilterOptionsPanel } from '@/platform/url-kit/filters/feature-filtering/components/PillFilter/filter-options-panel'
import { useAnchoredPanelPosition } from '@/platform/url-kit/filters/lib/use-anchored-panel-position'
import type { PanelAlign } from '@/platform/url-kit/filters/lib/use-anchored-panel-position'
import { cn } from '@/shared/lib/utils'
import { IconTriggerButton } from '../shared/icon-trigger-button'

export interface FilterControlProps {
  filters: FilterConfig[]
  showInitialCount?: boolean
  className?: string
  /** Dropdown panel surface (e.g. `bg-background`). */
  panelClassName?: string
  /**
   * Horizontal anchor to the trigger.
   * Desktop (icon on the left): `start`. Mobile (icon on the right): `end`.
   * @default 'end'
   */
  panelAlign?: PanelAlign
}

export function FilterControl({
  filters,
  showInitialCount = false,
  className,
  panelClassName = 'bg-background/80 backdrop-blur-sm',
  panelAlign = 'end',
}: FilterControlProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null)
  const [selectedFiltersOrder, setSelectedFiltersOrder] = useState<string[]>([])

  const closeDropdown = useCallback(() => setIsDropdownOpen(false), [])
  const { triggerRef, panelRef, position, hasPositioned } =
    useAnchoredPanelPosition({
      isOpen: isDropdownOpen,
      align: panelAlign,
      repositionKey: activeFilterKey,
      onClose: closeDropdown,
    })

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

  if (filters.length === 0) return null

  const panel =
    isDropdownOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={panelRef}
            className={cn(
              'fixed z-50 w-fit max-w-[calc(100vw-1rem)] min-w-[min(100vw-1.5rem,600px)] lg:min-w-[600px]',
              'border border-border rounded-lg shadow-lg',
              panelClassName
            )}
            style={{
              top: position.top,
              left: position.left,
              visibility: hasPositioned ? 'visible' : 'hidden',
            }}
          >
            <div className="border-b border-border px-3 pt-3 pb-2">
              <p className="text-xs font-medium">Filters</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Narrow results by one or more fields, applied forward.
              </p>
            </div>
            <div className="flex gap-2 p-2 lg:gap-6">
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
          </div>,
          document.body
        )
      : null

  return (
    <div className={cn('relative', className)}>
      <IconTriggerButton
        ref={triggerRef as Ref<HTMLButtonElement>}
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
      {panel}
    </div>
  )
}
