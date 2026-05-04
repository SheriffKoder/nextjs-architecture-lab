/**
 * SubHeadings Drag and Drop Hook
 * 
 * Purpose: Manages drag and drop state and handlers for SubHeadings container
 * Used in: SubHeadingsContainer component
 * Similar to: use-kanban-dnd.ts
 * 
 * Features:
 * - Configures drag sensors
 * - Handles drag start, drag over, drag end events
 * - Manages drag state
 */

import { useState } from 'react'
import { 
  DragStartEvent, 
  DragOverEvent, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core'
import { SubHeadingsDragState, SubHeadingsDragAction } from '../types'

export interface DragEndResult {
  itemId: string | number
  targetGroupKey: string
  dragSource: { itemId: string | number; groupKey: string; rowIndex: number } | null
}

export interface UseSubHeadingsDndReturn {
  sensors: ReturnType<typeof useSensors>
  dragState: SubHeadingsDragState
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => DragEndResult | null
  handleDragCancel: () => void
}

/**
 * Custom hook for SubHeadings drag and drop functionality
 * 
 * @returns Drag and drop handlers and state
 */
export function useSubHeadingsDnd(): UseSubHeadingsDndReturn {
  const [dragState, setDragState] = useState<SubHeadingsDragState>({
    activeId: null,
    dragSource: null,
    overId: null
  })

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  )

  /**
   * Handle drag start event
   * Stores the source position (group and row index)
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const itemId = active.id as string | number
    
    // Extract drag source from active data
    const dragSource = active.data.current as {
      groupKey: string
      rowIndex: number
    } | null

    if (!dragSource) {
      console.error('❌ No drag source data found')
      return
    }

    console.log('🚀 DRAG START:', {
      itemId,
      groupKey: dragSource.groupKey,
      rowIndex: dragSource.rowIndex
    })

    setDragState({
      activeId: String(itemId),
      dragSource: {
        itemId,
        groupKey: dragSource.groupKey,
        rowIndex: dragSource.rowIndex
      },
      overId: null
    })
  }

  /**
   * Handle drag over event
   * Updates the overId to track which drop zone is being hovered
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    
    if (!over) {
      setDragState(prev => ({ ...prev, overId: null }))
      return
    }

    setDragState(prev => ({
      ...prev,
      overId: String(over.id)
    }))
  }

  /**
   * Handle drag end event
   * Returns drop information for processing
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    console.log('🎯 DRAG END:', {
      active: active.id,
      over: over?.id,
      hasOver: !!over
    })

    // Reset state
    setDragState({
      activeId: null,
      dragSource: null,
      overId: null
    })

    // Return drop information if valid
    if (!over) {
      console.log('❌ No drop target found')
      return null
    }

    return {
      itemId: active.id as string | number,
      targetGroupKey: String(over.id),
      dragSource: dragState.dragSource
    }
  }

  /**
   * Handle drag cancel event
   * Resets drag state when drag is cancelled
   */
  const handleDragCancel = () => {
    console.log('❌ DRAG CANCELED')
    setDragState({
      activeId: null,
      dragSource: null,
      overId: null
    })
  }

  return {
    sensors,
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  }
}
