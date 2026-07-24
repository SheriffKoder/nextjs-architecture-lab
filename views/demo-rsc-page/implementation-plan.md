# Demo RSC Page - Implementation Plan

## Overview
Create a React Server Component (RSC) page that demonstrates fetching mock rental car data from a server function and displaying it using FilteringWrapper with table view as default. Includes action buttons beside page header and comprehensive configuration options.

## File Structure

```
screens/demo-rsc-page/
├── demo-rsc-index.tsx            # Page shell (Suspense islands, header, drawer)
├── demo-rsc-content.tsx          # Client component that renders FilteringWrapper
├── components/
│   └── action-buttons.tsx        # Action buttons component (Export CSV, Add Car)
├── config/
│   └── displays/table-config.ts  # Table chrome config
└── README.md                     # Documentation for this feature

features/cars-rsc/
├── types/
│   └── rental-car-table-item.ts  # Row type `RentalCarTableItem` (mock data + displays import this)
└── server/
    ├── get-rental-cars-data.ts   # Server function to fetch/filter/sort/paginate rental cars
    └── data-source.ts            # Mock rental cars data source

app/(root)/demo-rsc-page/
└── page.tsx                      # RSC page component → DemoRscIndex
```

## Implementation Steps

### Step 1: Create Feature Directory Structure ✅ Done
- Create `screens/demo-rsc-page/` directory
- Create subdirectories: `config/`, `components/`, `hooks/`, `utils/`
- Domain/server data in `features/cars-rsc/`

### Step 2: Create Mock Data Source (`features/cars-rsc/server/data-source.ts`) ✅ Done
**Purpose**: Define mock rental cars data array
**Content**:
- Export array of rental car objects matching `RentalCarTableItem` from `features/cars-rsc/types/rental-car-table-item.ts`
- Include fields: id, model, make, year, status, location, mileage, pricePerDay, color, licensePlate
- Generate ~20-30 mock cars with varied data

### Step 3: Create Server Function (`features/cars-rsc/server/get-rental-cars-data.ts`) ✅ Done
**Purpose**: Server function that returns mock rental cars (can be extended for filtering later)
**Function Signature**:
```typescript
export async function getRentalCarsData(
  searchParams?: { [key: string]: string | string[] | undefined }
): Promise<{ cars: RentalCarTableItem[]; pagination: { totalItems: number; page: number; limit: number; showAll?: boolean } }>
```
**Implementation**:
- Import mock data from `data-source.ts`
- Filter, sort, paginate (or show-all via `all=1`) from URL searchParams
- Cached via `features/cars-rsc/server/demo-rsc-cached-loaders.ts` (`getCars`, `getFilters`)

### Step 4: Create Action Buttons Component (`screens/demo-rsc-page/components/action-buttons.tsx`) ✅ Done
**Purpose**: Action buttons for page header (Export CSV, Add Car)
**Implementation**:
- Export CSV button with Save icon
- Add Car button with Plus icon
- Uses PrimaryButton component

### Step 5: Create Table Configuration (`screens/demo-rsc-page/config/displays/table-config.ts`) ✅ Done
**Purpose**: Define table chrome config with ALL available options (row type lives in `features/cars-rsc/types/rental-car-table-item.ts`)

**Exports**:
1. **Table Columns**: All columns with proper configuration (see `screens/demo-rsc-page/config/columns.ts`)
2. **Header Columns**: Columns for filter dropdowns in header
3. **Filter Config**: All filter configuration options (marked false/undefined where not needed)
4. **Table Config**: All table configuration options (marked false/undefined where not needed)

### Step 6: Create Content Component (`screens/demo-rsc-page/demo-rsc-content.tsx`) ✅ Done
**Purpose**: Client component that renders FilteringWrapper (`features/multi-view/filtering-wrapper.tsx`)
**Type**: `'use client'` component
**Props**: cars, loading, onRowClick

