/**
 * Group Data Utility
 * 
 * Purpose: Groups flat array of items into column-based structure
 * Used in: hooks/use-kanban-state.ts
 * Why: Transforms flat data array into grouped structure for efficient column rendering
 * 
 * Function Index:
 * - groupDataByColumn: Groups items by specified column key
 * - flattenGroupedData: Converts grouped data back to flat array
 * 
 * Example Input:
 * data = [
 *   { id: '1', status: 'todo', title: 'Task 1' },
 *   { id: '2', status: 'done', title: 'Task 2' },
 *   { id: '3', status: 'todo', title: 'Task 3' }
 * ]
 * columnKey = 'status'
 * 
 * Example Output:
 * {
 *   todo: [{ id: '1', status: 'todo', title: 'Task 1' }, { id: '3', status: 'todo', title: 'Task 3' }],
 *   done: [{ id: '2', status: 'done', title: 'Task 2' }]
 * }
 * 
 * Steps:
 * 1. Iterate through data array
 * 2. Extract column value from each item using columnKey
 * 3. Group items by column value
 * 4. Return grouped object
 */

//////////////////////////////////
// Group items by column key
//////////////////////////////////

/**
 * Groups flat array of items into column-based structure
 * Optionally calculates manualSorting field if missing
 * Optionally applies sorting when manual sorting is disabled
 * 
 * @param data - Flat array of items to group
 * @param columnKey - Property name to group by (e.g., 'status')
 * @param manualSorting - If true, calculate manualSorting field based on array index
 * @param sortKey - Optional sort key to apply (only if manualSorting is false)
 * @param sortDirection - Optional sort direction (only if manualSorting is false)
 * @returns Object with column keys and arrays of items
 * 
 * @example
 * groupDataByColumn([{id: '1', status: 'todo'}], 'status')
 * // Returns: { todo: [{id: '1', status: 'todo'}] }
 * 
 * groupDataByColumn([{id: '1', status: 'todo'}], 'status', true)
 * // Returns: { todo: [{id: '1', status: 'todo', manualSorting: 0}] }
 */
export function groupDataByColumn<T = any>(
  data: T[],
  columnKey: string,
  manualSorting?: boolean,
  sortKey?: string,
  sortDirection?: 'asc' | 'desc'
): Record<string, T[]> {
  // Initialize empty grouped object
  const grouped: Record<string, T[]> = {}
  
  // Check if any items have manualSorting field
  const hasManualSorting = data.some((item) => (item as any).manualSorting !== undefined)
  
  // Iterate through each item in data
  data.forEach((item) => {
    // Extract column value (e.g., item['status'])
    const columnValue = (item as any)[columnKey]
    
    // Skip items without a column value
    if (columnValue === undefined || columnValue === null) {
      console.warn(`Item missing column key "${columnKey}":`, item)
      return
    }
    
    // Convert column value to string for consistent keys
    const columnKeyStr = String(columnValue)
    
    // Initialize array for this column if it doesn't exist
    if (!grouped[columnKeyStr]) {
      grouped[columnKeyStr] = []
    }
    
    // Add item to its column array
    grouped[columnKeyStr].push(item)
  })
  
  // If manualSorting is enabled and no items have manualSorting field, calculate it
  if (manualSorting && !hasManualSorting) {
    Object.keys(grouped).forEach((colKey) => {
      grouped[colKey].forEach((item, index) => {
        // Mutate item directly to add manualSorting field
        ;(item as any).manualSorting = index
      })
    })
  }
  
  // If manualSorting is enabled, sort each column by manualSorting field
  if (manualSorting) {
    Object.keys(grouped).forEach((colKey) => {
      grouped[colKey].sort((a: any, b: any) => {
        const aSort = (a as any).manualSorting ?? 0
        const bSort = (b as any).manualSorting ?? 0
        return aSort - bSort
      })
    })
  } else if (sortKey && sortDirection) {
    // If manual sorting is disabled and sort config provided, apply sorting
    // Import sortColumnData dynamically to avoid circular dependency
    const { sortColumnData } = require('./sort-data')
    
    Object.keys(grouped).forEach((colKey) => {
      grouped[colKey] = sortColumnData(
        grouped[colKey],
        sortKey,
        sortDirection
      )
    })
  }
  
  return grouped
}

//////////////////////////////////
// Flatten grouped data back to array
//////////////////////////////////

/**
 * Converts grouped data structure back to flat array
 * Useful for sending updated data back to parent component
 * 
 * @param groupedData - Object with column keys and item arrays
 * @returns Flat array of all items
 * 
 * @example
 * flattenGroupedData({ todo: [{id: '1'}], done: [{id: '2'}] })
 * // Returns: [{id: '1'}, {id: '2'}]
 */
export function flattenGroupedData<T = any>(
  groupedData: Record<string, T[]>
): T[] {
  // Initialize empty result array
  const flattened: T[] = []
  
  // Iterate through each column
  Object.keys(groupedData).forEach((columnKey) => {
    // Get items in this column
    const columnItems = groupedData[columnKey]
    
    // Add all items from this column to result array
    flattened.push(...columnItems)
  })
  
  return flattened
}

//////////////////////////////////
// Extract unique column keys from data
//////////////////////////////////

/**
 * Extracts unique column values from data
 * Used for auto-generating column configuration
 * 
 * @param data - Array of items
 * @param columnKey - Property name to extract unique values from
 * @returns Array of unique column keys
 * 
 * @example
 * extractUniqueColumns([{status: 'todo'}, {status: 'done'}, {status: 'todo'}], 'status')
 * // Returns: ['todo', 'done']
 */
export function extractUniqueColumns<T = any>(
  data: T[],
  columnKey: string
): string[] {
  // Use Set to automatically handle uniqueness
  const uniqueKeys = new Set<string>()
  
  // Extract column value from each item
  data.forEach((item) => {
    const columnValue = (item as any)[columnKey]
    
    // Add to set if value exists
    if (columnValue !== undefined && columnValue !== null) {
      uniqueKeys.add(String(columnValue))
    }
  })
  
  // Convert Set to Array and return
  return Array.from(uniqueKeys)
}

