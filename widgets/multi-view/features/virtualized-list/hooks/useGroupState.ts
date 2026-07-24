/**
 * Group State Management Hook
 * 
 * Purpose: Manage expand/collapse state for groups and sub-groups
 * Used in: VirtualizedTableContainer for grouped table view
 * Why: Provides centralized state management for group interactions
 */

import { useState, useCallback, useMemo } from 'react';
import { GroupedData } from '../utils/grouping-utils';

/**
 * Return type for useGroupState hook
 */
export interface GroupState {
  isGroupExpanded: (groupKey: string) => boolean;
  isSubGroupExpanded: (groupKey: string, subGroupKey: string) => boolean;
  toggleGroup: (groupKey: string) => void;
  toggleSubGroup: (groupKey: string, subGroupKey: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

/**
 * Hook to manage group expand/collapse state
 * Supports nested groups
 * 
 * @param groupedData - Array of grouped data
 * @returns Group state management functions
 */
export function useGroupState<T>(
  groupedData: GroupedData<T>[]
): GroupState {
  // State for expanded groups (level 1)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // State for expanded sub-groups (level 2) - Map<groupKey, Set<subGroupKey>>
  const [expandedSubGroups, setExpandedSubGroups] = useState<Map<string, Set<string>>>(new Map());

  // Check if a group is expanded
  const isGroupExpanded = useCallback((groupKey: string): boolean => {
    return expandedGroups.has(groupKey);
  }, [expandedGroups]);

  // Check if a sub-group is expanded
  const isSubGroupExpanded = useCallback((groupKey: string, subGroupKey: string): boolean => {
    const subGroups = expandedSubGroups.get(groupKey);
    return subGroups ? subGroups.has(subGroupKey) : false;
  }, [expandedSubGroups]);

  // Toggle group expansion
  const toggleGroup = useCallback((groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
        // Also collapse all sub-groups when parent group is collapsed
        setExpandedSubGroups(prevSub => {
          const newSubMap = new Map(prevSub);
          newSubMap.delete(groupKey);
          return newSubMap;
        });
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  }, []);

  // Toggle sub-group expansion
  const toggleSubGroup = useCallback((groupKey: string, subGroupKey: string) => {
    setExpandedSubGroups(prev => {
      const newMap = new Map(prev);
      const subGroups = newMap.get(groupKey) || new Set<string>();
      const newSubGroups = new Set(subGroups);
      
      if (newSubGroups.has(subGroupKey)) {
        newSubGroups.delete(subGroupKey);
      } else {
        newSubGroups.add(subGroupKey);
      }
      
      newMap.set(groupKey, newSubGroups);
      return newMap;
    });
  }, []);

  // Expand all groups and sub-groups
  const expandAll = useCallback(() => {
    const allGroupKeys = new Set<string>();
    const allSubGroups = new Map<string, Set<string>>();

    for (const group of groupedData) {
      allGroupKeys.add(group.groupKey);
      
      if (group.subGroups && group.subGroups.length > 0) {
        const subGroupKeys = new Set<string>();
        for (const subGroup of group.subGroups) {
          subGroupKeys.add(subGroup.groupKey);
        }
        allSubGroups.set(group.groupKey, subGroupKeys);
      }
    }

    setExpandedGroups(allGroupKeys);
    setExpandedSubGroups(allSubGroups);
  }, [groupedData]);

  // Collapse all groups and sub-groups
  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set());
    setExpandedSubGroups(new Map());
  }, []);

  return useMemo(() => ({
    isGroupExpanded,
    isSubGroupExpanded,
    toggleGroup,
    toggleSubGroup,
    expandAll,
    collapseAll,
  }), [isGroupExpanded, isSubGroupExpanded, toggleGroup, toggleSubGroup, expandAll, collapseAll]);
}
