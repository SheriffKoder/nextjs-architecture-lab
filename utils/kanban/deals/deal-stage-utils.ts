/**
 * Deal Stage Utility Functions
 * 
 * Purpose: Provides utility functions for deal stage colors and display names
 * Used in: Kanban deal card templates
 * Why: Centralizes deal stage styling and naming logic
 */

/**
 * Get color classes for a deal stage badge
 * @param stage - The deal stage value
 * @returns Tailwind CSS classes for the stage badge
 */
export function getStageColor(stage: string): string {
  const normalizedStage = stage.toLowerCase().trim()
  
  switch (normalizedStage) {
    case 'prospecting':
    case 'qualification':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'proposal':
    case 'negotiation':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'closed-won':
    case 'won':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'closed-lost':
    case 'lost':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'on-hold':
    case 'paused':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get display name for a deal stage
 * @param stage - The deal stage value
 * @returns Human-readable display name
 */
export function getStageDisplayName(stage: string): string {
  const normalizedStage = stage.toLowerCase().trim()
  
  switch (normalizedStage) {
    case 'prospecting':
      return 'Prospecting'
    case 'qualification':
      return 'Qualification'
    case 'proposal':
      return 'Proposal'
    case 'negotiation':
      return 'Negotiation'
    case 'closed-won':
    case 'won':
      return 'Closed Won'
    case 'closed-lost':
    case 'lost':
      return 'Closed Lost'
    case 'on-hold':
      return 'On Hold'
    case 'paused':
      return 'Paused'
    default:
      // Capitalize first letter and replace underscores with spaces
      return stage
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
  }
}
