/**
 * Flatten Grouped Rows Utility
 * 
 * Purpose: Convert grouped data structure into flat array for virtualization
 * Used in: VirtualizedTableContainer for rendering grouped table view
 * Why: Virtualization requires a flat array of items to render
 */

import { GroupedData, GroupConfig } from './grouping-utils';
import { GroupState } from '../hooks/useGroupState';

/**
 * Types of rows in the flattened structure
 */
export type FlattenedRowType = 'group-header' | 'sub-group-header' | 'table-header' | 'data-row' | 'spacer';

/**
 * Flattened row structure for virtualization
 */
export interface FlattenedRow<T> {
  type: FlattenedRowType;
  level?: number;
  groupKey?: string;
  subGroupKey?: string;
  data?: T;
  groupData?: GroupedData<T>;
  subGroupData?: GroupedData<T>;
}

/**
 * Flatten grouped data into a flat array for virtualization
 * Only includes expanded groups and sub-groups
 * 
 * @param groupedData - Array of grouped data
 * @param groupState - Group state management object
 * @param groupConfig - Group configuration (for spacing)
 * @returns Flat array of rows to render
 */
export function flattenGroupedRows<T>(
  groupedData: GroupedData<T>[],
  groupState: GroupState,
  groupConfig?: GroupConfig
): FlattenedRow<T>[] {
  const flattened: FlattenedRow<T>[] = [];
  const groupSpacing = groupConfig?.groupSpacing || 0;

  for (let i = 0; i < groupedData.length; i++) {
    const group = groupedData[i];
    
    // Add spacer row before each group (except the first)
    if (i > 0 && groupSpacing > 0) {
      flattened.push({
        type: 'spacer',
        level: 0,
      });
    }
    const isGroupExpanded = groupState.isGroupExpanded(group.groupKey);

    // Always add group header
    flattened.push({
      type: 'group-header',
      level: 0,
      groupKey: group.groupKey,
      groupData: group,
    });

    // Only add group content if expanded
    if (isGroupExpanded) {
      // Check if this group has sub-groups
      if (group.subGroups && group.subGroups.length > 0) {
        // Has sub-groups - iterate through them
        for (const subGroup of group.subGroups) {
          const isSubGroupExpanded = groupState.isSubGroupExpanded(group.groupKey, subGroup.groupKey);

          // Always add sub-group header
          flattened.push({
            type: 'sub-group-header',
            level: 1,
            groupKey: group.groupKey,
            subGroupKey: subGroup.groupKey,
            groupData: group,
            subGroupData: subGroup,
          });

          // Only add sub-group content if expanded
          if (isSubGroupExpanded) {
            // Add table header for this sub-group
            flattened.push({
              type: 'table-header',
              level: 2,
              groupKey: group.groupKey,
              subGroupKey: subGroup.groupKey,
              groupData: group,
              subGroupData: subGroup,
            });

            // Add data rows for this sub-group
            for (const item of subGroup.items) {
              flattened.push({
                type: 'data-row',
                level: 2,
                groupKey: group.groupKey,
                subGroupKey: subGroup.groupKey,
                data: item,
                groupData: group,
                subGroupData: subGroup,
              });
            }
          }
        }
      } else {
        // No sub-groups - items go directly in the group
        // Add table header for this group
        flattened.push({
          type: 'table-header',
          level: 1,
          groupKey: group.groupKey,
          groupData: group,
        });

        // Add data rows for this group
        for (const item of group.items) {
          flattened.push({
            type: 'data-row',
            level: 1,
            groupKey: group.groupKey,
            data: item,
            groupData: group,
          });
        }
      }
    }
  }

  return flattened;
}
