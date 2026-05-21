/**
 * Kanban State Hook
 * 
 * Purpose: Manages Kanban state using useReducer for complex state logic
 * Used in: kanban-container.tsx
 * Why: Centralizes state management for drag/drop and data updates
 * 
 * Function Index:
 * - kanbanReducer: Reducer function handling all state transitions
 * - useKanbanState: Hook that sets up reducer and provides state/dispatch
 * 
 * State Flow:
 * 1. Initialize state from props (data → groupedData)
 * 2. Handle drag operations (DRAG_START, DRAG_OVER, DRAG_END)
 * 3. Handle external updates (UPDATE_DATA)
 * 
 * Steps:
 * 1. Define initial state
 * 2. Create reducer with action handlers
 * 3. Setup useReducer hook
 * 4. Return state and dispatch
 */

import { useReducer, useMemo, useEffect } from 'react'
import type React from 'react'
import type { KanbanState, KanbanAction, ColumnConfig } from '../types/kanban-types'
import { groupDataByColumn } from '../utils/group-data'

//////////////////////////////////
// Kanban Reducer
//////////////////////////////////

/**
 * Reducer function for Kanban state management
 * Handles all state transitions for drag/drop
 * 
 * @param state - Current state
 * @param action - Action to perform
 * @returns New state
 */
function kanbanReducer<T = any>(
  state: KanbanState<T>,
  action: KanbanAction,
  columnKey: string,
  onItemUpdate?: (item: T, newColumnKey: string, newRowIndex: number) => void | Promise<void>
): KanbanState<T> {
  console.log('🔄 REDUCER ACTION:', action.type, 'payload' in action ? action.payload : 'no payload')
  
  switch (action.type) {
    //////////////////////////////////
    // Drag Start: Mark item as active
    //////////////////////////////////
    case 'DRAG_START': {
      const { itemId, sourceColumn, sourceRow } = action.payload
      
      console.log('🚀 DRAG START:', { itemId, sourceColumn, sourceRow })
      
      return {
        ...state,
        activeId: itemId,
        dragSource: { columnKey: sourceColumn, rowIndex: sourceRow },
        virtualPlaceholder: null // Clear any existing placeholder
      }
    }
    
    //////////////////////////////////
    // Drag Over: Update virtual placeholder
    //////////////////////////////////
    case 'DRAG_OVER': {
      const { columnKey, rowIndex } = action.payload
      
      // Don't update if already at this position
      if (
        state.virtualPlaceholder &&
        state.virtualPlaceholder.columnKey === columnKey &&
        state.virtualPlaceholder.rowIndex === rowIndex
      ) {
        return state
      }
      
      console.log('📍 DRAG OVER:', { columnKey, rowIndex, activeId: state.activeId })
      
      return {
        ...state,
        virtualPlaceholder: {
          columnKey,
          rowIndex,
          itemId: state.activeId || ''
        }
      }
    }
    
    //////////////////////////////////
    // Drag End: Move item to new position
    //////////////////////////////////
    case 'DRAG_END': {
      const { itemId, targetColumn, targetRow, manualSorting } = action.payload
      
      console.log('🎯 DRAG END:', { itemId, targetColumn, targetRow, manualSorting })
      
      // Use stored drag source position
      if (!state.dragSource) {
        console.error('❌ No drag source found')
        return {
          ...state,
          activeId: null,
          dragSource: null,
          virtualPlaceholder: null
        }
      }
      
      const sourceColumn = state.dragSource.columnKey
      const sourceRow = state.dragSource.rowIndex
      
      // Get the dragged item from source position
      const draggedItem = state.groupedData[sourceColumn]?.[sourceRow]
      
      // If item not found at source position, cancel operation
      if (!draggedItem) {
        console.error('❌ Item not found at source position:', state.dragSource)
        return {
          ...state,
          activeId: null,
          dragSource: null,
          virtualPlaceholder: null
        }
      }
      
      // Create new grouped data with item moved
      const newGroupedData = { ...state.groupedData }
      
      // Remove item from source column
      newGroupedData[sourceColumn] = [...state.groupedData[sourceColumn]]
      newGroupedData[sourceColumn].splice(sourceRow, 1)
      
      // Add item to target column at target position
      if (!newGroupedData[targetColumn]) {
        newGroupedData[targetColumn] = []
      } else {
        newGroupedData[targetColumn] = [...newGroupedData[targetColumn]]
      }
      
      // Calculate insert index (if same column and moving down, adjust for removal)
      let insertIndex = targetRow
      if (sourceColumn === targetColumn && targetRow > sourceRow) {
        insertIndex = targetRow - 1
      }
      
      newGroupedData[targetColumn].splice(insertIndex, 0, draggedItem)
      
      // If manualSorting is enabled, recalculate manualSorting for affected columns
      if (manualSorting) {
        // Recalculate manualSorting for source column
        newGroupedData[sourceColumn].forEach((item, index) => {
          ;(item as any).manualSorting = index
        })
        
        // Recalculate manualSorting for target column
        newGroupedData[targetColumn].forEach((item, index) => {
          ;(item as any).manualSorting = index
        })
      }
      
      console.log('✅ DRAG END SUCCESS:', {
        from: `${sourceColumn}[${sourceRow}]`,
        to: `${targetColumn}[${insertIndex}]`,
        manualSorting,
        newGroupedData
      })
      
      // Update the item's column key property
      const updatedItem = {
        ...draggedItem,
        [columnKey]: targetColumn
      } as T
      
      // Call onItemUpdate callback if provided (for database persistence)
      if (onItemUpdate) {
        // Call asynchronously to not block state update
        Promise.resolve(onItemUpdate(updatedItem, targetColumn, insertIndex)).catch((error) => {
          console.error('❌ Error in onItemUpdate callback:', error)
        })
      }
      
      // Replace the item in newGroupedData with updated item
      newGroupedData[targetColumn][insertIndex] = updatedItem
      
      return {
        ...state,
        groupedData: newGroupedData,
        activeId: null,
        dragSource: null,
        virtualPlaceholder: null
      }
    }
    
    //////////////////////////////////
    // Drag Cancel: Reset drag state
    //////////////////////////////////
    case 'DRAG_CANCEL': {
      console.log('❌ DRAG CANCEL')
      
      return {
        ...state,
        activeId: null,
        dragSource: null,
        virtualPlaceholder: null
      }
    }
    
    //////////////////////////////////
    // Update Data: External data change
    //////////////////////////////////
    case 'UPDATE_DATA': {
      const { groupedData } = action.payload
      
      console.log('📥 UPDATE DATA:', groupedData)
      
      return {
        ...state,
        groupedData
      }
    }
    
    default:
      return state
  }
}

