/**
 * useGroupState Hook
 *
 * Purpose: Manages expand/collapse state for groups and sub-groups
 * Used in: VirtualizedTableContainer for grouped table view
 * Why: Provides reusable state management for group expansion
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
 * Hook to manage group expansion state
 *
 * @param groupedData - Array of grouped data (optional, used for expandAll/collapseAll)
 * @param options - Optional default-expand / reseed behavior
 * @returns Group state management object
 */
export function useGroupState<T = any>(
  groupedData?: GroupedData<T>[],
  options?: UseGroupStateOptions,
): GroupState {
  const data = groupedData ?? [];
  const defaultExpanded = options?.defaultExpanded ?? false;
  const defaultSubGroupsExpanded =
    options?.defaultSubGroupsExpanded ?? defaultExpanded;
  const resetKey = options?.resetKey ?? null;

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedSubGroups, setExpandedSubGroups] = useState<
    Map<string, Set<string>>
  >(new Map());

  const seededForKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!defaultExpanded || !resetKey) {
      seededForKeyRef.current = null;
      return;
    }
    if (data.length === 0) return;
    if (seededForKeyRef.current === resetKey) return;

    seededForKeyRef.current = resetKey;
    const { groups, subGroups } = buildExpandedSets(
      data,
      defaultSubGroupsExpanded,
    );
    setExpandedGroups(groups);
    setExpandedSubGroups(subGroups);
  }, [defaultExpanded, defaultSubGroupsExpanded, resetKey, data]);

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
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
        setExpandedSubGroups((prevSub) => {
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

  const toggleSubGroup = useCallback(
    (groupKey: string, subGroupKey: string) => {
      setExpandedSubGroups((prev) => {
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
    },
    [],
  );

  const expandAll = useCallback(() => {
    if (data.length === 0) return;
    const { groups, subGroups } = buildExpandedSets(data, true);
    setExpandedGroups(groups);
    setExpandedSubGroups(subGroups);
  }, [data]);

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
