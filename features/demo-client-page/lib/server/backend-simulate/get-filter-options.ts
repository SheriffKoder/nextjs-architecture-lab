/**
 * Get Filter Options (data-driven option lists)
 *
 * Name: get-filter-options
 * Purpose: Turn raw rows + field map into `FilterOption[]` for select / quick-select configs
 * Used in: ../get-filter-options-server.ts
 * Used for: Populate `FilterConfig.options` with label, value, count, initialCount for the UI
 *
 * Function Index:
 * - formatLabel: Capitalize raw facet value for display
 * - getUniqueValuesForField: Count occurrences in full vs filtered datasets per distinct value
 * - getFilterOptions: Map each `filterConfigs` entry to a config with `options` when applicable
 *
 * Steps (getFilterOptions):
 * 1. For each config, branch on `type` / `showQuickSelect` to decide if options are generated.
 * 2. Resolve the backing data field via `fieldMap[config.key]` — missing map → return config unchanged.
 * 3. For supported branches, delegate to getUniqueValuesForField and merge options into the config.
 */

import type { FilterConfig, FilterOption } from '../../../../ui/filters/feature-filtering/components/filter-types'

type DataRecord = Record<string, any>

export interface GetFilterOptionsOptions<T extends DataRecord> {
  filterConfigs: FilterConfig[]
  dataSource: T[]
  fieldMap: Record<string, keyof T>
  filteredDataSource?: T[]
}

/**
 * Capitalize the first character of a facet value for option labels.
 *
 * @param value - Raw string from data (e.g. status code)
 */
function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Build sorted filter options for one field with total vs faceted counts.
 *
 * Steps:
 * 1. Walk full `data` and increment totalCount per distinct string value for `field`.
 * 2. If `filteredData` is provided, increment initialCount per value on that subset (facet context).
 * 3. If no filtered set, set initialCount = totalCount so UI still has both numbers.
 * 4. Sort by value string and map to FilterOption objects.
 *
 * @param field - Column key on T
 * @param data - Full dataset (drives totalCount)
 * @param filteredData - Optional subset after “other” filters (drives initialCount)
 */
function getUniqueValuesForField<T extends DataRecord>(
  field: keyof T,
  data: T[],
  filteredData?: T[]
): FilterOption[] {
  const valueCounts = new Map<string, { totalCount: number; initialCount: number }>()

  // Step 1: totalCount from full data
  data.forEach((record) => {
    const value = record[field]
    if (value !== null && value !== undefined) {
      const valueStr = String(value)
      const current = valueCounts.get(valueStr) || { totalCount: 0, initialCount: 0 }
      current.totalCount++
      valueCounts.set(valueStr, current)
    }
  })

  // Step 2–3: initialCount from filtered slice, or mirror totalCount
  if (filteredData) {
    filteredData.forEach((record) => {
      const value = record[field]
      if (value !== null && value !== undefined) {
        const valueStr = String(value)
        const current = valueCounts.get(valueStr) || { totalCount: 0, initialCount: 0 }
        current.initialCount++
        valueCounts.set(valueStr, current)
      }
    })
  } else {
    valueCounts.forEach((counts) => {
      counts.initialCount = counts.totalCount
    })
  }

  // Step 4: stable sort + FilterOption shape
  return Array.from(valueCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, counts]) => ({
      label: formatLabel(value),
      value,
      count: counts.totalCount,
      initialCount: counts.initialCount,
    }))
}

/**
 * Attach generated `options` to each filter config that supports dynamic values.
 *
 * @param options - filterConfigs + full data + optional filtered data + field map
 */
export async function getFilterOptions<T extends DataRecord>(
  options: GetFilterOptionsOptions<T>
): Promise<FilterConfig[]> {
  const { filterConfigs, dataSource, fieldMap, filteredDataSource } = options

  return filterConfigs.map((config) => {
    //////////////////////////////////////////////////////////////
    // Branch A: discrete select filters
    //////////////////////////////////////////////////////////////
    if (config.type === 'multi-select' || config.type === 'single-select') {
      const field = fieldMap[config.key]
      if (!field) {
        return config
      }
      const opts = getUniqueValuesForField(field, dataSource, filteredDataSource)
      return { ...config, options: opts }
    }

    //////////////////////////////////////////////////////////////
    // Branch B: range filters with quick-pick unique values
    //////////////////////////////////////////////////////////////
    if (config.showQuickSelect && (config.type === 'date-range' || config.type === 'number-range')) {
      const field = fieldMap[config.key]
      if (!field) {
        return config
      }
      const quickSelectType = config.quickSelectType || 'unique'
      if (quickSelectType === 'unique') {
        const opts = getUniqueValuesForField(field, dataSource, filteredDataSource)
        return { ...config, options: opts }
      }
      return config
    }

    //////////////////////////////////////////////////////////////
    // Branch C: no generated options for this config type
    //////////////////////////////////////////////////////////////
    return config
  })
}
