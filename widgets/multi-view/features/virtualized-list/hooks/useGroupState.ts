/**
 * Group State Management Hook
 *
 * Purpose: Manage expand/collapse state for groups and sub-groups
 * Used in: VirtualizedListContainer for grouped table view
 * Why: Provides centralized state management for group interactions
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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

export interface UseGroupStateOptions {
  /** Expand all groups when grouping becomes active / groupBy changes. */
  defaultExpanded?: boolean;
  /**
   * Also expand sub-groups when seeding.
   * Defaults to the same value as `defaultExpanded`.
   */
  defaultSubGroupsExpanded?: boolean;
  /**
   * Reseed expand state when this key changes (e.g. effective `groupBy`).
   * Cleared / empty → collapse seed tracking (ungrouped).
   */
  resetKey?: string | null;
}

function buildExpandedSets<T>(
  groupedData: GroupedData<T>[],
  includeSubGroups: boolean,
): { groups: Set<string>; subGroups: Map<string, Set<string>> } {
  const groups = new Set<string>();
  const subGroups = new Map<string, Set<string>>();

  for (const group of groupedData) {
    groups.add(group.groupKey);
    if (includeSubGroups && group.subGroups && group.subGroups.length > 0) {
      subGroups.set(
        group.groupKey,
        new Set(group.subGroups.map((sg) => sg.groupKey)),
      );
    }
  }

  return { groups, subGroups };
}

/**
 * Hook to manage group expand/collapse state
 * Supports nested groups
 *
 * @param groupedData - Array of grouped data
 * @param options - Optional default-expand / reseed behavior
 * @returns Group state management functions
 */
export function useGroupState<T>(
  groupedData: GroupedData<T>[],
  options?: UseGroupStateOptions,
): GroupState {
  const defaultExpanded = options?.defaultExpanded ?? false;
  const defaultSubGroupsExpanded =
    options?.defaultSubGroupsExpanded ?? defaultExpanded;
  const resetKey = options?.resetKey ?? null;

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedSubGroups, setExpandedSubGroups] = useState<
    Map<string, Set<string>>
  >(new Map());

  const seededForKeyRef = useRef<string | null>(null);

  // Seed expanded state once per resetKey once grouped data is available.
  // Does not re-open groups the user collapsed on later data refreshes.
  useEffect(() => {
    if (!defaultExpanded || !resetKey) {
      seededForKeyRef.current = null;
      return;
    }
    if (groupedData.length === 0) return;
    if (seededForKeyRef.current === resetKey) return;

    seededForKeyRef.current = resetKey;
    const { groups, subGroups } = buildExpandedSets(
      groupedData,
      defaultSubGroupsExpanded,
    );
    setExpandedGroups(groups);
    setExpandedSubGroups(subGroups);
  }, [defaultExpanded, defaultSubGroupsExpanded, resetKey, groupedData]);

  const isGroupExpanded = useCallback(
    (groupKey: string): boolean => {
      return expandedGroups.has(groupKey);
    },
    [expandedGroups],
  );

  const isSubGroupExpanded = useCallback(
    (groupKey: string, subGroupKey: string): boolean => {
      const subGroups = expandedSubGroups.get(groupKey);
      return subGroups ? subGroups.has(subGroupKey) : false;
    },
    [expandedSubGroups],
  );

  const toggleGroup = useCallback((groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
        setExpandedSubGroups((prevSub) => {
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

  const toggleSubGroup = useCallback(
    (groupKey: string, subGroupKey: string) => {
      setExpandedSubGroups((prev) => {
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
    },
    [],
  );

  const expandAll = useCallback(() => {
    const { groups, subGroups } = buildExpandedSets(groupedData, true);
    setExpandedGroups(groups);
    setExpandedSubGroups(subGroups);
  }, [groupedData]);

  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set());
    setExpandedSubGroups(new Map());
  }, []);

  return useMemo(
    () => ({
      isGroupExpanded,
      isSubGroupExpanded,
      toggleGroup,
      toggleSubGroup,
      expandAll,
      collapseAll,
    }),
    [
      isGroupExpanded,
      isSubGroupExpanded,
      toggleGroup,
      toggleSubGroup,
      expandAll,
      collapseAll,
    ],
  );
}
