/**
 * Grouping Utilities
 * 
 * Purpose: Core utilities for grouping data by one or more keys
 * Used in: VirtualizedTableComponent for grouped table view
 * Why: Provides reusable grouping logic for single-level and nested grouping
 */

/**
 * Configuration object for grouping data
 */
export interface GroupConfig {
  // Primary group key (e.g., "company.name")
  groupBy?: string;
  // Secondary group key for nested grouping (e.g., "status")
  subGroupBy?: string;
  // Custom group key formatter
  groupKeyFormatter?: (value: any) => string;
  // Custom sub-group key formatter
  subGroupKeyFormatter?: (value: any) => string;
  // Spacing between groups in pixels (default: 0)
  groupSpacing?: number;
}

/**
 * Grouped data structure
 */
export interface GroupedData<T> {
  groupKey: string;
  groupValue: any;
  items: T[];
  subGroups?: GroupedData<T>[];
}

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
 * Create a stable group key from a value (handles arrays, objects, and primitives)
 * Used for consistent grouping when values are complex types
 */
function createGroupKey(value: any): string {
  if (value == null) return 'null';
  
  // Handle arrays (e.g., assignedUsers array)
  if (Array.isArray(value)) {
    if (value.length === 0) return 'empty';
    
    // For arrays of objects (like users), create a stable key from sorted IDs
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      // Extract IDs and sort them for consistent grouping
      const ids = value
        .map((item: any) => item?.id || item?.email || item?.name || JSON.stringify(item))
        .filter((id: any) => id != null)
        .sort()
        .map((id: any) => String(id));
      
      return ids.join(',');
    }
    
    // For arrays of primitives, sort and join
    return value
      .map((item: any) => String(item))
      .sort()
      .join(',');
  }
  
  // Handle objects
  if (typeof value === 'object') {
    // Try to extract a meaningful identifier
    if (value.id) return String(value.id);
    if (value.name) return String(value.name);
    if (value.email) return String(value.email);
    // Fallback to JSON string (not ideal but better than [object Object])
    return JSON.stringify(value);
  }
  
  // Handle primitives
  return String(value);
}

/**
 * Format group value for display (handles arrays, objects, and primitives)
 * Used to create readable group header text
 */
function formatGroupValueForDisplay(value: any): string {
  if (value == null) return 'Unknown';
  
  // Handle arrays (e.g., assignedUsers array)
  if (Array.isArray(value)) {
    if (value.length === 0) return 'No Members';
    
    // For arrays of objects (like users), extract names
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const names = value
        .map((item: any) => item?.name || item?.email || item?.username || 'Unknown')
        .filter((name: string) => name !== 'Unknown');
      
      if (names.length === 0) return 'No Members';
      if (names.length === 1) return names[0];
      if (names.length <= 3) return names.join(', ');
      return `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
    }
    
    // For arrays of primitives, join them
    return value.map((item: any) => String(item)).join(', ');
  }
  
  // Handle objects
  if (typeof value === 'object') {
    if (value.name) return String(value.name);
    if (value.email) return String(value.email);
    if (value.id) return String(value.id);
    return 'Unknown';
  }
  
  // Handle primitives
  return String(value);
}

/**
 * Group data by specified keys
 * Supports single-level and nested grouping
 * 
 * @param data - Array of data items to group
 * @param config - Grouping configuration
 * @returns Array of grouped data
 */
export function groupData<T extends Record<string, any>>(
  data: T[],
  config: GroupConfig
): GroupedData<T>[] {
  if (!config.groupBy) {
    return [];
  }

  // Group by primary key
  const groupsMap = new Map<string, T[]>();

  for (const item of data) {
    const groupValue = getNestedValue(item, config.groupBy);
    const groupKey = createGroupKey(groupValue);
    
    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, []);
    }
    
    groupsMap.get(groupKey)!.push(item);
  }

  // Convert map to array and create GroupedData objects
  const groups: GroupedData<T>[] = Array.from(groupsMap.entries()).map(([groupKey, items]) => {
    const groupValue = items[0] && config.groupBy ? getNestedValue(items[0], config.groupBy) : null;
    // Use formatter if provided, otherwise format for display
    const formattedKey = config.groupKeyFormatter 
      ? config.groupKeyFormatter(groupValue)
      : formatGroupValueForDisplay(groupValue);

    const groupData: GroupedData<T> = {
      groupKey: formattedKey,
      groupValue,
      items: [],
      subGroups: undefined,
    };

    // If subGroupBy is specified, create nested groups
    if (config.subGroupBy) {
      const subGroupsMap = new Map<string, T[]>();

      for (const item of items) {
        const subGroupValue = getNestedValue(item, config.subGroupBy);
        const subGroupKey = createGroupKey(subGroupValue);
        
        if (!subGroupsMap.has(subGroupKey)) {
          subGroupsMap.set(subGroupKey, []);
        }
        
        subGroupsMap.get(subGroupKey)!.push(item);
      }

      groupData.subGroups = Array.from(subGroupsMap.entries()).map(([subGroupKey, subItems]) => {
        const subGroupValue = subItems[0] && config.subGroupBy ? getNestedValue(subItems[0], config.subGroupBy) : null;
        const formattedSubKey = config.subGroupKeyFormatter
          ? config.subGroupKeyFormatter(subGroupValue)
          : formatGroupValueForDisplay(subGroupValue);

        return {
          groupKey: formattedSubKey,
          groupValue: subGroupValue,
          items: subItems,
        };
      });
    } else {
      // No sub-grouping, items go directly in the group
      groupData.items = items;
    }

    return groupData;
  });

  // Sort groups by formatted group key (alphabetically)
  groups.sort((a, b) => {
    const aKey = a.groupKey || '';
    const bKey = b.groupKey || '';
    return aKey.localeCompare(bKey);
  });

  return groups;
}
