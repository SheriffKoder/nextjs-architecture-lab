/**
 * ViewOrchestrator
 *
 * Purpose: Resolve URL view/grouping and render the matching multi-view display
 * Used in: Demo RSC / demo client pages
 * Why: Orchestrates view modes; filter/sort/pagination chrome lives in url-kit
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { VariableSizeList, FixedSizeList } from "react-window";
import { LoadingSpinner } from "./components/loading-spinner";
import {
  TableColumn,
  TableConfig,
  HeaderFilterConfig,
  type AccordionConfig,
} from "./types";
import type { FilterConfig } from "@/platform/url-kit/filters/feature-filtering/components/filter-types";
import type { SortConfig } from "@/platform/url-kit/filters/feature-sorting/types";
import { useViewSwitcher } from "./hooks/useViewSwitcher";
import { useAccordionColumns } from "./hooks/useAccordionColumns";
import { GroupIndicators } from "./components/GroupIndicators";
import { VirtualizedTableComponent } from "./features/virtualized-table/virtualized-table-container";
import { VirtualizedTableComponent as VirtualizedListComponent } from "./features/virtualized-list/virtualized-list-container";
import CalendarContainer from "./features/calendar/calendar-container";
import KanbanWrapper from "./features/kanban/kanban-wrapper";
import { SubHeadingsContainer } from "./features/subheadings/subheadings-container";
import type { SubheadingsUpdateContext } from "./features/subheadings/dnd";
import type { ColumnConfig } from "./features/kanban/types/kanban-types";
import { MapsContainerWithMock } from "@/widgets/maps-view/mock";
import TimelineWrapper from "./features/timeline-3/timeline-wrapper";
import {
  MobileListWrapper,
  resolveForcedMobileView,
  type MobileListConfig,
} from "./features/mobile-list";
import type { GroupConfig } from "./features/virtualized-list/utils/grouping-utils";
import type { FilterField } from "@/platform/url-kit/filters/feature-query-builder-filter/types/field";
import type { SearchConfig } from "@/platform/url-kit/filters/feature-filtering/components/search-types";
import { useUrlGrouping } from "@/platform/url-kit/minimal-controls";
import { useIsMobile } from "./hooks/use-is-mobile";

const EMPTY_GROUPING_KEYS: string[] = [];
// Lazy load DashboardContent to avoid loading it when not on dashboard route
// const DashboardContent = lazy(() => import("@/features/dashboard/dashboard-content"));

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the ViewOrchestrator component
 */
