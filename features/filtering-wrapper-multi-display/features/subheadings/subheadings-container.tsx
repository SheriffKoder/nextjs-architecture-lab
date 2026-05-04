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
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import VirtualizedTableHeader from "../../components/filtering-table-header";
import VirtualizedTablePagination from "./components/table-pagination-buttons";
import VirtualizedTablePaginationNumbers from "./components/table-pagination-buttons-2";
import { VirtualizedTableRow } from "./components/rows/table-row";
import { LoadingSpinner } from "../../components/loading-spinner";
import { LoadingRows } from "./components/rows/rows-loading-state";
import { TableRowMeasurer } from "./components/TableRowMeasurer";
import { useRowExpansion } from "./components/row-expand/useRowExpansion";
import { TableColumn, TableConfig, FilterConfig } from "../../types";
import { RowExpansionConfig } from "./components/row-expand/types";
import { ChevronDown } from "lucide-react";
import { getProjectStatusDisplayName } from "@/utils/projects/project-status-utils";
import { calculateGroupSums } from "./utils/calculate-group-sums";
import { GroupSummaryRow } from "./components/rows/group-summary-row";
// DnD imports
import { 
  useSubHeadingsDnd, 
  processGroupChange,
  DraggableRow, 
  DroppableGroup 
} from "./dnd";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the VirtualizedTableComponent
 * Some props come directly from parent, others are destructured from tableConfig and filterConfig
 */
interface SubHeadingsContainerProps<T = any> {
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
  // Column actions: Map of column keys to action handlers
  columnActions?: Record<string, (item: T, value: any) => void | Promise<void>>;
  
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
  
  // ============================================
  // Grouping Props
  // ============================================
  groupByKey?: string; // Key to group by (defaults to 'status')
  groupsConfig?: Array<{ key: string; label: string }>; // Explicit group configuration (shows all groups even if empty)
  nestedGrouping?: {
    enabled: boolean;
    primaryKey: string;      // Field name for primary grouping (e.g., 'project')
    secondaryKey: string;    // Field name for secondary grouping (e.g., 'phase')
    separator: string;       // Separator for composite keys (e.g., '|')
  };
  // Dynamic grouping state (overrides config)
  selectedGroupBy?: string | null;
  // When true, ignore config-based grouping and use only selectedGroupBy
  minimalControlsConfig?: {
    availableColumns?: string[];
  };
  
  // ============================================
  // Drag and Drop Props
  // ============================================
  subheadingsDragEnd?: (updatedData: T[], itemId?: string | number, targetGroupKey?: string) => void; // Callback when drag and drop completes
};
////////////////////////////////////
// Component Implementation: Main table logic
////////////////////////////////////

/**
 * High-performance virtualized table component
 * Supports sorting, filtering, pagination, and virtualization
 * 
 * @template T - The type of data items in the table
 * @param {SubHeadingsContainerProps<T>} props - Component props
 * @returns {JSX.Element} Complete table component
 */
