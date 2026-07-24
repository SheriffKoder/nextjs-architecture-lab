/**
 * Filter complete conditions from filter tree
 * WHY: Only sync complete conditions to URL
 * HOW: Recursively remove incomplete conditions and empty groups
 */

import type { FilterNode, FilterGroup, FilterCondition } from '../types/filter'
import { isConditionComplete } from './is-condition-complete'

/**
 * Filter out incomplete conditions from filter tree
 * WHY: Only apply complete conditions to URL parameters
 * HOW: Recursively traverse tree and remove incomplete conditions
 * @param {FilterNode | null} node - Filter node to filter
 * @returns {FilterNode | null} Filter tree with only complete conditions, or null if empty
 */
export function filterCompleteConditions(node: FilterNode | null): FilterNode | null {
  if (!node) return null

  if (node.type === 'condition') {
    // Only include complete conditions
    return isConditionComplete(node) ? node : null
  }

  if (node.type === 'group') {
    const group = node as FilterGroup
    
    // Filter children recursively
    const filteredChildren = group.children
      .map(child => filterCompleteConditions(child))
      .filter((child): child is FilterNode => child !== null)

    // Only return group if it has at least one child
    if (filteredChildren.length === 0) return null

    return {
      ...group,
      children: filteredChildren
    }
  }

  return null
}
