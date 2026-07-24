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

import { useReducer, useMemo, useEffect } from 'react'
import type React from 'react'
import {
  SubHeadingsDragState,
  SubHeadingsDragAction,
} from '../types'
import type {
  SubheadingsBoardState,
  SubheadingsBoardAction,
  SubheadingsUpdateContext,
} from '../types'
import {
  adjustInsertIndexAfterSameGroupRemoval,
  isSameGroupManualSortNoOp,
} from '../utils/insert-index-from-pointer'

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

function flattenGroupedData<T>(grouped: Record<string, T[]>): T[] {
  return Object.values(grouped).flat()
}

/** Split on first separator only so values may contain the separator in theory (avoid ambiguous multi-split). */
function parseCompositeGroupKey(
  targetGroup: string,
  separator: string
): { primary: string; secondary: string } | null {
  const i = targetGroup.indexOf(separator)
  if (i <= 0 || i + separator.length >= targetGroup.length) return null
  return {
    primary: targetGroup.slice(0, i),
    secondary: targetGroup.slice(i + separator.length),
  }
}

export function buildItemAfterManualSubheadingsDrop<T extends Record<string, unknown>>(
  draggedItem: T,
  targetGroup: string,
  groupByKey: string,
  nestedGrouping?: {
    enabled: boolean
    primaryKey: string
    secondaryKey: string
    separator: string
  }
): T {
  if (nestedGrouping?.enabled) {
    const parsed = parseCompositeGroupKey(targetGroup, nestedGrouping.separator)
    if (parsed) {
      return {
        ...draggedItem,
        [nestedGrouping.primaryKey]: parsed.primary,
        [nestedGrouping.secondaryKey]: parsed.secondary,
      } as T
    }
    return { ...draggedItem } as T
  }
  return {
    ...draggedItem,
    [groupByKey]: targetGroup,
  } as T
}

