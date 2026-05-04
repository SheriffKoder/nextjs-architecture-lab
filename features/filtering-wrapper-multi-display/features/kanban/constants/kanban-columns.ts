/**
 * Kanban Column Configuration Constants
 * 
 * Purpose: Defines filterable and searchable column configuration for Kanban component
 * Used in: page.tsx for filtering and search functionality
 * Why: Provides static column configuration with searchable fields for PillFilter integration
 * 
 * Column Index:
 * - id: Unique identifier (not filterable/searchable)
 * - status: Column grouping key (filterable, not searchable)
 * - summary: Task description (filterable, searchable)
 * - created_at: Creation date (filterable, searchable)
 * - priority: Priority level (filterable, searchable)
 * 
 * Steps:
 * 1. Define column structure matching TableColumn interface
 * 2. Mark which columns are filterable
 * 3. Mark which columns are searchable for global search
 * 4. Set field types for proper filtering (string, number, date)
 */

import { SearchableColumn } from '../../../types/search/search-types'

/**
 * Kanban column configuration for filtering and search
 * Maps Kanban item fields to filterable/searchable columns
 * 
 * @example
 * // Filter by priority: ['high', 'medium']
 * // Search for 'authentication' in summary field
 * // Filter by date range for created_at
 */

export const kanbanColumns: SearchableColumn<any>[] = [
  {
    key: 'summary',
    name: 'Summary',
    filterable: true,
    isSearchable: true, // Include in global search
    sortable: false
  },
  {
    key: 'priority',
    name: 'Priority',
    filterable: true,
    isSearchable: true, // Include in global search
    sortable: false
  },
  {
    key: 'created_at',
    name: 'Created At',
    filterable: true,
    isDateField: true, // Enable date range filtering
    isSearchable: false, // Dates typically not searched
    sortable: false
  },
  {
    key: 'status',
    name: 'Status',
    filterable: true,
    isSearchable: false, // Status is used for column grouping, not search
    sortable: false
  }
]

