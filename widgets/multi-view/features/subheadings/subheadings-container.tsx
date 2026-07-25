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

import React, { useState, useRef, useCallback, useMemo, useEffect, Fragment } from "react";
import { VariableSizeList, FixedSizeList } from "react-window";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type DragEndEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import VirtualizedTableHeader from "../../components/filtering-table-header";
import { VirtualizedTableRow } from "./components/rows/table-row";
import { LoadingSpinner } from "../../components/loading-spinner";
import { LoadingRows } from "./components/rows/rows-loading-state";
import { TableRowMeasurer } from "./components/TableRowMeasurer";
import { useRowExpansion } from "./components/row-expand/useRowExpansion";
import {
  TableColumn,
  TableConfig,
  HeaderFilterConfig,
  type AccordionConfig,
} from "../../types";
import type { FilterConfig } from "@/platform/url-kit/filters/feature-filtering/components/filter-types";
import { RowExpansionConfig } from "./components/row-expand/types";
import { ChevronDown } from "lucide-react";
import { calculateGroupSums } from "./utils/calculate-group-sums";
import { GroupSummaryRow } from "./components/rows/group-summary-row";
// DnD imports
import type { SubheadingsUpdateContext } from "./dnd";
import {
  useSubHeadingsDnd,
  processGroupChange,
  useSubheadingsReducerState,
  DraggableRow,
  DroppableGroup,
  DroppableRowCell,
  createCellId,
  SUBHEADINGS_DROP_PLACEHOLDER_HEIGHT,
} from "./dnd";
import { useContainerHeight } from "./hooks/ui/useContainerHeight";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the SubHeadingsContainer
 * Some props come directly from parent, others are destructured from tableConfig
 */
interface SubHeadingsContainerProps<T = any> {
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
  // Column actions: Map of column keys to action handlers
  columnActions?: Record<string, (item: T, value: any) => void | Promise<void>>;
  
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
  /** With minimal controls: secondary field for nested grouping (from GroupingControl). */
  selectedSubGroupBy?: string | null;
  // When true, ignore config-based grouping and use only selectedGroupBy
  minimalControlsConfig?: {
    availableColumnsForGrouping?: string[];
  };
  
  // ============================================
  // Drag and Drop Props
  // ============================================
  subheadingsDragEnd?: (updatedData: T[], itemId?: string | number, targetGroupKey?: string) => void; // Callback when drag and drop completes
  /** Per-row reorder + cross-bucket drops; nested uses composite keys + primary/secondary fields (see upgrade plan). */
  manualSorting?: boolean;
  idKey?: string;
  onSubheadingsItemUpdate?: (ctx: SubheadingsUpdateContext<T>) => void | Promise<void>;
  loadingItemIds?: string[];
  isManualOnChangeRef?: React.MutableRefObject<boolean>;
  /** Hide group chrome; use with a single bucket + manualSorting for reorder-only UIs. */
  listView?: boolean;