export function SubHeadingsContainer<T = any>({
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
  columnActions,
  
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
  
  // Grouping Props
  groupByKey = 'status',
  groupsConfig,
  nestedGrouping,
  selectedGroupBy,
  minimalControlsConfig,
  
  // Drag and Drop Props
  subheadingsDragEnd,
}: SubHeadingsContainerProps<T>) {
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
  } = tableConfig || {};

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
  // Refs: SubHeadings list reference for scroll control
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
  // Drag and Drop: Initialize DnD functionality
  ////////////////////////////////////
  
  const {
    sensors,
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  } = useSubHeadingsDnd();

  // Get the dragged item for overlay
  const draggedItem = useMemo(() => {
    if (!dragState.activeId) return null;
    
    // Find the dragged item in filteredData
    return filteredData.find((item: any) => {
      const itemId = item.id || item._id;
      return String(itemId) === dragState.activeId;
    }) || null;
  }, [dragState.activeId, filteredData]);







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
  // Data Processing: Calculate display data based on pagination
  ////////////////////////////////////
  
  /**
   * Get data to display based on pagination settings
   * Returns all data if pagination is disabled, or current page slice if enabled
   */
  const displayData = useMemo(() => {
    if (!usePagination) return sortedData;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, usePagination, currentPage, itemsPerPage]);

  ////////////////////////////////////
  // Grouping: Group data by the specified key
  ////////////////////////////////////
  
  /**
   * Determine effective groupByKey
   * If minimalControlsConfig is present, only use selectedGroupBy (ignore config)
   * Otherwise, use selectedGroupBy with config as fallback
   */
  const isMinimalControlsEnabled = minimalControlsConfig !== undefined;
  const effectiveGroupByKey = isMinimalControlsEnabled
    ? (selectedGroupBy ?? undefined)
    : (selectedGroupBy ?? groupByKey);

  /**
   * Group filtered data by the effectiveGroupByKey
   * Returns a map of group values to arrays of items
   * If groupsConfig is provided, always includes all groups (even empty ones)
   * Supports nested grouping with composite keys (primary|secondary)
   */
  const groupedData = useMemo(() => {
    const groups: Record<string, T[]> = {};
    
    // If groupsConfig is provided, initialize all groups first (ensures empty groups are shown)
    if (groupsConfig && groupsConfig.length > 0) {
      groupsConfig.forEach((group) => {
        groups[group.key] = [];
      });
    }
    
    // Group items by effectiveGroupByKey or composite key for nested grouping
    filteredData.forEach((item) => {
      let compositeKey: string;
      
      if (nestedGrouping?.enabled) {
        // Use composite key for nested grouping
        const primaryValue = (item as any)[nestedGrouping.primaryKey] || 'Unknown';
        const secondaryValue = (item as any)[nestedGrouping.secondaryKey] || 'default';
        compositeKey = `${primaryValue}${nestedGrouping.separator}${secondaryValue}`;
      } else {
        // Fallback to single-level grouping using effectiveGroupByKey
        const groupValue = effectiveGroupByKey ? (item as any)[effectiveGroupByKey] : undefined;
        compositeKey = groupValue !== null && groupValue !== undefined ? String(groupValue) : 'Unknown';
      }
      
      if (!groups[compositeKey]) {
        groups[compositeKey] = [];
      }
      groups[compositeKey].push(item);
    });
    
    return groups;
  }, [filteredData, effectiveGroupByKey, groupsConfig, nestedGrouping]);

  /**
   * Get group keys - use config if provided, otherwise use data-driven keys
   */
  const groupKeys = useMemo(() => {
    if (groupsConfig && groupsConfig.length > 0) {
      // Use configured groups in order, ensuring all groups are shown
      return groupsConfig.map(group => group.key);
    }
    // Fallback to data-driven groups (original behavior)
    return Object.keys(groupedData).sort();
  }, [groupedData, groupsConfig]);

  /**
   * Format group display name
   * Uses label from groupsConfig if available, otherwise formats the key
   * For nested grouping, extracts the appropriate part (primary or secondary)
   */
  const formatGroupName = (key: string, extractPrimary: boolean = false): string => {
    // If nested grouping is enabled and we need to extract primary value
    if (nestedGrouping?.enabled && extractPrimary && key.includes(nestedGrouping.separator)) {
      const [primaryValue] = key.split(nestedGrouping.separator);
      // Format the primary value
      return primaryValue
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // If groupsConfig is provided, use the label from config
    if (groupsConfig) {
      const groupConfig = groupsConfig.find(g => g.key === key);
      if (groupConfig) {
        // For nested grouping with composite keys, extract just the secondary part from label
        if (nestedGrouping?.enabled && key.includes(nestedGrouping.separator)) {
          // Label format is "Primary - Secondary", extract just "Secondary"
          const parts = groupConfig.label.split(' - ');
          return parts.length > 1 ? parts[1] : groupConfig.label;
        }
        return groupConfig.label;
      }
    }
    
    // Fallback to original formatting logic
    if (groupByKey === 'status') {
      return getProjectStatusDisplayName(key);
    }
    // Default: capitalize and replace underscores
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // State for tracking which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(groupKeys));
  
  // State for tracking which primary groups are expanded (for nested grouping)
  const [expandedPrimaryGroups, setExpandedPrimaryGroups] = useState<Set<string>>(new Set());

  // Initialize all groups as expanded when groupKeys change
  useEffect(() => {
    setExpandedGroups(new Set(groupKeys));
    // Initialize primary groups as expanded if nested grouping is enabled
    if (nestedGrouping?.enabled) {
      const primaryValues = new Set<string>();
      groupKeys.forEach(key => {
        if (key.includes(nestedGrouping.separator)) {
          const [primaryValue] = key.split(nestedGrouping.separator);
          primaryValues.add(primaryValue);
        }
      });
      setExpandedPrimaryGroups(new Set(primaryValues));
    }
  }, [groupKeys.length, groupKeys.join(','), nestedGrouping]); // Update when groupKeys change

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const togglePrimaryGroup = (primaryKey: string) => {
    setExpandedPrimaryGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(primaryKey)) {
        newSet.delete(primaryKey);
      } else {
        newSet.add(primaryKey);
      }
      return newSet;
    });
  };

  /**
   * Create a map of primary groups to their secondary groups
   * Only used when nested grouping is enabled
   */
  const primaryGroupsMap = useMemo(() => {
    if (!nestedGrouping?.enabled) {
      return null;
    }
    
    const map: Record<string, Array<{ key: string; label: string; secondaryValue: string }>> = {};
    
    groupKeys.forEach(groupKey => {
      if (groupKey.includes(nestedGrouping.separator)) {
        const [primaryValue, secondaryValue] = groupKey.split(nestedGrouping.separator);
        
        if (!map[primaryValue]) {
          map[primaryValue] = [];
        }
        
        // Find label from groupsConfig or format secondary value
        const groupConfig = groupsConfig?.find(g => g.key === groupKey);
        const label = groupConfig?.label || formatGroupName(secondaryValue);
        
        map[primaryValue].push({ 
          key: groupKey, 
          label, 
          secondaryValue 
        });
      }
    });
    
    return map;
  }, [groupKeys, nestedGrouping, groupsConfig]);

  ////////////////////////////////////
  // Drag and Drop: Handle drag end event
  ////////////////////////////////////
  
  /**
   * Handle drag end event
   * Updates the item's groupByKey field and calls the callback
   */
  const onDragEnd = (event: any) => {
    if (!subheadingsDragEnd) {
      return;
    }

    const result = handleDragEnd(event);
    
    if (!result) {
      return;
    }

    const { itemId, targetGroupKey, dragSource } = result;

    // Don't process if dropped on the same group
    if (dragSource?.groupKey === targetGroupKey) {
      console.log('⏭️ Dropped on same group, skipping update');
      return;
    }

    // Process the group change - use data instead of filteredData to update source
    // Cast to Record<string, any>[] for processGroupChange, then cast back to T[]
    const updatedData = processGroupChange(
      data as Record<string, any>[],
      itemId,
      targetGroupKey,
      groupByKey,
      nestedGrouping  // Pass nested grouping config
    ) as T[];

    // Call the callback with updated data, itemId, and targetGroupKey for direct updates
    subheadingsDragEnd(updatedData, itemId, targetGroupKey);
  };

  ////////////////////////////////////
  // Row Height Calculation: Calculate height based on content
  ////////////////////////////////////
  
  /**
   * Calculate row height using measured height from TableRowMeasurer
   * Accounts for expanded content if row expansion is enabled
   */
  const calculateRowHeight = useCallback((index: number): number => {
    const baseHeight = calculatedRowHeight;
    
    // If row expansion is enabled, check if this row is expanded
    if (rowExpansionEnabled && displayData[index]) {
      const item = displayData[index];
      const rowId = (item as any)?.id;
      
      if (rowId && isRowExpanded(rowId)) {
        // Row is expanded, calculate height based on children count
        // Precise calculation: only row content, no padding
        const children = getChildren(rowId);
        const childrenCount = children.length;
        
        if (childrenCount === 0) {
          // Empty state: just the text line height (~20px)
          return baseHeight + 20;
        }
        
        // Per child row: title line (~20px) + subtitle line (~16px) + mt-1 (4px) = ~40px
        const heightPerChild = 40;
        
        // Calculate total expanded height (no padding, no spacing)
        const expandedHeight = childrenCount * heightPerChild;
        
        return baseHeight + expandedHeight;
      }
    }
    
    // Default: return base height
    return baseHeight;
  }, [calculatedRowHeight, rowExpansionEnabled, rowExpansion, displayData, isRowExpanded, getChildren]);


  ////////////////////////////////////
  // Dynamic Height Calculation: Calculate height based on visible rows
  ////////////////////////////////////
  
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
    const rowCount = Math.min(displayData.length, itemsPerPage);
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



  ////////////////////////////////////
  // Row Renderer: Render individual table rows
  ////////////////////////////////////
  
  /**
   * Render individual table rows with proper formatting
   * Handles cell value formatting and row click events
   */
  const rowRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = displayData[index];
    const isSelected = selectedItemId && (item as any).id && (item as any).id.toString() === selectedItemId.toString();
    const rowId = (item as any)?.id;
    
    // Create toggle handler that resets list after index
    const handleToggleRow = rowId ? async () => {
      await toggleRow(rowId, item);
      // Use setTimeout to ensure state updates are applied before resetting heights
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
        // Row expansion props
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
  }, [displayData, visibleColumns, onRowClick, onActionClick, actionMode, actionConfigs, dynamicRowHeight, effectiveSearchText, selectedItemId, editableColumns, onCellValueChange, groupStylerConfig, rowStyler, searchHighlightStyle, rowExpansionEnabled, isRowExpanded, toggleRow, getChildren, isLoadingChildren, rowExpansion, resetAfterIndex, columnActions]);

  ////////////////////////////////////
  // Scroll Container Ref- REMOVED
  ////////////////////////////////////


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={handleDragCancel}
    >
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
            columns={visibleColumns as TableColumn<any>[]}
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
          />
        </div>

        {/* #3 Table container - takes remaining space, and the absolute will overflow the component
        will leave overflow here as this div has width not allowing sticky to work till the end. better UX */}
        <div className="relative flex-1 w-full" ref={scrollContainerRef}>
          <div className={` top-0 left-0 h-full min-w-full  border-gray-200`}>
          {/* Table container with proper flex layout */}
            <div className={`h-full flex flex-col flex-1 min-h-0 rounded
              ${!isItemLoading ? '' : 'opacity-20 pointer-events-none'}`}>


              
              {/* Table body with grouped collapsible sections */}
              <div className="flex-1 min-h-0 w-full">
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
                ) : groupKeys.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-medium mb-2">No data found</p>
                      <p className="text-sm">Try adjusting your filters or search terms</p>
                    </div>
                  </div>
                ) : primaryGroupsMap ? (
                  // Nested rendering: Primary group headers with secondary groups
                  <div className="flex flex-col gap-6 w-full">
                    {Object.entries(primaryGroupsMap).map(([primaryValue, secondaryGroups]) => {
                      const isPrimaryExpanded = expandedPrimaryGroups.has(primaryValue);
                      // Extract primary label - use first secondary group's label to extract primary part
                      let primaryLabel = primaryValue
                        .replace(/_/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                      
                      // Try to get primary label from groupsConfig if available
                      if (groupsConfig && secondaryGroups.length > 0) {
                        const firstSecondaryKey = secondaryGroups[0].key;
                        const groupConfig = groupsConfig.find(g => g.key === firstSecondaryKey);
                        if (groupConfig) {
                          // Label format is "Primary - Secondary", extract just "Primary"
                          const parts = groupConfig.label.split(' - ');
                          if (parts.length > 1) {
                            primaryLabel = parts[0];
                          }
                        }
                      }
                      
                      return (
                        <div key={primaryValue} className="w-full">
                          {/* Primary Group Header */}
                          <div
                            className="w-full flex items-center justify-between px-0 py-3 cursor-pointer hover:bg-tertiary/10 group transition-colors border-b-2 border-tertiary/20 mb-2"
                            onClick={() => togglePrimaryGroup(primaryValue)}
                          >
                            <div className="flex items-center gap-2">
                              <ChevronDown
                                className={`w-5 h-5 text-foreground/80 group-hover:text-tertiary transition-transform duration-300 ${
                                  isPrimaryExpanded ? 'rotate-180' : ''
                                }`}
                              />
                              <span className="text-base font-semibold text-foreground group-hover:text-tertiary transition-colors">
                                {primaryLabel}
                              </span>
                            </div>
                          </div>

                          {/* Secondary Groups (nested under primary) */}
                          <div
                            className={`ml-4 transition-all duration-300 ease-in-out ${
                              isPrimaryExpanded ? 'opacity-100 max-h-[10000px]' : 'opacity-0 max-h-0 overflow-hidden'
                            }`}
                          >
                            <div className="flex flex-col gap-4">
                              {secondaryGroups.map(({ key: secondaryKey, label: secondaryLabel }) => {
                                const groupItems = groupedData[secondaryKey];
                                const isExpanded = expandedGroups.has(secondaryKey);
                                
                                return (
                                  <DroppableGroup
                                    key={secondaryKey}
                                    groupKey={secondaryKey}
                                    isExpanded={isExpanded}
                                  >
                                    <div className="w-full">
                                      {/* Secondary Group Header */}
                                      <div
                                        className="w-full flex items-center justify-between px-0 py-2 cursor-pointer hover:bg-tertiary/5 group transition-colors border-b border-tertiary/10"
                                        onClick={() => toggleGroup(secondaryKey)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <ChevronDown
                                            className={`w-4 h-4 text-foreground/70 group-hover:text-tertiary transition-transform duration-300 ${
                                              isExpanded ? 'rotate-180' : ''
                                            }`}
                                          />
                                          <span className="text-sm font-medium text-foreground/90 group-hover:text-tertiary transition-colors">
                                            {secondaryLabel}
                                          </span>
                                          <span className="text-xs text-foreground/50 group-hover:text-tertiary transition-colors">
                                            ({groupItems.length})
                                          </span>
                                        </div>
                                      </div>

                                      {/* Collapsible Content */}
                                      <div
                                        className={`grid transition-all duration-300 ease-in-out ${
                                          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                        }`}
                                      >
                                        <div className={`w-full ${!isExpanded ? 'overflow-hidden' : ''}`}>
                                          <div className="w-full">
                                            {groupItems.map((item, index) => {
                                              const isSelected = selectedItemId && (item as any).id && (item as any).id.toString() === selectedItemId.toString();
                                              const rowId = (item as any)?.id;
                                              const itemId = (item as any)?.id || (item as any)?._id || index;
                                              
                                              // Create toggle handler that resets list after index
                                              const handleToggleRow = rowId ? async () => {
                                                await toggleRow(rowId, item);
                                                // Use setTimeout to ensure state updates are applied before resetting heights
                                                setTimeout(() => {
                                                  resetAfterIndex(index);
                                                }, 0);
                                              } : undefined;

                                              return (
                                                <DraggableRow
                                                  key={itemId}
                                                  item={item}
                                                  itemId={itemId}
                                                  groupKey={secondaryKey}
                                                  rowIndex={index}
                                                  isSummaryRow={false}
                                                >
                                                  <VirtualizedTableRow
                                                    item={item}
                                                    columns={visibleColumns}
                                                    onRowClick={onRowClick}
                                                    style={{ width: '100%' }}
                                                    isLastRow={index === groupItems.length - 1}
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
                                                    // Row expansion props
                                                    rowExpansionEnabled={rowExpansionEnabled}
                                                    isRowExpanded={rowId ? isRowExpanded(rowId) : false}
                                                    onToggleRow={handleToggleRow}
                                                    expandedChildren={rowId && rowExpansionEnabled ? getChildren(rowId) : []}
                                                    isLoadingChildren={rowId && rowExpansionEnabled ? isLoadingChildren(rowId) : false}
                                                    renderExpandedContent={rowExpansion?.renderExpandedContent}
                                                    expandedContentHeight={rowExpansion?.expandedContentHeight}
                                                  />
                                                </DraggableRow>
                                              );
                                            })}
                                            
                                            {/* Summary Row - Display sums for number field columns */}
                                            {(() => {
                                              const sums = calculateGroupSums({
                                                items: groupItems,
                                                columns: visibleColumns
                                              });
                                              
                                              return (
                                                <GroupSummaryRow
                                                  key={`summary-${secondaryKey}`}
                                                  columns={visibleColumns}
                                                  groupSums={sums}
                                                />
                                              );
                                            })()}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </DroppableGroup>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Original flat rendering (backward compatibility)
                  <div className="flex flex-col gap-8 w-full">
                    {groupKeys.map((groupKey) => {
                      const groupItems = groupedData[groupKey];
                      const isExpanded = expandedGroups.has(groupKey);
                      
                      // Group Header + Group Items + Group Summary Row
                      return (
                        <DroppableGroup
                          key={groupKey}
                          groupKey={groupKey}
                          isExpanded={isExpanded}
                        >
                        <div className="w-full">
                          {/* Collapsible Header */}
                          <div
                            className="w-[100%] flex items-center justify-between px-0 py-3 cursor-pointer hover:bg-tertiary/10 group transition-colors border-b border-tertiary/10"
                            onClick={() => toggleGroup(groupKey)}
                          >
                            <div className="flex items-center gap-2 sticky left-2">
                              <ChevronDown
                                className={`w-4 h-4 text-foreground/70 group-hover:text-tertiary transition-transform duration-300 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />                                   
                              <span className="text-sm font-medium text-foreground group-hover:text-tertiary transition-transform duration-300">
                                {formatGroupName(groupKey)}
                              </span>
                              <span className="text-xs text-foreground/50 group-hover:text-tertiary transition-transform duration-300">
                                ({groupItems.length})
                              </span>
                            </div>
                          </div>

                          {/* Collapsible Content */}
                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                            }`}
                          >
                            <div className={`w-full ${!isExpanded ? 'overflow-hidden' : ''}`}>
                              <div className="w-full">
                                {groupItems.map((item, index) => {
                                  const isSelected = selectedItemId && (item as any).id && (item as any).id.toString() === selectedItemId.toString();
                                  const rowId = (item as any)?.id;
                                  const itemId = (item as any)?.id || (item as any)?._id || index;
                                  
                                  // Create toggle handler that resets list after index
                                  const handleToggleRow = rowId ? async () => {
                                    await toggleRow(rowId, item);
                                    // Use setTimeout to ensure state updates are applied before resetting heights
                                    setTimeout(() => {
                                      resetAfterIndex(index);
                                    }, 0);
                                  } : undefined;

                                  return (
                                    <DraggableRow
                                      key={itemId}
                                      item={item}
                                      itemId={itemId}
                                      groupKey={groupKey}
                                      rowIndex={index}
                                      isSummaryRow={false}
                                    >
                                      <VirtualizedTableRow
                                        item={item}
                                        columns={visibleColumns}
                                        onRowClick={onRowClick}
                                        style={{ width: '100%' }}
                                        isLastRow={index === groupItems.length - 1}
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
                                        // Row expansion props
                                        rowExpansionEnabled={rowExpansionEnabled}
                                        isRowExpanded={rowId ? isRowExpanded(rowId) : false}
                                        onToggleRow={handleToggleRow}
                                        expandedChildren={rowId && rowExpansionEnabled ? getChildren(rowId) : []}
                                        isLoadingChildren={rowId && rowExpansionEnabled ? isLoadingChildren(rowId) : false}
                                        renderExpandedContent={rowExpansion?.renderExpandedContent}
                                        expandedContentHeight={rowExpansion?.expandedContentHeight}
                                      />
                                    </DraggableRow>
                                  );
                                })}
                                
                                {/* Summary Row - Display sums for number field columns */}
                                {(() => {
                                  const sums = calculateGroupSums({
                                    items: groupItems,
                                    columns: visibleColumns
                                  });
                                  
                                  return (
                                    <GroupSummaryRow
                                      key={`summary-${groupKey}`}
                                      columns={visibleColumns}
                                      groupSums={sums}
                                    />
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                        </DroppableGroup>
                      );
                    })}
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
          {/* <VirtualizedTablePagination
            currentPage={currentPage}
            totalPages={Math.ceil(sortedData.length / itemsPerPage)}
            onPageChange={handlePageChange}
            totalItems={sortedData.length}
            itemsPerPage={itemsPerPage}
          /> */}
          <VirtualizedTablePaginationNumbers
            currentPage={currentPage}
            totalPages={Math.ceil(sortedData.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      
      {/* Table footer with stats and pagination toggle */}
      <div className={`flex items-center justify-between px-4 py-2 ${!usePagination ? 'bg-gray-50 border-t border-gray-200' : ''}`}>
        {!usePagination && (
        <div className="text-sm text-gray-500">
          Showing {displayData.length} of {sortedData.length} items
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

      {/* Drag Overlay - Shows ghost row during drag */}
      <DragOverlay>
        {dragState.activeId && draggedItem ? (
          <div className="opacity-50 bg-tertiary/50 border-2 border-tertiary rounded">
            <VirtualizedTableRow
              item={draggedItem}
              columns={visibleColumns}
              style={{ width: '100%' }}
              isLastRow={false}
              globalSearchText={effectiveSearchText}
              truncateText={!dynamicRowHeight}
              calculatedRowHeight={calculatedRowHeight}
              groupStylerConfig={groupStylerConfig}
              rowStyler={rowStyler}
              searchHighlightStyle={searchHighlightStyle}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
} 