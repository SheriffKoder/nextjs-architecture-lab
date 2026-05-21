/**
 * Accordion Columns Hook
 * 
 * Purpose: Manages column visibility based on accordion group states
 * Used in: VirtualizedTable component for accordion functionality
 * Why: Separates accordion logic from component for better maintainability
 * 
 * Features:
 * - Column filtering based on open/closed groups
 * - Group toggle functionality
 * - Support for single or multiple open groups
 * - Default group opening behavior
 */

import { useState, useCallback, useMemo } from 'react';
import { TableColumn, type AccordionConfig } from '@/features/multi-view/types';

export type { AccordionConfig } from '@/features/multi-view/types';

/**
 * Hook for managing accordion column visibility and group toggling
 *
 * @param columns - Array of table columns
 * @param accordionConfig - Optional accordion configuration
 * @returns Object with visible columns and group toggle handler
 */
export const useAccordionColumns = <
  T extends Record<string, any> = Record<string, any>,
>(
  columns: TableColumn<T>[],
  accordionConfig?: AccordionConfig
) => {
  // Initialize open groups with default group if specified
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    if (!accordionConfig?.defaultOpenGroup) return new Set();
    return new Set([accordionConfig.defaultOpenGroup]);
  });

  // Get visible columns based on accordion state
  const getVisibleColumns = useCallback(() => {
    if (!accordionConfig) {
      // No accordion config = show all columns normally
      return columns;
    }

    return columns.filter(column => {
      if (!column.groupId) {
        // Always show ungrouped columns
        return true;
      }

      if (openGroups.has(column.groupId)) {
        // Open group = show all columns in this group
        return true;
      } else {
        // Closed group = show only first column of the group
        const groupColumns = columns.filter(col => col.groupId === column.groupId);
        const isFirstColumn = groupColumns[0]?.key === column.key;
        return isFirstColumn;
      }
    });
  }, [columns, openGroups, accordionConfig]);

  // Handle group toggle
  const handleGroupToggle = useCallback((groupId: string) => {
    if (!accordionConfig) return;

    setOpenGroups(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(groupId)) {
        // Close the group
        newSet.delete(groupId);
      } else {
        // Open the group
        newSet.add(groupId);
        
        // If only one group allowed, close others
        if (!accordionConfig.allowMultipleOpen) {
          return new Set([groupId]);
        }
      }
      
      return newSet;
    });
  }, [accordionConfig]);

  // Memoize visible columns to prevent unnecessary recalculations
  const visibleColumns = useMemo(() => getVisibleColumns(), [getVisibleColumns]);

  return {
    visibleColumns,
    handleGroupToggle,
    openGroups,
    hasAccordion: !!accordionConfig
  };
};