interface ViewOrchestratorProps<T extends Record<string, any> = Record<string, any>> {
  // Data array to display in the table
  data: T[];
  // Column definitions for table structure
  columns: TableColumn<T>[];
  // Optional row click handler
  onRowClick?: (row: T) => void;
  /** Fires when the pointer enters the row strip (e.g. prefetch row payload before click). */
  onRowPointerEnter?: (row: T) => void;
  // Optional handler for action button clicks
  onActionClick?: (action: string, row: T) => void;
  // Action configurations for each row
  actionConfigs?: (row: T) => any[];
  // ID of the currently selected item for highlighting
  selectedItemId?: string | number;
  // Handler for when editable cell values change
  onCellValueChange?: (rowIndex: number, columnKey: string, newValue: any) => void;
  // Whether the table is in item loading state
  isItemLoading?: boolean;
  accordionConfig?: AccordionConfig;
  // Table configuration object containing all table-related config options
  tableConfig?: TableConfig<T>;
  // List view configuration for grouped table view
  listViewConfig?: GroupConfig;
  /** Cards / mobile-list view configuration (`?view=cards`) */
  mobileListConfig?: MobileListConfig<T>;
  // Available view modes to display in switcher (e.g., ['table', 'kanban', 'map'])
  availableViews?: string[];
  /** Views that need the full filtered dataset (`?all=1`, no page/limit) */
  useAllItems?: string[];
  /** Page size restored when leaving a useAllItems view */
  defaultPageSize?: number;
  // Calendar configuration for calendar view
  calendarConfig?: {
    startDateKey: string;
    endDateKey: string;
    nameKey?: string;
    onProjectClick?: (project: T) => void;
    limitStartDate?: Date;
    limitEndDate?: Date;
  };
  // Kanban configuration for kanban view
  kanbanConfig?: {
    columnKey: string;
    cardKey: string;
    cardTitle?: string;
    cardContent?: string;
    dateKey?: string;
    minCards?: number;
    hideEmptyColumns?: boolean;
    manualSorting?: boolean;
    sortableColumns?: string[];
    columns?: ColumnConfig[];
    cardTemplate?: React.ComponentType<any>;
    kanbanDragEnd?: (updatedData: T[]) => void;
    handleCardActions?: (action: string, data: T) => void;
    /** Called when a card is dropped in a new column (item, newColumnKey, newRowIndex). Use to persist status change. */
    onItemUpdate?: (item: T, newColumnKey: string, newRowIndex: number) => void | Promise<void>;
    /** Item IDs (cardKey values) that are updating; those cards show a loading state */
    loadingItemIds?: string[];
  };
  // SubHeadings configuration for grouped view
  subheadingsConfig?: {
    columnKey?: string;
    groups?: Array<{ key: string; label: string }>;
    subheadingsDragEnd?: (updatedData: T[]) => void;
    nestedGrouping?: {
      enabled: boolean;
      primaryKey: string;
      secondaryKey: string;
      separator: string;
    };
    headerFilters?: HeaderFilterConfig;
    sortConfig?: SortConfig[];
    manualSorting?: boolean;
    idKey?: string;
    onSubheadingsItemUpdate?: (
      ctx: SubheadingsUpdateContext<T>
    ) => void | Promise<void>;
    loadingItemIds?: string[];
    isManualOnChangeRef?: React.MutableRefObject<boolean>;
    listView?: boolean;
  };
  // Filters for header filters (passed separately for flexibility)
  filters?: FilterConfig[];
  // Map configuration for map view
  mapConfig?: {
    onItemClick?: (item: T) => void;
    center?: { lat: number; lng: number };
    containerStyle?: { width: string; height: string };
    zoom?: number;
    // Field mappings to convert data items to MapItem format
    fieldMappings?: {
      id?: string | ((item: T) => string);
      title?: string | ((item: T) => string);
      latitude?: string | ((item: T) => number);
      longitude?: string | ((item: T) => number);
      address?: string | ((item: T) => string | undefined);
    };
  };
  // Timeline configuration for timeline view
  timelineConfig?: {
    // Field mappings to convert data items to timeline format
    mappingKeys: {
      startDateKey: string;      // Required: field name for start date
      endDateKey: string;        // Required: field name for end date
      titleKey?: string;         // Optional: field name for item title
      typeKey?: string;          // Optional: field name for item type
      statusKey?: string;        // Optional: field name for item status
      uniqueIdKey?: string;      // Optional: field name for unique ID
    };
    // Available timeline views (default: ['Year', 'Month', 'Week', 'Day'])
    views?: string[];
    // Field name to group items by (e.g., 'project_name', 'status')
    groupByKey?: string;
    // Whether to use inline grouping (true) or sidebar grouping (false). Defaults to true.
    isGroupInline?: boolean;
    // Whether to show unified event when group is collapsed in sidebar mode. Defaults to true.
    showUnifiedEventOnCollapse?: boolean;
    // Callback when a timeline event/item is clicked
    onEventClick?: (eventId: string) => void;
    // Callback when an item is dragged to a new position
    onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void;
    // Callback when an item is resized (start/end dates changed)
    onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void;
  };
  // Column actions configuration - maps column keys to action handler functions
  columnActions?: Record<string, (item: T, value: any) => void | Promise<void>>;
  // Whether to hide table, kanban, and calendar displays (only show filters)
  noTableDisplay?: boolean;
  // Configuration for minimal controls (grouping, filtering, etc.)
  minimalControlsConfig?: {
    availableColumnsForGrouping?: string[]; // Array of column keys available for grouping
    sortConfig?: SortConfig[]; // Sort configuration for SortingControl component
    queryBuilderFields?: FilterField[]; // Fields for QueryBuilder component
    searchConfig?: SearchConfig<T>; // Search configuration for ExpandableSearchControl component
  };
  /**
   * When true, toolbar is owned by url-kit `MinimalControls` outside this wrapper.
   * Grouping + view still come from URL; local toolbar is not rendered.
   */
  externalUrlControls?: boolean;
  /** Allowed `groupBy` / `subGroupBy` keys when `externalUrlControls` is true. */
  urlGroupingAllowedKeys?: string[];
  /** Expand groups when grouping is first applied (page-level SSOT). */
  defaultGroupsExpanded?: boolean;
  /**
   * Trailing virtualized row for list / table / cards (e.g. infinite load-more).
   * Ignored by board views (kanban, calendar, …).
   */
  listEndRow?: React.ReactNode;
  /** Height for `listEndRow`. Defaults to each view’s row height when omitted. */
  listEndRowHeight?: number;
};
////////////////////////////////////
// Component Implementation: Main table logic
////////////////////////////////////

