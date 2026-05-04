/**
 * Kanban Drag and Drop Hook
 * 
 * Purpose: Manages drag and drop event handlers for Kanban board
 * Used in: kanban-container.tsx
 * Why: Centralizes DND logic and integrates with @dnd-kit sensors
 * 
 * Function Index:
 * - useKanbanDnd: Hook that provides DND sensors and event handlers
 * 
 * Event Flow:
 * 1. onDragStart: User starts dragging a card
 * 2. onDragOver: User hovers over a drop zone (updates virtual placeholder)
 * 3. onDragEnd: User drops the card (updates data)
 * 4. onDragCancel: User cancels drag (ESC key or invalid drop)
 * 
 * Steps:
 * 1. Setup @dnd-kit sensors with activation distance
 * 2. Create event handlers that dispatch to reducer
 * 3. Parse cell IDs to extract position data
 * 4. Return sensors and handlers
 */

import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import { parseCellId, findItemPosition } from '../../utils/dnd/position-calculator'
import { DRAG_ACTIVATION_DISTANCE } from '../../constants/kanban-constants'

//////////////////////////////////
// Kanban DND Hook
//////////////////////////////////

/**
 * Custom hook for Kanban drag and drop functionality
 * Provides sensors and event handlers for @dnd-kit
 * 
 * @param dispatch - Reducer dispatch function
 * @param groupedData - Current grouped data
 * @param cardKey - Property name for card unique ID
 * @returns Sensors and event handlers
 * 
 * @example
 * const { sensors, handleDragStart, handleDragOver, handleDragEnd } = 
 *   useKanbanDnd(dispatch, state.groupedData, 'id')
 */
export function useKanbanDnd(
  dispatch: React.Dispatch<any>,
  groupedData: Record<string, any[]>,
  cardKey: string,
  manualSorting?: boolean
) {
  //////////////////////////////////
  // Setup sensors with activation constraint
  //////////////////////////////////
  
  /**
   * Configure pointer sensor with activation distance
   * Prevents accidental drags on click
   * 
   * WHY: Without activation distance, any click would trigger drag
   * HOW: Requires 8px movement before drag starts
   * IMPACT: Better UX - users can click cards without dragging
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE
      }
    })
  )
  
  //////////////////////////////////
  // Handle drag start
  //////////////////////////////////
  
  /**
   * Handles drag start event
   * Dispatches DRAG_START action to mark item as active
   * 
   * @param event - DragStartEvent from @dnd-kit
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const itemId = String(active.id)
    
    console.log('🚀 DRAG START:', { itemId, activeData: active.data.current })
    
    // Find item's current position
    const position = findItemPosition(itemId, groupedData, cardKey)
    
    if (!position) {
      console.error('❌ Could not find position for dragged item:', itemId)
      return
    }
    
    // Dispatch drag start action
    dispatch({
      type: 'DRAG_START',
      payload: {
        itemId,
        sourceColumn: position.columnKey,
        sourceRow: position.rowIndex
      }
    })
  }
  
  //////////////////////////////////
  // Handle drag over
  //////////////////////////////////
  
  /**
   * Handles drag over event (hovering over drop zones)
   * Dispatches DRAG_OVER action to update virtual placeholder
   * 
   * @param event - DragOverEvent from @dnd-kit
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    
    // If not hovering over a drop zone, ignore
    if (!over) {
      return
    }
    
    const cellId = String(over.id)
    
    console.log('📍 DRAG OVER:', { cellId, overData: over.data.current })
    
    // Parse cell ID to get position
    const position = parseCellId(cellId)
    
    if (!position) {
      console.error('❌ Invalid cell ID:', cellId)
      return
    }
    
    // Dispatch drag over action to update virtual placeholder
    dispatch({
      type: 'DRAG_OVER',
      payload: {
        columnKey: position.columnKey,
        rowIndex: position.rowIndex
      }
    })
  }
  
  //////////////////////////////////
  // Handle drag end
  //////////////////////////////////
  
  /**
   * Handles drag end event (drop or cancel)
   * Dispatches DRAG_END action to move item to new position
   * 
   * @param event - DragEndEvent from @dnd-kit
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    const itemId = String(active.id)
    
    console.log('🎯 DRAG END:', {
      itemId,
      over: over?.id,
      hasValidDrop: !!over
    })
    
    // If no valid drop target, cancel drag
    if (!over) {
      console.log('❌ No valid drop target - canceling drag')
      dispatch({ type: 'DRAG_CANCEL' })
      return
    }
    
    const cellId = String(over.id)
    
    // Parse target cell ID
    const targetPosition = parseCellId(cellId)
    
    if (!targetPosition) {
      console.error('❌ Invalid target cell ID:', cellId)
      dispatch({ type: 'DRAG_CANCEL' })
      return
    }
    
    // Find source position
    const sourcePosition = findItemPosition(itemId, groupedData, cardKey)
    
    if (!sourcePosition) {
      console.error('❌ Could not find source position:', itemId)
      dispatch({ type: 'DRAG_CANCEL' })
      return
    }
    
    console.log('✅ DROP SUCCESS:', {
      item: itemId,
      from: `${sourcePosition.columnKey}[${sourcePosition.rowIndex}]`,
      to: `${targetPosition.columnKey}[${targetPosition.rowIndex}]`
    })
    
    // Dispatch drag end action
    dispatch({
      type: 'DRAG_END',
      payload: {
        itemId,
        targetColumn: targetPosition.columnKey,
        targetRow: targetPosition.rowIndex,
        manualSorting
      }
    })
  }
  
  //////////////////////////////////
  // Handle drag cancel (ESC key)
  //////////////////////////////////
  
  /**
   * Handles drag cancel event
   * User pressed ESC or drag was cancelled
   */
  const handleDragCancel = () => {
    console.log('❌ DRAG CANCELED')
    dispatch({ type: 'DRAG_CANCEL' })
  }
  
  return {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  }
}

