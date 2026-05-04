/**
 * Draggable Row Component
 * 
 * Purpose: Wraps table rows to make them draggable
 * Used in: SubHeadingsContainer for individual rows
 * 
 * Features:
 * - Makes rows draggable via grip icon
 * - Excludes summary rows from dragging
 * - Provides drag data to DnD system
 */

'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { DragGripIcon } from './drag-grip-icon'
import { DraggableRowProps } from '../types'

/**
 * Wraps a table row to make it draggable
 * 
 * @template T - The type of data items
 * @param props - Component props
 * @returns Draggable row wrapper
 */
export function DraggableRow<T = any>({
  item,
  itemId,
  groupKey,
  rowIndex,
  children,
  isSummaryRow = false,
  disableDrag = false,
  manualSorting = false,
}: DraggableRowProps<T>) {
  // Don't make summary rows draggable
  if (isSummaryRow) {
    return <>{children}</>
  }

  // Config-driven: no drag chrome (matches SubHeadingsContainer without DraggableRow)
  if (disableDrag) {
    return <>{children}</>
  }

  // Use draggable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: String(itemId),
    data: {
      item,
      groupKey,
      rowIndex,
      itemId
    },
    disabled: isSummaryRow
  })

  const style =
    manualSorting && isDragging
      ? { transform: 'none' as const, opacity: 0.35 }
      : transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            opacity: isDragging ? 0.5 : 1,
          }
        : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-stretch ${isDragging ? 'z-50' : ''}`}
    >
      {/* Grip icon - drag handle (sticky on x-axis, full height) */}
      <div
        {...listeners}
        {...attributes}
        className="flex-shrink-0 bg-[#F0F2F8] dark:bg-[#151519] self-stretch flex items-center justify-center"
        style={{
          // Sticky positioning to keep grip icon visible when scrolling horizontally
          position: 'sticky',
          left: 0,
          zIndex: 5,
          // Take full height of the row
          alignSelf: 'stretch',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <DragGripIcon isDragging={isDragging} />
      </div>
      
      {/* Row content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
