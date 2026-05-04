/**
 * Droppable Group Component
 * 
 * Purpose: Wraps group containers to make them droppable zones
 * Used in: SubHeadingsContainer for group divs
 * 
 * Features:
 * - Makes groups droppable
 * - Provides visual feedback when dragging over
 * - Handles drop events
 */

'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { DroppableGroupProps } from '../types'

/**
 * Wraps a group container to make it droppable
 * 
 * @param props - Component props
 * @returns Droppable group wrapper
 */
export function DroppableGroup({
  groupKey,
  children,
  isExpanded = true
}: DroppableGroupProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: groupKey,
    data: {
      groupKey,
      type: 'group'
    }
  })

  return (
    <div
      ref={setNodeRef}
      className={`w-full transition-colors duration-200 ${
        isOver
          ? 'bg-tertiary/10 border-2 border-tertiary border-dashed'
          : ''
      }`}
    >
      {children}
    </div>
  )
}
