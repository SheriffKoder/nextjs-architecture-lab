/**
 * Kanban Container Component
 * 
 * Purpose: Main Kanban board component with drag-and-drop functionality
 * Used in: app/development/kanban/page.tsx
 * Why: Provides complete Kanban board with columns, cards, sorting, and DND
 * 
 * Function Index:
 * - KanbanContainer: Main component orchestrating all Kanban functionality
 * - determineColumns: Auto-generates or uses provided column configuration
 * - handleDragEnd: Processes drop events and updates parent component
 * 
 * Features:
 * - Controlled component (data managed by parent)
 * - Drag and drop cards between columns
 * - Column sorting with toggle direction
 * - Virtual placeholder for drop preview
 * - Customizable card and header templates
 * - Auto or manual column configuration
 * 
 * Example Input:
 * data = [
 *   { id: '1', status: 'todo', summary: 'Task 1', created_at: '2024-11-01' },
 *   { id: '2', status: 'done', summary: 'Task 2', created_at: '2024-11-02' }
 * ]
 * columnKey = 'status'
 * cardKey = 'id'
 * 
 * Example Output:
 * Renders Kanban board with columns: [todo, done]
 * Cards draggable between columns
 * onChange called with updated data on drop
 * 
 * Steps:
 * 1. Initialize state with useKanbanState hook
 * 2. Setup DND with useKanbanDnd hook
 * 3. Determine column configuration (auto or manual)
 * 4. Render column headers
 * 5. Render Kanban grid with DndContext
 * 6. Handle drop events and call onChange
 */

'use client'

import React, { useMemo, useEffect, useCallback, useRef } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { useKanbanState } from './hooks/use-kanban-state'
import { useKanbanDnd } from './hooks/dnd/use-kanban-dnd'
import KanbanGrid from './components/kanban-grid'
import ColumnHeader from './components/ui/column-header'
import DraggableCard from './components/dnd/draggable-card'
import { extractUniqueColumns, flattenGroupedData, groupDataByColumn } from './utils/group-data'
import type { KanbanContainerProps, ColumnConfig } from './types/kanban-types'

//////////////////////////////////
// Main Kanban Container Component
//////////////////////////////////

/**
 * Complete Kanban board component
 * Handles state, DND, and data updates
 * 
 * @param props - Component props (see KanbanContainerProps)
 */
