/**
 * Position Calculator Utility
 * 
 * Purpose: Calculates positions and IDs for drag and drop operations
 * Used in: hooks/dnd/use-kanban-dnd.ts, components/dnd/*
 * Why: Centralizes position calculation logic for consistent cell ID format
 * 
 * Function Index:
 * - createCellId: Creates formatted cell ID from column and row
 * - parseCellId: Extracts column and row from cell ID
 * - findItemPosition: Finds item's position in grouped data
 * - calculateDropPosition: Calculates target position for drop
 * 
 * Cell ID Format: "{columnKey}-{rowIndex}"
 * Example: "todo-0", "in-progress-2", "done-5"
 * 
 * Steps:
 * 1. Format cell IDs consistently
 * 2. Parse cell IDs to extract position data
 * 3. Find items in grouped data structure
 * 4. Calculate drop positions with proper validation
 */

import type { DragPosition, DropResult } from '../../types/kanban-types'

//////////////////////////////////
// Create formatted cell ID
//////////////////////////////////

/**
 * Creates formatted cell ID from column key and row index
 * 
 * @param columnKey - Column identifier (e.g., 'todo')
 * @param rowIndex - Row position (0-based)
 * @returns Formatted cell ID (e.g., 'todo-0')
 * 
 * @example
 * createCellId('todo', 0) // Returns: 'todo-0'
 * createCellId('in-progress', 2) // Returns: 'in-progress-2'
 */
export function createCellId(columnKey: string, rowIndex: number): string {
  return `${columnKey}-${rowIndex}`
}

//////////////////////////////////
// Parse cell ID into components
//////////////////////////////////

/**
 * Extracts column key and row index from cell ID
 * 
 * @param cellId - Formatted cell ID (e.g., 'todo-0')
 * @returns Object with columnKey and rowIndex, or null if invalid
 * 
 * @example
 * parseCellId('todo-0') // Returns: { columnKey: 'todo', rowIndex: 0 }
 * parseCellId('in-progress-2') // Returns: { columnKey: 'in-progress', rowIndex: 2 }
 */
export function parseCellId(cellId: string): DragPosition | null {
  // Split by last occurrence of '-' to handle column keys with dashes
  const lastDashIndex = cellId.lastIndexOf('-')
  
  // Validate format
  if (lastDashIndex === -1) {
    console.error(`Invalid cell ID format: ${cellId}`)
    return null
  }
  
  // Extract column key and row index
  const columnKey = cellId.substring(0, lastDashIndex)
  const rowIndexStr = cellId.substring(lastDashIndex + 1)
  
  // Parse row index as number
  const rowIndex = parseInt(rowIndexStr, 10)
  
  // Validate row index is a number
  if (isNaN(rowIndex)) {
    console.error(`Invalid row index in cell ID: ${cellId}`)
    return null
  }
  
  return {
    columnKey,
    rowIndex,
    cellId
  }
}

//////////////////////////////////
// Find item position in grouped data
//////////////////////////////////

/**
 * Finds item's current position in grouped data
 * 
 * @param itemId - Unique identifier of item
 * @param groupedData - Grouped data structure
 * @param cardKey - Property name for unique ID
 * @returns Position object or null if not found
 * 
 * @example
 * findItemPosition('task-1', { todo: [{id: 'task-1'}] }, 'id')
 * // Returns: { columnKey: 'todo', rowIndex: 0, cellId: 'todo-0' }
 */
export function findItemPosition<T = any>(
  itemId: string,
  groupedData: Record<string, T[]>,
  cardKey: string
): DragPosition | null {
  // Iterate through each column
  for (const columnKey in groupedData) {
    const columnItems = groupedData[columnKey]
    
    // Find item index in this column
    const rowIndex = columnItems.findIndex(
      (item) => String((item as any)[cardKey]) === String(itemId)
    )
    
    // If found, return position
    if (rowIndex !== -1) {
      return {
        columnKey,
        rowIndex,
        cellId: createCellId(columnKey, rowIndex)
      }
    }
  }
  
  // Item not found
  console.warn(`Item not found: ${itemId}`)
  return null
}

//////////////////////////////////
// Calculate drop position
//////////////////////////////////

/**
 * Calculates valid drop position from cell ID and drag state
 * Handles edge cases like empty columns and boundary validation
 * 
 * @param cellId - Target cell ID
 * @param groupedData - Current grouped data
 * @returns Validated drop position or null if invalid
 * 
 * @example
 * calculateDropPosition('done-2', { done: [{}, {}, {}] })
 * // Returns: { columnKey: 'done', rowIndex: 2, cellId: 'done-2' }
 */
export function calculateDropPosition(
  cellId: string,
  groupedData: Record<string, any[]>
): DragPosition | null {
  // Parse cell ID
  const position = parseCellId(cellId)
  
  if (!position) {
    return null
  }
  
  const { columnKey, rowIndex } = position
  
  // Validate column exists
  if (!groupedData[columnKey]) {
    console.error(`Column not found: ${columnKey}`)
    return null
  }
  
  // Get column items
  const columnItems = groupedData[columnKey]
  
  // Validate row index is within bounds (allow one past end for append)
  const maxIndex = columnItems.length
  if (rowIndex < 0 || rowIndex > maxIndex) {
    console.error(
      `Invalid row index ${rowIndex} for column ${columnKey} (length: ${columnItems.length})`
    )
    return null
  }
  
  return position
}

//////////////////////////////////
// Calculate insert position
//////////////////////////////////

/**
 * Calculates the actual insert position considering the dragged item's current position
 * Adjusts index if dropping in same column after original position
 * 
 * @param source - Source position of dragged item
 * @param target - Target position for drop
 * @returns Adjusted insert position
 * 
 * @example
 * // Moving item down in same column
 * calculateInsertPosition({ columnKey: 'todo', rowIndex: 1 }, { columnKey: 'todo', rowIndex: 3 })
 * // Returns: 2 (because item at index 1 will be removed first)
 */
export function calculateInsertPosition(
  source: DragPosition,
  target: DragPosition
): number {
  // If moving within same column
  if (source.columnKey === target.columnKey) {
    // If moving down, adjust for removal of source item
    if (target.rowIndex > source.rowIndex) {
      return target.rowIndex - 1
    }
  }
  
  // Otherwise, use target index as-is
  return target.rowIndex
}

//////////////////////////////////
// Create drop result
//////////////////////////////////

/**
 * Creates a complete drop result object
 * 
 * @param itemId - ID of dropped item
 * @param source - Source position
 * @param target - Target position
 * @returns Complete drop result
 */
export function createDropResult(
  itemId: string,
  source: DragPosition,
  target: DragPosition
): DropResult {
  return {
    itemId,
    source,
    target
  }
}

