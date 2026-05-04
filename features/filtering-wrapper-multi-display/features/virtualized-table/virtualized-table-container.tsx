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
import VirtualizedTableHeader from "../../components/filtering-table-header";
import VirtualizedTablePagination from "./components/table-pagination-buttons";
import VirtualizedTablePaginationNumbers from "./components/table-pagination-buttons-2";
import { VirtualizedTableRow } from "./components/rows/table-row";
import { LoadingSpinner } from "../../components/loading-spinner";
import { LoadingRows } from "./components/rows/rows-loading-state";
import { TableRowMeasurer } from "./components/TableRowMeasurer";
import { useRowExpansion } from "./components/row-expand/useRowExpansion";
import { TableColumn, TableConfig, FilterConfig, FilterUniqueValuesMap } from "../../types";
import { RowExpansionConfig } from "./components/row-expand/types";
import { groupData, GroupConfig, GroupedData } from "./utils/grouping-utils";
import { useGroupState } from "./hooks/useGroupState";
import { flattenGroupedRows, FlattenedRow } from "./utils/flatten-grouped-rows";
import { GroupHeaderRow } from "./components/group-header-row";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the VirtualizedTableComponent
 * Some props come directly from parent, others are destructured from tableConfig and filterConfig
 */
interface VirtualizedTableComponentProps<T = any> {
  // ============================================
  // Data & Display Props
  // ============================================
  data: T[];
  columns: TableColumn<T>[];
  visibleColumns: TableColumn<T>[];
  sortedData: T[];
  filteredData: T[];
  
  // ============================================
  // Refs
  // ============================================
  listRef: React.RefObject<FixedSizeList | VariableSizeList | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  
  // ============================================
  // Event Handlers
  // ============================================
  onRowClick?: (row: T) => void;
  onActionClick?: (action: string, row: T) => void;
  onCellValueChange?: (rowIndex: number, columnKey: string, newValue: any) => void;
  actionConfigs?: (row: T) => any[];
  
  // ============================================
  // Sorting & Filtering Props
  // ============================================
  sortConfig: { key: string; direction: "ascending" | "descending" | "none" } | null;
  handleSort: (columnKey: string) => void;
  filters: Record<string, any>;
  handleFilterChange: (columnKey: string, values: any) => void;
  getFilteredDataExcludingColumn: (columnKey: string) => T[];
  effectiveSearchText: string;
  
  // ============================================
  // Pagination Props
  // ============================================
  usePagination: boolean;
  currentPage: number;
  handlePageChange: (page: number) => void;
  togglePaginationMode: () => void;
  /** When set, pagination uses this as total (API/server pagination). displayData is not sliced. */
  totalItemCount?: number;
  
  // ============================================
  // Accordion & Grouping Props
  // ============================================
  accordionConfig?: {
    groups: Array<{
      id: string;
      name: string;
      color: string;
      textColor: string;
    }>;
  };
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
  filterConfig?: FilterConfig<T>;
  filterUniqueValues?: FilterUniqueValuesMap;
  onFilterApply?: (key: string, items: string[], type: string, columnConfig?: { filterApiParams?: { text?: string; number?: { from: string; to: string }; date?: { start: string; end: string }; isArray?: boolean; valueField?: 'id' | 'item' } }) => void;
  // Column actions configuration - maps column keys to action handler functions
  columnActions?: Record<string, (item: T, value: any) => void | Promise<void>>;
  // Dynamic grouping state (overrides config)
  selectedGroupBy?: string | null;
  selectedSubGroupBy?: string | null;
  // Configuration for minimal controls
  minimalControlsConfig?: {
    availableColumns?: string[];
  };
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
  sortedData,
  filteredData,
  
  // Refs
  listRef,
  scrollContainerRef,
  
  // Event Handlers
  onRowClick,
  onActionClick,
  onCellValueChange,
  actionConfigs,
  
  // Sorting & Filtering Props
  sortConfig,
  handleSort,
  filters,
  handleFilterChange,
  getFilteredDataExcludingColumn,
  effectiveSearchText,
  
  // Pagination Props
  usePagination,
  currentPage,
  handlePageChange,
  togglePaginationMode,
  totalItemCount,
  
  // Accordion & Grouping Props
  accordionConfig,
  handleGroupToggle,
  openGroups,
  
