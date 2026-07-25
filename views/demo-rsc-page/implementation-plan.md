# Demo RSC Page — Implementation Plan

## Overview

Create a React Server Component (RSC) page that demonstrates fetching mock rental car data from a server function and displaying it using FilteringWrapper with table view as default. Includes action buttons beside page header and comprehensive configuration options.

**Related:** URL filters + pagination checklist — [`docs/filters-integration.md`](docs/filters-integration.md)

---

## File Structure

Reference shape for a **URL-driven RSC list page** (filters → content → pagination, optional drawer). Concrete names in the demo are rental cars; the roles below are the reusable pattern.

**Dependency direction:** `app/` (route) → `views/` → `entities/` → `shared/` / `platform/`.

---

### 1. Route — `app/(root)/<route>/`

Next.js routing shell only. Thin: await/normalize `searchParams`, then hand off to the view. No business logic, no table chrome.

```text
app/(root)/<route>/
├── page.tsx                           # Await + normalize searchParams → view index
├── loading.tsx                        # Route-level loading UI
└── error.tsx                          # Route-level error UI
```

---

### 2. View — `views/<route>/`

Route composition: layout islands, client multi-view wiring, view-local config. Does not own domain persistence.

```text
views/<route>/
├── <route>-index.tsx                  # Page shell: header, Suspense islands, drawer mount
├── <route>-content.tsx                # Client island: FilteringWrapper + row/column actions
├── actions.ts                         # View-scoped server actions (export, page-only mutations)
├── implementation-plan.md             # Bootstrap plan + config reference (this file)
├── README.md                          # View overview / how to run
├── hooks/                             # Client hooks owned by this view
│   └── use-*-table-activity-toggle.ts # Example: optimistic cell toggle → server action
├── lib/                               # Pure view helpers (no React UI)
│   └── *-search-params-cache-key.ts   # Data-only params → stable list/facet cache key
├── ui/                                # View UI pieces composed by the index
│   ├── action-buttons.tsx             # Header CTAs (export, open-create, …)
│   ├── add-*-button.tsx               # Single CTA wired to url-drawer openCreate
│   ├── layout-sections/               # Async RSC islands (one fetch concern each)
│   │   ├── filters-section.tsx        # Facets + FiltersHeader (+ optional NL assistant)
│   │   └── table-and-pagination-section.tsx  # List payload + content + PaginationFooter
│   ├── layout-sections-error-boundaries/     # Island error UI (table/list failures)
│   └── drawer-content/                # url-drawer body: view / create / edit / delete
├── config/                            # View-local config — see config/README.md
│   ├── contract/                      # Shared keys only: field map, data vs UI URL params
│   ├── data/                          # What server fetches/caches/paginates (base filters, search, …)
│   ├── ui/                            # How it looks: columns, FiltersHeader layout, displays/*
│   └── mocks/                         # Temporary option/journey stand-ins until real APIs
└── docs/                              # Architecture / how-tos for this view
    └── filters-integration.md         # Checklist: add filters + pagination on an RSC page
```

---

### 3. Entity — `entities/<domain>/`

Domain unit: types, loaders, mutations. Reusable across views; no page layout.

```text
entities/<domain>/
├── types/                             # Row / status / list-query contracts
│   └── *-table-item.ts                # Table row shape shared by list + displays
├── lib/                               # Pure domain helpers (params→query, toggle rules, …)
│   ├── build-*-list-query.ts          # URL/params → typed list query for the list loader
│   └── *-activity-status.ts           # Example: shared toggle rules (cell + action + hook)
├── actions/                           # Server Actions: by-id fetch, create, row patches, …
│   └── …                              # Prefer one action file per mutation / fetch entry
├── validation/                        # Zod schemas shared by forms + server actions
└── server/                            # Server loaders + mock/DB boundary
    ├── data-source.ts                 # In-memory / DB seed store for this domain
    ├── get-*-data.ts                  # List: filter → sort → paginate → { rows, pagination }
    ├── get-filter-options-server.ts   # Facets: options + totalCount / initialCount
    ├── *-cached-loaders.ts            # unstable_cache entry points (getFilters, getList, getById)
    └── backend-simulate/              # Filter/facet simulation (replace with real repo later)
```

---

## Implementation Steps

### Step 1: Create Feature Directory Structure — Done

- Create `views/demo-rsc-page/` directory
- Create subdirectories: `config/`, `ui/`, `hooks/`, `lib/`
- Domain/server data in `entities/cars-rsc/`

### Step 2: Create Mock Data Source (`entities/cars-rsc/server/data-source.ts`) — Done

**Purpose:** Define mock rental cars data array

