/**
 * Kanban Wrapper Component
 * 
 * Purpose: Wrapper component that provides sorting UI around KanbanContainer
 * Used in: app/development/kanban/page.tsx
 * Why: Separates Kanban UI concerns (sorting) from core Kanban functionality
 * 
 * Features:
 * - Sort controls with manual sorting toggle
 * - Controlled state management
 * - onChange and onCardAction handlers
 * - Accepts filtered data as prop (filtering handled externally)
 * 
 * Steps:
 * 1. Accept props for data, callbacks, and configuration
 * 2. Manage sort state
 * 3. Render sort controls and KanbanContainer
 */

'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import KanbanContainer from './kanban-container'
import SortControls from './components/ui/sort-controls'
import { getSortFields } from './utils/get-sort-fields'
import type { ColumnConfig } from './types/kanban-types'
import { ArrowDown01, ArrowDownNarrowWide } from 'lucide-react'

//////////////////////////////////
// Component Props
//////////////////////////////////

export interface KanbanWrapperProps<T extends Record<string, any> = Record<string, any>> {
  /**
   * Initial data array (unfiltered, for internal state management)
   */
  initialData: T[]
  
  /**
   * Filtered data array to display in kanban
   * If not provided, uses initialData
   */
  filteredData?: T[]
  
  /**
   * Callback when data is updated (called from handleDataChange)
   */
  onUpdate: (updatedData: T[]) => void
  
  /**
   * Callback when card actions are triggered
   */
  handleCardActions: (action: string, data: T) => void
  
  /**
   * Callback when item is updated via drag and drop
   * Called with the updated item, new column key, and new row index
   */
  onItemUpdate?: (item: T, newColumnKey: string, newRowIndex: number) => void | Promise<void>
  
  /**
   * Item IDs (cardKey values) that are currently updating; show loading state on those cards
   */
  loadingItemIds?: string[]
  
  /**
   * Callback when a new item is added to a column
   * Called with the new item data for API creation
   */
  onAddItem?: (item: T) => void | Promise<void>
  
  /**
   * Property name that determines column placement
   */
  columnKey: string
  
  /**
   * Unique identifier property for each card
   */
  cardKey: string
  
  /**
   * Label for card header
   */
  cardTitle?: string
  
  /**
   * Property name to display in card body
   */
  cardContent?: string
  
  /**
   * Property name for date display
   */
  dateKey?: string
  
  /**
   * Minimum rows to show per column
   */
  minCards?: number
  
  /**
   * Whether to hide columns with no cards
   */
  hideEmptyColumns?: boolean
  
  /**
   * Whether manual sorting is enabled
   */
  manualSorting?: boolean
  
  /**
   * Explicit column configuration
   */
  columns?: ColumnConfig[]
  
  /**
   * Custom card template component
   */
  cardTemplate?: React.ComponentType<any>
  
  /**
   * Custom column header template component
   */
  columnHeaderTemplate?: React.ComponentType<any>
  
  /**
   * Array of column keys that should be available for sorting
   * If not provided, all fields from data will be available for sorting
   */
  sortableColumns?: string[]
}

//////////////////////////////////
// Kanban Wrapper Component
//////////////////////////////////

