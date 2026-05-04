/**
 * Development Kanban Configuration Utilities
 * 
 * Purpose: Provides configuration and data transformation utilities for Development Kanban view
 * Used in: app/development/kanban/page.tsx
 * Why: Separates Kanban configuration logic from page component for reusability and maintainability
 * 
 * Function Index:
 * - getDevelopmentKanbanColumns: Returns filter/search column configuration
 * - getDevelopmentKanbanStatusColumns: Returns status column configuration for Kanban board
 * - getDevelopmentSortableColumns: Returns sortable column keys for Kanban sorting
 * 
 * Features:
 * - Column configuration for filtering and search
 * - Status column definitions
 * - Sortable column definitions
 * 
 * Steps:
 * 1. Return column configurations for filtering and board display
 * 2. Return sortable column keys
 */

import type { ColumnConfig } from './types/kanban-types'
import type { SearchableColumn } from '../../types/search/search-types'

//////////////////////////////////
// Column Configurations
//////////////////////////////////

/**
 * Kanban column configuration for filtering and search
 * Includes: summary, priority, created_at, status
 * 
 * @returns Array of SearchableColumn configurations for filtering and search
 */
export function getDevelopmentKanbanColumns(): SearchableColumn<any>[] {
  return [
    {
      key: 'summary',
      name: 'Summary',
      filterable: true,
      isSearchable: true,
      sortable: false
    },
    {
      key: 'priority',
      name: 'Priority',
      filterable: true,
      isSearchable: true,
      sortable: false
    },
    {
      key: 'created_at',
      name: 'Created At',
      filterable: true,
      isDateField: true,
      isSearchable: false,
      sortable: false
    },
    {
      key: 'status',
      name: 'Status',
      filterable: true,
      isSearchable: false,
      sortable: false
    }
  ]
}

/**
 * Kanban status column configuration
 * Defines the columns that will appear in the Kanban board
 * 
 * @returns Array of ColumnConfig for Kanban board status columns
 */
export function getDevelopmentKanbanStatusColumns(): ColumnConfig[] {
  return [
    { label: 'To Do', key: 'todo' },
    { label: 'In Progress', key: 'in-progress' },
    { label: 'Review', key: 'review' },
    { label: 'Done', key: 'done' }
  ]
}

/**
 * Get sortable column keys for development Kanban
 * Defines which columns should be available for sorting
 * 
 * @returns Array of column keys that can be used for sorting
 */
export function getDevelopmentSortableColumns(): string[] {
  return [
    'summary',
    'priority',
    'created_at',
    'status'
  ]
}