/**
 * Resolves URL view state and renders the matching multi-view display.
 *
 * @template T - The type of data items
 * @param {ViewOrchestratorProps<T>} props - Component props
 * @returns {JSX.Element}
 *
 * @example
 * ```tsx
 * <ViewOrchestrator
 *   data={items}
 *   columns={tableColumns}
 *   onRowClick={handleRowClick}
 *   availableViews={['table', 'kanban']}
 * />
 * ```
 */
export function ViewOrchestrator<T extends Record<string, any> = Record<string, any>>({
  data,
  columns,
  onRowClick,
  onRowPointerEnter,
  onActionClick,
  actionConfigs,
  selectedItemId,
  onCellValueChange,
  isItemLoading,
  accordionConfig,
  tableConfig,
  listViewConfig,
  mobileListConfig,
  availableViews = ['table'],
  useAllItems,
  defaultPageSize,
  calendarConfig,
  kanbanConfig,
  subheadingsConfig,
  mapConfig,
  timelineConfig,
  noTableDisplay = false,
  minimalControlsConfig,
  externalUrlControls = false,
  urlGroupingAllowedKeys = EMPTY_GROUPING_KEYS,
  defaultGroupsExpanded = false,
  columnActions,
  filters,
  listEndRow,
  listEndRowHeight,
}: ViewOrchestratorProps<T>) {
  // Extract table config values with defaults
  const {
    actionMode = 'inline',
    editableColumns,
    groupStylerConfig,
    rowStyler,
  } = tableConfig || {};
  ////////////////////////////////////
  // Refs: Virtualized list reference for scroll control
  ////////////////////////////////////
  
  // Reference to the virtualized list for scroll control
  const listRef = useRef<FixedSizeList | VariableSizeList>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  ////////////////////////////////////
  // Row Height State: Track calculated row height - REMOVED
  ////////////////////////////////////


  // Dynamic grouping: URL when external kit owns controls; local state for legacy toolbar
  const [localGroupBy] = useState<string | null>(null);
  const [localSubGroupBy] = useState<string | null>(null);

  const urlGrouping = useUrlGrouping({
    allowedKeys: urlGroupingAllowedKeys,
  });

  const selectedGroupBy = externalUrlControls
    ? urlGrouping.groupBy
    : localGroupBy;
  const selectedSubGroupBy = externalUrlControls
    ? urlGrouping.subGroupBy
    : localSubGroupBy;

  // Initialize accordion column management - Up in level for button communication with child components
  const {
    visibleColumns,
    handleGroupToggle,
    openGroups,
    hasAccordion
  } = useAccordionColumns(columns, accordionConfig);

  ////////////////////////////////////
  // Main Render: Complete table structure
  ////////////////////////////////////


  // Determine current view mode from URL params
  // Use first option in availableViews as default, or 'table' if not provided
  const effectiveAvailableViews = availableViews || ['table']
  const defaultView = effectiveAvailableViews.length > 0 ? effectiveAvailableViews[0] : 'table'
  
  const { currentView, resolution } = useViewSwitcher({
    availableViews: effectiveAvailableViews,
    defaultView,
    useAllItems,
    defaultPageSize,
  })

  // Renderability: URL view may be in availableViews but page config missing → fall back to table
  const canRenderView = (view: string): boolean => {
    switch (view) {
      case 'kanban':
        return kanbanConfig !== undefined
      case 'calendar':
        return calendarConfig !== undefined
      case 'subheadings':
        return subheadingsConfig !== undefined
      case 'timeline':
        return timelineConfig !== undefined
      case 'list':
        return listViewConfig !== undefined
      case 'cards':
        return mobileListConfig !== undefined
      case 'map':
      case 'table':
        return true
      default:
        return false
    }
  }

  const resolvedView =
    canRenderView(currentView) ? currentView : defaultView

  // Below md: table / list / subheadings → cards (URL unchanged)
  const isMobile = useIsMobile()
  const renderView = resolveForcedMobileView(resolvedView, {
    isMobile,
    canRenderCards: mobileListConfig !== undefined,
  })

  // Determine which view to render based on resolved + renderable view
  const isKanbanView = renderView === 'kanban' && kanbanConfig !== undefined
  const isCalendarView = renderView === 'calendar' && calendarConfig !== undefined
  const isMapView = renderView === 'map' // mapConfig is optional, map view works without it
  const isSubHeadingsView = renderView === 'subheadings' && subheadingsConfig !== undefined
  const isTimelineView = renderView === 'timeline' && timelineConfig !== undefined
  const isListView = renderView === 'list' && listViewConfig !== undefined
  const isCardsView = renderView === 'cards' && mobileListConfig !== undefined
  const isTableView =
    renderView === 'table' ||
    (!isKanbanView &&
      !isCalendarView &&
      !isMapView &&
      !isSubHeadingsView &&
      !isTimelineView &&
      !isListView &&
      !isCardsView)

  const isScrollableDataView =
    isTableView || isListView || isSubHeadingsView || isCardsView

  // Children treat URL / legacy grouping as authoritative when either path is active
  const groupingControlsSignal =
    externalUrlControls ? (minimalControlsConfig ?? {}) : minimalControlsConfig

  return (
    <div
      className="flex flex-col h-full min-h-0 gap-0 p-0 relative"
      data-view-resolution={resolution.status}
      data-resolved-view={resolvedView}
      data-render-view={renderView}
      data-mobile-forced={
        isMobile && resolvedView !== renderView ? 'cards' : undefined
      }
    >
      {isItemLoading && (
        <div className="flex items-center justify-center h-full absolute inset-0">
          <LoadingSpinner />
        </div>
      )}


      {/* Group Indicators - for accordion grouping */}
      <div className="flex flex-row gap-2 items-center justify-between px-2">
        {/* <GroupIndicators
          groups={accordionConfig?.groups || []}
          openGroups={openGroups}
          onGroupToggle={handleGroupToggle}
          scrollContainer={scrollContainerRef.current || undefined}
        /> */}
      </div>
      

      {/* TABLE HEADER AND ROWS LIST CONTAINER
      contain the table header and the table rows list in a flex-col
      this allows the table header to be away from the scroll container, being visible all the time.
      */}
      
      {/* Timeline manages its own scroll in VirtualizedTimelineContainer; an outer
          overflow-y-auto here stacks a second vertical scrollbar on the wrapper. */}
      <div
        className={
          isTimelineView
            ? "flex-1 min-h-0 overflow-x-hidden overflow-y-hidden tertiary-scrollbar"
            : isScrollableDataView
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "flex-1 overflow-y-auto overflow-x-hidden tertiary-scrollbar"
        }
      >
        {noTableDisplay ? (
          // For other routes with noTableDisplay, render nothing
          null
        ) : isKanbanView ? (
          /* Kanban View - replaces only the table component */
          <KanbanWrapper
            initialData={data}
            filteredData={data}
            onUpdate={kanbanConfig.kanbanDragEnd || (() => {})}
            handleCardActions={kanbanConfig.handleCardActions || (() => {})}
            onItemUpdate={kanbanConfig.onItemUpdate}
            loadingItemIds={kanbanConfig.loadingItemIds}
            columnKey={kanbanConfig.columnKey}
            cardKey={kanbanConfig.cardKey}
            cardTitle={kanbanConfig.cardTitle}
            cardContent={kanbanConfig.cardContent}
            dateKey={kanbanConfig.dateKey}
            minCards={kanbanConfig.minCards}
            hideEmptyColumns={kanbanConfig.hideEmptyColumns}
            manualSorting={kanbanConfig.manualSorting}
            sortableColumns={kanbanConfig.sortableColumns}
            columns={kanbanConfig.columns}
            cardTemplate={kanbanConfig.cardTemplate}
          />
        ) : isCalendarView ? (
          /* Calendar View */
          <CalendarContainer
            projects={data}
            startDateKey={calendarConfig.startDateKey}
            endDateKey={calendarConfig.endDateKey}
            nameKey={calendarConfig.nameKey || 'name'}
            onProjectClick={calendarConfig.onProjectClick}
            limitStartDate={calendarConfig.limitStartDate}
            limitEndDate={calendarConfig.limitEndDate}
          />
        ) : isMapView ? (
          /* Map View - Display MapVisualizer with mock data */
          <MapsContainerWithMock
            data={data}
            mapConfig={mapConfig}
          />
        ) : isTimelineView ? (
          /* Timeline View */
          <TimelineWrapper
            timelineData={data}
            mappingKeys={timelineConfig.mappingKeys}
            views={timelineConfig.views}
            groupByKey={timelineConfig.groupByKey}
            isGroupInline={timelineConfig.isGroupInline}
            showUnifiedEventOnCollapse={timelineConfig.showUnifiedEventOnCollapse}
            selectedGroupBy={selectedGroupBy}
            minimalControlsConfig={groupingControlsSignal}
            onEventClick={timelineConfig.onEventClick}
            onItemDrag={timelineConfig.onItemDrag}
            onItemResize={timelineConfig.onItemResize}
          />
        ) : isSubHeadingsView ? (
          /* SubHeadings View */
          <SubHeadingsContainer
            columns={columns}
            listRef={listRef}
            scrollContainerRef={scrollContainerRef}
            onRowClick={onRowClick}
            onRowPointerEnter={onRowPointerEnter}
            onActionClick={onActionClick}
            actionConfigs={actionConfigs}
            selectedItemId={selectedItemId}
            onCellValueChange={onCellValueChange}
            accordionConfig={accordionConfig}
            visibleColumns={visibleColumns}
            data={data}
            handleGroupToggle={handleGroupToggle}
            openGroups={openGroups}
            isItemLoading={isItemLoading}
            tableConfig={subheadingsConfig}
            groupByKey={subheadingsConfig?.columnKey}
            groupsConfig={subheadingsConfig?.groups}
            subheadingsDragEnd={subheadingsConfig?.subheadingsDragEnd || (() => {})}
            nestedGrouping={subheadingsConfig?.nestedGrouping}
            selectedGroupBy={selectedGroupBy}
            selectedSubGroupBy={selectedSubGroupBy}
            minimalControlsConfig={groupingControlsSignal}
            columnActions={columnActions}
            filters={filters}
            manualSorting={subheadingsConfig?.manualSorting}
            idKey={subheadingsConfig?.idKey}
            onSubheadingsItemUpdate={subheadingsConfig?.onSubheadingsItemUpdate}
            loadingItemIds={subheadingsConfig?.loadingItemIds}
            isManualOnChangeRef={subheadingsConfig?.isManualOnChangeRef}
            listView={subheadingsConfig?.listView}
          />
        ) : isCardsView ? (
          /* Cards / mobile-list View — no hover prefetch */
          <MobileListWrapper
            data={data}
            config={{
              ...mobileListConfig,
              loading: isItemLoading ?? mobileListConfig.loading,
            }}
            selectedItemId={selectedItemId}
            onRowClick={onRowClick}
            onActionClick={onActionClick}
            actionConfigs={actionConfigs}
            columnActions={columnActions}
            onCellValueChange={onCellValueChange}
            selectedGroupBy={selectedGroupBy}
            listEndRow={listEndRow}
            listEndRowHeight={listEndRowHeight}
          />
        ) : (
          /* Table/List View */
          isListView ? (
            <VirtualizedListComponent
              columns={columns}
              listRef={listRef}
              scrollContainerRef={scrollContainerRef}
              onRowClick={onRowClick}
              onRowPointerEnter={onRowPointerEnter}
              onActionClick={onActionClick}
              actionConfigs={actionConfigs}
              selectedItemId={selectedItemId}
              onCellValueChange={onCellValueChange}
              accordionConfig={accordionConfig}
              visibleColumns={visibleColumns}
              data={data}
              handleGroupToggle={handleGroupToggle}
              openGroups={openGroups}
              isItemLoading={isItemLoading}
              tableConfig={listViewConfig}
              columnActions={columnActions}
              selectedGroupBy={selectedGroupBy}
              selectedSubGroupBy={selectedSubGroupBy}
              defaultGroupsExpanded={defaultGroupsExpanded}
              minimalControlsConfig={groupingControlsSignal}
              filters={filters}
              listEndRow={listEndRow}
              listEndRowHeight={listEndRowHeight}
            />
          ) : (
            <VirtualizedTableComponent
              columns={columns}
              listRef={listRef}
              scrollContainerRef={scrollContainerRef}
              onRowClick={onRowClick}
              onRowPointerEnter={onRowPointerEnter}
              onActionClick={onActionClick}
              actionConfigs={actionConfigs}
              selectedItemId={selectedItemId}
              onCellValueChange={onCellValueChange}
              accordionConfig={accordionConfig}
              visibleColumns={visibleColumns}
              data={data}
              handleGroupToggle={handleGroupToggle}
              openGroups={openGroups}
              isItemLoading={isItemLoading}
              tableConfig={tableConfig}
              columnActions={columnActions}
              selectedGroupBy={selectedGroupBy}
              selectedSubGroupBy={selectedSubGroupBy}
              defaultGroupsExpanded={defaultGroupsExpanded}
              minimalControlsConfig={groupingControlsSignal}
              filters={filters}
              listEndRow={listEndRow}
              listEndRowHeight={listEndRowHeight}
            />
          )
        )}
    </div>
  </div>

  );
} 