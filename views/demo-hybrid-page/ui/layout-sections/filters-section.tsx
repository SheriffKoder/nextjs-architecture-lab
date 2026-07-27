/**
 * @file views/demo-hybrid-page/ui/layout-sections/filters-section.tsx
 * Client filter strip driven by `useShallowListParams` (not `useUrlFilters`).
 *
 * Purpose: Multi-select + search + sort chrome that writes shallow URL only
 * Used in: `demo-hybrid-page.tsx`
 * Used for: Shareable `?status=…&q=…` without App Router navigation / RSC remount
 *
 * Function Index:
 * - DemoHybridFiltersSection — controlled filter UI over facet configs
 *
 * Steps:
 * 1. Render search input bound to `listQuery.q` / `setSearch`.
 * 2. Render enabled multi-select chips from facet `FilterConfig` options.
 * 3. Optional primary sort select → `setSort` (page reset batched in hook).
 * 4. Clear button resets filter/search/sort via `clearFilters`.
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import type { SortSpec } from '@/platform/url-kit/filters/feature-sorting/types'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import type {
  ShallowListFilterKey,
  UseShallowListParamsResult,
} from '@/views/demo-hybrid-page/hooks/use-shallow-list-params'
import { rentalCarFiltersHeaderConfig } from '@/views/demo-hybrid-page/config/ui/rental-car-filters-header-config'
import { rentalCarSearchConfig } from '@/views/demo-hybrid-page/config/data/rental-car-search-config'
import { demoRscMinimalControlsConfig } from '@/views/demo-hybrid-page/config/ui/demo-rsc-minimal-controls-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type DemoHybridFiltersSectionProps = {
  filters: FilterConfig[]
  listQuery: RentalCarListQuery
  setFilter: UseShallowListParamsResult['setFilter']
  setSearch: UseShallowListParamsResult['setSearch']
  setSort: UseShallowListParamsResult['setSort']
  clearFilters: UseShallowListParamsResult['clearFilters']
  /** Soft loading indicator while facets refetch */
  isFetching?: boolean
}

const ENABLED_KEYS = (rentalCarFiltersHeaderConfig.enabledFilterKeys ?? [
  'status',
  'make',
  'location',
]) as ShallowListFilterKey[]

function toggleValue(current: string[] | undefined, value: string): string[] {
  const list = current ?? []
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value]
}

/**
 * Shallow-URL filter toolbar for the hybrid page.
 * Platform FilterToolbar is not used — it writes via `router.replace`.
 */
export function DemoHybridFiltersSection({
  filters,
  listQuery,
  setFilter,
  setSearch,
  setSort,
  clearFilters,
  isFetching = false,
}: DemoHybridFiltersSectionProps) {
  const [searchDraft, setSearchDraft] = useState(listQuery.q ?? '')

  // Keep draft in sync when URL changes via back/forward or clear
  useEffect(() => {
    setSearchDraft(listQuery.q ?? '')
  }, [listQuery.q])

  const enabledFilters = useMemo(
    () => filters.filter((f) => ENABLED_KEYS.includes(f.key as ShallowListFilterKey)),
    [filters]
  )

  const primarySort: SortSpec | undefined = listQuery.sort?.[0]
  const sortOptions = demoRscMinimalControlsConfig.sortConfig ?? []

  const hasActiveFilters =
    Boolean(listQuery.q) ||
    Boolean(listQuery.sort?.length) ||
    ENABLED_KEYS.some((key) => (listQuery[key]?.length ?? 0) > 0)

  return (
    <div
      className={`shrink-0 space-y-3 px-1 ${isFetching ? 'opacity-80' : ''}`}
    >
      {/* Step 1: search — commit on Enter / blur to avoid replaceState per keystroke */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          value={searchDraft}
          placeholder={rentalCarSearchConfig.placeholder}
          className="max-w-xs"
          onChange={(e) => setSearchDraft(e.target.value)}
          onBlur={() => {
            if (searchDraft !== (listQuery.q ?? '')) {
              setSearch(searchDraft.trim())
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearch(searchDraft.trim())
            }
          }}
          aria-label="Search rental cars"
        />

        {/* Step 3: primary sort */}
        <select
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          value={
            primarySort
              ? `${primarySort.key}:${primarySort.direction}`
              : ''
          }
          onChange={(e) => {
            const raw = e.target.value
            if (!raw) {
              setSort(undefined)
              return
            }
            const [key, direction] = raw.split(':') as [
              string,
              'asc' | 'desc',
            ]
            setSort([{ key, direction }])
          }}
          aria-label="Sort rental cars"
        >
          <option value="">Sort…</option>
          {sortOptions.map((opt) => (
            <optgroup key={opt.key} label={opt.label}>
              <option value={`${opt.key}:asc`}>{opt.label} ↑</option>
              <option value={`${opt.key}:desc`}>{opt.label} ↓</option>
            </optgroup>
          ))}
        </select>

        {/* Step 4: clear */}
        {hasActiveFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {/* Step 2: multi-select chips from facet options */}
      {enabledFilters.map((filter) => {
        const key = filter.key as ShallowListFilterKey
        const selected = listQuery[key] ?? []
        const options = filter.options ?? []
        if (options.length === 0) return null

        return (
          <div key={filter.key} className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {filter.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {options.map((opt) => {
                const value = String(opt.value)
                const isOn = selected.includes(value)
                return (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant="selection"
                    selected={isOn}
                    onClick={() =>
                      setFilter(key, toggleValue(selected, value))
                    }
                  >
                    {opt.label}
                    {typeof opt.count === 'number' ? (
                      <span className="ml-1 text-muted-foreground">
                        ({opt.count})
                      </span>
                    ) : null}
                  </Button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