**Content:**

- Export array of rental car objects matching `RentalCarTableItem` from `entities/cars-rsc/types/rental-car-table-item.ts`
- Include fields: id, model, make, year, status, location, mileage, pricePerDay, color, licensePlate
- Generate ~20–30 mock cars with varied data

### Step 3: Create Server Function (`entities/cars-rsc/server/get-rental-cars-data.ts`) — Done

**Purpose:** Server function that returns mock rental cars (can be extended for filtering later)

**Function Signature:**

```typescript
export async function getRentalCarsData(
  searchParams?: { [key: string]: string | string[] | undefined }
): Promise<{
  cars: RentalCarTableItem[]
  pagination: {
    totalItems: number
    page: number
    limit: number
    showAll?: boolean
  }
}>
```

**Implementation:**

- Import mock data from `data-source.ts`
- Filter, sort, paginate (or show-all via `all=1`) from URL searchParams
- Cached via `entities/cars-rsc/server/demo-rsc-cached-loaders.ts` (`getCars`, `getFilters`)

See also: [`docs/filters-integration.md`](docs/filters-integration.md)

### Step 4: Create Action Buttons Component (`views/demo-rsc-page/ui/action-buttons.tsx`) — Done

**Purpose:** Action buttons for page header (Export CSV, Add Car)

**Implementation:**

- Export CSV button with Save icon
- Add Car button with Plus icon
- Uses PrimaryButton component

### Step 5: Create Table Configuration (`views/demo-rsc-page/config/ui/displays/table-config.ts`) — Done

**Purpose:** Define table chrome config with ALL available options (row type lives in `entities/cars-rsc/types/rental-car-table-item.ts`)

**Exports:**

1. **Table Columns:** All columns with proper configuration (see `views/demo-rsc-page/config/ui/columns.ts`)
2. **Header Columns:** Columns for filter dropdowns in header
3. **Filter Config:** All filter configuration options (marked false/undefined where not needed)
4. **Table Config:** All table configuration options (marked false/undefined where not needed)

### Step 6: Create Content Component (`views/demo-rsc-page/demo-rsc-content.tsx`) — Done

**Purpose:** Client component that renders FilteringWrapper (`widgets/multi-view/filtering-wrapper.tsx`)

**Type:** `'use client'` component

**Props:** cars, loading, onRowClick

### Step 7: Create RSC Page (`app/(root)/demo-rsc-page/page.tsx`) — Done

**Purpose:** Server component that fetches data and renders page with action buttons

**Features:**

- PageHeader with subtitle
- ActionButtons beside header
- Suspense boundary with loading skeletons (`shared/ui/loading-skeletons/`)
- `views/demo-rsc-page/demo-rsc-index.tsx` → `FiltersSection`, `TableAndPaginationSection`, `DemoRscContent`

---

## Loading Skeleton Structure

The loading skeleton includes:

1. **PageHeaderSkeleton** — Matches PageHeader with subtitle
2. **Action Buttons Skeleton** — Two placeholder buttons matching ActionButtons layout
3. **TableSkeleton** — Matches table structure with 9 columns (matching tableColumns) and 10 rows

---

## Configuration Options Reference

Types live in the paths below. Demo RSC wires them via `views/demo-rsc-page/config/data/*`, `config/ui/*` (including `rental-car-filters-header-config.ts`, `minimal-controls-config.ts`, and `config/ui/displays/*`).

### FilterConfig — per-facet config

`platform/url-kit/filters/feature-filtering/components/filter-types.ts`

Used in `rentalCarBaseFilters` (server + API facet generation).

**Required:**

- `key` — URL param name
- `label` — Display name
- `type` — `"multi-select" | "single-select" | "date-range" | "number-range"`

**Optional:**

- `options` — `FilterOption[]` (`label`, `value`, `count?`, `initialCount?`)
- `showQuickSelect` — Range filters — show quick-select dropdown above manual range
- `quickSelectType` — `"unique" | "buckets" | "presets"`
- `showOptionSearch` — Multi/single-select — in-dropdown option search (default true)
- `defaultRangeExpanded` — Date/number range — “Filter by range” open on first open
- `quickSelectOptionsExpanded` — Range quick-select visible immediately vs collapsible

### FiltersHeaderConfig — filter bar layout

`platform/url-kit/filters/components/filters-header-config.ts`

Used as `rentalCarFiltersHeaderConfig` on `FiltersHeader`.

