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

import React, { useState, useRef, useCallback, useMemo, useEffect, lazy, Suspense } from "react";
import { VariableSizeList, FixedSizeList } from "react-window";
import { usePathname } from "next/navigation";
import { LoadingSpinner } from "./components/loading-spinner";
import { TableColumn, TableConfig, FilterConfig, FilterUniqueValuesMap } from "./types";
import { useTableSorting, useTableFiltering, useTablePagination } from "./hooks";
import { useViewSwitcher } from "./hooks/useViewSwitcher";
import { HeaderFiltersWrapper } from "./components/header-filters-wrapper";
import { performGlobalSearch, DEFAULT_SEARCH_CONFIG } from "./utils/search/search-utils";
import { SearchableColumn } from "./types/search";
import { PillFilter } from "./components/PillFilter/pill-filters-wrapper";
import { DateFilterButton } from "./components/DateFilterSingle";
import { useAccordionColumns } from "./hooks/useAccordionColumns";
import { GroupIndicators } from "./components/GroupIndicators";
import { ZoneFilters } from "./components/ZoneFilters";
import { VirtualizedTableComponent } from "./features/virtualized-table/virtualized-table-container";
import { VirtualizedTableComponent as VirtualizedListComponent } from "./features/virtualized-list/virtualized-list-container";
import { ViewSwitcherWrapper } from "./components/view-switcher-wrapper";
import CalendarContainer from "./features/calendar/calendar-container";
import KanbanWrapper from "./features/kanban/kanban-wrapper";
import { SubHeadingsContainer } from "./features/subheadings/subheadings-container";
import type { ColumnConfig } from "./features/kanban/types/kanban-types";
import { Loading } from "@/components/ui/loading";
import MapsContainerWithMock from "@/components/maps/MapsContainerWithMock";
import TimelineWrapper from "./features/timeline-3/timeline-wrapper";
import type { GroupConfig } from "./features/virtualized-list/utils/grouping-utils";
import { GroupingControl } from "./components/minimals/grouping-control";
import { FilterControl } from "./components/minimals/filter-control";
import { NewSwitcherWrapper } from "./components/minimals/minimal-switcher-wrapper";
import { ExpandableSearchControl } from "./components/minimals/expandable-search-control";

// Lazy load DashboardContent to avoid loading it when not on dashboard route
// const DashboardContent = lazy(() => import("@/features/dashboard/dashboard-content"));

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the VirtualizedTable component
 */
