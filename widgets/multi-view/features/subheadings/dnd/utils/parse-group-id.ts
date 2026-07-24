/**
 * Parse Group ID Utility
 * 
 * Purpose: Utility functions for parsing and validating group IDs
 * Used in: Drag and drop event handlers
 * 
 * Features:
 * - Parse group IDs from drop events
 * - Validate group IDs
 * - Extract group key from drop data
 */

/**
 * Parse group key from drop target ID
 * 
 * @param dropTargetId - ID from drop event
 * @returns Group key or null if invalid
 */
export function parseGroupId(dropTargetId: string): string | null {
  // Group ID should be the groupKey itself
  // If it's prefixed with "group-", remove the prefix
  if (dropTargetId.startsWith('group-')) {
    return dropTargetId.replace('group-', '')
  }
  
  // Otherwise, assume it's the group key directly
  return dropTargetId
}

/**
 * Validate that a group ID is valid
 * 
 * @param groupId - Group ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidGroupId(groupId: string | null): boolean {
  return groupId !== null && groupId !== undefined && groupId !== ''
}

/**
 * Extract group key from drop event data
 * 
 * @param dropData - Data from drop event
 * @returns Group key or null if not found
 */
export function extractGroupKeyFromDropData(dropData: any): string | null {
  if (!dropData) {
    return null
  }

  // Check if data has groupKey directly
  if (dropData.groupKey) {
    return String(dropData.groupKey)
  }

  // Check if data has type and groupKey
  if (dropData.type === 'group' && dropData.groupKey) {
    return String(dropData.groupKey)
  }

  return null
}
