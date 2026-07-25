/**
 * URL selection state for a single label-filter key.
 */

'use client'

import { useUrlFilters } from '@/platform/url-kit/filters/feature-filtering/hooks/useUrlFilters'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'

export function useLabelFilterSelection(
  filterKey: string,
  filter: FilterConfig
) {
  const { getList, get, toggleListValue, set, remove } = useUrlFilters()

  const isMultiSelect = filter.type === 'multi-select'
  const selectedValues = isMultiSelect
    ? getList(filterKey)
    : get(filterKey)
      ? [get(filterKey)!]
      : []
  const selectedCount = selectedValues.length

  const isSelected = (value: string) => selectedValues.includes(value)

  const handleOptionClick = (value: string) => {
    if (isMultiSelect) {
      toggleListValue(filterKey, value)
      return
    }
    if (isSelected(value)) {
      remove(filterKey)
    } else {
      set(filterKey, value)
    }
  }

  return {
    selectedValues,
    selectedCount,
    isSelected,
    handleOptionClick,
  }
}