const KanbanContainer = <T extends Record<string, any>>({
  filteredData, // Filtered data for display
  originalData, // Original unfiltered data for operations
  columnKey,
  cardKey,
  onChange,
  columns: providedColumns,
  cardTitle,
  cardContent,
  dateKey,
  minCards,
  maxCards,
  hideEmptyColumns = false,
  cardTemplate,
  columnHeaderTemplate,
  onCardAction,
  onItemUpdate,
  loadingItemIds,
  onAddItem,
  manualSorting,
  sortKey,
  sortDirection
}: KanbanContainerProps<T>) => {
  //////////////////////////////////
  // Initialize Kanban state with ORIGINAL data
  //////////////////////////////////
  
  /**
   * WHY: useKanbanState manages complex state with useReducer
   * HOW: Works with original unfiltered data for accurate operations
   * IMPACT: All operations (drag/drop) work on complete data, not filtered subset
   */
  //////////////////////////////////
  // Track manual onChange calls to prevent infinite loops
  //////////////////////////////////
  
  /**
   * WHY: useRef tracks if onChange was called manually (e.g., from handleAddItem)
   * HOW: Set to true before manual onChange, useEffect checks this flag
   * IMPACT: Prevents infinite loop when handleAddItem calls onChange
   */
  const isManualOnChangeRef = useRef(false)
  
  const { state, dispatch } = useKanbanState<T>(
    originalData, // Use original unfiltered data for state management
    columnKey,
    providedColumns,
    manualSorting,
    sortKey,
    sortDirection,
    isManualOnChangeRef, // Pass ref to prevent UPDATE_DATA dispatch
    onItemUpdate // Pass callback for item updates
  )
  
  //////////////////////////////////
  // Filter groupedData for display
  //////////////////////////////////
  
  /**
   * WHY: Filter state.groupedData to show only filtered items
   * HOW: Create a Set of filtered item IDs, then filter each column
   * IMPACT: Display shows filtered view, but operations work on original data
   */
  const displayGroupedData = useMemo(() => {
    // Create Set of filtered item IDs for fast lookup
    const filteredItemIds = new Set(filteredData.map((item: any) => String(item[cardKey])))
    
    // Filter each column to only include items that are in filtered data
    const filtered: Record<string, T[]> = {}
    for (const colKey in state.groupedData) {
      filtered[colKey] = state.groupedData[colKey].filter((item: any) => 
        filteredItemIds.has(String(item[cardKey]))
      )
    }
    
    return filtered
  }, [state.groupedData, filteredData, cardKey])
  
  //////////////////////////////////
  // Setup drag and drop handlers
  //////////////////////////////////
  
  /**
   * WHY: useKanbanDnd centralizes DND logic
   * HOW: Provides sensors and event handlers for @dnd-kit
   * IMPACT: Consistent drag behavior across components
   */
  const {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd: handleDragEndInternal,
    handleDragCancel
  } = useKanbanDnd(dispatch, state.groupedData, cardKey, manualSorting)
  
  //////////////////////////////////
  // Determine column configuration
  //////////////////////////////////
  
  /**
   * Auto-generate columns from data or use provided config
   * 
   * WHY: useMemo prevents recalculating on every render
   * HOW: Extracts unique column keys or uses provided columns
   * IMPACT: Better performance for large datasets
   */
  const allColumns: ColumnConfig[] = useMemo(() => {
    if (providedColumns && providedColumns.length > 0) {
      // Use provided column configuration
      return providedColumns
    }
    
    // Auto-generate columns from original data (not filtered)
    const uniqueKeys = extractUniqueColumns(originalData, columnKey)
    
    return uniqueKeys.map((key) => ({
      label: formatColumnLabel(key),
      key
    }))
  }, [providedColumns, originalData, columnKey])
  
  //////////////////////////////////
  // Filter columns if hideEmptyColumns is true
  //////////////////////////////////
  
  /**
   * Filter out empty columns if hideEmptyColumns is enabled
   * 
   * WHY: useMemo prevents recalculating on every render
   * HOW: Filters columns based on groupedData
   * IMPACT: Only shows columns with items
   */
  const columns: ColumnConfig[] = useMemo(() => {
    if (!hideEmptyColumns) {
      return allColumns
    }
    
    // Use displayGroupedData for visibility check (what user sees)
    return allColumns.filter((col) => {
      const items = displayGroupedData[col.key] || []
      return items.length > 0
    })
  }, [allColumns, hideEmptyColumns, displayGroupedData])
  
  //////////////////////////////////
  // Handle add item to column
  //////////////////////////////////
  
  /**
   * Creates a new item and adds it to the specified column
   * 
   * WHY: Allows users to add items directly from column headers
   * HOW: Generates new item with "No+fieldKey" values, adds to data
   * IMPACT: Updates parent data via onChange callback
   */
  const handleAddItem = useCallback((targetColumnKey: string) => {
    if (originalData.length === 0) {
      console.warn('Cannot create new item: no existing data to infer structure')
      return
    }
    
    // Get the first item to infer field structure from original data
    const sampleItem = originalData[0]
    const fields = Object.keys(sampleItem)
    
    // Create new item with null values (will display "No FieldKey" in card template)
    const newItem: any = {}
    fields.forEach((field) => {
      // Set column key to target column
      if (field === columnKey) {
        newItem[field] = targetColumnKey
      } else if (field === cardKey) {
        // Generate unique ID (timestamp + random) - will be replaced by API response
        newItem[field] = `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      } else if (field === 'created_at' || field === 'updated_at' || field.includes('date') || field.includes('Date')) {
        // Set date fields to current time
        newItem[field] = new Date().toISOString()
      } else {
        // Set other fields to null (card template will display "No FieldKey")
        newItem[field] = null
      }
    })
    
    // Add new item to original data (not filtered data)
    const updatedData = [...originalData, newItem]
    
    // Mark that this is a manual onChange call
    isManualOnChangeRef.current = true
    
    // Manually update the grouped data in state to include the new item
    // This ensures the UI updates immediately without waiting for the parent update
    const newGroupedData = groupDataByColumn(
      updatedData as T[],
      columnKey,
      manualSorting,
      sortKey,
      sortDirection
    )
    
    // Dispatch UPDATE_DATA to update state immediately
    dispatch({
      type: 'UPDATE_DATA',
      payload: { groupedData: newGroupedData }
    })
    
    // Call onChange with updated original data
    onChange(updatedData as T[])
    
    // Call onAddItem callback if provided (for API creation)
    if (onAddItem) {
      Promise.resolve(onAddItem(newItem as T)).catch((error) => {
        console.error('❌ Error in onAddItem callback:', error)
      })
    }
    
    // Reset flag after a short delay to allow state updates to complete
    // This ensures the flag is cleared after all effects have run
    setTimeout(() => {
      isManualOnChangeRef.current = false
    }, 0)
  }, [originalData, columnKey, cardKey, onChange, dispatch, manualSorting, sortKey, sortDirection, onAddItem])
  
  //////////////////////////////////
  // Handle drag end and update parent
  //////////////////////////////////
  
  /**
   * Wraps internal drag end handler to call onChange
   * Updates parent component with new data structure
   */
  const handleDragEnd = (event: any) => {
    // Call internal handler (updates state)
    handleDragEndInternal(event)
  }
  
  // Note: onChange effect has been removed to prevent infinite loops
  // Mutations (onItemUpdate, onAddItem) handle all data persistence
  // React Query's cache updates propagate back through initialData prop
  
  //////////////////////////////////
  // Get dragged card data for overlay
  //////////////////////////////////
  
  const draggedCard = useMemo(() => {
    if (!state.activeId) return null
    
    // Find the dragged card in grouped data
    for (const columnKey in state.groupedData) {
      const columnItems = state.groupedData[columnKey]
      const found = columnItems.find((item: any) => String(item[cardKey]) === state.activeId)
      if (found) return found
    }
    
    return null
  }, [state.activeId, state.groupedData, cardKey])
  
  //////////////////////////////////
  // Render component
  //////////////////////////////////
  
  return (
    <div className='w-full h-full flex flex-col'>
      
      {/* Column Headers */}
      <div
        className='w-full flex-shrink-0 grid'
        style={{
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          gap: '12px'
        }}
      >
          {columns.map((column) => {
            const itemCount = displayGroupedData[column.key]?.length || 0
          
    return (
            <ColumnHeader
              key={column.key}
              column={column}
              itemCount={itemCount}
              onAddItem={handleAddItem}
              columnHeaderTemplate={columnHeaderTemplate}
            />
          )
        })}
      </div>
      
      {/* Kanban Grid with DND Context */}
      <div className='w-full h-full pb-14'>
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
            <KanbanGrid
              groupedData={displayGroupedData}
              columns={allColumns}
              cardKey={cardKey}
              cardTitle={cardTitle}
              cardContent={cardContent}
              dateKey={dateKey}
              minCards={minCards}
              hideEmptyColumns={hideEmptyColumns}
              activeId={state.activeId}
              virtualPlaceholder={state.virtualPlaceholder}
              cardTemplate={cardTemplate}
              onCardAction={onCardAction}
              loadingItemIds={loadingItemIds}
            />
          
          {/* Drag Overlay - shows card being dragged */}
          <DragOverlay>
            {draggedCard && (
              <div className='opacity-90 cursor-grabbing'>
                <DraggableCard
                  data={draggedCard}
                  cardKey={cardKey}
                  cardTitle={cardTitle}
                  cardContent={cardContent}
                  dateKey={dateKey}
                  cardTemplate={cardTemplate}
                  onCardAction={onCardAction}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
            </div>
      
        </div>
    )
}

//////////////////////////////////
// Helper: Format column label
//////////////////////////////////

/**
 * Formats column key into readable label
 * Converts kebab-case to Title Case
 * 
 * @param key - Column key (e.g., 'in-progress')
 * @returns Formatted label (e.g., 'In Progress')
 */
function formatColumnLabel(key: string): string {
  return key
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default KanbanContainer
