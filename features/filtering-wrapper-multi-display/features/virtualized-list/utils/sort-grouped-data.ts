/**
 * Sort Grouped Data Utility
 * 
 * Purpose: Sort items within each group/sub-group based on per-group sort configurations
 * Used in: VirtualizedListContainer for per-group sorting
 * Why: Applies independent sorting to items within each group
 */

import { GroupedData } from './grouping-utils';
import { SortConfig } from '../hooks/useGroupSortState';
import type { TableColumn } from '@/features/filtering-wrapper-multi-display/types';

/**
 * Get nested value from object using dot notation (e.g., "company.name")
 */
function getNestedValue(obj: any, path: string): any {
  if (!path) return undefined;
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value == null) return undefined;
    value = value[key];
  }
  
  return value;
}

/**
 * Sort a single array of items based on sort configuration
 * Handles different data types (numbers, strings, dates)
 */
function sortItems<T>(
  items: T[],
  sortConfig: SortConfig,
  columns: TableColumn<T>[]
): T[] {
  if (!sortConfig.key || sortConfig.direction === "none") {
    return items;
  }

  // Create sorted copy
  return [...items].sort((a, b) => {
    // Extract values for comparison
    const aValue = getNestedValue(a, sortConfig.key);
    const bValue = getNestedValue(b, sortConfig.key);
    
    // Handle null/undefined values (place them at the end)
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    // Find column definition to determine data type
    const column = columns.find(col => col.key === sortConfig.key);
    
    let comparison = 0;
    
    // Sort based on data type
    if (column?.isNumberField) {
      // Handle numeric sorting
      const aNum = typeof aValue === 'number' ? aValue : parseFloat(String(aValue));
      const bNum = typeof bValue === 'number' ? bValue : parseFloat(String(bValue));
      
      // Handle invalid numbers (place them at the end)
      if (isNaN(aNum)) return 1;
      if (isNaN(bNum)) return -1;
      
      comparison = aNum - bNum;
    } else if (column?.isDateField) {
      // Handle date sorting
      const aDate = new Date(aValue).getTime();
      const bDate = new Date(bValue).getTime();
      
      if (isNaN(aDate)) return 1;
      if (isNaN(bDate)) return -1;
      
      comparison = aDate - bDate;
    } else {
      // Handle string sorting
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    // Apply sort direction
    return sortConfig.direction === 'ascending' ? comparison : -comparison;
  });
}

/**
 * Generate a unique key for group sort state lookup
 * Format: `${groupKey}${subGroupKey || ''}`
 */
function getSortKey(groupKey: string, subGroupKey?: string): string {
  return subGroupKey ? `${groupKey}::${subGroupKey}` : groupKey;
}

/**
 * Sort items within each group/sub-group based on per-group sort configurations
 * 
 * @param groupedData - Array of grouped data
 * @param sortConfigs - Map of sort configurations keyed by group/sub-group
 * @param columns - Table column definitions for type detection
 * @returns New grouped data with sorted items (does not mutate original)
 */
export function sortGroupedData<T extends Record<string, any>>(
  groupedData: GroupedData<T>[],
  sortConfigs: Map<string, SortConfig>,
  columns: TableColumn<T>[]
): GroupedData<T>[] {
  // Create a new array to avoid mutating the original
  return groupedData.map(group => {
    const groupSortKey = getSortKey(group.groupKey);
    const groupSortConfig = sortConfigs.get(groupSortKey);

    // If group has sub-groups, sort items within each sub-group
    if (group.subGroups && group.subGroups.length > 0) {
      const sortedSubGroups = group.subGroups.map(subGroup => {
        const subGroupSortKey = getSortKey(group.groupKey, subGroup.groupKey);
        const subGroupSortConfig = sortConfigs.get(subGroupSortKey);

        // Sort items within this sub-group
        const sortedItems = subGroupSortConfig
          ? sortItems(subGroup.items, subGroupSortConfig, columns)
          : subGroup.items;

        return {
          ...subGroup,
          items: sortedItems,
        };
      });

      return {
        ...group,
        subGroups: sortedSubGroups,
      };
    } else {
      // No sub-groups, sort items directly in the group
      const sortedItems = groupSortConfig
        ? sortItems(group.items, groupSortConfig, columns)
        : group.items;

      return {
        ...group,
        items: sortedItems,
      };
    }
  });
}
