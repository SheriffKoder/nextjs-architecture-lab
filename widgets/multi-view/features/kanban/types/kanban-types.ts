import React from 'react'

/**
 * Kanban Types
 * 
 * Purpose: TypeScript interfaces and types for Kanban component
 * Used in: All Kanban component files
 * Why: Provides type safety and IDE autocomplete for Kanban functionality
 * 
 * Type Index:
 * - ColumnConfig: Configuration for a single column
 * - KanbanState: State managed by useReducer
 * - KanbanAction: All possible reducer actions
 * - KanbanContainerProps: Main component props
 * - DragPosition: Position data for drag operations
 */

//////////////////////////////////
// Column Configuration Types
//////////////////////////////////

/**
 * Configuration for a single Kanban column
 * 
 * @property label - Display name for the column header
 * @property key - Unique identifier matching data[columnKey] values
 * @property headerColors - Optional color classes for column header styling
 */
export interface ColumnConfig {
  label: string
  key: string
  headerColors?: string // Tailwind classes for header background, text, and border colors
  icon?: React.ReactNode
}

//////////////////////////////////
// State Management Types
//////////////////////////////////

/**
 * Virtual placeholder shown during drag operations
 * Indicates where the dragged item will be placed
 */
export interface VirtualPlaceholder {
  columnKey: string
  rowIndex: number
  itemId: string
}

/**
 * Payload for `onItemUpdate` after a successful drop.
 * @see features/filtering-wrapper-multi-display/features/kanban/hooks/use-kanban-state.ts — built in `DRAG_END`
 */
export interface KanbanUpdateContext<T = any> {
  /** All items flattened after drop (column order follows `Object.keys` on grouped data). */
  data: T[]
  /** Full grouped board after drop — use with `buildManualSortUpsertRowsFromGrouped` in `utils/manual_sorting.ts`. */
  groupedData: Record<string, T[]>
  /** Column the card was dragged from (matches `dragSource` at drop time). */
  sourceColumn: string
  /** Column the card was dropped into. */
  targetColumn: string
}

/**
 * Main state managed by the Kanban reducer
 * 
 * @property groupedData - Items grouped by column key with array index as position
 * @property virtualPlaceholder - Shows drop indicator position during drag
 * @property activeId - ID of currently dragged item
 * @property dragSource - Source position of currently dragged item
 */
export interface KanbanState<T = any> {
  groupedData: Record<string, T[]>
  virtualPlaceholder: VirtualPlaceholder | null
  activeId: string | null
  dragSource: { columnKey: string; rowIndex: number } | null
}

//////////////////////////////////
// Reducer Action Types
//////////////////////////////////

/**
 * All possible actions for the Kanban reducer
 * 
 * - DRAG_START: User starts dragging an item
 * - DRAG_OVER: User hovers over a drop zone (updates virtual placeholder)
 * - DRAG_END: User drops the item (updates data)
 * - DRAG_CANCEL: User cancels the drag operation
 * - UPDATE_DATA: External data update (controlled component)
 */
export type KanbanAction =
  | { type: 'DRAG_START'; payload: { itemId: string; sourceColumn: string; sourceRow: number } }
  | { type: 'DRAG_OVER'; payload: { columnKey: string; rowIndex: number } }
  | { type: 'DRAG_END'; payload: { itemId: string; targetColumn: string; targetRow: number; manualSorting?: boolean } }
  | { type: 'DRAG_CANCEL' }
  | { type: 'UPDATE_DATA'; payload: { groupedData: Record<string, any[]> } }

//////////////////////////////////
// Component Props Types
//////////////////////////////////

/**
 * Props for the main KanbanContainer component
 * 
 * Required:
 * @property data - Array of items to display
 * @property columnKey - Property name that determines column placement
 * @property cardKey - Unique identifier property for each card
 * @property onChange - Callback when data changes (drag/drop, etc.)
 * 
 * Optional Configuration:
 * @property columns - Explicit column configuration (auto-detected if not provided)
 * @property cardTitle - Label for card header
 * @property cardContent - Property name to display in card body
 * @property dateKey - Property name for date display
 * @property minCards - Minimum rows to show per column
 * @property maxCards - Maximum cards per column (not yet implemented)
 * @property hideEmptyColumns - Whether to hide columns with no cards (default: false)
 * 
 * Templates:
 * @property cardTemplate - Custom card component
 * @property columnHeaderTemplate - Custom column header component
 * 
 * Actions:
 * @property onCardAction - Callback for card actions (edit, delete, click, etc.)
 */
export interface KanbanContainerProps<T = any> {
  // Required props
  filteredData: T[] // Filtered data for display (what user sees)
  originalData: T[] // Original unfiltered data (for operations)
  columnKey: string
  cardKey: string
  onChange: (updatedData: T[]) => void
  
  // Optional configuration
  columns?: ColumnConfig[]
  cardTitle?: string
  cardContent?: string
  dateKey?: string
  minCards?: number
  maxCards?: number
  hideEmptyColumns?: boolean
  manualSorting?: boolean // If true, calculate and update manualSorting field on drag/drop
  sortKey?: string // Sort key for column sorting (only applies if manualSorting is false)
  sortDirection?: 'asc' | 'desc' // Sort direction (default: 'asc')
  
  // Custom templates
  cardTemplate?: React.ComponentType<{ data: T; onAction?: (action: string) => void }>
  columnHeaderTemplate?: React.ComponentType<{ 
    column: ColumnConfig
    itemCount?: number
    onAddItem?: (columnKey: string) => void
  }>
  
  // Action handlers
  onCardAction?: (action: string, data: T) => void
  onItemUpdate?: (item: T, newColumnKey: string, newRowIndex: number) => void | Promise<void>
  onAddItem?: (item: T) => void | Promise<void>
  /** Item IDs (cardKey values) that are currently updating; show loading state on those cards */
  loadingItemIds?: string[]
}

//////////////////////////////////
// Drag and Drop Types
//////////////////////////////////

/**
 * Position data for drag operations
 * 
 * @property columnKey - Column identifier
 * @property rowIndex - Row position within column
 * @property cellId - Formatted cell ID (columnKey-rowIndex)
 */
export interface DragPosition {
  columnKey: string
  rowIndex: number
  cellId: string
}

/**
 * Data returned from drop operation
 * 
 * @property source - Original position
 * @property target - Drop target position
 * @property itemId - ID of dragged item
 */
export interface DropResult {
  source: DragPosition
  target: DragPosition
  itemId: string
}

