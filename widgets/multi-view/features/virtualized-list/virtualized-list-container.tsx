/**
 * VirtualizedTable Component
 * 
 * Purpose: High-performance virtualized table with sorting, filtering, and pagination
 * Used in: app/virtualized-table/page.tsx
 * Why: Provides efficient rendering of large datasets with full functionality
 * 
 * Steps:
 * 1. Import hooks and utilities for separated concerns
 * 2. Initialize state using custom hooks
 * 3. Handle data processing through hooks
 * 4. Render table with rowRenderer logic
 */

"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { VariableSizeList, FixedSizeList } from "react-window";
import { VirtualizedTableRow } from "./components/rows/table-row";
import { LoadingSpinner } from "../../components/loading-spinner";
import { LoadingRows } from "./components/rows/rows-loading-state";
import { TableRowMeasurer } from "./components/TableRowMeasurer";
import { useRowExpansion } from "./components/row-expand/useRowExpansion";
import { TableColumn, TableConfig, type AccordionConfig } from "../../types";
import type { FilterConfig } from "@/platform/url-kit/filters/feature-filtering/components/filter-types";
import type { SortConfig } from "@/platform/url-kit/filters/feature-sorting/types";
import { RowExpansionConfig } from "./components/row-expand/types";
import { GroupConfig, groupData, GroupedData } from "./utils/grouping-utils";
import { useGroupState } from "./hooks/useGroupState";
import { useGroupSortState } from "./hooks/useGroupSortState";
import { flattenGroupedRows, FlattenedRow } from "./utils/flatten-grouped-rows";
import { sortGroupedData } from "./utils/sort-grouped-data";
import { GroupHeader } from "./components/group-header";
import VirtualizedTableHeader from "./components/filtering-table-header";
import { useContainerHeight } from "./hooks/ui/useContainerHeight";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the VirtualizedListComponent
 * Some props come directly from parent, others are destructured from tableConfig
 */
interface VirtualizedTableComponentProps<T = any> {
  // ============================================
  // Data & Display Props
  // ============================================
  data: T[];
  columns: TableColumn<T>[];
  visibleColumns: TableColumn<T>[];
  
  // ============================================
  // Refs
  // ============================================
  listRef: React.RefObject<FixedSizeList | VariableSizeList | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  
  // ============================================
  // Event Handlers
  // ============================================
  onRowClick?: (row: T) => void;
  onRowPointerEnter?: (row: T) => void;
  onActionClick?: (action: string, row: T) => void;
  onCellValueChange?: (rowIndex: number, columnKey: string, newValue: any) => void;
  actionConfigs?: (row: T) => any[];
  
  // ============================================
  // Accordion & Grouping Props
  // ============================================
  accordionConfig?: AccordionConfig;
  handleGroupToggle: (groupId: string) => void;
  openGroups: Set<string>;
  
  // ============================================
  // Selection & State Props
  // ============================================
  selectedItemId?: string | number;
  isItemLoading?: boolean;
  
  // ============================================
  // Configuration Objects
  // ============================================
  tableConfig?: TableConfig<T>;
  // Column actions configuration - maps column keys to action handler functions
  columnActions?: Record<string, (item: T, value: any) => void | Promise<void>>;
  // Dynamic grouping state (overrides config)
  selectedGroupBy?: string | null;
  selectedSubGroupBy?: string | null;
  // When true, ignore config-based grouping and use only selectedGroupBy
  minimalControlsConfig?: {
    availableColumnsForGrouping?: string[];
  };
  // Filter props for header filters
  filters?: FilterConfig[];
};
////////////////////////////////////
// Component Implementation: Main table logic
////////////////////////////////////

/**
 * High-performance virtualized table component
 * Supports sorting, filtering, pagination, and virtualization
 * 
 * @template T - The type of data items in the table
 * @param {VirtualizedTableComponentProps<T>} props - Component props
 * @returns {JSX.Element} Complete table component
 */
