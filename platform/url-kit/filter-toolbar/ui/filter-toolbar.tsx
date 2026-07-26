/**
 * FilterToolbar — orchestrates desktop (one row) + mobile (two rows) layouts.
 *
 * Desktop: [filter] [group]  [search……] ---- [label filters] [view] [date]
 * Mobile:
 *   Row 1: [search……] ---- [filter] [group] [label] [date]
 *   ──── separator ────
 *   Row 2: [view pills…]
 *
 * Decoupled from FiltersHeader / MinimalControls. Owns its own URL hooks + chrome.
 */

'use client'

import { Suspense } from 'react'
import type { FilterToolbarProps } from '../model/types'
import { DEFAULT_GROUPING_SUPPORTED_VIEWS } from '../config/chrome'
import { useUrlGrouping } from '../hooks/use-url-grouping'
import { useViewResolution } from '../hooks/use-view-resolution'
import { FilterToolbarDesktop } from './filter-toolbar-desktop'
import { FilterToolbarMobile } from './filter-toolbar-mobile'
import type { FilterToolbarLayoutProps } from './filter-toolbar-layout-types'

export type { FilterToolbarProps }

function FilterToolbarInner({
  filters,
  searchConfig,
  labelFilterKey,
  labelSelectType = 'single-select',
  dateFilterKey = 'rentalStartDate',
  dateFilterButtonText,
  groupableFields = [],
  groupingSupportedViews = DEFAULT_GROUPING_SUPPORTED_VIEWS,
  availableViews = [],
  defaultView,
  useAllItems,
  defaultPageSize = 10,
  enabledFilterKeys,
  showInitialCount = false,
  className,
}: FilterToolbarProps) {
  const displayedFilters = enabledFilterKeys
    ? filters.filter((f) => enabledFilterKeys.includes(f.key))
    : filters

  const allowedKeys = groupableFields.map((f) => f.key)
  const { groupBy, subGroupBy, setGroupBy, setSubGroupBy } = useUrlGrouping({
    allowedKeys,
  })

  const { currentView, setView } = useViewResolution({
    availableViews,
    defaultView,
    useAllItems,
    defaultPageSize,
  })

  const resolvedLabelKey =
    labelFilterKey ||
    displayedFilters[0]?.key ||
    filters[0]?.key ||
    ''

  const dateFilterLabel =
    dateFilterKey
      ? filters.find((f) => f.key === dateFilterKey)?.label
      : undefined

  const layoutProps: FilterToolbarLayoutProps = {
    displayedFilters,
    filters,
    searchConfig,
    showInitialCount,
    groupableFields,
    groupBy,
    subGroupBy,
    setGroupBy,
    setSubGroupBy,
    currentView,
    setView,
    groupingSupportedViews,
    resolvedLabelKey,
    labelSelectType,
    availableViews,
    dateFilterKey,
    dateFilterLabel,
    dateFilterButtonText,
    className,
  }

  return (
    <>
      <FilterToolbarDesktop {...layoutProps} />
      <FilterToolbarMobile {...layoutProps} />
    </>
  )
}

export function FilterToolbar(props: FilterToolbarProps) {
  return (
    <Suspense
      fallback={
        <div className="h-10 w-full animate-pulse rounded-md bg-muted/40 px-2" />
      }
    >
      <FilterToolbarInner {...props} />
    </Suspense>
  )
}