function subheadingsBoardReducer<T>(
  state: SubheadingsBoardState<T>,
  action: SubheadingsBoardAction,
  groupByKey: string,
  idKey: string,
  onItemUpdate?: (context: SubheadingsUpdateContext<T>) => void | Promise<void>,
  nestedGrouping?: {
    enabled: boolean
    primaryKey: string
    secondaryKey: string
    separator: string
  }
): SubheadingsBoardState<T> {
  switch (action.type) {
    case 'DRAG_START': {
      const { itemId, groupKey, rowIndex } = action.payload
      return {
        ...state,
        activeId: String(itemId),
        dragSource: { itemId, groupKey, rowIndex },
        virtualPlaceholder: null,
      }
    }

    case 'DRAG_OVER': {
      const { groupKey, insertIndex } = action.payload
      if (
        state.virtualPlaceholder &&
        state.virtualPlaceholder.groupKey === groupKey &&
        state.virtualPlaceholder.insertIndex === insertIndex
      ) {
        return state
      }
      return {
        ...state,
        virtualPlaceholder: {
          groupKey,
          insertIndex,
          itemId: state.activeId || '',
        },
      }
    }

    case 'CLEAR_VIRTUAL_PLACEHOLDER':
      if (state.virtualPlaceholder === null) return state
      return { ...state, virtualPlaceholder: null }

    case 'DRAG_END': {
      const { targetGroup, targetInsertIndex: rawInsert, manualSorting } =
        action.payload

      if (!state.dragSource) {
        return {
          ...state,
          activeId: null,
          dragSource: null,
          virtualPlaceholder: null,
        }
      }

      const sourceGroup = state.dragSource.groupKey
      const sourceRow = state.dragSource.rowIndex
      const sourceItems = state.groupedData[sourceGroup]
      const draggedItem = sourceItems?.[sourceRow]

      if (!draggedItem) {
        return {
          ...state,
          activeId: null,
          dragSource: null,
          virtualPlaceholder: null,
        }
      }

      if (
        isSameGroupManualSortNoOp(
          state.groupedData,
          idKey,
          sourceGroup,
          sourceRow,
          targetGroup,
          rawInsert
        )
      ) {
        return {
          ...state,
          activeId: null,
          dragSource: null,
          virtualPlaceholder: null,
        }
      }

      const newGroupedData = { ...state.groupedData }
      newGroupedData[sourceGroup] = [...(state.groupedData[sourceGroup] ?? [])]
      newGroupedData[sourceGroup].splice(sourceRow, 1)

      if (!newGroupedData[targetGroup]) {
        newGroupedData[targetGroup] = []
      } else {
        newGroupedData[targetGroup] = [...newGroupedData[targetGroup]]
      }

      let insertIndex = rawInsert
      if (sourceGroup === targetGroup) {
        insertIndex = adjustInsertIndexAfterSameGroupRemoval(rawInsert, sourceRow)
      }

      const targetLen = newGroupedData[targetGroup].length
      insertIndex = Math.max(0, Math.min(insertIndex, targetLen))

      newGroupedData[targetGroup].splice(insertIndex, 0, draggedItem)

      const updatedItem = buildItemAfterManualSubheadingsDrop(
        draggedItem as T & Record<string, unknown>,
        targetGroup,
        groupByKey,
        nestedGrouping
      ) as T
      newGroupedData[targetGroup][insertIndex] = updatedItem

      if (manualSorting) {
        newGroupedData[sourceGroup].forEach((item, i) => {
          ;(item as Record<string, unknown>).manual_sorting = i
        })
        newGroupedData[targetGroup].forEach((item, i) => {
          ;(item as Record<string, unknown>).manual_sorting = i
        })
      }

      if (onItemUpdate) {
        const ctx: SubheadingsUpdateContext<T> = {
          data: flattenGroupedData(newGroupedData),
          groupedData: newGroupedData,
          sourceGroup,
          targetGroup,
        }
        queueMicrotask(() => {
          Promise.resolve(onItemUpdate(ctx)).catch((err) => {
            console.error('Subheadings onItemUpdate error:', err)
          })
        })
      }

      return {
        ...state,
        groupedData: newGroupedData,
        activeId: null,
        dragSource: null,
        virtualPlaceholder: null,
      }
    }

    case 'DRAG_CANCEL':
      return {
        ...state,
        activeId: null,
        dragSource: null,
        virtualPlaceholder: null,
      }

    case 'UPDATE_DATA':
      return {
        ...state,
        groupedData: action.payload.groupedData as Record<string, T[]>,
      }

    default:
      return state
  }
}

export function useSubheadingsReducerState<T>(
  initialGroupedData: Record<string, T[]>,
  groupByKey: string,
  isManualOnChangeRef: React.MutableRefObject<boolean> | undefined,
  onItemUpdate?: (context: SubheadingsUpdateContext<T>) => void | Promise<void>,
  idKey = 'id',
  nestedGrouping?: {
    enabled: boolean
    primaryKey: string
    secondaryKey: string
    separator: string
  }
) {
  const reducerWithCallback = useMemo(
    () => (state: SubheadingsBoardState<T>, action: SubheadingsBoardAction) =>
      subheadingsBoardReducer(
        state,
        action,
        groupByKey,
        idKey,
        onItemUpdate,
        nestedGrouping
      ),
    [groupByKey, idKey, onItemUpdate, nestedGrouping]
  )

  const initialState: SubheadingsBoardState<T> = useMemo(
    () => ({
      groupedData: initialGroupedData,
      activeId: null,
      dragSource: null,
      virtualPlaceholder: null,
    }),
    [initialGroupedData]
  )

  const [state, dispatch] = useReducer(reducerWithCallback, initialState)

  useEffect(() => {
    if (isManualOnChangeRef?.current) {
      isManualOnChangeRef.current = false
      return
    }
    dispatch({
      type: 'UPDATE_DATA',
      payload: { groupedData: initialGroupedData as Record<string, unknown[]> },
    })
  }, [initialGroupedData, isManualOnChangeRef])

  return { state, dispatch }
}
