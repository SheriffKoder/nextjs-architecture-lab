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
}

/**
 * Props for droppable group component
 */
export interface DroppableGroupProps {
  groupKey: string
  children: React.ReactNode
  isExpanded?: boolean
}
