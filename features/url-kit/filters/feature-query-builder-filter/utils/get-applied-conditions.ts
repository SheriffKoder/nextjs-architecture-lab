/**
 * Get applied condition IDs from URL filter
 * WHY: Track which conditions are currently applied to URL
 * HOW: Extract all condition IDs from the filter tree in URL
 */

import type { FilterNode, FilterCondition } from '../types/filter'

/**
 * Recursively collect all condition IDs from filter tree
 * WHY: Traverse nested groups to find all conditions
 * HOW: Recursively visit all nodes and collect condition IDs
 * @param {FilterNode | null} node - Filter node to traverse
 * @param {Set<string>} ids - Set to collect condition IDs
 */
function collectConditionIds(node: FilterNode | null, ids: Set<string>): void {
  if (!node) return

  if (node.type === 'condition') {
    ids.add(node.id)
  } else if (node.type === 'group') {
    node.children.forEach(child => collectConditionIds(child, ids))
  }
}

/**
 * Get set of applied condition IDs from URL filter
 * WHY: Know which conditions are currently in URL params
 * HOW: Parse filter from URL and collect all condition IDs
 * @param {FilterNode | null} urlFilter - Filter tree from URL
 * @returns {Set<string>} Set of condition IDs that are applied
 */
export function getAppliedConditionIds(urlFilter: FilterNode | null): Set<string> {
  const ids = new Set<string>()
  collectConditionIds(urlFilter, ids)
  return ids
}