export function VirtualizedTableComponent<T = any>({
  // Data & Display Props
  data,
  columns,
  visibleColumns,
  
  // Refs
  listRef,
  scrollContainerRef,
  
  // Event Handlers
  onRowClick,
  onRowPointerEnter,
  onActionClick,
  onCellValueChange,
  actionConfigs,
  
  // Accordion & Grouping Props
  accordionConfig,
  handleGroupToggle,
  openGroups,
  
  // Selection & State Props
  selectedItemId,
  isItemLoading,
  
  // Configuration Objects
  tableConfig,
  columnActions,
  selectedGroupBy,
  selectedSubGroupBy,
  minimalControlsConfig,
  filters,
}: VirtualizedTableComponentProps<T>) {
  // Extract props from tableConfig
  const {
    rowHeight = 40,
    minRowHeight = 40,
    tableHeight,
    dynamicRowHeight = true,
    emptyMessage = "No data available",
    loading,
    loadingStateShimmer = false,
    rowExpansion,
    actionMode = 'inline',
    editableColumns,
    groupStylerConfig,
    rowStyler,
    rowHighlighting,
    transparentHeader = false,
    headerFilters,
    sortConfig,
  } = tableConfig || {};

  ////////////////////////////////////
  // Refs: Virtualized list reference for scroll control
  ////////////////////////////////////
  
  // Reference to the virtualized list for scroll control - REMOVED


  ////////////////////////////////////
  // Row Height State: Track calculated row height
  ////////////////////////////////////
  
  // State to store the calculated row height from measurement
  const [calculatedRowHeight, setCalculatedRowHeight] = useState(rowHeight);

  ////////////////////////////////////
  // Row Expansion: Manage expandable row state
  ////////////////////////////////////
  
  // Initialize row expansion hook if config is provided
  const rowExpansionEnabled = rowExpansion?.enabled !== false && !!rowExpansion;
  const {
    isRowExpanded,
    toggleRow,
    getChildren,
    isLoadingChildren,
    setListRef,
    resetAfterIndex
  } = useRowExpansion<T>(rowExpansionEnabled ? rowExpansion : undefined);







  ////////////////////////////////////
  // Pagination Hook: Manage pagination state and logic - REMOVED
  ////////////////////////////////////

  ////////////////////////////////////
  // Internal Search State: Manage global search results - REMOVED
  ////////////////////////////////////

  
  ////////////////////////////////////
  // Filtering Hook: Manage filtering state and logic - REMOVED
  ////////////////////////////////////

  // Initialize accordion column management - REMOVED
  
  ////////////////////////////////////
  // Sorting Hook: Manage sorting state and logic - REMOVED
  ////////////////////////////////////

  ////////////////////////////////////
  // Search Effect: Run global search when search text changes - REMOVED
  ////////////////////////////////////
  

  ////////////////////////////////////
  // Grouping Logic: Group data if tableConfig has grouping properties
  ////////////////////////////////////
  
  /**
   * Per-group sort state management
   */
  const groupSortState = useGroupSortState();

  /**
   * Determine effective grouping
   * If minimalControlsConfig is present, only use selectedGroupBy (ignore config)
   * Otherwise, use selectedGroupBy with config as fallback
   */
  const isMinimalControlsEnabled = minimalControlsConfig !== undefined;
  const effectiveGroupBy = isMinimalControlsEnabled 
    ? selectedGroupBy || null 
    : selectedGroupBy || tableConfig?.groupBy;
  const effectiveSubGroupBy = isMinimalControlsEnabled 
    ? selectedSubGroupBy || null 
    : selectedSubGroupBy || tableConfig?.subGroupBy;

  /**
   * Group data if effectiveGroupBy is set
   * Apply per-group sorting after grouping
   */
  const groupedData = useMemo(() => {
    if (!effectiveGroupBy) return null;
    
    const effectiveConfig: GroupConfig = {
      groupBy: effectiveGroupBy || undefined,
      subGroupBy: effectiveSubGroupBy || undefined,
      groupKeyFormatter: tableConfig?.groupKeyFormatter,
      subGroupKeyFormatter: tableConfig?.subGroupKeyFormatter,
      groupSpacing: tableConfig?.groupSpacing,
    };
    
    const grouped = groupData(data as Record<string, any>[], effectiveConfig);
    // Apply per-group sorting
    const sortConfigs = groupSortState.getSortConfigs();
    return sortGroupedData(grouped, sortConfigs, columns as TableColumn<Record<string, any>>[]) as GroupedData<T>[];
  }, [data, effectiveGroupBy, effectiveSubGroupBy, tableConfig, groupSortState, columns]);

  /**
   * Group state management
   */
  const groupState = useGroupState(groupedData || []);

  /**
   * Flatten grouped rows for virtualization
   */
  const flattenedRows = useMemo(() => {
    if (!groupedData) return null;
    
    const effectiveConfig: GroupConfig = {
      groupBy: effectiveGroupBy || undefined,
      subGroupBy: effectiveSubGroupBy || undefined,
      groupKeyFormatter: tableConfig?.groupKeyFormatter,
      subGroupKeyFormatter: tableConfig?.subGroupKeyFormatter,
      groupSpacing: tableConfig?.groupSpacing,
    };
    
    return flattenGroupedRows(groupedData, groupState, effectiveConfig);
  }, [groupedData, groupState, effectiveGroupBy, effectiveSubGroupBy, tableConfig]);

  ////////////////////////////////////
  // Data Processing: Calculate display data based on pagination
  ////////////////////////////////////
  
  /**
   * Get data to display.
   * When grouping is enabled, use flattened rows.
   * Otherwise returns data directly.
   */
  const displayData = useMemo(() => {
    // If grouping is enabled, return flattened rows (they will be handled differently in rowRenderer)
    if (flattenedRows) {
      return flattenedRows as any[];
    }
    
    // Default: return data directly
    return data;
  }, [data, flattenedRows]);

  ////////////////////////////////////
  // Row Height Calculation: Calculate height based on content
  ////////////////////////////////////
  
  /**
   * Calculate row height using measured height from TableRowMeasurer
   * Accounts for expanded content if row expansion is enabled
   * Also handles different row types when grouping is enabled
   */
  const calculateRowHeight = useCallback((index: number): number => {
    // If grouping is enabled, check row type
    if (flattenedRows && flattenedRows[index]) {
      const flattenedRow = flattenedRows[index];
      
      switch (flattenedRow.type) {
        case 'spacer':
          // Return configured spacing or 0
          return tableConfig?.groupSpacing || 0;
        
        case 'group-header':
        case 'sub-group-header':
          return 40; // Fixed height for group headers
        
        case 'table-header':
          return 50; // Fixed height for table headers
        
        case 'data-row':
          // Use existing row height calculation
          const baseHeight = calculatedRowHeight;
          
          // If row expansion is enabled, check if this row is expanded
          if (rowExpansionEnabled && flattenedRow.data) {
            const rowId = (flattenedRow.data as any)?.id;
            
            if (rowId && isRowExpanded(rowId)) {
              // Row is expanded, calculate height based on children count
              const children = getChildren(rowId);
              const childrenCount = children.length;
              
              if (childrenCount === 0) {
                return baseHeight + 20;
              }
              
              const heightPerChild = 40;
              const expandedHeight = childrenCount * heightPerChild;
              
              return baseHeight + expandedHeight;
            }
          }
          
          return baseHeight;
      }
    }
    
    // Default behavior (no grouping)
    const baseHeight = calculatedRowHeight;
    
    // If row expansion is enabled, check if this row is expanded
    if (rowExpansionEnabled && displayData[index]) {
      const item = displayData[index];
      const rowId = (item as any)?.id;
      
      if (rowId && isRowExpanded(rowId)) {
        // Row is expanded, calculate height based on children count
        const children = getChildren(rowId);
        const childrenCount = children.length;
        
        if (childrenCount === 0) {
          return baseHeight + 20;
        }
        
        const heightPerChild = 40;
        const expandedHeight = childrenCount * heightPerChild;
        
        return baseHeight + expandedHeight;
      }
    }
    
    // Default: return base height
    return baseHeight;
  }, [calculatedRowHeight, rowExpansionEnabled, displayData, isRowExpanded, getChildren, flattenedRows, tableConfig]);


  const { containerRef: bodyMeasureRef, height: measuredBodyHeight } =
    useContainerHeight({
      fixedHeight: tableHeight && tableHeight > 0 ? tableHeight : undefined,
      minHeight: 200,
    });

  const assignBodyScrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      bodyMeasureRef.current = node;
      if (scrollContainerRef) {
        (
          scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = node;
      }
    },
    [scrollContainerRef, bodyMeasureRef],
  );

  const listViewportHeight =
    tableHeight && tableHeight > 0 ? tableHeight : measuredBodyHeight;

  ////////////////////////////////////
  // Row Renderer: Render individual table rows
  ////////////////////////////////////
  
  /**
   * Render individual table rows with proper formatting
   * Handles cell value formatting and row click events
   * Also handles different row types when grouping is enabled
   */
  const rowRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    // If grouping is enabled, handle different row types
    if (flattenedRows && flattenedRows[index]) {
      const flattenedRow = flattenedRows[index];
      
      switch (flattenedRow.type) {
        case 'spacer':
          // Render empty div with spacing height
          return <div style={style} />;
        
        case 'group-header':
          // Extract field name from effectiveGroupBy path (e.g., "category" from "category" or "company.name")
          // Use effectiveGroupBy instead of tableConfig?.groupBy to support dynamic grouping
          const groupFieldName = effectiveGroupBy 
            ? effectiveGroupBy.split('.').pop() || ''
            : '';
          return (
            <GroupHeader
              groupKey={flattenedRow.groupKey!}
              groupValue={flattenedRow.groupData!.groupValue}
              isExpanded={groupState.isGroupExpanded(flattenedRow.groupKey!)}
              onToggle={() => groupState.toggleGroup(flattenedRow.groupKey!)}
              level={flattenedRow.level || 0}
              itemCount={flattenedRow.groupData!.items.length + (flattenedRow.groupData!.subGroups?.reduce((sum, sg) => sum + sg.items.length, 0) || 0)}
              style={style}
              fieldName={groupFieldName}
            />
          );
        
        case 'sub-group-header':
          // Extract field name from effectiveSubGroupBy path
          const subGroupFieldName = effectiveSubGroupBy 
            ? effectiveSubGroupBy.split('.').pop() || ''
            : '';
          return (
            <GroupHeader
              groupKey={flattenedRow.subGroupKey!}
              groupValue={flattenedRow.subGroupData!.groupValue}
              isExpanded={groupState.isSubGroupExpanded(flattenedRow.groupKey!, flattenedRow.subGroupKey!)}
              onToggle={() => groupState.toggleSubGroup(flattenedRow.groupKey!, flattenedRow.subGroupKey!)}
              level={flattenedRow.level || 1}
              itemCount={flattenedRow.subGroupData!.items.length}
              style={style}
              fieldName={subGroupFieldName}
            />
          );
        
        case 'table-header':
          // Create group-specific sort handler
          const handleGroupSort = (columnKey: string) => {
            const groupKey = flattenedRow.groupKey!;
            const subGroupKey = flattenedRow.subGroupKey;
            groupSortState.handleGroupSort(groupKey, subGroupKey, columnKey);
          };
          
          // Get group-specific sort config
          const groupSortConfig = groupSortState.getGroupSortConfig(
            flattenedRow.groupKey!,
            flattenedRow.subGroupKey
          );
          
          // Calculate indentation to align with parent group header
          // Same formula as group headers: level * 20px
          const tableHeaderIndent = (flattenedRow.level || 0) * 20;
          
          return (
            <div style={style}>
              <div 
                style={{ 
                  marginLeft: `${tableHeaderIndent}px`,
                  width: tableHeaderIndent > 0 ? `calc(100% - ${tableHeaderIndent}px)` : '100%'
                }} 
                className="border-b border-foreground/5"
              >
              <VirtualizedTableHeader
                columns={visibleColumns}
                transparentHeader={transparentHeader}
                hideFilters={true}
                filters={filters}
                headerFilterConfig={headerFilters}
                sortConfig={sortConfig}
              />
              </div>
            </div>
          );
        
        case 'data-row':
          const item = flattenedRow.data!;
          const isSelected = selectedItemId && (item as any).id && (item as any).id.toString() === selectedItemId.toString();
          const rowId = (item as any)?.id;
          
          // Calculate indentation to align with parent group header
          // Same formula as group headers: level * 20px
          const dataRowIndent = (flattenedRow.level || 0) * 20;
          
          // Create toggle handler that resets list after index
          const handleToggleRow = rowId ? async () => {
            await toggleRow(rowId, item as T);
            setTimeout(() => {
              resetAfterIndex(index);
            }, 0);
          } : undefined;
          
          return (
            <div style={style}>
              <div 
                style={{ 
                  marginLeft: `${dataRowIndent}px`,
                  width: dataRowIndent > 0 ? `calc(100% - ${dataRowIndent}px)` : '100%'
                }} 
                className="border-b border-foreground/5"
              >
              <VirtualizedTableRow
                item={item as T}
                columns={visibleColumns}
                onRowClick={onRowClick}
                onRowPointerEnter={onRowPointerEnter}
                style={{ height: style.height, width: '100%' }}
                isLastRow={index === flattenedRows.length - 1}
                onActionClick={onActionClick}
                actionMode={actionMode}
                actionClickConfigs={actionConfigs?.(item as T)}
                truncateText={!dynamicRowHeight}
                isSelected={!!isSelected}
                editableColumns={editableColumns}
                onCellValueChange={onCellValueChange}
                rowIndex={index}
                calculatedRowHeight={calculatedRowHeight}
                groupStylerConfig={groupStylerConfig}
                rowStyler={rowStyler}
                rowHighlighting={rowHighlighting}
                rowExpansionEnabled={rowExpansionEnabled}
                isRowExpanded={rowId ? isRowExpanded(rowId) : false}
                onToggleRow={handleToggleRow}
                expandedChildren={rowId && rowExpansionEnabled ? getChildren(rowId) : []}
                isLoadingChildren={rowId && rowExpansionEnabled ? isLoadingChildren(rowId) : false}
                renderExpandedContent={rowExpansion?.renderExpandedContent}
                expandedContentHeight={rowExpansion?.expandedContentHeight}
                columnActions={columnActions}
              />
              </div>
            </div>
          );
      }
    }
    
    // Default behavior (no grouping)
    const item = displayData[index];
    const isSelected = selectedItemId && (item as any).id && (item as any).id.toString() === selectedItemId.toString();
    const rowId = (item as any)?.id;
    
    // Create toggle handler that resets list after index
    const handleToggleRow = rowId ? async () => {
      await toggleRow(rowId, item);
      setTimeout(() => {
        resetAfterIndex(index);
      }, 0);
    } : undefined;
    
    return (
      <VirtualizedTableRow
        item={item}
        columns={visibleColumns}
        onRowClick={onRowClick}
        onRowPointerEnter={onRowPointerEnter}
        style={style}
        isLastRow={index === displayData.length - 1}
        onActionClick={onActionClick}
        actionMode={actionMode}
        actionClickConfigs={actionConfigs?.(item)}
        globalSearchText={undefined}
        truncateText={!dynamicRowHeight}
        isSelected={!!isSelected}
        editableColumns={editableColumns}
        onCellValueChange={onCellValueChange}
        rowIndex={index}
        calculatedRowHeight={calculatedRowHeight}
        groupStylerConfig={groupStylerConfig}
        rowStyler={rowStyler}
        rowHighlighting={rowHighlighting}
        searchHighlightStyle={undefined}
        rowExpansionEnabled={rowExpansionEnabled}
        isRowExpanded={rowId ? isRowExpanded(rowId) : false}
        onToggleRow={handleToggleRow}
        expandedChildren={rowId && rowExpansionEnabled ? getChildren(rowId) : []}
        isLoadingChildren={rowId && rowExpansionEnabled ? isLoadingChildren(rowId) : false}
        renderExpandedContent={rowExpansion?.renderExpandedContent}
        expandedContentHeight={rowExpansion?.expandedContentHeight}
        columnActions={columnActions}
      />
    );
  }, [displayData, visibleColumns, onRowClick, onRowPointerEnter, onActionClick, actionMode, actionConfigs, dynamicRowHeight, selectedItemId, editableColumns, onCellValueChange, groupStylerConfig, rowStyler, rowHighlighting, rowExpansionEnabled, isRowExpanded, toggleRow, getChildren, isLoadingChildren, rowExpansion, resetAfterIndex, columnActions, flattenedRows, groupState, groupSortState, transparentHeader]);

  ////////////////////////////////////
  // Scroll Container Ref- REMOVED
  ////////////////////////////////////


  return (
    <div className="relative flex h-full min-h-0 flex-col gap-0 p-0">
      {/* Hidden measurement component for accurate row height calculation (only when dynamic height is enabled) */}
      {dynamicRowHeight && displayData.length > 0 && (
        <TableRowMeasurer
          data={displayData}
          columns={columns}
          onHeightCalculated={setCalculatedRowHeight}
          onRowClick={onRowClick}
          onRowPointerEnter={onRowPointerEnter}
          onActionClick={onActionClick}
          actionMode={actionMode}
          actionConfigs={actionConfigs}
          globalSearchText={undefined}
          minRowHeight={minRowHeight}
        />
      )}
      
      {/* TABLE HEADER AND ROWS LIST CONTAINER
      contain the table header and the table rows list in a flex-col
      this allows the table header to be away from the scroll container, being visible all the time.
      */}
      
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div
          className={`shrink-0 z-10 w-full ${accordionConfig?.groups && accordionConfig?.groups?.length > 0 ? 'pt-[40px]' : ''}`}
        >
          <VirtualizedTableHeader
            columns={visibleColumns}
            accordionConfig={accordionConfig}
            handleGroupToggle={handleGroupToggle}
            openGroups={openGroups}
            transparentHeader={transparentHeader}
            filters={filters}
            headerFilterConfig={headerFilters}
            sortConfig={sortConfig}
          />
        </div>

        <div
          ref={assignBodyScrollRef}
          className={`relative min-h-0 flex-1 w-full overflow-hidden ${!isItemLoading ? '' : 'opacity-20 pointer-events-none'}`}
        >
          <div className="h-full w-full min-w-full">
                {loading ? (
                  loadingStateShimmer ? (
                    <LoadingRows
                      columns={columns}
                      rowHeight={rowHeight}
                      containerHeight={listViewportHeight}
                      showActions={!!onActionClick}
                      actionMode={actionMode}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <LoadingSpinner />
                    </div>
                  )
                ) : displayData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-medium mb-2">No data found</p>
                      <p className="text-sm">Try adjusting your filters or search terms</p>
                    </div>
                  </div>
                ) : displayData.length > 0 ? (
                  <div className="h-full relative">
                    {dynamicRowHeight ? (
                      <VariableSizeList
                        key={`table-${calculatedRowHeight}`} // Force re-render when height changes
                        ref={(ref: any) => {
                          listRef.current = ref;
                          if (rowExpansionEnabled) {
                            setListRef(ref);
                          }
                        }}
                        height={listViewportHeight}
                        width="100%"
                        itemCount={displayData.length}
                        itemSize={calculateRowHeight}
                        className="tertiary-scrollbar"
                      >
                        {rowRenderer}
                      </VariableSizeList>
                    ) : (
                      <FixedSizeList
                        ref={listRef as React.RefObject<FixedSizeList>}
                        height={listViewportHeight}
                        width="100%"
                        itemCount={displayData.length}
                        itemSize={rowHeight}
                        className="tertiary-scrollbar"
                      >
                        {rowRenderer}
                      </FixedSizeList>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    {emptyMessage}
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>

  );
} 