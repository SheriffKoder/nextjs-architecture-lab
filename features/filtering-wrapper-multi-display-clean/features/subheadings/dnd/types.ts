/**
 * Types for SubHeadings Drag and Drop functionality
 * 
 * Purpose: Define TypeScript interfaces and types for drag and drop operations
 * Used in: All DnD components and hooks
 */

/**
 * Drag source information - tracks where the drag started
 */
export interface DragSource {
  groupKey: string
  rowIndex: number
  itemId: string | number
}

/** Position of a row slot (`::` in cell ids so group keys may contain `-`). */
export interface SubheadingsDragPosition {
  groupKey: string
  rowIndex: number
  cellId: string
}

/** Context after a successful manual-sort drop (parent persists / refetches). */
export interface SubheadingsUpdateContext<T = unknown> {
  data: T[]
  groupedData: Record<string, T[]>
  sourceGroup: string
  targetGroup: string
}

/** Reducer state when manual row sorting owns `groupedData`. */
export interface SubheadingsBoardState<T = unknown> {
  groupedData: Record<string, T[]>
  activeId: string | null
  dragSource: DragSource | null
  virtualPlaceholder: {
    groupKey: string
    insertIndex: number
    itemId: string
  } | null
}

export type SubheadingsBoardAction =
  | {
      type: 'DRAG_START'
      payload: { itemId: string | number; groupKey: string; rowIndex: number }
    }
  | { type: 'DRAG_OVER'; payload: { groupKey: string; insertIndex: number } }
  | { type: 'CLEAR_VIRTUAL_PLACEHOLDER' }
  | {
      type: 'DRAG_END'
      payload: {
        itemId: string
        targetGroup: string
        targetInsertIndex: number
        manualSorting?: boolean
      }
    }
  | { type: 'DRAG_CANCEL' }
  | { type: 'UPDATE_DATA'; payload: { groupedData: Record<string, unknown[]> } }

/**
 * Drag state for SubHeadings DnD
 */
export interface SubHeadingsDragState<T = any> {
  activeId: string | null
  dragSource: DragSource | null
  overId: string | null
}

/**
 * Action types for drag and drop state management
 */
export type SubHeadingsDragAction =
  | { type: 'DRAG_START'; payload: { itemId: string | number; groupKey: string; rowIndex: number } }
  | { type: 'DRAG_OVER'; payload: { overId: string } }
  | { type: 'DRAG_END'; payload: { targetGroupKey: string } }
  | { type: 'DRAG_CANCEL' }

/**
 * Props for draggable row component
 */
export interface DraggableRowProps<T = any> {
  item: T
  itemId: string | number
  groupKey: string
  rowIndex: number
  children: React.ReactNode
  isSummaryRow?: boolean
  /** When true, render row content only (no drag grip, no useDraggable). */
  disableDrag?: boolean
  /** Manual subheadings sort: list row stays in place; {@link DragOverlay} shows the drag copy. */
  manualSorting?: boolean
}

/**
 * Props for droppable group component
 */
export interface DroppableGroupProps {
  groupKey: string
  children: React.ReactNode
  isExpanded?: boolean
}
