/**
 * Group Sort State Management Hook
 * 
 * Purpose: Manage per-group sort state for grouped table view
 * Used in: VirtualizedListContainer for per-group sorting
 * Why: Allows each group/sub-group to have independent sort configuration
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Sort configuration for a group
 */
export interface SortConfig {
  key: string;
  direction: "ascending" | "descending" | "none";
}

/**
 * Return type for useGroupSortState hook
 */
export interface GroupSortState {
  // Get sort config for a specific group/sub-group
  getGroupSortConfig: (groupKey: string, subGroupKey?: string) => SortConfig | null;
  // Set sort config for a specific group/sub-group
  setGroupSortConfig: (groupKey: string, subGroupKey: string | undefined, config: SortConfig) => void;
  // Handle sort click for a specific group/sub-group
  handleGroupSort: (groupKey: string, subGroupKey: string | undefined, columnKey: string) => void;
  // Get all sort configs as a Map (for sorting utility)
  getSortConfigs: () => Map<string, SortConfig>;
}

/**
 * Generate a unique key for group sort state
 * Format: `${groupKey}${subGroupKey || ''}`
 */
function getSortKey(groupKey: string, subGroupKey?: string): string {
  return subGroupKey ? `${groupKey}::${subGroupKey}` : groupKey;
}

/**
 * Hook to manage per-group sort state
 * Each group/sub-group can have its own independent sort configuration
 * 
 * @returns Group sort state management functions
 */
export function useGroupSortState(): GroupSortState {
  // State: Map<sortKey, SortConfig>
  // sortKey format: `${groupKey}${subGroupKey || ''}`
  const [sortConfigs, setSortConfigs] = useState<Map<string, SortConfig>>(new Map());

  // Get sort config for a specific group/sub-group
  const getGroupSortConfig = useCallback((groupKey: string, subGroupKey?: string): SortConfig | null => {
    const key = getSortKey(groupKey, subGroupKey);
    return sortConfigs.get(key) || null;
  }, [sortConfigs]);

  // Set sort config for a specific group/sub-group
  const setGroupSortConfig = useCallback((groupKey: string, subGroupKey: string | undefined, config: SortConfig) => {
    setSortConfigs(prev => {
      const newMap = new Map(prev);
      const key = getSortKey(groupKey, subGroupKey);
      newMap.set(key, config);
      return newMap;
    });
  }, []);

  // Handle sort click for a specific group/sub-group
  // Toggles: none → ascending → descending → none
  const handleGroupSort = useCallback((groupKey: string, subGroupKey: string | undefined, columnKey: string) => {
    const key = getSortKey(groupKey, subGroupKey);
    const currentConfig = sortConfigs.get(key);

    let newConfig: SortConfig;

    if (!currentConfig || currentConfig.key !== columnKey) {
      // New column: start with ascending
      newConfig = { key: columnKey, direction: "ascending" };
    } else {
      // Same column: toggle direction
      switch (currentConfig.direction) {
        case "ascending":
          newConfig = { key: columnKey, direction: "descending" };
          break;
        case "descending":
          newConfig = { key: columnKey, direction: "none" };
          break;
        case "none":
        default:
          newConfig = { key: columnKey, direction: "ascending" };
          break;
      }
    }

    setGroupSortConfig(groupKey, subGroupKey, newConfig);
  }, [sortConfigs, setGroupSortConfig]);

  // Get all sort configs as a Map (for sorting utility)
  const getSortConfigs = useCallback(() => {
    return sortConfigs;
  }, [sortConfigs]);

  return useMemo(() => ({
    getGroupSortConfig,
    setGroupSortConfig,
    handleGroupSort,
    getSortConfigs,
  }), [getGroupSortConfig, setGroupSortConfig, handleGroupSort, getSortConfigs]);
}