- `filterType` — `"dropdown-1" | "pill" | "dropdown-2"` (which filter row layout)
- `showColumnOptions` — Show column-options row (Row 4)
- `columnOptionsKey` — Filter key for column options (when `showColumnOptions`)
- `showSearch` — Search bar in dropdown-1 / dropdown-2 rows
- `showIndependentDateSelect` — Date button beside pill row (pill layout only)
- `enabledFilterKeys` — Subset of facet keys to show in the header

### SearchConfig — search bar

`platform/url-kit/filters/feature-filtering/components/search-types.ts`

Used in `rentalCarSearchConfig` / `minimalControlsConfig.searchConfig`.

- `searchableFields` — `(keyof T)[]` — OR search across these fields
- `placeholder` — Input placeholder
- `minLength` — Min chars before search (default 0)

### PaginationConfig — footer pagination

`platform/url-kit/filters/feature-pagination/types.ts`

Used as `rentalCarPaginationConfig` on `PaginationFooter`.

- `defaultPageSize` — Default items per page
- `pageSizeOptions` — e.g. `[10, 20, 50, 100]`
- `allowPageSizeChange` — Show page-size preset buttons
- `allowShowAll` — Show “All” → `?all=1` (no `page` / `limit`)
- `showAllLabel` — Label for show-all button (default `"All"`)

Sorting is URL-driven via `SortConfig[]` (`platform/url-kit/filters/feature-sorting/types.ts`: `key`, `label`) — used in minimal toolbar and optional `tableConfig.sortConfig`, not on `FilterConfig`.

### HeaderFilterConfig — column-header filter dropdowns

`widgets/multi-view/types/header-filter-config.ts`

Nested on `tableConfig.headerFilters` / subheadings display config (not in the data filter configs).

- `columnToFilterMap` — Map column key → filter key
- `enabledFilterKeys` — Per-column list of filter keys to show
- `autoApply` — Apply filter on selection (no separate Apply)
- `showBadges` — Badge counts on filter controls
- `defaultRangeExpanded` — Range filters expanded by default in header
- `showInitialCount` — Show initial facet counts in header filters

### TableConfig — display chrome

`widgets/multi-view/features/virtualized-table/types/table-config.ts`

Passed to `FilteringWrapper` as `tableConfig` (and mirrored on list/subheadings configs where needed).

**Row / display:**

- `rowHeight` — Fixed row height in pixels
- `minRowHeight` — Minimum row height for dynamic rows
- `dynamicRowHeight` — Enable variable row heights
- `tableHeight` — Fixed table height
- `emptyMessage` — Message when no data
- `loading` — Loading state
- `loadingStateShimmer` — Shimmer effect when loading
- `rowExpansion` — Row expansion configuration
- `actionMode` — `'inline' | 'dropdown'` for row actions
- `editableColumns` — Column keys that are editable

**Styling / grouping:**

- `groupStylerConfig` — Custom styling per group
- `rowStyler` — Custom styling per row
- `rowHighlighting` — Full-row highlight layer behind cells
- `transparentHeader` — Header transparent until scrolled
- `groupBy` — Primary grouping key
- `subGroupBy` — Secondary grouping key
- `groupKeyFormatter` — Custom formatter for group headers
- `subGroupKeyFormatter` — Custom formatter for sub-group headers
- `groupSpacing` — Spacing between groups in pixels

**Header filters / sort / subheadings:**

- `headerFilters` — `HeaderFilterConfig` (see above)
- `sortConfig` — `SortConfig[]` for sort buttons in table headers
- `subheadingsDisableRowDrag` — Subheadings view — disable row drag handle

### Legacy (removed — old embedded `FilteringWrapper` `filterConfig`)

Not on current types: `initialSortKey`, `initialSortDirection`, `autoApplyDropdown`, `showBadgesDropdown`, `rangeOpen`, `searchPlaceholder`, `searchHighlightStyle`, `hideTopLevelFilterSorting`, `hideTopLevelFiltering`, `hideTopLevelSearch`, `headerColumns`, `showPill`, `showIndependentDateFilter`, `showDateFilterHeader`, `sideFilterButton`, `initialPaginationMode`, `itemsPerPage`, `hidePaginationSwitch`. See sections above for replacements.

---

## Next Steps (Future Enhancements)

1. ~~Add server-side filtering support via searchParams~~ — Done
2. ~~Add server-side sorting support via searchParams~~ — Done
3. ~~Add server-side pagination support via searchParams~~ — Done (incl. `?all=1` show-all)
4. ~~Add additional views (kanban, calendar, map, etc.)~~ — Done
5. Implement actual CSV export functionality
6. ~~Implement add car / row detail (e.g. drawer on the client demo page pattern)~~ — Done (`platform/url-kit/url-drawer` + drawer components)

---

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