### Step 7: Create RSC Page (`app/(root)/demo-rsc-page/page.tsx`) ✅ Done
**Purpose**: Server component that fetches data and renders page with action buttons
**Features**:
- PageHeader with subtitle
- ActionButtons beside header
- Suspense boundary with loading skeletons (`components/layout/loading-skeletons/`)
- `screens/demo-rsc-page/demo-rsc-index.tsx` → `FiltersSection`, `TableAndPaginationSection`, `DemoRscContent`

## Loading Skeleton Structure

The loading skeleton includes:
1. **PageHeaderSkeleton**: Matches PageHeader with subtitle
2. **Action Buttons Skeleton**: Two placeholder buttons matching ActionButtons layout
3. **TableSkeleton**: Matches table structure with 9 columns (matching tableColumns) and 10 rows

## Configuration Options Reference

Types live in the paths below. Demo RSC wires them via `screens/demo-rsc-page/config/header-filters-config.ts`, `minimal-controls-config.ts`, and `config/displays/*`.

### FilterConfig — per-facet config (`features/url-kit/filters/feature-filtering/components/filter-types.ts`)

Used in `rentalCarBaseFilters` (server + API facet generation).

**Required:**
- ✅ `key`: URL param name
- ✅ `label`: Display name
- ✅ `type`: `"multi-select" | "single-select" | "date-range" | "number-range"`

**Optional:**
- ✅ `options`: `FilterOption[]` (`label`, `value`, `count?`, `initialCount?`)
- ✅ `showQuickSelect`: Range filters — show quick-select dropdown above manual range
- ✅ `quickSelectType`: `"unique" | "buckets" | "presets"`
- ✅ `showOptionSearch`: Multi/single-select — in-dropdown option search (default true)
- ✅ `defaultRangeExpanded`: Date/number range — “Filter by range” open on first open
- ✅ `quickSelectOptionsExpanded`: Range quick-select visible immediately vs collapsible

### FiltersHeaderConfig — filter bar layout (`features/url-kit/filters/components/filters-header-config.ts`)

Used as `rentalCarFiltersHeaderConfig` on `FiltersHeader`.

- ✅ `filterType`: `"dropdown-1" | "pill" | "dropdown-2"` (which filter row layout)
- ✅ `showColumnOptions`: Show column-options row (Row 4)
- ✅ `columnOptionsKey`: Filter key for column options (when `showColumnOptions`)
- ✅ `showSearch`: Search bar in dropdown-1 / dropdown-2 rows
- ✅ `showIndependentDateSelect`: Date button beside pill row (pill layout only)
- ✅ `enabledFilterKeys`: Subset of facet keys to show in the header

### SearchConfig — search bar (`features/url-kit/filters/feature-filtering/components/search-types.ts`)

Used in `rentalCarSearchConfig` / `minimalControlsConfig.searchConfig`.

- ✅ `searchableFields`: `(keyof T)[]` — OR search across these fields
- ✅ `placeholder`: Input placeholder
- ✅ `minLength`: Min chars before search (default 0)

### PaginationConfig — footer pagination (`features/url-kit/filters/feature-pagination/types.ts`)

Used as `rentalCarPaginationConfig` on `PaginationFooter`.

- ✅ `defaultPageSize`: Default items per page
- ✅ `pageSizeOptions`: e.g. `[10, 20, 50, 100]`
- ✅ `allowPageSizeChange`: Show page-size preset buttons
- ✅ `allowShowAll`: Show “All” → `?all=1` (no `page` / `limit`)
- ✅ `showAllLabel`: Label for show-all button (default `"All"`)

Sorting is URL-driven via `SortConfig[]` (`features/url-kit/filters/feature-sorting/types.ts`: `key`, `label`) — used in minimal toolbar and optional `tableConfig.sortConfig`, not on `FilterConfig`.

### HeaderFilterConfig — column-header filter dropdowns (`features/multi-view/types/header-filter-config.ts`)

