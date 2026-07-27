/**
 * @file entities/demo-hybrid-cars/repository/get-filter-options.ts
 * Build filter facet options with counts from a data source.
 *
 * Purpose: Populate `FilterConfig.options` from mock rows + field map
 * Used in: `server/get-filter-options-server.ts`
 * Used for: Faceted filter UI with `totalCount` and `initialCount` per option
 *
 * Function Index:
 * - getFilterOptions — extract unique values and counts per filter config
 *
 * Steps:
 * 1. Accept filter configs, full data source, field map, and narrowed source.
 * 2. Extract unique values per filter key.
 * 3. Format labels and attach count fields.
 * 4. Return configs with populated options arrays.
 */

import type { FilterConfig, FilterOption } from "@/platform/url-kit/filters/feature-filtering/components/filter-types"

//////////////////////////////////
// Types
//////////////////////////////////

/**
 * Generic data record type
 * WHY: Allows function to work with any data type
 * HOW: Constrains to objects with string keys
 */
type DataRecord = Record<string, any>

/**
 * Options for getFilterOptions function
 * WHY: Makes function parameters explicit and self-documenting
 * HOW: Object with all required parameters
 */
export interface GetFilterOptionsOptions<T extends DataRecord> {
  /**
   * Base filter configurations (without options)
   * WHY: Define which filters to populate
   * HOW: Array of FilterConfig objects
   */
  filterConfigs: FilterConfig[]
  
  /**
   * Data source to extract unique values from (for totalCount)
   * WHY: Need actual data to populate filter options and calculate total counts
   * HOW: Array of data records
   */
  dataSource: T[]
  
  /**
   * Mapping of filter keys to data fields
   * WHY: Connect filter configuration keys to actual data properties
   * HOW: Object mapping filter key strings to data field keys
   */
  fieldMap: Record<string, keyof T>
  
  /**
   * Optional filtered data source (for initialCount)
   * WHY: Calculate initial counts after filtering by other columns
   * HOW: Array of data records filtered by other columns only
   */
  filteredDataSource?: T[]
}

//////////////////////////////////
// Helper Functions
//////////////////////////////////

/**
 * Format label from value
 * WHY: Human-readable labels for filter options
 * HOW: Capitalize first letter, handle special cases
 * @param {string} value - Raw value from data
 * @returns {string} Formatted label
 */
function formatLabel(value: string): string {
  // Capitalize first letter
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Get unique values for a specific field with counts
 * WHY: Extract distinct values from data for filter options and count occurrences
 * HOW: Use Map to track unique values and their counts, map to FilterOption format
 * @param {keyof T} field - Data field to extract values from
 * @param {T[]} data - Array of data records to extract from
 * @param {T[]} filteredData - Optional filtered data for initialCount
 * @returns {FilterOption[]} Array of unique filter options with counts
 */
function getUniqueValuesForField<T extends DataRecord>(
  field: keyof T,
  data: T[],
  filteredData?: T[]
): FilterOption[] {
  // Use Map to track unique values and their counts
  // WHY: Need to count occurrences of each value
  // HOW: Map stores value -> { totalCount, initialCount }
  const valueCounts = new Map<string, { totalCount: number; initialCount: number }>()
  
  // Count occurrences of each value in full data (totalCount)
  data.forEach((record) => {
    const value = record[field]
    if (value !== null && value !== undefined) {
      const valueStr = String(value)
      const current = valueCounts.get(valueStr) || { totalCount: 0, initialCount: 0 }
      current.totalCount++
      valueCounts.set(valueStr, current)
    }
  })
  
  // Count occurrences in filtered data (initialCount)
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
    // If no filtered data provided, use totalCount for initialCount
    valueCounts.forEach((counts) => {
      counts.initialCount = counts.totalCount
    })
  }
  
  // Convert to FilterOption array with counts and sort
  return Array.from(valueCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, counts]) => ({
      label: formatLabel(value),
      value: value,
      count: counts.totalCount,
      initialCount: counts.initialCount,
    }))
}

//////////////////////////////////
// Main Function
//////////////////////////////////

/**
 * Get filter options for all filter configs
 * WHY: Populate filter options dynamically from data
 * HOW: Extract unique values for each filter key that needs options
 * @param {GetFilterOptionsOptions<T>} options - Options object with configs, data, and field map
 * @returns {Promise<FilterConfig[]>} Filter configs with populated options
 */
export async function getFilterOptions<T extends DataRecord>(
  options: GetFilterOptionsOptions<T>
): Promise<FilterConfig[]> {
  const { filterConfigs, dataSource, fieldMap, filteredDataSource } = options
  
  return filterConfigs.map((config) => {
    // Handle select types (multi-select, single-select)
    if (config.type === "multi-select" || config.type === "single-select") {
      const field = fieldMap[config.key]
      if (!field) {
        return config
      }
      
      const options = getUniqueValuesForField(field, dataSource, filteredDataSource)
      return { ...config, options }
    }
    
    // Handle range types with showQuickSelect
    // WHY: Extract unique values for quick select dropdowns
    // HOW: When showQuickSelect is true, populate options with unique values
    if (config.showQuickSelect && (config.type === "date-range" || config.type === "number-range")) {
      const field = fieldMap[config.key]
      if (!field) {
        return config
      }
      
      // Get quick select type (default to "unique")
      const quickSelectType = config.quickSelectType || "unique"
      
      // For now, only implement "unique" type
      // Future: "buckets" and "presets" will be implemented later
      if (quickSelectType === "unique") {
        const options = getUniqueValuesForField(field, dataSource, filteredDataSource)
        return { ...config, options }
      }
      
      // Future implementations will go here
      // if (quickSelectType === "buckets") { ... }
      // if (quickSelectType === "presets") { ... }
      
      return config
    }
    
    return config
  })
}
