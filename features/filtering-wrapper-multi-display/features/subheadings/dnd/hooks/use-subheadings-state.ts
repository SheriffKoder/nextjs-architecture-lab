/**
 * SubHeadings State Management Hook
 * 
 * Purpose: Manages state updates when items are moved between groups
 * Used in: SubHeadingsContainer component
 * Similar to: use-kanban-state.ts
 * 
 * Features:
 * - Updates item's groupByKey field when dropped
 * - Returns updated data array for callback
 * - Handles state transitions during drag operations
 */

import { useReducer } from 'react'
import { SubHeadingsDragState, SubHeadingsDragAction } from '../types'

/**
 * Initial drag state
 */
const initialState: SubHeadingsDragState = {
  activeId: null,
  dragSource: null,
  overId: null
}

/**
 * Reducer for drag state management
 */
function dragStateReducer(
  state: SubHeadingsDragState,
  action: SubHeadingsDragAction
): SubHeadingsDragState {
  switch (action.type) {
    case 'DRAG_START':
      return {
        activeId: String(action.payload.itemId),
        dragSource: {
          itemId: action.payload.itemId,
          groupKey: action.payload.groupKey,
          rowIndex: action.payload.rowIndex
        },
        overId: null
      }

    case 'DRAG_OVER':
      return {
        ...state,
        overId: action.payload.overId
      }

    case 'DRAG_END':
    case 'DRAG_CANCEL':
      return {
        activeId: null,
        dragSource: null,
        overId: null
      }

    default:
      return state
  }
}

/**
 * Hook for managing SubHeadings drag state
 * 
 * @returns State and dispatch function
 */
export function useSubHeadingsState() {
  const [state, dispatch] = useReducer(dragStateReducer, initialState)

  return {
    state,
    dispatch
  }
}

/**
 * Process data update when item is moved to a new group
 * 
 * @param data - Current data array
 * @param itemId - ID of the item being moved
 * @param targetGroupKey - Target group key
 * @param groupByKey - Field name to update (e.g., 'status')
 * @param nestedGrouping - Optional nested grouping configuration
 * @returns Updated data array
 */
export function processGroupChange<T extends Record<string, any>>(
  data: T[],
  itemId: string | number,
  targetGroupKey: string,
  groupByKey: string,
  nestedGrouping?: {
    enabled: boolean;
    primaryKey: string;
    secondaryKey: string;
    separator: string;
  }
): T[] {
  // Find the item in the data array
  const itemIndex = data.findIndex((item: any) => {
    // Try common ID fields
    return item.id === itemId || 
           item._id === itemId || 
           String(item.id) === String(itemId) ||
           String(item._id) === String(itemId)
  })

  if (itemIndex === -1) {
    console.error('❌ Item not found in data array:', itemId)
    return data
  }

  // Handle nested grouping with composite keys
  let updatedItem: T
  if (nestedGrouping?.enabled && targetGroupKey.includes(nestedGrouping.separator)) {
    const parts = targetGroupKey.split(nestedGrouping.separator)
    
    if (parts.length !== 2) {
      console.error('❌ Invalid composite key format:', targetGroupKey)
      return data
    }
    
    const [primaryValue, secondaryValue] = parts
    
    // Update both primary and secondary fields
    updatedItem = {
      ...data[itemIndex],
      [nestedGrouping.primaryKey]: primaryValue,
      [nestedGrouping.secondaryKey]: secondaryValue
    }
    
    console.log('✅ NESTED GROUP CHANGE:', {
      itemId,
      primary: { from: data[itemIndex][nestedGrouping.primaryKey], to: primaryValue },
      secondary: { from: data[itemIndex][nestedGrouping.secondaryKey], to: secondaryValue }
    })
  } else {
    // Single-level grouping - update only the groupByKey field
    updatedItem = {
      ...data[itemIndex],
      [groupByKey]: targetGroupKey
    }
    
    console.log('✅ GROUP CHANGE:', {
      itemId,
      from: data[itemIndex][groupByKey],
      to: targetGroupKey
    })
  }

  // Create new data array with updated item
  const updatedData = [...data]
  updatedData[itemIndex] = updatedItem

  return updatedData
}
