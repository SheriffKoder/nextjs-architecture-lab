/**
 * Shared Types for Dropdown Select Component
 * 
 * Function flow:
 * This file contains type definitions shared across all utility files.
 * No functions are defined here, only TypeScript interfaces and types.
 * 
 * Function index:
 * (No functions - type definitions only)
 * - DropdownItem : Interface for dropdown items with id, label, and value
 * - GroupedItem : Interface for grouped items containing groupValue, items array, and displayItem
 * - GroupByType : Type for groupBy configuration (string path or function)
 * - CountByType : Type for countBy configuration (string path or function)
 */

export interface DropdownItem {
  id: string | number
  label: string
  value: any
}

export interface GroupedItem {
  groupValue: any
  items: DropdownItem[]
  displayItem: DropdownItem
}

export type GroupByType = string | ((item: DropdownItem) => any)
export type CountByType = string | ((item: DropdownItem) => any)