interface FilteringWrapperProps<T extends Record<string, any> = Record<string, any>> {
  // Data array to display in the table
  data: T[];
  // Column definitions for table structure
  columns: TableColumn<T>[];
  // Optional row click handler
  onRowClick?: (row: T) => void;
  // Optional handler for action button clicks
  onActionClick?: (action: string, row: T) => void;
  // Action configurations for each row
  actionConfigs?: (row: T) => any[];
  // ID of the currently selected item for highlighting
  selectedItemId?: string | number;
  // Handler for when editable cell values change
  onCellValueChange?: (rowIndex: number, columnKey: string, newValue: any) => void;
  // Optional callback to expose filter change handler to parent component
  onFilterHandlerReady?: (handleFilterChange: (columnKey: string, values: any) => void) => void;
  // Global search text for highlighting (optional)
  globalSearchText?: string;
  // Whether the table is in item loading state
  isItemLoading?: boolean;
  // Accordion configuration for column grouping
  accordionConfig?: {
    groups: Array<{
      id: string;
      name: string;
      color: string;
      textColor: string;
    }>;
  }
  // Filter configuration object containing all filter-related config options
  filterConfig?: FilterConfig<T>;
  // Table configuration object containing all table-related config options
  tableConfig?: TableConfig<T>;
  // List view configuration for grouped table view
  listViewConfig?: GroupConfig;
  // Available view modes to display in switcher (e.g., ['table', 'kanban', 'map'])
  availableViews?: string[];
  // Callback for when filter apply button is clicked
  onFilterApply?: (key: string, items: string[], type: string, columnConfig?: { filterApiParams?: { text?: string; number?: { from: string; to: string }; date?: { start: string; end: string }; isArray?: boolean; valueField?: 'id' | 'item' } }) => void;
  /** When table header sort changes, called with API sort spec e.g. "arv:asc" or undefined when cleared. Use to refetch with sort + filters. */
  onSortChange?: (sortSpec: string | undefined) => void;
  /** When set, pagination is driven by the API: total/page/limit from server, onPageChange triggers refetch. Table shows one page and uses totalItemCount for "X of Y". */
  serverPagination?: { total: number; page: number; limit: number; onPageChange: (page: number) => void };
  // Unique value facets from the main fetch (e.g. { company_unique_values: [{id, title, count}], ... }). Columns with uniqueValues use this for filter options.
  filterUniqueValues?: FilterUniqueValuesMap;
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
    columnKey: string;
    groups: Array<{ key: string; label: string }>;
    subheadingsDragEnd?: (updatedData: T[]) => void;
    nestedGrouping?: {
      enabled: boolean;
      primaryKey: string;
      secondaryKey: string;
      separator: string;
    };
  };
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
    availableColumns?: string[]; // Array of column keys available for grouping
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
 * @param {VirtualizedTableProps<T>} props - Component props
 * @returns {JSX.Element} Complete table component
 * 
 * @example
 * ```tsx
 * <VirtualizedTable
 *   data={items}
 *   columns={tableColumns}
 *   onRowClick={handleRowClick}
 *   tableHeight={400}
 *   rowHeight={40}
 * />
 * ```
 */
