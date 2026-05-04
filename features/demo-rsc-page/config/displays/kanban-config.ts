/**
 * Kanban View Configuration
 * 
 * Purpose: Configuration for kanban board view of rental cars
 * Used in: demo-rsc-content.tsx
 * Why: Groups rental cars by status in a kanban board layout
 */

import type { ColumnConfig } from '@/features/filtering-wrapper-multi-display-clean/features/kanban/types/kanban-types'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'

/**
 * Kanban configuration for rental cars
 * Groups cars by status (available, rented, maintenance, reserved)
 */
export const kanbanConfig = {
  columnKey: 'status',
  cardKey: 'id',
  cardTitle: 'model',
  cardContent: 'make',
  dateKey: undefined, // No date field in rental cars
  minCards: 0,
  hideEmptyColumns: false,
  manualSorting: false,
  sortableColumns: ['model', 'make', 'year', 'location', 'mileage', 'pricePerDay'],
  columns: [
    {
      label: 'Available',
      key: 'available',
      headerColors: 'bg-green-500/20 text-green-700 border-green-400/50 dark:bg-green-500/30 dark:text-green-300 dark:border-green-400/60'
    },
    {
      label: 'Rented',
      key: 'rented',
      headerColors: 'bg-blue-500/20 text-blue-700 border-blue-400/50 dark:bg-blue-500/30 dark:text-blue-300 dark:border-blue-400/60'
    },
    {
      label: 'Maintenance',
      key: 'maintenance',
      headerColors: 'bg-orange-500/20 text-orange-700 border-orange-400/50 dark:bg-orange-500/30 dark:text-orange-300 dark:border-orange-400/60'
    },
    {
      label: 'Reserved',
      key: 'reserved',
      headerColors: 'bg-purple-500/20 text-purple-700 border-purple-400/50 dark:bg-purple-500/30 dark:text-purple-300 dark:border-purple-400/60'
    }
  ] as ColumnConfig[],
  kanbanDragEnd: (updatedData: RentalCarTableItem[]) => {
    console.log('Kanban drag ended:', updatedData)
    // In real app, this would persist the status change
  },
  handleCardActions: (action: string, data: RentalCarTableItem) => {
    console.log('Kanban card action:', action, data)
    // In real app, this would handle card actions
  },
  onItemUpdate: undefined, // No server-side update for demo
  loadingItemIds: undefined,
}
