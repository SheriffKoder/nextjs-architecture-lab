/**
 * Grouping Utilities for Dropdown Items
 * 
 * Function flow:
 * 1. getGroupValue extracts the grouping key from each item based on groupBy config
 * 2. groupItems processes all items, groups them by their group value, and creates display items
 * 3. getDisplayItems returns either grouped display items or original items if not grouped
 * 4. filterDisplayItems filters the display items based on search term, handling grouped items
 * 
 * Function index:
 * - getGroupValue : Extracts the group value from an item using groupBy config (string path or function)
 * - groupItems : Groups items by their group value and creates a map of grouped items with display items
 * - getDisplayItems : Returns display items array (grouped items or original items if not grouped)
 * - filterDisplayItems : Filters display items by search term, searching within grouped items when applicable
 */

import type { DropdownItem, GroupedItem, GroupByType } from '../model/types'
export type { DropdownItem, GroupedItem, GroupByType }

/**
 * Get the group value for an item based on the groupBy configuration
 * 
 * @param item - The dropdown item
 * @param groupBy - The groupBy configuration (string path or function)
 * @param getNestedValue - Function to get nested values from objects
 * @returns The group value for the item
 */
export function getGroupValue(
  item: DropdownItem,
  groupBy: GroupByType | undefined,
  getNestedValue: (obj: any, path: string) => any
): any {
  if (!groupBy) return null
  
  if (typeof groupBy === 'function') {
    return groupBy(item)
  }
  
  if (typeof groupBy === 'string') {
    // Try to get from item.value first, then from item itself
    const valueFromItem = getNestedValue(item, groupBy)
    if (valueFromItem !== undefined) return valueFromItem
    return getNestedValue(item.value, groupBy)
  }
  
  return null
}

/**
 * Group items based on groupBy configuration
 * 
 * @param items - Array of dropdown items to group
 * @param groupBy - The groupBy configuration (string path or function)
 * @param getNestedValue - Function to get nested values from objects
 * @returns Map of grouped items with their display items
 */
export function groupItems(
  items: DropdownItem[],
  groupBy: GroupByType | undefined,
  getNestedValue: (obj: any, path: string) => any
): Map<string, GroupedItem> | null {
  if (!groupBy) return null
  
  const map = new Map<string, GroupedItem>()
  
  items.forEach(item => {
    const groupValue = getGroupValue(item, groupBy, getNestedValue)
    const groupKey = JSON.stringify(groupValue)
    
    if (!map.has(groupKey)) {
      // Create display item with group value as label
      const displayLabel = typeof groupValue === 'string' || typeof groupValue === 'number' 
        ? String(groupValue) 
        : item.label
      map.set(groupKey, {
        groupValue,
        items: [item],
        displayItem: { 
          ...item,
          id: `group-${groupKey}`, // Unique ID for the group
          label: displayLabel
        }
      })
    } else {
      const group = map.get(groupKey)!
      group.items.push(item)
    }
  })
  
  return map
}

/**
 * Get display items (grouped or ungrouped)
 * 
 * @param items - Array of dropdown items
 * @param groupedItemsMap - Map of grouped items (null if not grouped)
 * @returns Array of display items to show in dropdown
 */
export function getDisplayItems(
  items: DropdownItem[],
  groupedItemsMap: Map<string, GroupedItem> | null
): DropdownItem[] {
  if (groupedItemsMap) {
    return Array.from(groupedItemsMap.values()).map(group => group.displayItem)
  }
  return items
}

/**
 * Filter display items based on search term, considering grouping
 * 
 * @param displayItems - Array of display items
 * @param searchTerm - The search term to filter by
 * @param groupedItemsMap - Map of grouped items (null if not grouped)
 * @param getGroupValue - Function to get group value for an item
 * @returns Filtered and sorted array of display items
 */
export function filterDisplayItems(
  displayItems: DropdownItem[],
  searchTerm: string,
  groupedItemsMap: Map<string, GroupedItem> | null,
  getGroupValue: (item: DropdownItem) => any
): DropdownItem[] {
  return displayItems.filter(item => {
    if (groupedItemsMap) {
      // For grouped items, search in all items in the group
      const groupKey = JSON.stringify(getGroupValue(item))
      const group = groupedItemsMap.get(groupKey)
      if (group) {
        return group.items.some(i => 
          i.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
    }
    return item.label.toLowerCase().includes(searchTerm.toLowerCase())
  }).sort((a, b) => a.label.localeCompare(b.label))
}

