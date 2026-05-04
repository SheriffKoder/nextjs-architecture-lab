/**
 * useRowExpansion Hook
 * 
 * Purpose: Manages expandable row state and functionality
 * Used in: VirtualizedTable component
 * Why: Separates expansion logic from table component
 */

import { useState, useCallback, useRef } from 'react';
import { ExpandedRowState, RowExpansionConfig } from './types';

/**
 * Hook to manage row expansion state
 * 
 * @param config - Configuration for row expansion
 * @returns Expansion state and handlers
 */
export function useRowExpansion<T = any>(config?: RowExpansionConfig) {
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [childrenData, setChildrenData] = useState<Map<string | number, any[]>>(new Map());
  const [loadingChildren, setLoadingChildren] = useState<Map<string | number, boolean>>(new Map());
  
  // Ref to store the list component for resetting heights
  const listRef = useRef<any>(null);

  /**
   * Toggle expansion state for a row
   * 
   * @param rowId - ID of the row to toggle
   * @param item - The row item data
   */
  const toggleRow = useCallback(async (rowId: string | number, item: T) => {
    const isExpanded = expandedRows.has(rowId);
    
    if (isExpanded) {
      // Collapse: remove from expanded set
      setExpandedRows(prev => {
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
    } else {
      // Expand: add to expanded set and fetch children if needed
      setExpandedRows(prev => new Set(prev).add(rowId));
      
      // Fetch children if getChildren function is provided
      if (config?.getChildren) {
        setLoadingChildren(prev => new Map(prev).set(rowId, true));
        
        try {
          const children = await config.getChildren(rowId);
          setChildrenData(prev => new Map(prev).set(rowId, children));
        } catch (error) {
          console.error('Error fetching children:', error);
          setChildrenData(prev => new Map(prev).set(rowId, []));
        } finally {
          setLoadingChildren(prev => {
            const next = new Map(prev);
            next.delete(rowId);
            return next;
          });
        }
      }
    }
    
    // Reset list heights after expansion state changes
    // Find the index of the row in the data array
    if (listRef.current?.resetAfterIndex) {
      // We'll need to pass the index from the component
      // For now, reset all rows after the toggled row
      listRef.current.resetAfterIndex(0);
    }
  }, [expandedRows, config]);

  /**
   * Check if a row is expanded
   * 
   * @param rowId - ID of the row to check
   * @returns True if row is expanded
   */
  const isRowExpanded = useCallback((rowId: string | number): boolean => {
    return expandedRows.has(rowId);
  }, [expandedRows]);

  /**
   * Get children data for a row
   * 
   * @param rowId - ID of the row
   * @returns Children data array
   */
  const getChildren = useCallback((rowId: string | number): any[] => {
    return childrenData.get(rowId) || [];
  }, [childrenData]);

  /**
   * Check if children are loading for a row
   * 
   * @param rowId - ID of the row
   * @returns True if children are loading
   */
  const isLoadingChildren = useCallback((rowId: string | number): boolean => {
    return loadingChildren.has(rowId);
  }, [loadingChildren]);

  /**
   * Set the list ref for height resetting
   * 
   * @param ref - Reference to the VariableSizeList component
   */
  const setListRef = useCallback((ref: any) => {
    listRef.current = ref;
  }, []);

  /**
   * Reset list heights after a specific index
   * 
   * @param index - Index to reset from
   */
  const resetAfterIndex = useCallback((index: number) => {
    if (listRef.current?.resetAfterIndex) {
      listRef.current.resetAfterIndex(index);
    }
  }, []);

  return {
    expandedRows,
    isRowExpanded,
    toggleRow,
    getChildren,
    isLoadingChildren,
    setListRef,
    resetAfterIndex
  };
}
