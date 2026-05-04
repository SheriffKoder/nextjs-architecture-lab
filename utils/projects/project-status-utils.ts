/**
 * Project Status Utility Functions
 * 
 * Purpose: Provides utility functions for project status colors and display names
 * Used in: Kanban project card templates
 * Why: Centralizes project status styling and naming logic
 */

import { ProjectStatusEnum } from '@/lib/constants'

/**
 * Get color classes for a project status badge
 * @param status - The project status value
 * @returns Tailwind CSS classes for the status badge
 */
export function getProjectStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase().trim()
  
  switch (normalizedStatus) {
    case ProjectStatusEnum.ACTIVE_CONSTRUCTION:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case ProjectStatusEnum.SOLD:
      return 'bg-green-100 text-green-800 border-green-200'
    case ProjectStatusEnum.FOR_SALE:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case ProjectStatusEnum.PENDING_PURCHASE:
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case ProjectStatusEnum.RENTAL_PROPERTIES:
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get display name for a project status
 * @param status - The project status value
 * @returns Human-readable display name
 */
export function getProjectStatusDisplayName(status: string): string {
  const normalizedStatus = status.toLowerCase().trim()
  
  switch (normalizedStatus) {
    case ProjectStatusEnum.ACTIVE_CONSTRUCTION:
      return 'Active Construction'
    case ProjectStatusEnum.SOLD:
      return 'Sold'
    case ProjectStatusEnum.FOR_SALE:
      return 'For Sale'
    case ProjectStatusEnum.PENDING_PURCHASE:
      return 'Pending Purchase'
    case ProjectStatusEnum.RENTAL_PROPERTIES:
      return 'Rental Properties'
    default:
      // Capitalize first letter and replace underscores with spaces
      return status
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
  }
}
