/**
 * Label filters — option chips at `xl+`; compact icon + label dropdown below `xl`.
 *
 * Owns its own URL wiring (does not use FilterOptionsButtons dropdown chrome).
 */

'use client'

import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import type { LabelFiltersProps } from './types'
import { useLabelFilterSelection } from './use-label-filter-selection'
import { LabelFilterChipsRow } from './label-filter-chips-row'
import { LabelFilterDropdown } from './label-filter-dropdown'

export type { LabelFiltersProps } from './types'

const EMPTY_FILTER: FilterConfig = {
  key: '',
  label: '',
  type: 'single-select',
  options: [],
}

export function LabelFilters({
  filterKey,
  filterOptions,
  selectType = 'single-select',
  showInitialCount = true,
  iconOnly = false,
}: LabelFiltersProps) {
  const foundFilter = filterOptions.find((f) => f.key === filterKey)

  const filter: FilterConfig = foundFilter
    ? selectType
      ? { ...foundFilter, type: selectType }
      : foundFilter
    : EMPTY_FILTER

  const { selectedCount, isSelected, handleOptionClick } =
    useLabelFilterSelection(filterKey, filter)

  if (!foundFilter || !filter.options || filter.options.length === 0) {
    return null
  }

  return (
    <>
      {!iconOnly ? (
        <LabelFilterChipsRow
          filter={filter}
          showInitialCount={showInitialCount}
          isSelected={isSelected}
          onSelect={handleOptionClick}
        />
      ) : null}
      <LabelFilterDropdown
        filter={filter}
        selectedCount={selectedCount}
        showInitialCount={showInitialCount}
        isSelected={isSelected}
        onSelect={handleOptionClick}
        iconOnly={iconOnly}
      />
    </>
  )
}