  // Selection & State Props
  selectedItemId,
  isItemLoading,
  
  // Configuration Objects
  tableConfig,
  filterConfig,
  filterUniqueValues,
  onFilterApply,
  columnActions,
  selectedGroupBy,
  selectedSubGroupBy,
  minimalControlsConfig,
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
    transparentHeader = false,
    // Grouping config
    groupBy,
    subGroupBy,
    groupKeyFormatter,
    subGroupKeyFormatter,
  } = tableConfig || {};

  // Determine effective grouping
  // If minimalControlsConfig is present, only use selectedGroupBy (ignore config)
  // Otherwise, use selectedGroupBy with config as fallback
  const isMinimalControlsEnabled = minimalControlsConfig !== undefined;
  const effectiveGroupBy = isMinimalControlsEnabled 
    ? selectedGroupBy || null 
    : selectedGroupBy || groupBy;
  const effectiveSubGroupBy = isMinimalControlsEnabled 
    ? selectedSubGroupBy || null 
    : selectedSubGroupBy || subGroupBy;

  // Extract props from filterConfig
  const {
    itemsPerPage = 20,
    searchHighlightStyle = "bg-yellow-200 font-medium px-0 rounded text-inherit",
    autoApplyDropdown,
    showBadgesDropdown,
    rangeOpen,
    hidePaginationSwitch = false,
  } = filterConfig || {};
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
  // Grouping: Group data if grouping config is provided
  ////////////////////////////////////
  
  /**
   * Group data if effective grouping is set (selected state or config)
   */
  const groupedData = useMemo<GroupedData<T>[] | null>(() => {
    if (!effectiveGroupBy) return null;
    
    const groupConfig: GroupConfig = {
      groupBy: effectiveGroupBy || undefined,
      subGroupBy: effectiveSubGroupBy || undefined,
      groupKeyFormatter,
      subGroupKeyFormatter,
    };
    
    return groupData(filteredData as Record<string, any>[], groupConfig) as GroupedData<T>[];
  }, [filteredData, effectiveGroupBy, effectiveSubGroupBy, groupKeyFormatter, subGroupKeyFormatter]);

  /**
   * Group state management
   */
  const groupState = useGroupState(groupedData || []);

  /**
   * Flatten grouped rows for virtualization
   */
  const flattenedRows = useMemo<FlattenedRow<T>[] | null>(() => {
    if (!groupedData) return null;
    
    const groupConfig: GroupConfig = {
      groupBy: effectiveGroupBy || undefined,
      subGroupBy: effectiveSubGroupBy || undefined,
      groupKeyFormatter,
      subGroupKeyFormatter,
      groupSpacing: tableConfig?.groupSpacing,
    };
    
    return flattenGroupedRows(groupedData, groupState, groupConfig);
  }, [groupedData, groupState, effectiveGroupBy, effectiveSubGroupBy, groupKeyFormatter, subGroupKeyFormatter, tableConfig]);

  ////////////////////////////////////
  // Data Processing: Calculate display data based on pagination
  ////////////////////////////////////
  
  /**
   * Get data to display based on pagination settings.
   * When grouping is enabled, extract data rows from flattened structure.
   * When totalItemCount is set (API pagination), data is already the current page — no slice.
   * Otherwise returns current page slice of sortedData.
   */
  const displayData = useMemo(() => {
    // If grouping is enabled, extract data rows from flattened structure
    if (flattenedRows) {
      const dataRows = flattenedRows
        .filter(row => row.type === 'data-row')
        .map(row => row.data!);
      
      if (!usePagination) return dataRows;
      if (totalItemCount != null) return dataRows; // API pagination: data is already one page
      const totalItems = dataRows.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const actualPage = (currentPage > totalPages && totalPages > 0) ? 1 : currentPage;
      const startIndex = (actualPage - 1) * itemsPerPage;
      return dataRows.slice(startIndex, startIndex + itemsPerPage);
    }
    
    // Default behavior: no grouping
    if (!usePagination) return sortedData;
    if (totalItemCount != null) return sortedData; // API pagination: data is already one page
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const actualPage = (currentPage > totalPages && totalPages > 0) ? 1 : currentPage;
    const startIndex = (actualPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [flattenedRows, sortedData, usePagination, currentPage, itemsPerPage, totalItemCount]);

  const effectiveTotal = totalItemCount ?? sortedData.length;
  const effectiveTotalPages = Math.ceil(effectiveTotal / itemsPerPage);

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
          // Return spacing height from tableConfig
          return tableConfig?.groupSpacing || 0;
        
        case 'group-header':
        case 'sub-group-header':
          return calculatedRowHeight; // Same height as data rows
        
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


  ////////////////////////////////////
  // Dynamic Height Calculation: Calculate height based on visible rows
  ////////////////////////////////////
  
  /**
   * Get item count for virtualization
   * When grouping is enabled, use flattened rows count
   */
  const itemCount = useMemo(() => {
    if (flattenedRows) {
      return flattenedRows.length;
    }
    return displayData.length;
  }, [flattenedRows, displayData.length]);

  /**
   * Calculate table height based on the number of visible rows
   * Uses either fixed height or calculates based on row count
   * For variable list: sums individual row heights (including expanded children) up to itemsPerPage
   */
  const bodyHeight = useMemo(() => {
    // If fixed height is provided, use it
    if (tableHeight && tableHeight > 0) {
      return tableHeight;
    }
    
    // Calculate height based on visible rows
    // For variable list: sum individual row heights (including expanded children) up to itemsPerPage
    const rowCount = flattenedRows 
      ? Math.min(flattenedRows.length, itemsPerPage)
      : Math.min(displayData.length, itemsPerPage);
    const baseRowHeight = rowHeight || calculatedRowHeight || 40;
    
    let calculatedHeight: number;
    
    if (rowExpansionEnabled && dynamicRowHeight) {
      // Sum up all individual row heights (including expanded children)
      calculatedHeight = 0;
      for (let i = 0; i < rowCount; i++) {
        calculatedHeight += calculateRowHeight(i);
      }
    } else {
      // Simple calculation: row count * row height
      calculatedHeight = rowCount * baseRowHeight;
    }
    
    // Ensure minimum height (but don't cap maximum - let it grow as needed)
    const minHeight = 200;
    
    return Math.max(minHeight, calculatedHeight);
  }, [tableHeight, displayData.length, rowHeight, calculatedRowHeight, itemsPerPage, rowExpansionEnabled, dynamicRowHeight, calculateRowHeight]);

  // Reset list when flattenedRows changes (for grouping)
  // This happens when groups expand/collapse since flattenedRows depends on groupState
  useEffect(() => {
    if (flattenedRows && listRef.current && 'resetAfterIndex' in listRef.current) {
      (listRef.current as VariableSizeList).resetAfterIndex(0);
    }
  }, [flattenedRows]);

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
          // Render empty spacer row
          return <div style={style} />;
        
        case 'group-header':
          // Extract field name from effectiveGroupBy path
          const groupFieldName = effectiveGroupBy 
            ? effectiveGroupBy.split('.').pop() || ''
            : '';
          return (
            <div style={style}>
              <GroupHeaderRow
                groupKey={flattenedRow.groupKey!}
                groupValue={flattenedRow.groupData!.groupValue}
                isExpanded={groupState.isGroupExpanded(flattenedRow.groupKey!)}
                onToggle={() => groupState.toggleGroup(flattenedRow.groupKey!)}
                level={0}
                itemCount={flattenedRow.groupData!.items.length + (flattenedRow.groupData!.subGroups?.reduce((sum, sg) => sum + sg.items.length, 0) || 0)}
                fieldName={groupFieldName}
                columns={visibleColumns}
              />
            </div>
          );
        
        case 'sub-group-header':
          // Extract field name from effectiveSubGroupBy path
          const subGroupFieldName = effectiveSubGroupBy 
            ? effectiveSubGroupBy.split('.').pop() || ''
            : '';
          return (
            <div style={style}>
              <GroupHeaderRow
                groupKey={flattenedRow.subGroupKey!}
                groupValue={flattenedRow.subGroupData!.groupValue}
                isExpanded={groupState.isSubGroupExpanded(flattenedRow.groupKey!, flattenedRow.subGroupKey!)}
                onToggle={() => groupState.toggleSubGroup(flattenedRow.groupKey!, flattenedRow.subGroupKey!)}
                level={1}
                itemCount={flattenedRow.subGroupData!.items.length}
                fieldName={subGroupFieldName}
                columns={visibleColumns}
              />
            </div>
          );
        
        case 'data-row':
          const item = flattenedRow.data!;
          const isSelected = selectedItemId && (item as any).id && (item as any).id.toString() === selectedItemId.toString();
          const rowId = (item as any)?.id;
          
          // Create toggle handler that resets list after index
          const handleToggleRow = rowId ? async () => {
            await toggleRow(rowId, item);
            setTimeout(() => {
              if (listRef.current && 'resetAfterIndex' in listRef.current) {
                (listRef.current as VariableSizeList).resetAfterIndex(index);
              }
            }, 0);
          } : undefined;
          
          return (
            <div style={style}>
              <VirtualizedTableRow
                item={item}
                columns={visibleColumns}
                onRowClick={onRowClick}
                style={{ height: style.height, width: '100%' }}
                isLastRow={index === flattenedRows.length - 1}
                onActionClick={onActionClick}
                actionMode={actionMode}
                actionClickConfigs={actionConfigs?.(item)}
                globalSearchText={effectiveSearchText}
                truncateText={!dynamicRowHeight}
                isSelected={!!isSelected}
                editableColumns={editableColumns}
                onCellValueChange={onCellValueChange}
                rowIndex={index}
                calculatedRowHeight={calculatedRowHeight}
                groupStylerConfig={groupStylerConfig}
                rowStyler={rowStyler}
                searchHighlightStyle={searchHighlightStyle}
                rowExpansionEnabled={rowExpansionEnabled}
                isRowExpanded={rowId ? isRowExpanded(rowId) : false}
                onToggleRow={handleToggleRow}
                expandedChildren={rowId && rowExpansionEnabled ? getChildren(rowId) : []}
                isLoadingChildren={rowId && rowExpansionEnabled ? isLoadingChildren(rowId) : false}
                renderExpandedContent={rowExpansion?.renderExpandedContent}
                expandedContentHeight={rowExpansion?.expandedContentHeight}
                columnActions={columnActions}
                indentLevel={flattenedRow.level || 0}
              />
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
        style={style}
        isLastRow={index === displayData.length - 1}
        onActionClick={onActionClick}
        actionMode={actionMode}
        actionClickConfigs={actionConfigs?.(item)}
        globalSearchText={effectiveSearchText}
        truncateText={!dynamicRowHeight}
        isSelected={!!isSelected}
        editableColumns={editableColumns}
        onCellValueChange={onCellValueChange}
        rowIndex={index}
        calculatedRowHeight={calculatedRowHeight}
        groupStylerConfig={groupStylerConfig}
        rowStyler={rowStyler}
        searchHighlightStyle={searchHighlightStyle}
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
  }, [flattenedRows, groupState, displayData, visibleColumns, onRowClick, onActionClick, actionMode, actionConfigs, dynamicRowHeight, effectiveSearchText, selectedItemId, editableColumns, onCellValueChange, groupStylerConfig, rowStyler, searchHighlightStyle, rowExpansionEnabled, isRowExpanded, toggleRow, getChildren, isLoadingChildren, rowExpansion, resetAfterIndex, columnActions, effectiveGroupBy, effectiveSubGroupBy]);

  ////////////////////////////////////
  // Scroll Container Ref- REMOVED
  ////////////////////////////////////


  return (
    <div className="flex flex-col h-full gap-0 p-0 relative">
      {/* Hidden measurement component for accurate row height calculation (only when dynamic height is enabled) */}
      {dynamicRowHeight && displayData.length > 0 && (
        <TableRowMeasurer
          data={displayData}
          columns={columns}
          onHeightCalculated={setCalculatedRowHeight}
          onRowClick={onRowClick}
          onActionClick={onActionClick}
          actionMode={actionMode}
          actionConfigs={actionConfigs}
          globalSearchText={effectiveSearchText}
          minRowHeight={minRowHeight}
        />
      )}
      
      {/* TABLE HEADER AND ROWS LIST CONTAINER
      contain the table header and the table rows list in a flex-col
      this allows the table header to be away from the scroll container, being visible all the time.
      */}
      
      <div className="flex flex-col flex-1 w-full overflow-auto">
        <div className={`sticky top-0 z-10 w-full ${accordionConfig?.groups && accordionConfig?.groups?.length > 0 ? 'pt-[40px]' : ''}`}>
          {/* Table header with sorting and filtering */}
          <VirtualizedTableHeader
            columns={visibleColumns}
            sortConfig={sortConfig || { key: "", direction: "none" }}
            handleSort={handleSort}
            activeFilters={filters}
            handleFilterChange={handleFilterChange}
            data={data}
            filteredData={filteredData}
            getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
            autoApplyDropdown={autoApplyDropdown}
            showBadgesDropdown={showBadgesDropdown}
            rangeOpen={rangeOpen}
            accordionConfig={accordionConfig}
            handleGroupToggle={handleGroupToggle}
            openGroups={openGroups}
            filterUniqueValues={filterUniqueValues}
            onFilterApply={onFilterApply}
            transparentHeader={transparentHeader}
          />
        </div>

        {/* #3 Table container - takes remaining space, and the absolute will overflow the component
        will leave overflow here as this div has width not allowing sticky to work till the end. better UX */}
        <div className="relative flex-1 w-full" ref={scrollContainerRef}>
          <div className={` top-0 left-0 h-full min-w-full  border-gray-200`}>
          {/* Table container with proper flex layout */}
            <div className={`h-full flex flex-col flex-1 min-h-0 rounded
              ${!isItemLoading ? '' : 'opacity-20 pointer-events-none'}`}>


              
              {/* Table body with virtualization - this is the key container */}
              <div className="flex-1 min-h-0 overflow">
                {loading ? (
                  loadingStateShimmer ? (
                    <LoadingRows
                      columns={columns}
                      rowHeight={rowHeight}
                      containerHeight={bodyHeight}
                      showActions={!!onActionClick}
                      actionMode={actionMode}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <LoadingSpinner />
                    </div>
                  )
                ) : itemCount === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-medium mb-2">No data found</p>
                      <p className="text-sm">Try adjusting your filters or search terms</p>
                    </div>
                  </div>
                ) : itemCount > 0 ? (
                  <div className="h-full relative">
                    {dynamicRowHeight ? (
                      <VariableSizeList
                        key={`table-${calculatedRowHeight}-${flattenedRows ? 'grouped' : 'ungrouped'}`} // Force re-render when height or grouping changes
                        ref={(ref: any) => {
                          listRef.current = ref;
                          if (rowExpansionEnabled) {
                            setListRef(ref);
                          }
                        }}
                        height={bodyHeight}
                        width="100%"
                        itemCount={itemCount}
                        itemSize={calculateRowHeight}
                        style={{
                          overflow: 'visible' // for sticky columns
                        }}
                      >
                        {rowRenderer}
                      </VariableSizeList>
                    ) : (
                      <FixedSizeList
                        ref={listRef as React.RefObject<FixedSizeList>}
                        height={rowHeight * itemCount}
                        width="100%"
                        itemCount={itemCount}
                        itemSize={rowHeight}
                        style={{
                          overflow: 'visible' // for sticky columns
                        }}
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
      </div>
      
      
      {/* Pagination controls (only shown when pagination is enabled) */}
      {usePagination && (
        <div className="flex flex-col gap-2">
          <VirtualizedTablePaginationNumbers
            currentPage={currentPage}
            totalPages={effectiveTotalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      
      {/* Table footer with stats and pagination toggle */}
      <div className={`flex items-center justify-between px-4 py-2 ${!usePagination ? 'bg-gray-50 border-t border-gray-200' : ''}`}>
        {!usePagination && (
        <div className="text-sm text-gray-500">
          Showing {displayData.length} of {effectiveTotal} items
        </div>
        )}
        {usePagination && (
        <div className="text-sm text-gray-500">
          {effectiveTotal === 0
            ? '0 items'
            : `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, effectiveTotal)} of ${effectiveTotal} items`}
        </div>
        )}
        {!hidePaginationSwitch && (
        <div className="flex items-center ml-auto">
          <label className="flex items-center text-sm text-gray-600 mr-2">
            <input
              type="checkbox"
              checked={usePagination}
              onChange={togglePaginationMode}
              className="mr-1"
            />
              Use pagination
            </label>
          </div>
        )}
      </div>
    </div>

  );
} 