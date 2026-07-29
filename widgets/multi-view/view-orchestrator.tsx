/**
 * ViewOrchestrator
 *
 * Purpose: Resolve URL view/grouping and render table, list, or cards
 * Used in: Public demo hybrid / RSC pages
 * Why: Orchestrates list/table/card views; filter/sort/pagination chrome lives in url-kit
 */

"use client";

import React, { useState, useRef } from "react";
import { VariableSizeList, FixedSizeList } from "react-window";
import { LoadingSpinner } from "./components/loading-spinner";
import {
  TableColumn,
  TableConfig,
  type AccordionConfig,
} from "./types";
import type { FilterConfig } from "@/platform/url-kit/filters/feature-filtering/components/filter-types";
import type { SortConfig } from "@/platform/url-kit/filters/feature-sorting/types";
import { useViewSwitcher } from "./hooks/useViewSwitcher";
import { useAccordionColumns } from "./hooks/useAccordionColumns";
import { VirtualizedTableComponent } from "./features/virtualized-table/virtualized-table-container";
import { VirtualizedTableComponent as VirtualizedListComponent } from "./features/virtualized-list/virtualized-list-container";
import {
  MobileListWrapper,
  resolveForcedMobileView,
  type MobileListConfig,
} from "./features/mobile-list";
import type { GroupConfig } from "./features/virtualized-list/utils/grouping-utils";
import type { SearchConfig } from "@/platform/url-kit/filters/feature-filtering/components/search-types";
import { useUrlGrouping } from "@/platform/url-kit/minimal-controls";
import { useIsMobile } from "./hooks/use-is-mobile";

const EMPTY_GROUPING_KEYS: string[] = [];

interface ViewOrchestratorProps<T extends Record<string, any> = Record<string, any>> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (row: T) => void;
  onRowPointerEnter?: (row: T) => void;
  onActionClick?: (action: string, row: T) => void;
  actionConfigs?: (row: T) => any[];
  selectedItemId?: string | number;
  onCellValueChange?: (rowIndex: number, columnKey: string, newValue: any) => void;
  isItemLoading?: boolean;
  accordionConfig?: AccordionConfig;
  tableConfig?: TableConfig<T>;
  listViewConfig?: GroupConfig;
  mobileListConfig?: MobileListConfig<T>;
  availableViews?: string[];
  useAllItems?: string[];
  defaultPageSize?: number;
  filters?: FilterConfig[];
  columnActions?: Record<string, (item: T, value: any) => void | Promise<void>>;
  noTableDisplay?: boolean;
  minimalControlsConfig?: {
    availableColumnsForGrouping?: string[];
    sortConfig?: SortConfig[];
    searchConfig?: SearchConfig<T>;
  };
  externalUrlControls?: boolean;
  urlGroupingAllowedKeys?: string[];
  defaultGroupsExpanded?: boolean;
  listEndRow?: React.ReactNode;
  listEndRowHeight?: number;
}

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
  const listRef = useRef<FixedSizeList | VariableSizeList>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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

  const {
    visibleColumns,
    handleGroupToggle,
    openGroups,
  } = useAccordionColumns(columns, accordionConfig);

  const effectiveAvailableViews = availableViews || ['table'];
  const defaultView =
    effectiveAvailableViews.length > 0 ? effectiveAvailableViews[0] : 'table';

  const { currentView, resolution } = useViewSwitcher({
    availableViews: effectiveAvailableViews,
    defaultView,
    useAllItems,
    defaultPageSize,
  });

  const canRenderView = (view: string): boolean => {
    switch (view) {
      case 'list':
        return listViewConfig !== undefined;
      case 'cards':
        return mobileListConfig !== undefined;
      case 'table':
        return true;
      default:
        return false;
    }
  };

  const resolvedView = canRenderView(currentView) ? currentView : defaultView;

  const isMobile = useIsMobile();
  const renderView = resolveForcedMobileView(resolvedView, {
    isMobile,
    canRenderCards: mobileListConfig !== undefined,
  });

  const isListView = renderView === 'list' && listViewConfig !== undefined;
  const isCardsView = renderView === 'cards' && mobileListConfig !== undefined;
  const isTableView = renderView === 'table' || (!isListView && !isCardsView);

  const groupingControlsSignal =
    externalUrlControls ? (minimalControlsConfig ?? {}) : minimalControlsConfig;

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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {noTableDisplay ? null : isCardsView ? (
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
        ) : isListView ? (
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
        )}
      </div>
    </div>
  );
}
