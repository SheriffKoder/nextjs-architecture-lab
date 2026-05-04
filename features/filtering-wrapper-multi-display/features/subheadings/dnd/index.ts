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
export { useSubHeadingsState, processGroupChange } from './hooks/use-subheadings-state'

// Components
export { DragGripIcon } from './components/drag-grip-icon'
export { DraggableRow } from './components/draggable-row'
export { DroppableGroup } from './components/droppable-group'

// Utils
export { parseGroupId, isValidGroupId, extractGroupKeyFromDropData } from './utils/parse-group-id'