export default function KanbanWrapper<T extends Record<string, any> = Record<string, any>>({
  initialData,
  filteredData: propFilteredData,
  onUpdate,
  handleCardActions,
  onItemUpdate,
  loadingItemIds,
  onAddItem,
  columnKey,
  cardKey,
  cardTitle,
  cardContent,
  dateKey,
  minCards,
  hideEmptyColumns = false,
  manualSorting: initialManualSorting = false,
  columns,
  cardTemplate,
  columnHeaderTemplate,
  sortableColumns
}: KanbanWrapperProps<T>) {
  //////////////////////////////////
  // Controlled state
  //////////////////////////////////
  
  /**
   * WHY: useState manages Kanban data in parent component
   * HOW: Kanban is controlled - parent owns data state
   * IMPACT: Parent can track changes and sync with backend/store
   */
  const [kanbanData, setKanbanData] = useState(initialData)
  
  /**
   * WHY: useRef tracks if we're currently updating from handleDataChange
   * HOW: Set to true when handleDataChange updates state, prevents sync effect from running
   * IMPACT: Prevents infinite loop when handleDataChange or handleAddItem updates kanbanData
   */
  const isInternalUpdateRef = useRef(false)
  
  /**
   * WHY: useRef tracks the last synced initialData to prevent unnecessary syncs
   * HOW: Stores a stringified, sorted list of IDs from the last successful sync
   * IMPACT: Allows comparison without reading from state, preventing dependency loops
   */
  const lastSyncedIdsRef = useRef<string>('')
  
  /**
   * WHY: useEffect syncs initialData prop changes to kanbanData state
   * HOW: When initialData prop changes (e.g., after query refetch or view switch), update local state
   * IMPACT: Ensures Kanban displays latest data from parent, especially after view switches
   * 
   * Note: Uses ref to track previous IDs to prevent infinite loops from array reference changes
   * The ref stores the IDs string from the last sync, so we can compare without reading state
   * 
   * Special handling: 
   * - Skips sync if we're in the middle of an internal update (from handleDataChange)
   * - Skips sync if IDs haven't actually changed (prevents loop from array reference changes)
   * - Only syncs when IDs actually change (items added/removed) or when initialData has more items
   */
  useEffect(() => {
    // Skip if this is an internal update from handleDataChange (drag-and-drop)
    // Reset flag immediately so next update (from API) can proceed
    if (isInternalUpdateRef.current) {
      console.log('⏭️ Skipping sync - internal update from drag/drop')
      isInternalUpdateRef.current = false
      return
    }
    
    // Skip if arrays are the same reference (no change)
    if (initialData === kanbanData) {
      return
    }
    
    // Get current IDs from kanbanData state for comparison
    const currentIds = new Set(kanbanData.map((item: any) => String(item[cardKey])))
    const newIds = new Set(initialData.map((item: any) => String(item[cardKey])))
    
    // Check if IDs are different (items added/removed)
    const idsChanged = currentIds.size !== newIds.size || 
      [...newIds].some(id => !currentIds.has(id)) ||
      [...currentIds].some(id => !newIds.has(id))
    
    // If IDs changed, always sync (new items added or removed)
    if (idsChanged) {
      console.log('🔄 Syncing - IDs changed (items added/removed):', {
        currentCount: kanbanData.length,
        newCount: initialData.length,
        currentIds: Array.from(currentIds).slice(0, 5),
        newIds: Array.from(newIds).slice(0, 5)
      })
      
      setKanbanData(initialData)
      
      // Update hash ref
      const newDataHash = JSON.stringify(
        initialData
          .map((item: any) => ({ id: item[cardKey], [columnKey]: item[columnKey] }))
          .sort((a, b) => String(a.id).localeCompare(String(b.id)))
      )
      lastSyncedIdsRef.current = newDataHash
      return
    }
    
    // If IDs are same, check if data content changed (e.g., status updates)
    const newDataHash = JSON.stringify(
      initialData
        .map((item: any) => ({ id: item[cardKey], [columnKey]: item[columnKey] }))
        .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    )
    
    // Skip if data hash hasn't changed (prevents loop from array reference changes)
    if (lastSyncedIdsRef.current === newDataHash) {
      return
    }
    
    // Data content changed (e.g., status update from another view)
    console.log('🔄 Syncing - data content changed')
    setKanbanData(initialData)
    lastSyncedIdsRef.current = newDataHash
  }, [initialData, cardKey, columnKey]) // kanbanData intentionally excluded - we use refs to prevent loops
  

  /**
   * WHY: useState manages manual sorting toggle
   * HOW: User toggles manual sort mode on/off
   * IMPACT: Controls whether manualSorting field is calculated and updated
   */
  const [manualSorting, setManualSorting] = useState(initialManualSorting)
  
  /**
   * WHY: useState manages sort key selection
   * HOW: User selects field from dropdown to sort columns
   * IMPACT: Controls which field is used for column sorting
   */
  const [sortKey, setSortKey] = useState<string | undefined>(undefined)
  
  /**
   * WHY: useState manages sort direction
   * HOW: User clicks arrow buttons to toggle direction
   * IMPACT: Controls sort direction (asc/desc), defaults to 'asc'
   */
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  /**
   * WHY: useMemo generates sort field config from data, filtered by sortableColumns
   * HOW: Uses utility function to extract fields and infer types, then filters by sortableColumns if provided
   * IMPACT: Provides only specified sortable fields with labels and type hints
   */
  const sortFields = useMemo(() => {
    const allSortFields = getSortFields(kanbanData as any[]);
    console.log('🔍 ALL SORT FIELDS:', allSortFields)
    
    // Filter by sortableColumns if provided
    let filteredFields = allSortFields
    if (sortableColumns && sortableColumns.length > 0) {
      filteredFields = allSortFields.filter(field => sortableColumns.includes(field.key))
      console.log('🔍 FILTERED SORT FIELDS:', filteredFields)
    }
    
    return filteredFields.map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type
    }))
  }, [kanbanData, sortableColumns])

  //////////////////////////////////
  // Display Data
  //////////////////////////////////

  /**
   * WHY: useMemo determines which data to display in kanban
   * HOW: Uses propFilteredData if provided, otherwise falls back to kanbanData
   * IMPACT: Allows parent component to control filtering externally
   */
  const displayData = useMemo(() => {
    return propFilteredData ?? kanbanData
  }, [propFilteredData, kanbanData])

  //////////////////////////////////
  // Handle data changes from Kanban
  //////////////////////////////////
  
  /**
   * Called when cards are moved between columns
   * Always updates original kanbanData (unfiltered) for backend sync
   * Filters persist because they're separate from data state
   * 
   * @param updatedData - New data after drag/drop operation (from filtered view)
   */
  const handleDataChange = (updatedData: T[]) => {
    console.log('📊 KANBAN DATA UPDATED:', updatedData)
    
    // Mark that this is an internal update to prevent sync effect from running
    isInternalUpdateRef.current = true
    
    // Update local state
    setKanbanData(updatedData)
    
    // Update the ref with data hash to prevent sync effect from running on next render
    const newDataHash = JSON.stringify(
      updatedData
        .map((item: any) => ({ id: item[cardKey], [columnKey]: item[columnKey] }))
        .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    )
    lastSyncedIdsRef.current = newDataHash
    
    // Call parent's onUpdate callback
    onUpdate(updatedData)
    
    // Reset the flag after a short delay to allow API refetch to sync
    // This ensures that when new items are created via API, the sync effect can run
    setTimeout(() => {
      isInternalUpdateRef.current = false
    }, 0)
    
    // Filters persist automatically because they're in separate state
  }

  //////////////////////////////////
  // Handle card actions
  //////////////////////////////////
  
  /**
   * Called when user interacts with a card
   * Delegates to parent's handleCardActions callback
   * 
   * @param action - Action type (e.g., 'edit', 'delete', 'click')
   * @param data - Card data
   */
  const handleCardAction = (action: string, data: T) => {
    handleCardActions(action, data)
  }

  return (

    <div className='w-full h-full flex flex-col'>

      <div className='hidden w-full overflow-y-hidden overflow-x-auto sticky top-0 h-auto z-50'>
        {/* Header with Sort and Manual Sort Controls */}
        <div className=' w-full min-w-[950px] sticky top-0 flex-row justify-end gap-4 flex-shrink-0 h-fit my-auto px-2 rounded-sm bg-black
        border-b border-border'>
          {/* Sort and Manual Sort Controls */}
          <div className='w-fit flex flex-row items-center justify-end gap-3 h-fit my-auto p-0 rounded-[18px] bg-black'>
            <SortControls
              fields={sortFields}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortKeyChange={(key) => setSortKey(key || undefined)}
              onSortDirectionChange={(dir) => setSortDirection(dir)}
              disabled={manualSorting}
            />
            <button
              onClick={() => setManualSorting(!manualSorting)}
              className={`py-2 px-4 rounded-md text-sm font-medium border border-gray-500 p-2 w-[150px] outline-none flex items-center justify-center gap-1 ${manualSorting ? 'bg-white text-blue-500 hover:bg-white/90' : 'bg-transparent text-gray-300 hover:bg-gray-100/20'}`}
            >
              <span className='text-sm font-medium'>Manual Sort</span>
              <span className='relative'>
                
                <ArrowDown01 className='w-4 h-4 mt-0' />
              
                {!manualSorting && (
                  <div className='h-full w-[1px] rounded-full rotate-45 -ml-[1px] bg-white absolute top-0 left-1/2 translate-x-[-50%]' />
                )}
              </span>

            </button>
          </div>
        </div>
      </div>

      <div className='w-full h-full flex flex-col overflow-x-auto'>
        <div className='w-full min-w-[1200px] h-full min-h-0 overflow-hidden'>
          <KanbanContainer
          filteredData={displayData}
          originalData={kanbanData}
          columnKey={columnKey}
          cardKey={cardKey}
          onChange={handleDataChange}
          onCardAction={handleCardAction}
          onItemUpdate={onItemUpdate}
          loadingItemIds={loadingItemIds}
          onAddItem={onAddItem}
          cardTitle={cardTitle}
          cardContent={cardContent}
          dateKey={dateKey}
          minCards={minCards}
          hideEmptyColumns={hideEmptyColumns}
          manualSorting={manualSorting}
          sortKey={sortKey}
          sortDirection={sortDirection}
          columns={columns}
          cardTemplate={cardTemplate}
          columnHeaderTemplate={columnHeaderTemplate}
          />
        </div>
      </div>
    </div>
  )
}