  // ============================================
  // Header Filter Props
  // ============================================
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
 * @param {SubHeadingsContainerProps<T>} props - Component props
 * @returns {JSX.Element} Complete table component
 */
export function SubHeadingsContainer<T = any>({
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
  columnActions,
  
  // Accordion & Grouping Props
  accordionConfig,
  handleGroupToggle,
  openGroups,
  
  // Selection & State Props
  selectedItemId,
  isItemLoading,
  
  // Configuration Objects
  tableConfig,
  
  // Grouping Props
  groupByKey = 'status',
  groupsConfig,
  nestedGrouping,
  selectedGroupBy,
  selectedSubGroupBy,
  minimalControlsConfig,
  
  // Drag and Drop Props
  subheadingsDragEnd,
  manualSorting = false,
  idKey = "id",
  onSubheadingsItemUpdate,
  loadingItemIds,
  isManualOnChangeRef,
  listView = false,

  // Header Filter Props
  filters,
}: SubHeadingsContainerProps<T>) {
  // Extract props from tableConfig
  const {
    rowHeight = 40,
    minRowHeight = 40,
    tableHeight,
    dynamicRowHeight = true,
    headerFilters,
    sortConfig,
    emptyMessage = "No data available",
    loading,
    loadingStateShimmer = false,
    rowExpansion,
    actionMode = 'inline',
    editableColumns,
    groupStylerConfig,
    rowStyler,
    rowHighlighting,
    subheadingsDisableRowDrag = false,
  } = tableConfig || {};

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
  
  // Use data directly (no pagination)
  const displayData = data;

  ////////////////////////////////////
  // Grouping: Group data by the specified key
  ////////////////////////////////////
  
  /**
   * Determine effective groupByKey
   * If minimalControlsConfig is present, use selectedGroupBy if set, otherwise fall back to groupByKey
   * (Subheadings view always needs grouping, so we can't use undefined)
   * Otherwise, use selectedGroupBy with config as fallback
   */
  const isMinimalControlsEnabled = minimalControlsConfig !== undefined;
  const effectiveGroupByKey = isMinimalControlsEnabled
    ? (selectedGroupBy ?? groupByKey)
    : (selectedGroupBy ?? groupByKey);

  /**
   * Nested grouping: GroupingControl wins when minimal controls are on and both keys are set;
   * otherwise use static subheadingsConfig.nestedGrouping.
   */
  const effectiveNestedGrouping = useMemo(() => {
    if (
      isMinimalControlsEnabled &&
      selectedGroupBy &&
      selectedSubGroupBy
    ) {
      return {
        enabled: true as const,
        primaryKey: selectedGroupBy,
        secondaryKey: selectedSubGroupBy,
        separator: nestedGrouping?.separator ?? '|',
      };
    }
    return nestedGrouping;
  }, [
    isMinimalControlsEnabled,
    selectedGroupBy,
    selectedSubGroupBy,
    nestedGrouping,
  ]);

  /**
   * Group data by the effectiveGroupByKey
   * Returns a map of group values to arrays of items
   * If groupsConfig is provided, always includes all groups (even empty ones)
   * Supports nested grouping with composite keys (primary|secondary)
   */
  const derivedGroupedData = useMemo(() => {
    const groups: Record<string, T[]> = {};
    
    // If groupsConfig is provided, initialize all groups first (ensures empty groups are shown)
    if (groupsConfig && groupsConfig.length > 0) {
      groupsConfig.forEach((group) => {
        groups[group.key] = [];
      });
    }
    
    // Group items by effectiveGroupByKey or composite key for nested grouping
    displayData.forEach((item) => {
      let compositeKey: string;
      
      if (effectiveNestedGrouping?.enabled) {
        // Use composite key for nested grouping
        const primaryValue = (item as any)[effectiveNestedGrouping.primaryKey] || 'Unknown';
        const secondaryValue = (item as any)[effectiveNestedGrouping.secondaryKey] || 'default';
        compositeKey = `${primaryValue}${effectiveNestedGrouping.separator}${secondaryValue}`;
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

    if (manualSorting) {
      Object.keys(groups).forEach((k) => {
        groups[k] = [...groups[k]].sort(
          (a, b) =>
            ((a as Record<string, number>).manual_sorting ?? 0) -
            ((b as Record<string, number>).manual_sorting ?? 0)
        );
      });
    }
    
    return groups;
  }, [displayData, effectiveGroupByKey, groupsConfig, effectiveNestedGrouping, manualSorting]);

  const manualSortActive = manualSorting === true;

  const nestedGroupingForReducer =
    effectiveNestedGrouping?.enabled === true ? effectiveNestedGrouping : undefined;

  const { state: boardState, dispatch } = useSubheadingsReducerState<T>(
    derivedGroupedData,
    effectiveGroupByKey,
    isManualOnChangeRef,
    onSubheadingsItemUpdate,
    idKey,
    nestedGroupingForReducer
  );

  const groupedData = manualSortActive ? boardState.groupedData : derivedGroupedData;

  const subheadingsPointerRef = useRef<{ x: number; y: number } | null>(null);

  const subheadingsCollisionDetection = useMemo<CollisionDetection>(() => {
    return (args) => {
      if (args.pointerCoordinates != null) {
        subheadingsPointerRef.current = args.pointerCoordinates;
      }
      return pointerWithin(args);
    };
  }, []);

  const {
    sensors,
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useSubHeadingsDnd({
    manualSorting: manualSortActive,
    dispatch,
    groupedData: manualSortActive ? boardState.groupedData : undefined,
    idKey,
    boardState: manualSortActive ? boardState : undefined,
    pointerCoordinatesRef: manualSortActive ? subheadingsPointerRef : undefined,
  });

  const draggedItem = useMemo(() => {
    if (!dragState.activeId) return null;
    if (manualSortActive) {
      for (const k of Object.keys(groupedData)) {
        const found = groupedData[k].find((item) => {
          const row = item as Record<string, unknown>;
          return String(row[idKey] ?? "") === dragState.activeId;
        });
        if (found) return found;
      }
      return null;
    }
    return (
      data.find((item: any) => {
        const rid = item.id ?? item._id;
        return String(rid) === dragState.activeId;
      }) || null
    );
  }, [dragState.activeId, data, groupedData, idKey, manualSortActive]);

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
    if (effectiveNestedGrouping?.enabled && extractPrimary && key.includes(effectiveNestedGrouping.separator)) {
      const [primaryValue] = key.split(effectiveNestedGrouping.separator);
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
        if (effectiveNestedGrouping?.enabled && key.includes(effectiveNestedGrouping.separator)) {
          // Label format is "Primary - Secondary", extract just "Secondary"
          const parts = groupConfig.label.split(' - ');
          return parts.length > 1 ? parts[1] : groupConfig.label;
        }
        return groupConfig.label;
      }
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
    if (effectiveNestedGrouping?.enabled) {
      const primaryValues = new Set<string>();
      groupKeys.forEach(key => {
        if (key.includes(effectiveNestedGrouping.separator)) {
          const [primaryValue] = key.split(effectiveNestedGrouping.separator);
          primaryValues.add(primaryValue);
        }
      });
      setExpandedPrimaryGroups(new Set(primaryValues));
    }
  }, [groupKeys.length, groupKeys.join(','), effectiveNestedGrouping]); // Update when groupKeys change

  const toggleGroup = (groupKey: string) => {
    if (listView) return;
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
    if (!effectiveNestedGrouping?.enabled) {
      return null;
    }
    
    const map: Record<string, Array<{ key: string; label: string; secondaryValue: string }>> = {};
    
    groupKeys.forEach(groupKey => {
      if (groupKey.includes(effectiveNestedGrouping.separator)) {
        const [primaryValue, secondaryValue] = groupKey.split(effectiveNestedGrouping.separator);
        
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
  }, [groupKeys, effectiveNestedGrouping, groupsConfig]);

  ////////////////////////////////////
  // Drag and Drop: Handle drag end event
  ////////////////////////////////////
  
  /**
   * Handle drag end event
   * Updates the item's groupByKey field and calls the callback
   */
  const onDragEnd = (event: DragEndEvent) => {
    if (manualSortActive) {
      handleDragEnd(event);
      return;
    }

    if (!subheadingsDragEnd) {
      return;
    }

    const result = handleDragEnd(event);

    if (!result) {
      return;
    }

    const { itemId, targetGroupKey, dragSource } = result;

    if (dragSource?.groupKey === targetGroupKey) {
      return;
    }

    const updatedData = processGroupChange(
      data as Record<string, any>[],
      itemId,
      targetGroupKey,
      effectiveGroupByKey,
      effectiveNestedGrouping ?? undefined
    ) as T[];

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
        onRowPointerEnter={onRowPointerEnter}
        style={style}
        isLastRow={index === displayData.length - 1}
        onActionClick={onActionClick}
        actionMode={actionMode}
        actionClickConfigs={actionConfigs?.(item)}
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
  }, [displayData, visibleColumns, onRowClick, onRowPointerEnter, onActionClick, actionMode, actionConfigs, dynamicRowHeight, selectedItemId, editableColumns, onCellValueChange, groupStylerConfig, rowStyler, rowHighlighting, rowExpansionEnabled, isRowExpanded, toggleRow, getChildren, isLoadingChildren, rowExpansion, resetAfterIndex, columnActions]);

  ////////////////////////////////////
  // Scroll Container Ref- REMOVED
  ////////////////////////////////////


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={
        manualSortActive ? subheadingsCollisionDetection : pointerWithin
      }
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={handleDragCancel}
    >
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
          minRowHeight={minRowHeight}
        />
      )}
      
      {/* TABLE HEADER AND ROWS LIST CONTAINER
      contain the table header and the table rows list in a flex-col
      this allows the table header to be away from the scroll container, being visible all the time.
      */}
      
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div
          className={`shrink-0 z-10 w-full ${accordionConfig?.groups && accordionConfig?.groups?.length > 0 ? 'pt-[24px]' : ''}`}
        >
          <VirtualizedTableHeader
            columns={visibleColumns as TableColumn<any>[]}
            accordionConfig={accordionConfig}
            handleGroupToggle={handleGroupToggle}
            openGroups={openGroups}
            filters={filters}
            headerFilterConfig={headerFilters}
            sortConfig={sortConfig}
          />
        </div>

        {/* #3 Table container - takes remaining space, and the absolute will overflow the component
        will leave overflow here as this div has width not allowing sticky to work till the end. better UX */}
        <div
          ref={assignBodyScrollRef}
          className={`relative min-h-0 flex-1 w-full overflow-auto tertiary-scrollbar ${!isItemLoading ? '' : 'opacity-20 pointer-events-none'}`}
        >
          <div className="min-h-full min-w-full">
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
                ) : groupKeys.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-medium mb-2">No data found</p>
                      <p className="text-sm">No data available</p>
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
                                const groupItems = groupedData[secondaryKey] ?? [];
                                const isExpanded = expandedGroups.has(secondaryKey);
                                const groupKey = secondaryKey;

                                const secondaryHeader = (
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
                                );

                                const secondaryBody = (
                                      <div
                                        className={`grid transition-all duration-300 ease-in-out ${
                                          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                        }`}
                                      >
                                        <div className={`w-full ${!isExpanded ? 'overflow-hidden' : ''}`}>
                                          <div className="w-full">
                                            {manualSortActive ? (
                                              (() => {
                                                const vp = boardState.virtualPlaceholder;
                                                const showDropPreview =
                                                  !!boardState.activeId && vp?.groupKey === groupKey;
                                                const insertIdx = vp?.insertIndex ?? -1;
                                                const insertionStrip = (
                                                  <div
                                                    key="subheadings-insert-preview-nested"
                                                    className="w-full rounded-md border-2 border-dashed border-tertiary bg-tertiary/15 dark:bg-tertiary/25"
                                                    style={{
                                                      height: SUBHEADINGS_DROP_PLACEHOLDER_HEIGHT,
                                                      minHeight: SUBHEADINGS_DROP_PLACEHOLDER_HEIGHT,
                                                    }}
                                                    aria-hidden
                                                  />
                                                );
                                                if (groupItems.length === 0) {
                                                  return (
                                                    <>
                                                      <DroppableRowCell
                                                        key={`empty-${groupKey}`}
                                                        cellId={createCellId(groupKey, 0)}
                                                        groupKey={groupKey}
                                                        rowIndex={0}
                                                      >
                                                        {showDropPreview && insertIdx === 0
                                                          ? insertionStrip
                                                          : null}
                                                        <div className="min-h-10 w-full" aria-hidden />
                                                      </DroppableRowCell>
                                                      <GroupSummaryRow
                                                        key={`summary-${groupKey}`}
                                                        columns={visibleColumns}
                                                        groupSums={calculateGroupSums({
                                                          items: groupItems,
                                                          columns: visibleColumns,
                                                        })}
                                                      />
                                                    </>
                                                  );
                                                }
                                                return (
                                                  <>
                                                    {groupItems.map((item, index) => {
                                                      const row = item as Record<string, unknown>;
                                                      const rowItemId = (row[idKey] ??
                                                        row.id ??
                                                        row._id ??
                                                        index) as string | number;
                                                      const isSelected =
                                                        selectedItemId != null &&
                                                        String(row[idKey] ?? row.id ?? '') ===
                                                          String(selectedItemId);
                                                      const rowId = row.id as string | undefined;
                                                      const handleToggleRow = rowId
                                                        ? async () => {
                                                            await toggleRow(rowId, item);
                                                            setTimeout(() => {
                                                              resetAfterIndex(index);
                                                            }, 0);
                                                          }
                                                        : undefined;
                                                      const rowLoading =
                                                        loadingItemIds?.includes(String(rowItemId)) ??
                                                        false;
                                                      const rowBody = (
                                                        <DraggableRow
                                                          item={item}
                                                          itemId={rowItemId}
                                                          groupKey={groupKey}
                                                          rowIndex={index}
                                                          isSummaryRow={false}
                                                          disableDrag={subheadingsDisableRowDrag}
                                                          manualSorting={manualSortActive}
                                                        >
                                                          <VirtualizedTableRow
                                                            item={item}
                                                            columns={visibleColumns}
                                                            onRowClick={onRowClick}
                                                            onRowPointerEnter={onRowPointerEnter}
                                                            style={{ width: '100%' }}
                                                            isLastRow={index === groupItems.length - 1}
                                                            onActionClick={onActionClick}
                                                            actionMode={actionMode}
                                                            actionClickConfigs={actionConfigs?.(item)}
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
                                                            isRowExpanded={
                                                              rowId ? isRowExpanded(rowId) : false
                                                            }
                                                            onToggleRow={handleToggleRow}
                                                            expandedChildren={
                                                              rowId && rowExpansionEnabled
                                                                ? getChildren(rowId)
                                                                : []
                                                            }
                                                            isLoadingChildren={
                                                              rowId && rowExpansionEnabled
                                                                ? isLoadingChildren(rowId)
                                                                : false
                                                            }
                                                            renderExpandedContent={
                                                              rowExpansion?.renderExpandedContent
                                                            }
                                                            expandedContentHeight={
                                                              rowExpansion?.expandedContentHeight
                                                            }
                                                            columnActions={columnActions}
                                                          />
                                                        </DraggableRow>
                                                      );
                                                      return (
                                                        <Fragment key={String(rowItemId)}>
                                                          {showDropPreview && insertIdx === index
                                                            ? insertionStrip
                                                            : null}
                                                          <DroppableRowCell
                                                            cellId={createCellId(groupKey, index)}
                                                            groupKey={groupKey}
                                                            rowIndex={index}
                                                          >
                                                            <div
                                                              className={
                                                                rowLoading
                                                                  ? 'pointer-events-none opacity-50'
                                                                  : undefined
                                                              }
                                                            >
                                                              {rowBody}
                                                            </div>
                                                          </DroppableRowCell>
                                                        </Fragment>
                                                      );
                                                    })}
                                                    {showDropPreview &&
                                                    insertIdx === groupItems.length
                                                      ? insertionStrip
                                                      : null}
                                                    <DroppableRowCell
                                                      cellId={createCellId(
                                                        groupKey,
                                                        groupItems.length
                                                      )}
                                                      groupKey={groupKey}
                                                      rowIndex={groupItems.length}
                                                    >
                                                      <div className="min-h-1 w-full" aria-hidden />
                                                    </DroppableRowCell>
                                                    <GroupSummaryRow
                                                      key={`summary-${groupKey}`}
                                                      columns={visibleColumns}
                                                      groupSums={calculateGroupSums({
                                                        items: groupItems,
                                                        columns: visibleColumns,
                                                      })}
                                                    />
                                                  </>
                                                );
                                              })()
                                            ) : (
                                              <>
                                                {groupItems.map((item, index) => {
                                                  const isSelected =
                                                    selectedItemId &&
                                                    (item as any).id &&
                                                    (item as any).id.toString() ===
                                                      selectedItemId.toString();
                                                  const rowId = (item as any)?.id;
                                                  const itemId =
                                                    (item as any)?.id ||
                                                    (item as any)?._id ||
                                                    index;

                                                  const handleToggleRow = rowId
                                                    ? async () => {
                                                        await toggleRow(rowId, item);
                                                        setTimeout(() => {
                                                          resetAfterIndex(index);
                                                        }, 0);
                                                      }
                                                    : undefined;

                                                  return (
                                                    <DraggableRow
                                                      key={itemId}
                                                      item={item}
                                                      itemId={itemId}
                                                      groupKey={secondaryKey}
                                                      rowIndex={index}
                                                      isSummaryRow={false}
                                                      disableDrag={subheadingsDisableRowDrag}
                                                    >
                                                      <VirtualizedTableRow
                                                        item={item}
                                                        columns={visibleColumns}
                                                        onRowClick={onRowClick}
                                                        onRowPointerEnter={onRowPointerEnter}
                                                        style={{ width: '100%' }}
                                                        isLastRow={index === groupItems.length - 1}
                                                        onActionClick={onActionClick}
                                                        actionMode={actionMode}
                                                        actionClickConfigs={actionConfigs?.(item)}
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
                                                        isRowExpanded={
                                                          rowId ? isRowExpanded(rowId) : false
                                                        }
                                                        onToggleRow={handleToggleRow}
                                                        expandedChildren={
                                                          rowId && rowExpansionEnabled
                                                            ? getChildren(rowId)
                                                            : []
                                                        }
                                                        isLoadingChildren={
                                                          rowId && rowExpansionEnabled
                                                            ? isLoadingChildren(rowId)
                                                            : false
                                                        }
                                                        renderExpandedContent={
                                                          rowExpansion?.renderExpandedContent
                                                        }
                                                        expandedContentHeight={
                                                          rowExpansion?.expandedContentHeight
                                                        }
                                                        columnActions={columnActions}
                                                      />
                                                    </DraggableRow>
                                                  );
                                                })}
                                                <GroupSummaryRow
                                                  key={`summary-${secondaryKey}`}
                                                  columns={visibleColumns}
                                                  groupSums={calculateGroupSums({
                                                    items: groupItems,
                                                    columns: visibleColumns,
                                                  })}
                                                />
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                );

                                if (manualSortActive) {
                                  return (
                                    <div key={secondaryKey} className="w-full">
                                      {secondaryHeader}
                                      {secondaryBody}
                                    </div>
                                  );
                                }

                                return (
                                  <DroppableGroup
                                    key={secondaryKey}
                                    groupKey={secondaryKey}
                                    isExpanded={isExpanded}
                                  >
                                    <div className="w-full">
                                      {secondaryHeader}
                                      {secondaryBody}
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
                ) : manualSortActive ? (
                  <div className={`flex flex-col w-full ${listView ? "gap-0" : "gap-8"}`}>
                    {groupKeys.map((groupKey) => {
                      const groupItems = groupedData[groupKey];
                      const isExpanded = listView ? true : expandedGroups.has(groupKey);

                      const groupShell = (inner: React.ReactNode) =>
                        manualSortActive ? (
                          <div key={groupKey} className="w-full">
                            {inner}
                          </div>
                        ) : (
                          <DroppableGroup
                            key={groupKey}
                            groupKey={groupKey}
                            isExpanded={isExpanded}
                          >
                            {inner}
                          </DroppableGroup>
                        );

                      return groupShell(
                        <div className="w-full">
                          {!listView && (
                            <div
                              className="w-[100%] flex items-center justify-between px-0 py-3 cursor-pointer hover:bg-tertiary/10 group transition-colors border-b border-tertiary/10"
                              onClick={() => toggleGroup(groupKey)}
                            >
                              <div className="flex items-center gap-2 sticky left-2">
                                <ChevronDown
                                  className={`w-4 h-4 text-foreground/70 group-hover:text-tertiary transition-transform duration-300 ${
                                    isExpanded ? "rotate-180" : ""
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
                          )}

                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            }`}
                          >
                            <div className={`w-full ${!isExpanded ? "overflow-hidden" : ""}`}>
                              <div className="w-full">
                                {(() => {
                                  const vp = boardState.virtualPlaceholder;
                                  const showDropPreview =
                                    manualSortActive &&
                                    !!boardState.activeId &&
                                    vp?.groupKey === groupKey;
                                  const insertIdx = vp?.insertIndex ?? -1;

                                  const insertionStrip = (
                                    <div
                                      key="subheadings-insert-preview"
                                      className="w-full rounded-md border-2 border-dashed border-tertiary bg-tertiary/15 dark:bg-tertiary/25"
                                      style={{
                                        height: SUBHEADINGS_DROP_PLACEHOLDER_HEIGHT,
                                        minHeight: SUBHEADINGS_DROP_PLACEHOLDER_HEIGHT,
                                      }}
                                      aria-hidden
                                    />
                                  );

                                  if (manualSortActive && groupItems.length === 0) {
                                    return (
                                      <DroppableRowCell
                                        key={`empty-${groupKey}`}
                                        cellId={createCellId(groupKey, 0)}
                                        groupKey={groupKey}
                                        rowIndex={0}
                                      >
                                        {showDropPreview && insertIdx === 0
                                          ? insertionStrip
                                          : null}
                                        <div className="min-h-10 w-full" aria-hidden />
                                      </DroppableRowCell>
                                    );
                                  }

                                  return (
                                    <>
                                      {groupItems.map((item, index) => {
                                        const isSelected =
                                          selectedItemId &&
                                          (item as any).id &&
                                          (item as any).id.toString() ===
                                            selectedItemId.toString();
                                        const rowId = (item as any)?.id;
                                        const rowItemId =
                                          (item as any)?.id ||
                                          (item as any)?._id ||
                                          index;
                                        const rowLoading =
                                          loadingItemIds?.includes(String(rowItemId)) ??
                                          false;

                                        const handleToggleRow = rowId
                                          ? async () => {
                                              await toggleRow(rowId, item);
                                              setTimeout(() => {
                                                resetAfterIndex(index);
                                              }, 0);
                                            }
                                          : undefined;

                                        const rowBody = (
                                          <DraggableRow
                                            item={item}
                                            itemId={rowItemId}
                                            groupKey={groupKey}
                                            rowIndex={index}
                                            isSummaryRow={false}
                                            disableDrag={subheadingsDisableRowDrag}
                                            manualSorting={manualSortActive}
                                          >
                                            <VirtualizedTableRow
                                              item={item}
                                              columns={visibleColumns}
                                              onRowClick={onRowClick}
                                              onRowPointerEnter={onRowPointerEnter}
                                              style={{ width: "100%" }}
                                              isLastRow={index === groupItems.length - 1}
                                              onActionClick={onActionClick}
                                              actionMode={actionMode}
                                              actionClickConfigs={actionConfigs?.(item)}
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
                                              isRowExpanded={
                                                rowId ? isRowExpanded(rowId) : false
                                              }
                                              onToggleRow={handleToggleRow}
                                              expandedChildren={
                                                rowId && rowExpansionEnabled
                                                  ? getChildren(rowId)
                                                  : []
                                              }
                                              isLoadingChildren={
                                                rowId && rowExpansionEnabled
                                                  ? isLoadingChildren(rowId)
                                                  : false
                                              }
                                              renderExpandedContent={
                                                rowExpansion?.renderExpandedContent
                                              }
                                              expandedContentHeight={
                                                rowExpansion?.expandedContentHeight
                                              }
                                              columnActions={columnActions}
                                            />
                                          </DraggableRow>
                                        );

                                        return (
                                          <Fragment key={String(rowItemId)}>
                                            {showDropPreview && insertIdx === index
                                              ? insertionStrip
                                              : null}
                                            <DroppableRowCell
                                              cellId={createCellId(groupKey, index)}
                                              groupKey={groupKey}
                                              rowIndex={index}
                                            >
                                              <div
                                                className={
                                                  rowLoading
                                                    ? "opacity-50 pointer-events-none"
                                                    : undefined
                                                }
                                              >
                                                {rowBody}
                                              </div>
                                            </DroppableRowCell>
                                          </Fragment>
                                        );
                                      })}
                                      {groupItems.length > 0 ? (
                                        <>
                                          {showDropPreview &&
                                          insertIdx === groupItems.length
                                            ? insertionStrip
                                            : null}
                                          <DroppableRowCell
                                            cellId={createCellId(
                                              groupKey,
                                              groupItems.length
                                            )}
                                            groupKey={groupKey}
                                            rowIndex={groupItems.length}
                                          >
                                            <div className="min-h-1 w-full" aria-hidden />
                                          </DroppableRowCell>
                                        </>
                                      ) : null}
                                    </>
                                  );
                                })()}

                                {(() => {
                                  const sums = calculateGroupSums({
                                    items: groupItems,
                                    columns: visibleColumns,
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
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-8 w-full">
                    {groupKeys.map((groupKey) => {
                      const groupItems = groupedData[groupKey];
                      const isExpanded = expandedGroups.has(groupKey);

                      return (
                        <DroppableGroup
                          key={groupKey}
                          groupKey={groupKey}
                          isExpanded={isExpanded}
                        >
                          <div className="w-full">
                            <div
                              className="w-[100%] flex items-center justify-between px-0 py-3 cursor-pointer hover:bg-tertiary/10 group transition-colors border-b border-tertiary/10"
                              onClick={() => toggleGroup(groupKey)}
                            >
                              <div className="flex items-center gap-2 sticky left-2">
                                <ChevronDown
                                  className={`w-4 h-4 text-foreground/70 group-hover:text-tertiary transition-transform duration-300 ${
                                    isExpanded ? "rotate-180" : ""
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

                            <div
                              className={`grid transition-all duration-300 ease-in-out ${
                                isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                              }`}
                            >
                              <div
                                className={`w-full ${!isExpanded ? "overflow-hidden" : ""}`}
                              >
                                <div className="w-full">
                                  {groupItems.map((item, index) => {
                                    const isSelected =
                                      selectedItemId &&
                                      (item as any).id &&
                                      (item as any).id.toString() ===
                                        selectedItemId.toString();
                                    const rowId = (item as any)?.id;
                                    const itemId =
                                      (item as any)?.id ||
                                      (item as any)?._id ||
                                      index;

                                    const handleToggleRow = rowId
                                      ? async () => {
                                          await toggleRow(rowId, item);
                                          setTimeout(() => {
                                            resetAfterIndex(index);
                                          }, 0);
                                        }
                                      : undefined;

                                    return (
                                      <DraggableRow
                                        key={itemId}
                                        item={item}
                                        itemId={itemId}
                                        groupKey={groupKey}
                                        rowIndex={index}
                                        isSummaryRow={false}
                                        disableDrag={subheadingsDisableRowDrag}
                                      >
                                        <VirtualizedTableRow
                                          item={item}
                                          columns={visibleColumns}
                                          onRowClick={onRowClick}
                                          onRowPointerEnter={onRowPointerEnter}
                                          style={{ width: "100%" }}
                                          isLastRow={index === groupItems.length - 1}
                                          onActionClick={onActionClick}
                                          actionMode={actionMode}
                                          actionClickConfigs={actionConfigs?.(item)}
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
                                          isRowExpanded={
                                            rowId ? isRowExpanded(rowId) : false
                                          }
                                          onToggleRow={handleToggleRow}
                                          expandedChildren={
                                            rowId && rowExpansionEnabled
                                              ? getChildren(rowId)
                                              : []
                                          }
                                          isLoadingChildren={
                                            rowId && rowExpansionEnabled
                                              ? isLoadingChildren(rowId)
                                              : false
                                          }
                                          renderExpandedContent={
                                            rowExpansion?.renderExpandedContent
                                          }
                                          expandedContentHeight={
                                            rowExpansion?.expandedContentHeight
                                          }
                                          columnActions={columnActions}
                                        />
                                      </DraggableRow>
                                    );
                                  })}

                                  {(() => {
                                    const sums = calculateGroupSums({
                                      items: groupItems,
                                      columns: visibleColumns,
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

      {/* Drag Overlay - Shows ghost row during drag */}
      <DragOverlay>
        {dragState.activeId && draggedItem ? (
          <div className="opacity-50 bg-tertiary/50 border-2 border-tertiary rounded">
            <VirtualizedTableRow
              item={draggedItem}
              columns={visibleColumns}
              style={{ width: '100%' }}
              isLastRow={false}
              truncateText={!dynamicRowHeight}
              calculatedRowHeight={calculatedRowHeight}
              groupStylerConfig={groupStylerConfig}
              rowStyler={rowStyler}
              rowHighlighting={rowHighlighting}
              searchHighlightStyle={undefined}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
} 