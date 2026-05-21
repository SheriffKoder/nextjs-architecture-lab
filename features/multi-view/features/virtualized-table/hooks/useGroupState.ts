/**
 * useGroupState Hook
 * 
 * Purpose: Manages expand/collapse state for groups and sub-groups
 * Used in: VirtualizedTableContainer for grouped table view
 * Why: Provides reusable state management for group expansion
 */

import { useState, useCallback, useMemo } from 'react';
import { GroupedData } from '../utils/grouping-utils';

/**
 * Group state management interface
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
 * Hook to manage group expansion state
 * 
 * @param groupedData - Array of grouped data (optional, used for expandAll/collapseAll)
 * @returns Group state management object
 */
export function useGroupState<T = any>(groupedData?: GroupedData<T>[]): GroupState {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedSubGroups, setExpandedSubGroups] = useState<Map<string, Set<string>>>(new Map());

  /**
   * Check if a group is expanded
   */
  const isGroupExpanded = useCallback((groupKey: string): boolean => {
    return expandedGroups.has(groupKey);
  }, [expandedGroups]);

  /**
   * Check if a sub-group is expanded
   */
  const isSubGroupExpanded = useCallback((groupKey: string, subGroupKey: string): boolean => {
    const subGroups = expandedSubGroups.get(groupKey);
    return subGroups ? subGroups.has(subGroupKey) : false;
  }, [expandedSubGroups]);

  /**
   * Toggle group expansion state
   */
  const toggleGroup = useCallback((groupKey: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
        // Also collapse all sub-groups when group is collapsed
        setExpandedSubGroups(prevSub => {
          const nextSub = new Map(prevSub);
          nextSub.delete(groupKey);
          return nextSub;
        });
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }, []);

  /**
   * Toggle sub-group expansion state
   */
  const toggleSubGroup = useCallback((groupKey: string, subGroupKey: string) => {
    setExpandedSubGroups(prev => {
      const next = new Map(prev);
      const subGroups = next.get(groupKey) || new Set<string>();
      const newSubGroups = new Set(subGroups);
      
      if (newSubGroups.has(subGroupKey)) {
        newSubGroups.delete(subGroupKey);
      } else {
        newSubGroups.add(subGroupKey);
      }
      
      next.set(groupKey, newSubGroups);
      return next;
    });
  }, []);

  /**
   * Expand all groups and sub-groups
   */
  const expandAll = useCallback(() => {
    if (!groupedData) return;
    
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

  /**
   * Collapse all groups and sub-groups
   */
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
