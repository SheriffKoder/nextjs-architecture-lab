/**
 * Get Sort Fields Utility
 * 
 * Purpose: Generates sort field configuration from data with type inference
 * Used in: page.tsx, sort controls
 * Why: Provides sortable fields with labels and type hints for sorting
 * 
 * Function Index:
 * - getSortFields: Extracts sortable fields from data with type inference
 * 
 * Steps:
 * 1. Extract field names from data
 * 2. Infer type from sample values (string, number, date)
 * 3. Return formatted sort field config
 */

import { getFieldNames } from './get-field-names'
import type { SortFieldConfig } from '../components/ui/sort-controls'

//////////////////////////////////
// Get Sort Fields from Data
//////////////////////////////////

/**
 * Generates sort field configuration from data array
 * Infers field types (string, number, date) from sample values
 * 
 * @param data - Array of data objects
 * @returns Array of sort field configurations with keys, labels, and types
 * 
 * @example
 * getSortFields([
 *   { id: 1, created_at: '2024-01-01', name: 'Task' }
 * ])
 * // Returns: [
 * //   { key: 'created_at', label: 'Created At', type: 'date' },
 * //   { key: 'id', label: 'Id', type: 'number' },
 * //   { key: 'name', label: 'Name', type: 'string' }
 * // ]
 */
export function getSortFields<T extends Record<string, any>>(
  data: T[]
): SortFieldConfig[] {
  if (!data || data.length === 0) {
    return []
  }
  
  // Get field names with formatted labels
  const fields = getFieldNames(data)
  const sampleItem = data[0]
  
  // Map fields to sort config with type inference
  return fields.map((field) => {
    const value = (sampleItem as any)[field.key]
    let type: 'string' | 'number' | 'date' | undefined = undefined
    
    // Infer type from sample value
    if (typeof value === 'number') {
      type = 'number'
    } else if (typeof value === 'string') {
      // Check if it's a date string (ISO format)
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}/
      if (isoDateRegex.test(value)) {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          type = 'date'
        } else {
          type = 'string'
        }
      } else {
        type = 'string'
      }
    }
    
    return {
      key: field.key,
      label: field.label,
      type
    }
  })
}

