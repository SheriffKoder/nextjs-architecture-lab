/**
 * Generate Node ID Utility
 * 
 * Purpose: Generate unique IDs for filter nodes
 * Used in: Filter builder hook when creating new nodes
 * Why: Ensures each node has a unique identifier for manipulation
 */

let nodeIdCounter = 0

/**
 * Generate a unique node ID
 * WHY: Each node needs a unique identifier for finding/updating/removing
 * HOW: Combines timestamp with incrementing counter
 * @returns {string} Unique node ID
 */
export function generateNodeId(): string {
  return `node_${Date.now()}_${++nodeIdCounter}`
}