//////////////////////////////////
// Kanban State Hook
//////////////////////////////////

/**
 * Custom hook for managing Kanban state
 * Sets up reducer with initial state and provides state/dispatch
 * 
 * @param data - Initial data array
 * @param columnKey - Property name for column grouping
 * @param columns - Optional column configuration
 * @returns State and dispatch function
 * 
 * @example
 * const { state, dispatch } = useKanbanState(data, 'status', columns)
 */
export function useKanbanState<T = any>(
  data: T[],
  columnKey: string,
  columns?: ColumnConfig[],
  manualSorting?: boolean,
  sortKey?: string,
  sortDirection?: 'asc' | 'desc',
  isManualOnChangeRef?: React.MutableRefObject<boolean>,
  onItemUpdate?: (item: T, newColumnKey: string, newRowIndex: number) => void | Promise<void>
) {
  //////////////////////////////////
  // Initialize grouped data from props
  //////////////////////////////////
  const initialGroupedData = useMemo(() => {
    return groupDataByColumn(data, columnKey, manualSorting, sortKey, sortDirection)
  }, [data, columnKey, manualSorting, sortKey, sortDirection])
  
  //////////////////////////////////
  // Initialize reducer state
  //////////////////////////////////
  const initialState: KanbanState<T> = useMemo(() => ({
    groupedData: initialGroupedData,
    virtualPlaceholder: null,
    activeId: null,
    dragSource: null
  }), [initialGroupedData])
  
  //////////////////////////////////
  // Setup reducer with onItemUpdate callback
  //////////////////////////////////
  const reducerWithCallback = useMemo(
    () => (state: KanbanState<T>, action: KanbanAction) => 
      kanbanReducer(state, action, columnKey, onItemUpdate),
    [columnKey, onItemUpdate]
  )
  
  const [state, dispatch] = useReducer(reducerWithCallback, initialState)
  
  //////////////////////////////////
  // Update grouped data when external data changes
  //////////////////////////////////
  useEffect(() => {
    // Skip UPDATE_DATA if this is a manual onChange (e.g., from handleAddItem)
    // The handleAddItem function will manually dispatch UPDATE_DATA
    if (isManualOnChangeRef?.current) {
      console.log('⏭️ Skipping UPDATE_DATA - manual onChange in progress')
      return
    }
    
    const newGroupedData = groupDataByColumn(data, columnKey, manualSorting, sortKey, sortDirection)
    
    dispatch({ 
      type: 'UPDATE_DATA', 
      payload: { groupedData: newGroupedData } 
    })
  }, [data, columnKey, manualSorting, sortKey, sortDirection, isManualOnChangeRef])
  
  return {
    state,
    dispatch
  }
}