export function FilteringWrapper<T extends Record<string, any> = Record<string, any>>({
  data,
  columns,
  onRowClick,
  onActionClick,
  actionConfigs,
  selectedItemId,
  onCellValueChange,
  globalSearchText,
  isItemLoading,
  accordionConfig,
  filterConfig,
  tableConfig,
  listViewConfig,
  availableViews = ['table'],
  calendarConfig,
  kanbanConfig,
  subheadingsConfig,
  mapConfig,
  timelineConfig,
    noTableDisplay = false,
    minimalControlsConfig,
  onFilterApply,
  onSortChange,
  serverPagination,
  filterUniqueValues,
  columnActions,
}: FilteringWrapperProps<T>) {
  // Get current pathname to detect dashboard route
  const pathname = usePathname();
  const isDashboardRoute = pathname === '/dashboard';

  // Reset all internal state when navigation occurs
  useEffect(() => {
    setInternalSearchText('');
    // resetPage() is already called within hook initializations if needed, 
    // but we might need to manually trigger resets for hooks that store state.
  }, [pathname]);
  
  // Extract filter config values with defaults
  const {
    initialSortKey,
    initialSortDirection,
    initialPaginationMode = false,
    itemsPerPage = 20,
    sideFilterButton,
    showPill = true,
    showIndependentDateFilter = true,
    showDateFilterHeader = false,
    headerColumns,
    searchPlaceholder = "search...",
    hideTopLevelFilterSorting = false,
    hideTopLevelFiltering = false,
    hideTopLevelSearch = false,
    autoApplyDropdown,
    showBadgesDropdown,
    rangeOpen,
    searchHighlightStyle = "bg-yellow-200 font-medium px-0 rounded text-inherit",
  } = filterConfig || {};

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


  ////////////////////////////////////
  // Row Expansion: Manage expandable row state  - REMOVED
  ////////////////////////////////////



  ////////////////////////////////////
  // Internal Search State: Manage global search results
  ////////////////////////////////////
  
  // Internal search text state (manages search input in RowFilters)
  const [internalSearchText, setInternalSearchText] = useState<string>('');
  
  // Dynamic grouping state (overrides config-based grouping)
  const [selectedGroupBy, setSelectedGroupBy] = useState<string | null>(null);
  const [selectedSubGroupBy, setSelectedSubGroupBy] = useState<string | null>(null);

  // Use either external globalSearchText or internal search text
  const effectiveSearchText = globalSearchText || internalSearchText;

  // Derive search results from data and search text
  const searchResults = useMemo(() => {
    if (effectiveSearchText && effectiveSearchText.trim()) {
      // Filter to only searchable columns (columns with isSearchable !== false)
      const searchableColumns = columns.filter(col => col.isSearchable !== false) as SearchableColumn<T>[];
      
      // Perform global search across only searchable columns
      const results = performGlobalSearch(
        data,
        effectiveSearchText,
        searchableColumns,
        { ...DEFAULT_SEARCH_CONFIG, debounceDelay: 300 }
      );
      // Extract just the items from search results
      return results.results.map(result => result.item);
    }
    // No search text, use original data
    return data;
  }, [effectiveSearchText, data, columns]);

  ////////////////////////////////////
  // Pagination Hook: Manage pagination state and logic
  ////////////////////////////////////
  
  // Initialize pagination with temporary total items (will be updated after filtering)
  const {
    currentPage,
    totalPages,
    usePagination,
    handlePageChange,
    togglePaginationMode,
    resetPage
  } = useTablePagination({
    initialPaginationMode,
    itemsPerPage,
    totalItems: searchResults.length, // Will be updated after filtering
    listRef: listRef as React.RefObject<VariableSizeList>
  });
  
  ////////////////////////////////////
  // Filtering Hook: Manage filtering state and logic
  ////////////////////////////////////
  
  // Initialize filtering with search results (not original data)
  const {
    filters,
    handleFilterChange,
    clearAllFilters,
    filteredData,
    getFilteredDataExcludingColumn
  } = useTableFiltering({
    data: searchResults, // Use search results instead of original data
    columns,
    listRef: listRef as React.RefObject<FixedSizeList | VariableSizeList>,
    usePagination,
    resetPage
  });

  // Reset all internal state when navigation occurs
  useEffect(() => {
    setInternalSearchText('');
    clearAllFilters();
    resetPage();
  }, [pathname, clearAllFilters, resetPage]);

  // Initialize accordion column management - Up in level for button communication with child components
  const {
    visibleColumns,
    handleGroupToggle,
    openGroups,
    hasAccordion
  } = useAccordionColumns(columns, accordionConfig);
  
  ////////////////////////////////////
  // Sorting Hook: Manage sorting state and logic
  ////////////////////////////////////
  
  // Initialize sorting with filtered data
  const {
    sortConfig,
    handleSort,
    sortedData,
  } = useTableSorting({
    initialSortKey,
    initialSortDirection,
    columns,
    data: filteredData,
    listRef: listRef as React.RefObject<FixedSizeList | VariableSizeList>,
    usePagination,
    resetPage,
    onSortChange,
  });

  ////////////////////////////////////
  // Server-driven data: skip client-side filter/sort when data comes from API (paginated + filtered server-side)
  ////////////////////////////////////
  const displayData = serverPagination ? data : sortedData;
  const displayFilteredData = serverPagination ? data : filteredData;

  ////////////////////////////////////
  // Main Render: Complete table structure
  ////////////////////////////////////


  // Determine current view mode from URL params
  // Use first option in availableViews as default, or 'table' if not provided
  const effectiveAvailableViews = availableViews || ['table']
  const defaultView = effectiveAvailableViews.length > 0 ? effectiveAvailableViews[0] : 'table'
  
  const { currentView } = useViewSwitcher({
    availableViews: effectiveAvailableViews,
    defaultView
  })

  // Determine which view to render based on currentView and configs
  const isKanbanView = currentView === 'kanban' && kanbanConfig !== undefined
  const isCalendarView = currentView === 'calendar' && calendarConfig !== undefined
  const isMapView = currentView === 'map' // mapConfig is optional, map view works without it
  const isSubHeadingsView = currentView === 'subheadings' && subheadingsConfig !== undefined
  const isTimelineView = currentView === 'timeline' && timelineConfig !== undefined
  const isListView = currentView === 'list' && listViewConfig !== undefined
  const isTableView = currentView === 'table' || (!isKanbanView && !isCalendarView && !isMapView && !isSubHeadingsView && !isTimelineView && !isListView)

  // Calculate enabled state from config presence
  const isMinimalControlsEnabled = minimalControlsConfig !== undefined;

  return (
    <div className="flex flex-col h-full gap-0 p-0 relative">
      {/* Grouping Control Row */}
      {isMinimalControlsEnabled && (
      <div className="w-full flex items-center justify-end px-2 py-2 mb-2 border-b border-tertiary/10">
        <div className="flex items-center gap-2">
          <GroupingControl
            columns={columns}
            selectedGroupBy={selectedGroupBy}
            selectedSubGroupBy={selectedSubGroupBy}
            onGroupByChange={setSelectedGroupBy}
            onSubGroupByChange={setSelectedSubGroupBy}
            availableViews={availableViews}
            currentView={currentView}
            availableColumns={minimalControlsConfig?.availableColumns}
          />
          <FilterControl<T>
            handleFilterChange={handleFilterChange}
            activeFilters={filters}
            columns={hasAccordion ? visibleColumns : (headerColumns as TableColumn<T>[] || visibleColumns)}
            autoApplyDropdown={autoApplyDropdown}
            showBadgesDropdown={showBadgesDropdown}
            rangeOpen={rangeOpen}
            onFilterApply={onFilterApply}
            filterUniqueValues={filterUniqueValues}
            data={data}
            filteredData={displayFilteredData}
            getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
          />
          <NewSwitcherWrapper
            availableViews={availableViews || ['table']}
          />

          <ExpandableSearchControl
            data={data}
            columns={columns}
            searchPlaceholder={searchPlaceholder}
            onSearchResults={(results: T[]) => {
              // Search results are handled by the useGlobalSearch hook internally
              // Results are automatically filtered in the search hook
            }}
            onSearchTextChange={(text: string) => {
              // Update internal search text state
              setInternalSearchText(text);
            }}
          />

        </div>
      </div>
      )}
      
      {/* Hidden measurement component for accurate row height calculation (only when dynamic height is enabled) - REMOVED */}

      {!isMinimalControlsEnabled && (showPill || !hideTopLevelFiltering || showIndependentDateFilter || (availableViews && availableViews.length > 1)) && (
      <div className="w-full flex flex-col lg:flex-row justify-between mb-4 lg:mb-0">
        {showPill && (
        <PillFilter<T>
          columns={hasAccordion ? visibleColumns : (headerColumns as TableColumn<T>[] || visibleColumns)}
          activeFilters={filters}
          handleFilterChange={handleFilterChange}
          autoApplyDropdown={autoApplyDropdown}
          showBadgesDropdown={showBadgesDropdown}
          rangeOpen={rangeOpen}
          searchTerm={effectiveSearchText}
          isSearching={false}
          hasSearchResults={effectiveSearchText.length > 0}
          onSearchTermChange={setInternalSearchText}
          onClearSearch={() => setInternalSearchText('')}
          searchResultsCount={searchResults.length}
          totalItems={searchResults.length}
          onFilterApply={onFilterApply}
          filterUniqueValues={filterUniqueValues}
          data={data}
          filteredData={displayFilteredData}
          getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
        />
        )}
      {/* View Switcher */}
      {availableViews && availableViews.length > 1 && (
        <div className="w-full flex justify-end my-auto">
          <ViewSwitcherWrapper
            availableViews={availableViews}
          />
        </div>
      )}




          <div className="flex flex-col lg:flex-row gap-2 items-center mb-4">

            {!hideTopLevelFiltering && (
              <HeaderFiltersWrapper
                columns={headerColumns}
                activeFilters={filters}
                handleFilterChange={handleFilterChange}
                data={data}
                filteredData={displayFilteredData}
                getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
                autoApplyDropdown={autoApplyDropdown}
                showBadgesDropdown={showBadgesDropdown}
                rangeOpen={rangeOpen}
                handleSort={handleSort}
                sortConfig={sortConfig}
                searchPlaceholder={searchPlaceholder}
                onGlobalSearchResults={(results) => {}}
                onGlobalSearchTextChange={(searchText) => setInternalSearchText(searchText)}
                hideTopLevelFilterSorting={hideTopLevelFilterSorting}
                hideTopLevelSearch={hideTopLevelSearch}
                isHeadLevel={true}
                isSubHeadingsView={isSubHeadingsView}
                filterUniqueValues={filterUniqueValues}
                onFilterApply={onFilterApply}
              />
            )}


            {showIndependentDateFilter && (
            <DateFilterButton
            column={columns.find(col => col.isDateField) || columns[0]} // Find first date column or fallback
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            buttonText="Filter by Date"
            width="200px"
            showDateFilterHeader={showDateFilterHeader}
            />
            )}
          </div>
      </div>
      )}

      {isItemLoading && (
        <div className="flex items-center justify-center h-full absolute inset-0">
          <LoadingSpinner />
        </div>
      )}


      {/* Zone Filters - conditionally rendered based on sideFilterButton prop */}
      {/* Group Indicators - positioned above the table uses the table header (for filters) with showFilterTitle set to false for style #2 and with headerColumns const instead of tableColumns */}
      <div className="flex flex-row gap-2 items-center justify-between px-2">
        {sideFilterButton && (
            <ZoneFilters 
              data={data} 
              handleFilterChange={handleFilterChange} 
              filters={filters} 
              zoneField={sideFilterButton.field}
              label={sideFilterButton.label}
            />
          )}

        <GroupIndicators
          groups={accordionConfig?.groups || []}
          openGroups={openGroups}
          onGroupToggle={handleGroupToggle}
          scrollContainer={scrollContainerRef.current || undefined}
        />
      </div>
      

      {/* TABLE HEADER AND ROWS LIST CONTAINER
      contain the table header and the table rows list in a flex-col
      this allows the table header to be away from the scroll container, being visible all the time.
      */}
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* If noTableDisplay is true and route is /dashboard, render DashboardContent */}
        {noTableDisplay && isDashboardRoute ? (
          <Suspense fallback={<Loading message="Loading dashboard..." size="md" />}>
            {/* Dashboard Content - displays active columns and values using getActiveColumns and getAllActiveValues*/}
            {/* <DashboardContent 
            data={data as any} 
            filteredData={displayFilteredData as any}
            activeFilters={filters}
            columns={columns as TableColumn<Record<string, any>>[]}
          /> */}
          </Suspense>
        ) : noTableDisplay ? (
          // For other routes with noTableDisplay, render nothing
          null
        ) : isKanbanView ? (
          /* Kanban View - replaces only the table component */
          <KanbanWrapper
            initialData={data}
            filteredData={displayFilteredData}
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
            projects={displayFilteredData}
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
            data={displayFilteredData}
            mapConfig={mapConfig}
          />
        ) : isTimelineView ? (
          /* Timeline View */
          <TimelineWrapper
          timelineData={displayFilteredData}
          mappingKeys={timelineConfig.mappingKeys}
          views={timelineConfig.views}
          groupByKey={timelineConfig.groupByKey}
          isGroupInline={timelineConfig.isGroupInline}
          showUnifiedEventOnCollapse={timelineConfig.showUnifiedEventOnCollapse}
          selectedGroupBy={selectedGroupBy}
          minimalControlsConfig={minimalControlsConfig}
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
        currentPage={currentPage}
        onRowClick={onRowClick}
        onActionClick={onActionClick}
        actionConfigs={actionConfigs}
        effectiveSearchText={effectiveSearchText}
        selectedItemId={selectedItemId}
        onCellValueChange={onCellValueChange}
        accordionConfig={accordionConfig}
        visibleColumns={visibleColumns}
        sortedData={displayData}
        usePagination={usePagination}
        handlePageChange={handlePageChange}
        togglePaginationMode={togglePaginationMode}
        sortConfig={sortConfig}
        handleSort={handleSort}
        filters={filters}
        handleFilterChange={handleFilterChange}
        filteredData={displayFilteredData}
        getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
        data={data}
        handleGroupToggle={handleGroupToggle}
        openGroups={openGroups}
        isItemLoading={isItemLoading}
        tableConfig={tableConfig}
        filterConfig={filterConfig}
        groupByKey={subheadingsConfig?.columnKey || kanbanConfig?.columnKey || 'status'}
        groupsConfig={subheadingsConfig?.groups}
        subheadingsDragEnd={subheadingsConfig?.subheadingsDragEnd || (() => {})}
        nestedGrouping={subheadingsConfig?.nestedGrouping}
        selectedGroupBy={selectedGroupBy}
        minimalControlsConfig={minimalControlsConfig}
        columnActions={columnActions}
        />
      ) : (
        /* Table/List View */
        isListView ? (
          <VirtualizedListComponent
            columns={columns}
            listRef={listRef}
            scrollContainerRef={scrollContainerRef}
            currentPage={currentPage}
            onRowClick={onRowClick}
            onActionClick={onActionClick}
            actionConfigs={actionConfigs}
            effectiveSearchText={effectiveSearchText}
            selectedItemId={selectedItemId}
            onCellValueChange={onCellValueChange}
            accordionConfig={accordionConfig}
            visibleColumns={visibleColumns}
            sortedData={displayData}
            usePagination={usePagination}
            handlePageChange={serverPagination?.onPageChange ?? handlePageChange}
            togglePaginationMode={togglePaginationMode}
            totalItemCount={serverPagination?.total}
            sortConfig={sortConfig}
            handleSort={handleSort}
            filters={filters}
            handleFilterChange={handleFilterChange}
            filteredData={displayFilteredData}
            getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
            data={data}
            handleGroupToggle={handleGroupToggle}
            openGroups={openGroups}
            isItemLoading={isItemLoading}
            tableConfig={tableConfig}
            filterConfig={filterConfig}
            filterUniqueValues={filterUniqueValues}
            onFilterApply={onFilterApply}
            columnActions={columnActions}
            listViewConfig={listViewConfig}
            selectedGroupBy={selectedGroupBy}
            selectedSubGroupBy={selectedSubGroupBy}
            minimalControlsConfig={minimalControlsConfig}
          />
        ) : (
        <VirtualizedTableComponent
          columns={columns}
          listRef={listRef}
          scrollContainerRef={scrollContainerRef}
          currentPage={currentPage}
          onRowClick={onRowClick}
          onActionClick={onActionClick}
          actionConfigs={actionConfigs}
          effectiveSearchText={effectiveSearchText}
          selectedItemId={selectedItemId}
          onCellValueChange={onCellValueChange}
          accordionConfig={accordionConfig}
          visibleColumns={visibleColumns}
          sortedData={displayData}
          usePagination={usePagination}
          handlePageChange={serverPagination?.onPageChange ?? handlePageChange}
          togglePaginationMode={togglePaginationMode}
          totalItemCount={serverPagination?.total}
          sortConfig={sortConfig}
          handleSort={handleSort}
          filters={filters}
          handleFilterChange={handleFilterChange}
          filteredData={displayFilteredData}
          getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
          data={data}
          handleGroupToggle={handleGroupToggle}
          openGroups={openGroups}
          isItemLoading={isItemLoading}
          tableConfig={tableConfig}
          filterConfig={filterConfig}
          filterUniqueValues={filterUniqueValues}
          onFilterApply={onFilterApply}
          columnActions={columnActions}
          selectedGroupBy={selectedGroupBy}
          selectedSubGroupBy={selectedSubGroupBy}
          minimalControlsConfig={minimalControlsConfig}
        />
        )
      )}
    </div>
  </div>

  );
} 