//////////////////////////////////
// Example Custom Card Template
//////////////////////////////////

/*
const CustomCardTemplate: React.FC<{ data: any; onAction?: (action: string) => void }> = ({ data, onAction }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className='w-full bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 p-4 shadow-md hover:shadow-lg transition-all duration-200'>
      <div className='flex items-start justify-between mb-3'>
        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getPriorityColor(data.priority)}`}>
          {data.priority?.toUpperCase()}
        </span>
        <span className='text-xs text-gray-400'>#{data.id}</span>
      </div>
      
      <h4 className='text-sm font-semibold text-gray-800 mb-2 leading-snug'>
        {data.summary}
      </h4>
      
      <div className='flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200'>
        <span>{new Date(data.created_at).toLocaleDateString()}</span>
        <div className='flex gap-2'>
          <button 
            onClick={() => onAction?.('edit')}
            className='text-blue-500 hover:text-blue-700'
          >
            Edit
          </button>
          <button 
            onClick={() => onAction?.('delete')}
            className='text-red-500 hover:text-red-700'
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Usage:
<KanbanContainer
  data={kanbanData}
  columnKey="status"
  cardKey="id"
  onChange={handleDataChange}
  cardTemplate={CustomCardTemplate}
  onCardAction={handleCardAction}
/>
*/

//////////////////////////////////
// Example Custom Column Header Template
//////////////////////////////////

/*
const CustomColumnHeaderTemplate: React.FC<{ 
  column: any; 
  onSort?: () => void; 
  sortDirection?: 'asc' | 'desc' 
}> = ({ column, onSort, sortDirection }) => {
  return (
    <div className='w-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 rounded-t-lg'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 rounded-full bg-white'></div>
          <h3 className='text-sm font-bold text-white uppercase tracking-wider'>
            {column.label}
          </h3>
        </div>
        
        {column.sortable && (
          <button
            onClick={onSort}
            className='text-white hover:text-blue-100 transition-colors'
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        )}
      </div>
    </div>
  )
}

// Usage:
<KanbanContainer
  data={kanbanData}
  columnKey="status"
  cardKey="id"
  onChange={handleDataChange}
  columnHeaderTemplate={CustomColumnHeaderTemplate}
/>
*/

// Note: This component is now a wrapper that accepts props
// Use it in page.tsx by passing all required configuration
