/**
 * Sort Data Utility
 * 
 * Purpose: Sorts items within columns by specified key and direction
 * Used in: hooks/use-kanban-state.ts reducer
 * Why: Provides flexible sorting for column data based on any property
 * 
 * Function Index:
 * - sortColumnData: Sorts array of items by key and direction
 * - sortAllColumns: Sorts all columns in grouped data
 * 
 * Example Input:
 * items = [
 *   { id: '1', created_at: '2024-11-01' },
 *   { id: '2', created_at: '2024-11-03' },
 *   { id: '3', created_at: '2024-11-02' }
 * ]
 * sortKey = 'created_at'
 * direction = 'asc'
 * 
 * Example Output:
 * [
 *   { id: '1', created_at: '2024-11-01' },
 *   { id: '3', created_at: '2024-11-02' },
 *   { id: '2', created_at: '2024-11-03' }
 * ]
 * 
 * Steps:
 * 1. Extract values to compare from each item
 * 2. Compare values based on type (string, number, date)
 * 3. Apply sort direction (ascending or descending)
 * 4. Return sorted array
 */

//////////////////////////////////
// Sort single column data
//////////////////////////////////

/**
 * Sorts array of items by specified key and direction
 * Handles different data types (string, number, date)
 * 
 * @param items - Array of items to sort
 * @param sortKey - Property name to sort by
 * @param direction - Sort direction ('asc' or 'desc')
 * @returns New sorted array (does not mutate original)
 * 
 * @example
 * sortColumnData([{age: 30}, {age: 20}], 'age', 'asc')
 * // Returns: [{age: 20}, {age: 30}]
 */
export function sortColumnData<T = any>(
  items: T[],
  sortKey: string,
  direction: 'asc' | 'desc' = 'asc',
  preserveRowIndex?: boolean // If true, use rowIndex as secondary sort to preserve manual order
): T[] {
  // Create copy to avoid mutating original array
  const itemsCopy = [...items]
  
  // Sort the copied array
  itemsCopy.sort((a, b) => {
    // Extract values to compare
    const aValue = (a as any)[sortKey]
    const bValue = (b as any)[sortKey]
    
    // Handle undefined/null values (push to end)
    if (aValue === undefined || aValue === null) return 1
    if (bValue === undefined || bValue === null) return -1
    
    // Determine comparison result based on type
    let comparison = 0
    
    // Check if values are dates (ISO strings or Date objects)
    if (isDateValue(aValue) && isDateValue(bValue)) {
      const dateA = new Date(aValue).getTime()
      const dateB = new Date(bValue).getTime()
      comparison = dateA - dateB
    }
    // Check if values are numbers
    else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue
    }
    // Treat as strings (case-insensitive)
    else {
      const strA = String(aValue).toLowerCase()
      const strB = String(bValue).toLowerCase()
      comparison = strA.localeCompare(strB)
    }
    
    // If values are equal and preserveRowIndex is true, use rowIndex as secondary sort
    if (comparison === 0 && preserveRowIndex) {
      const aRowIndex = (a as any).rowIndex ?? 0
      const bRowIndex = (b as any).rowIndex ?? 0
      comparison = aRowIndex - bRowIndex
    }
    
    // Apply direction (reverse for descending)
    return direction === 'asc' ? comparison : -comparison
  })
  
  return itemsCopy
}

//////////////////////////////////
// Helper: Check if value is a date
//////////////////////////////////

/**
 * Checks if a value can be treated as a date
 * 
 * @param value - Value to check
 * @returns True if value is a valid date
 */
function isDateValue(value: any): boolean {
  // Check if it's a Date object
  if (value instanceof Date) return !isNaN(value.getTime())
  
  // Check if it's a date string (ISO format)
  if (typeof value === 'string') {
    // Simple check for ISO date format (YYYY-MM-DD)
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}/
    if (isoDateRegex.test(value)) {
      const date = new Date(value)
      return !isNaN(date.getTime())
    }
  }
  
  return false
}

//////////////////////////////////
// Sort all columns in grouped data
//////////////////////////////////

/**
 * Sorts all columns in grouped data structure
 * 
 * @param groupedData - Object with column keys and item arrays
 * @param sortConfig - Configuration for each column's sort
 * @returns New grouped data with sorted columns
 * 
 * @example
 * sortAllColumns(
 *   { todo: [{id: '2'}, {id: '1'}] },
 *   { todo: { key: 'id', direction: 'asc' } }
 * )
 * // Returns: { todo: [{id: '1'}, {id: '2'}] }
 */
export function sortAllColumns<T = any>(
  groupedData: Record<string, T[]>,
  sortConfig: Record<string, { key: string; direction: 'asc' | 'desc' }>
): Record<string, T[]> {
  // Create new object to avoid mutation
  const sortedData: Record<string, T[]> = {}
  
  // Iterate through each column
  Object.keys(groupedData).forEach((columnKey) => {
    // Get items in this column
    const columnItems = groupedData[columnKey]
    
    // Get sort configuration for this column
    const config = sortConfig[columnKey]
    
    // If column has sort config, apply it
    if (config && config.key) {
      sortedData[columnKey] = sortColumnData(
        columnItems,
        config.key,
        config.direction
      )
    } else {
      // Otherwise, keep original order
      sortedData[columnKey] = [...columnItems]
    }
  })
  
  return sortedData
}

//////////////////////////////////
// Toggle sort direction
//////////////////////////////////

/**
 * Toggles sort direction (asc <-> desc)
 * 
 * @param currentDirection - Current sort direction
 * @returns Opposite direction
 * 
 * @example
 * toggleSortDirection('asc') // Returns: 'desc'
 * toggleSortDirection('desc') // Returns: 'asc'
 */
export function toggleSortDirection(
  currentDirection: 'asc' | 'desc'
): 'asc' | 'desc' {
  return currentDirection === 'asc' ? 'desc' : 'asc'
}