Nested on `tableConfig.headerFilters` / subheadings display config (not in `header-filters-config.ts`).

- ✅ `columnToFilterMap`: Map column key → filter key
- ✅ `enabledFilterKeys`: Per-column list of filter keys to show
- ✅ `autoApply`: Apply filter on selection (no separate Apply)
- ✅ `showBadges`: Badge counts on filter controls
- ✅ `defaultRangeExpanded`: Range filters expanded by default in header
- ✅ `showInitialCount`: Show initial facet counts in header filters

### TableConfig — display chrome (`features/multi-view/features/virtualized-table/types/table-config.ts`)

Passed to `FilteringWrapper` as `tableConfig` (and mirrored on list/subheadings configs where needed).

**Row / display:**
- ✅ `rowHeight`: Fixed row height in pixels
- ✅ `minRowHeight`: Minimum row height for dynamic rows
- ✅ `dynamicRowHeight`: Enable variable row heights
- ✅ `tableHeight`: Fixed table height
- ✅ `emptyMessage`: Message when no data
- ✅ `loading`: Loading state
- ✅ `loadingStateShimmer`: Shimmer effect when loading
- ✅ `rowExpansion`: Row expansion configuration
- ✅ `actionMode`: `'inline' | 'dropdown'` for row actions
- ✅ `editableColumns`: Column keys that are editable

**Styling / grouping:**
- ✅ `groupStylerConfig`: Custom styling per group
- ✅ `rowStyler`: Custom styling per row
- ✅ `rowHighlighting`: Full-row highlight layer behind cells
- ✅ `transparentHeader`: Header transparent until scrolled
- ✅ `groupBy`: Primary grouping key
- ✅ `subGroupBy`: Secondary grouping key
- ✅ `groupKeyFormatter`: Custom formatter for group headers
- ✅ `subGroupKeyFormatter`: Custom formatter for sub-group headers
- ✅ `groupSpacing`: Spacing between groups in pixels

**Header filters / sort / subheadings:**
- ✅ `headerFilters`: `HeaderFilterConfig` (see above)
- ✅ `sortConfig`: `SortConfig[]` for sort buttons in table headers
- ✅ `subheadingsDisableRowDrag`: Subheadings view — disable row drag handle

### Legacy (removed — old embedded `FilteringWrapper` `filterConfig`)

Not on current types: `initialSortKey`, `initialSortDirection`, `autoApplyDropdown`, `showBadgesDropdown`, `rangeOpen`, `searchPlaceholder`, `searchHighlightStyle`, `hideTopLevelFilterSorting`, `hideTopLevelFiltering`, `hideTopLevelSearch`, `headerColumns`, `showPill`, `showIndependentDateFilter`, `showDateFilterHeader`, `sideFilterButton`, `initialPaginationMode`, `itemsPerPage`, `hidePaginationSwitch`. See sections above for replacements.

## Next Steps (Future Enhancements)
1. ~~Add server-side filtering support via searchParams~~ ✅ Done
2. ~~Add server-side sorting support via searchParams~~ ✅ Done
3. ~~Add server-side pagination support via searchParams~~ ✅ Done (incl. `?all=1` show-all)
4. ~~Add additional views (kanban, calendar, map, etc.)~~ ✅ Done
5. Implement actual CSV export functionality
6. ~~Implement add car / row detail (e.g. drawer on the client demo page pattern)~~ ✅ Done (`features/url-kit/drawer-2` + drawer components)

## Testing Checklist
- [x] Page renders without errors
- [x] Mock data displays in table
- [x] Action buttons render beside page header
- [x] Loading skeletons display correctly
- [x] Columns are sortable
- [x] Filters work (dropdown filters)
- [x] Search works
- [x] Pagination works
- [x] Loading state displays correctly
- [ ] Empty state displays when no data
- [x] Row click handler works
