/**
 * Validate Filter Utility
 * 
 * Purpose: Validate filter AST structure
 * Used in: Backend filter processing
 * Why: Ensures filter structure is valid before processing
 */

import type { FilterNode, FilterGroup, FilterCondition } from '../types/filter'

/**
 * Validate filter node structure
 * WHY: Ensure filter AST is valid before processing
 * HOW: Recursively check node structure and required fields
 * @param {FilterNode} node - Filter node to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateFilter(node: FilterNode | null): boolean {
  if (!node) return true // Empty filter is valid

  if (node.type === 'group') {
    const group = node as FilterGroup
    
    // Check required fields
    if (!group.id || !group.logic || !Array.isArray(group.children)) {
      return false
    }

    // Validate logic value
    if (group.logic !== 'and' && group.logic !== 'or') {
      return false
    }

    // Recursively validate children
    return group.children.every(child => validateFilter(child))
  }

  if (node.type === 'condition') {
    const condition = node as FilterCondition
    
    // Check required fields
    if (!condition.id || !condition.field || !condition.operator) {
      return false
    }

    // Value is optional (e.g., for is_empty operator)
    return true
  }

  return false
}
