'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'

export interface DroppableRowCellProps {
  cellId: string
  groupKey: string
  rowIndex: number
  children?: React.ReactNode
}

export function DroppableRowCell({
  cellId,
  groupKey,
  rowIndex,
  children,
}: DroppableRowCellProps) {
  const { setNodeRef } = useDroppable({
    id: cellId,
    data: { type: 'cell', groupKey, rowIndex, cellId },
  })

  return (
    <div ref={setNodeRef} className="w-full">
      {children}
    </div>
  )
}
