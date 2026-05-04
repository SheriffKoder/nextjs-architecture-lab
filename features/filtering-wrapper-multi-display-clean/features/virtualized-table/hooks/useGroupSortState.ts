/**
 * useGroupSortState Hook
 * 
 * Purpose: Manages per-group sort configurations
 * Used in: VirtualizedTableContainer for per-group sorting
 * Why: Allows each group/sub-group to have independent sort state
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Sort configuration for a group or sub-group
 */
export interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending' | 'none';
}

/**
 * Group sort state management interface
 */
export interface GroupSortState {
  getGroupSortConfig: (groupKey: string, subGroupKey?: string) => SortConfig | undefined;
  getSortConfigs: () => Map<string, SortConfig>;
  handleGroupSort: (groupKey: string, subGroupKey: string | undefined, columnKey: string) => void;
}

/**
 * Hook to manage per-group sort state
 * 
 * @returns Group sort state management object
 */
export function useGroupSortState(): GroupSortState {
  const [sortConfigs, setSortConfigs] = useState<Map<string, SortConfig>>(new Map());

  /**
   * Generate a unique key for group sort state lookup
   * Format: `${groupKey}::${subGroupKey}` or `${groupKey}`
   */
  const getSortKey = useCallback((groupKey: string, subGroupKey?: string): string => {
    return subGroupKey ? `${groupKey}::${subGroupKey}` : groupKey;
  }, []);

  /**
   * Get sort configuration for a specific group/sub-group
   */
  const getGroupSortConfig = useCallback((groupKey: string, subGroupKey?: string): SortConfig | undefined => {
    const key = getSortKey(groupKey, subGroupKey);
    return sortConfigs.get(key);
  }, [sortConfigs, getSortKey]);

  /**
   * Get all sort configurations as a Map
   */
  const getSortConfigs = useCallback((): Map<string, SortConfig> => {
    return sortConfigs;
  }, [sortConfigs]);

  /**
   * Handle sort toggle for a group/sub-group
   * Cycles through: none -> ascending -> descending -> none
   */
  const handleGroupSort = useCallback((groupKey: string, subGroupKey: string | undefined, columnKey: string) => {
    const key = getSortKey(groupKey, subGroupKey);
    const currentConfig = sortConfigs.get(key);
    
    setSortConfigs(prev => {
      const next = new Map(prev);
      
      // If clicking the same column, cycle through states
      if (currentConfig?.key === columnKey) {
        if (currentConfig.direction === 'none') {
          next.set(key, { key: columnKey, direction: 'ascending' });
        } else if (currentConfig.direction === 'ascending') {
          next.set(key, { key: columnKey, direction: 'descending' });
        } else {
          next.delete(key); // Remove to set to 'none'
        }
      } else {
        // New column, start with ascending
        next.set(key, { key: columnKey, direction: 'ascending' });
      }
      
      return next;
    });
  }, [sortConfigs, getSortKey]);

  return useMemo(() => ({
    getGroupSortConfig,
    getSortConfigs,
    handleGroupSort,
  }), [getGroupSortConfig, getSortConfigs, handleGroupSort]);
}
