# Filtering Wrapper Cleanup Plan

## Overview
Remove filtering, sorting, and pagination functionality from `features/filtering-wrapper-multi-display-clean` while preserving view switching and grouping controls.

## Components to Keep
- ✅ GroupingControl
- ✅ NewSwitcherWrapper (view switcher)
- ✅ ViewSwitcherWrapper
- ✅ All view components (table, kanban, calendar, map, timeline, subheadings, list)

## Components to Remove

### 1. Props to Remove from `FilteringWrapperProps`
- `filterConfig?: FilterConfig<T>`
- `onFilterApply?: (...)`
- `onSortChange?: (sortSpec: string | undefined) => void`
- `serverPagination?: { total: number; page: number; limit: number; onPageChange: (page: number) => void }`
- `filterUniqueValues?: FilterUniqueValuesMap`
- `onFilterHandlerReady?: (handleFilterChange: (columnKey: string, values: any) => void) => void`
- `globalSearchText?: string`

### 2. Folders/Files to Delete

**Hooks:**
- `hooks/filtering/` (entire folder)
- `hooks/sorting/` (entire folder)
- `hooks/search/` (entire folder)

**Components:**
- `components/PillFilter/` (entire folder)
- `components/TableFilters/` (entire folder)
- `components/DateFilterSingle/` (entire folder)
- `components/header-filters-wrapper.tsx`
- `components/ZoneFilters.tsx`
- `components/GlobalSearch/` (entire folder)
- `components/minimals/filter-control.tsx`
- `components/minimals/expandable-search-control.tsx`
- `components/minimals/search-control.tsx`

**Utils:**
- `utils/filtering/` (entire folder)
- `utils/search/` (entire folder)

**Types:**
- `types/filter-config.ts`
- `types/filter-facets.ts`
- `types/filter-types.ts`
- `types/search/` (entire folder)

**Pagination hooks in features:**
- `features/virtualized-table/hooks/pagination/` (entire folder)
- `features/virtualized-list/hooks/pagination/` (entire folder)
- `features/subheadings/hooks/pagination/` (entire folder)

### 3. Code to Remove from `filtering-wrapper.tsx`

**Imports to remove:**
- `useTableSorting, useTableFiltering, useTablePagination` from hooks
- `HeaderFiltersWrapper` component
- `performGlobalSearch, DEFAULT_SEARCH_CONFIG` from utils
- `SearchableColumn` from types
- `PillFilter` component
- `DateFilterButton` component
- `ZoneFilters` component
- `FilterControl` component
- `ExpandableSearchControl` component
- `FilterConfig, FilterUniqueValuesMap` from types

**State and hooks to remove:**
- `internalSearchText` state
- `effectiveSearchText` calculation
- `searchResults` useMemo
- `useTablePagination` hook
- `useTableFiltering` hook
- `useTableSorting` hook
- `displayData` and `displayFilteredData` calculations (use `data` directly)

**Config extraction to remove:**
- All `filterConfig` destructuring (initialSortKey, initialSortDirection, initialPaginationMode, itemsPerPage, sideFilterButton, showPill, showIndependentDateFilter, showDateFilterHeader, headerColumns, searchPlaceholder, hideTopLevelFilterSorting, hideTopLevelFiltering, hideTopLevelSearch, autoApplyDropdown, showBadgesDropdown, rangeOpen, searchHighlightStyle)

**UI components to remove:**
- `<FilterControl>` component
- `<ExpandableSearchControl>` component
- `<PillFilter>` component
- `<HeaderFiltersWrapper>` component
- `<DateFilterButton>` component
- `<ZoneFilters>` component
- All conditional rendering based on filter/sort/pagination configs

### 4. Update Files

**hooks/index.ts:**
- Remove exports for useTableSorting, useTableFiltering, useTablePagination

**types/index.ts:**
- Remove exports for FilterConfig, FilterUniqueValuesMap, FilterValue, RangeFilter, DateRangeFilter

**Child components to update:**
- `features/virtualized-table/virtualized-table-container.tsx`
- `features/virtualized-list/virtualized-list-container.tsx`
- `features/subheadings/subheadings-container.tsx`

Remove props:
- `filters`, `handleFilterChange`, `filteredData`
- `sortConfig`, `handleSort`, `sortedData`
- `usePagination`, `handlePageChange`, `togglePaginationMode`, `currentPage`, `totalPages`
- `filterConfig`, `filterUniqueValues`, `onFilterApply`
- `getFilteredDataExcludingColumn`

### 5. Simplify Data Flow

After removal:
```typescript
// Simple: data -> display (no filtering/sorting/pagination)
const displayData = data; // Just use data directly
```

### 6. Update Component Description

Update file header to reflect removal of filtering/sorting/pagination.

## Implementation Steps

1. ✅ Create cleanup plan
2. ⏳ Delete folders/files
3. ⏳ Remove imports from filtering-wrapper.tsx
4. ⏳ Remove state/hooks from filtering-wrapper.tsx
5. ⏳ Remove UI components from filtering-wrapper.tsx
6. ⏳ Update hooks/index.ts
7. ⏳ Update types/index.ts
8. ⏳ Update child components (virtualized-table, virtualized-list, subheadings)
9. ⏳ Test and verify
