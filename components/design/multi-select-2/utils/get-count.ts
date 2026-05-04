/**
 * Count Utilities for Dropdown Items
 * 
 * Function flow:
 * This utility calculates the count indicator for dropdown items. It first checks
 * if items are grouped (returns group size), then checks if countBy is configured
 * (counts items matching the countBy value), or defaults to counting by item value.
 * 
 * Function index:
 * - getItemCount : Calculates count for an item based on grouping, countBy config, or default value matching
 */

import type { DropdownItem, GroupedItem, CountByType } from './types'
export type { DropdownItem, GroupedItem, CountByType }

/**
 * Get count for an item based on countBy configuration and grouping
 * 
 * @param item - The dropdown item
 * @param showItemCount - Whether to show item count
 * @param items - All items in the dropdown
 * @param countBy - The countBy configuration (string path or function)
 * @param groupBy - Whether items are grouped
 * @param groupedItemsMap - Map of grouped items (null if not grouped)
 * @param getGroupValue - Function to get group value for an item
 * @param getNestedValue - Function to get nested values from objects
 * @returns The count for the item
 */
export function getItemCount(
  item: DropdownItem,
  showItemCount: boolean,
  items: DropdownItem[],
  countBy: CountByType | undefined,
  groupBy: boolean,
  groupedItemsMap: Map<string, GroupedItem> | null,
  getGroupValue: (item: DropdownItem) => any,
  getNestedValue: (obj: any, path: string) => any
): number {
  if (!showItemCount) return 0
  
  // If grouped, return count of items in the group
  if (groupBy && groupedItemsMap) {
    const groupKey = JSON.stringify(getGroupValue(item))
    const group = groupedItemsMap.get(groupKey)
    if (group) {
      return group.items.length
    }
  }
  
  if (countBy) {
    // If countBy is a function, use it to get the value to count by
    if (typeof countBy === 'function') {
      const countValue = countBy(item)
      return items.filter(i => {
        const iValue = countBy(i)
        return JSON.stringify(iValue) === JSON.stringify(countValue)
      }).length
    }
    // If countBy is a string, use it as a property path
    if (typeof countBy === 'string') {
      const countValue = getNestedValue(item.value, countBy)
      return items.filter(i => {
        const iValue = getNestedValue(i.value, countBy)
        return JSON.stringify(iValue) === JSON.stringify(countValue)
      }).length
    }
  }
  
  // Default: count by item value
  return items.filter(i => JSON.stringify(i.value) === JSON.stringify(item.value)).length
}

