/**
 * SubHeadings Drag and Drop - Main Export
 * 
 * Purpose: Central export point for all DnD functionality
 * Used in: SubHeadingsContainer and other components
 */

// Types
export * from './types'

// Hooks
export { useSubHeadingsDnd } from './hooks/use-subheadings-dnd'
export type {
  DragEndResult,
  UseSubHeadingsDndConfig,
} from './hooks/use-subheadings-dnd'
export {
  useSubHeadingsState,
  processGroupChange,
  useSubheadingsReducerState,
  buildItemAfterManualSubheadingsDrop,
} from './hooks/use-subheadings-state'

// Components
export { DragGripIcon } from './components/drag-grip-icon'
export { DraggableRow } from './components/draggable-row'
export { DroppableGroup } from './components/droppable-group'
export { DroppableRowCell } from './components/droppable-row-cell'

// Utils
export { parseGroupId, isValidGroupId, extractGroupKeyFromDropData } from './utils/parse-group-id'
export { createCellId, parseCellId, findItemPosition } from './utils/position-calculator'
export {
  computeInsertIndexFromPointer,
  getPointerClientYFromDragEvent,
  adjustInsertIndexAfterSameGroupRemoval,
  isSameGroupManualSortNoOp,
} from './utils/insert-index-from-pointer'
export { SUBHEADINGS_DROP_PLACEHOLDER_HEIGHT } from './constants'
