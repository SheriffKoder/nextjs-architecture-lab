# Projects Page — Full Flow & Configuration Reference

This document describes the end-to-end flow of the Projects page (table, filters, sort, pagination, API, summary). Use it as the reference to implement similar pages (e.g. Allocations, Companies).

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Index (page container)                                                      │
│  - Owns: data, filters, sort, page, total, filterUniqueValues, summary       │
│  - loadProjects(params) → useProjects().getAll(params)                       │
│  - Handlers: handleFilterApply, handleSortChange, serverPagination.onPageChange │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ProjectBoardContent                                                         │
│  - Score cards (summary from API)                                            │
│  - FilteringWrapper with: tableColumns, filterConfig, tableConfig,           │
│    onFilterApply, onSortChange, serverPagination, filterUniqueValues         │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  FilteringWrapper (from filtering-wrapper-multi-display)                     │
│  - Pill filters, header filters, virtualized table, pagination UI            │
│  - Internal: search, filters (by column key), sorting                        │
│  - When user applies filter/sort/page → calls onFilterApply / onSortChange / │
│    serverPagination.onPageChange → parent refetches                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. File Structure

| File | Role |
|------|------|
| `index.tsx` | Page container: state, `loadProjects`, handlers, mounts `ProjectBoardContent` |
| `projectboard-content.tsx` | Composes ScoreCards + FilteringWrapper; passes props from Index |
| `config/table-config.ts` | Single source for columns, filterConfig, tableConfig |

---

## 3. Column Configuration (`config/table-config.ts`)

### 3.1 Column definition shape

Each column in `allColumns` is a `TableColumn<T>` with:

- **`key`** — Data field name (e.g. `"address"`, `"after_repair_value"`). Used for sorting, row data, and (with `filterApiParams`) API param mapping.
- **`name`** — Header label.
- **`sortable`** — If true, header shows sort controls and `onSortChange` receives this key (or the key you use in the table).
- **`width` / `minWidth` / `fixedWidth`** — Layout.
- **`formatter`** — `(value) => string` for display.
- **`cellRenderer`** — Optional custom cell component.
- **Filter-related** (see below): `filterApiParams`, `uniqueValues`, `isNumberField`, `isDateField`, `isSearchFilter`, `getDropdownItems`.

### 3.2 Filter-type-specific options

- **Search (text, one field)**  
  - `isSearchFilter: true`  
  - `filterApiParams: { text: 'address_search', isArray: false }`  
  - Header/pill show a single search input; param sent as `address_search`.

- **Multi-select (e.g. owner, lender, status)**  
  - `uniqueValues: { key: "company_unique_values" }` or `"lender_unique_values"` / `"status_unique_values"`  
  - Options come from API `uniqueValues[ key ]` (facets).  
  - `filterApiParams: { text: 'company_ids', isArray: true, valueField: 'id' }`  
  - Sends `company_ids` as comma-separated IDs.

- **Number range**  
  - `isNumberField: true`  
  - `filterApiParams: { number: { from: 'after_repair_value_filter_from', to: 'after_repair_value_filter_to' } }`  
  - Header/pill show From/To; params `after_repair_value_filter_from`, `after_repair_value_filter_to`.

- **Date range**  
  - `isDateField: true`  
  - `filterApiParams: { date: { start: '...', end: '...' } }`  
  - Same idea as number, with start/end param names.

- **Optional backup source**  
  - `getDropdownItems` — Used when no `uniqueValues` (e.g. lender can fallback to another API). If `uniqueValues` is set, facets are used and `getDropdownItems` is ignored for that column.

### 3.3 Building column arrays

```ts
export const tableColumns = createColumnArray([
  'address', 'owner', 'lender', 'arv', 'mortgage',
  'investorTotalEquity', 'leveragePercentage', 'status'
]);
export const headerColumns = createColumnArray([...]); // same or subset
```

`createColumnArray` maps keys to `allColumns[key]` and returns the column objects in order.

---

## 4. Filter Configuration (`filterConfig`)

Defined in `config/table-config.ts` and passed as `filterConfig` into `FilteringWrapper`:

| Option | Example | Purpose |
|--------|---------|---------|
| `initialSortKey` | `"address"` | Default sort column when table loads |
| `autoApplyDropdown` | `false` | If true, changing filter applies immediately (no Apply button) |
| `showBadgesDropdown` | `true` | Show counts in filter options when facets exist |
| `rangeOpen` | `false` | Default open/closed for number/date range section in dropdowns |
| `searchPlaceholder` | `"Search projects by address, owner, lender..."` | Global search placeholder |
| `hideTopLevelFilterSorting` | `true` | Hide sort in top-level filter UI (sort stays in table header) |
| `hideTopLevelFiltering` | `true` | Hide separate top-level filter bar (use pill + header only) |
| `headerColumns` | `headerColumns` | Columns that have header filter controls |
| `showPill` | `true` | Show pill of active filters |
| `initialPaginationMode` | `true` | Table starts in paginated mode |
| `itemsPerPage` | `10` | Page size (used for API `limit` and server pagination) |
| `hidePaginationSwitch` | `true` | Hide “Use pagination” toggle so it’s always on |

---

## 5. Table Configuration (`tableConfig`)

Also in `config/table-config.ts`, passed as `tableConfig`:

| Option | Example | Purpose |
|--------|---------|---------|
| `rowHeight` / `minRowHeight` | `40` | Fixed row height |
| `dynamicRowHeight` | `false` | No per-row height calculation |
| `tableHeight` | `undefined` | No fixed table height; grows with rows |
| `emptyMessage` | `"No projects available"` | Shown when `data.length === 0` |
| `loadingStateShimmer` | `true` | Loading skeleton |
| `rowExpansion` | `undefined` | No expandable rows |
| `actionMode` | `'inline'` | How row actions are rendered |

---

## 6. Page State (Index)

The page keeps everything needed for one fetch and for the table/summary:

| State | Type | Meaning |
|-------|------|---------|
| `data` | `ProjectBoardTableItem[]` | Current page of rows (after transform) |
| `filters` | `Record<string, any>` | **API param names → values** (e.g. `company_ids`, `after_repair_value_filter_from`) |
| `sort` | `string \| undefined` | Sort spec for API, e.g. `"arv:asc"`, `"address:desc"` |
| `page` | `number` | Current page (1-based) |
| `total` | `number` | Total count from last API response (for “X of Y” and page count) |
| `filterUniqueValues` | `FilterUniqueValuesMap` | Facets from API, e.g. `company_unique_values`, `lender_unique_values` |
| `summary` | `ProjectsSummary \| null` | `{ total_arv, total_equity, total_investor_capital }` from API |

`itemsPerPage` comes from `projectFilterConfig.itemsPerPage` (same as `filterConfig.itemsPerPage`).

---

## 7. Load & API Contract

### 7.1 `loadProjects(override?)`

- **Merge rule (with race condition protection):**  
  `currentFilters = override?.filters ?? filters`  
  `params = { limit: itemsPerPage, page: override?.page ?? page, sort: override?.sort ?? sort, ...currentFilters }`
- **Uses:** `projectsHook.getAll(params)`.
- **After a successful response:**
  - `setData(transformedData)` (including `owner` / `lender` from `company` / `lender_org`)
  - `setFilterUniqueValues(response.uniqueValues)`
  - `setSummary(response.summary)`
  - `setTotal(response.total)`
  - If `override?.page != null`, `setPage(override.page)`.

**Note on state synchronization:** To avoid race conditions where `loadProjects` uses stale state from a previous render, `handleFilterApply` and other handlers pass the **full updated filters object** in `override.filters`. `loadProjects` prioritizes this object over the local `filters` state.

### 7.2 API route and query params

- **Route:** `GET /api/projects/with-facets`
- **Auth:** Requires user; uses `getUserData`, `isInternalAdminOrUser`, `userOrgIds` for RPC.

Query params used by the API (and thus by `GetProjectsParams` / `buildQueryParams`):

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | 1-based page (default 1) |
| `limit` | number | Page size (default 10, capped 1–1000) |
| `sort` | string | `"col:dir,col2:dir2"` e.g. `"arv:asc,mortgage:desc"` |
| `address_search` | string | Text search on address |
| `company_ids` | string (CSV) | Filter by company IDs (owner) |
| `lender_ids` | string (CSV) | Filter by lender IDs |
| `status` | string (CSV) | Filter by status values |
| `after_repair_value_filter_from` / `_to` | number | ARV range |
| `mortgage_amount_filter_from` / `_to` | number | Mortgage range |
| `investor_capital_filter_from` / `_to` | number | Investor capital range |
| `leverage_percentage_filter_from` / `_to` | number | Leverage % range |
| (plus equity, purchase_price, rehab_budget, etc. as in the route) |

Mapping from **column config** to **param names** is done via `filterApiParams` and `convertFilterToApiParams` in the apply handler (see below).

### 7.3 Response shape

- `data`: `Project[]` — current page.
- `total`: number — total count (after filters, before pagination).
- `uniqueValues`: `{ [facet_key]: UniqueValueItem[] }` — where each `UniqueValueItem` contains:
  - `id`: identifier (e.g. UUID or status string)
  - `title`: display name
  - `available`: count after applying all other filters (OR-logic within this category)
  - `total`: count before any filters (organizational visibility only)
- `summary`: `{ total_arv, total_equity, total_investor_capital }` — aggregates over the filtered set (before pagination).
- `page`, `limit`, `totalPages` — echo/computed for convenience.

---

## 8. Filter Apply Flow

1. User changes selection in pill or header (e.g. owner, ARV range, status).
2. User clicks **Apply** (or equivalent). FilteringWrapper calls  
   `onFilterApply(key, items, type, columnConfig)`  
   where `key` is the column key, `items` the selected values or `[min, max]` for ranges, `type` is `'text'|'number'|'date'`, and `columnConfig` includes `filterApiParams`.
3. **Index `handleFilterApply`:**
   - `apiParams = convertFilterToApiParams(key, items, type, columnConfig)`  
     → e.g. `{ company_ids: 'id1,id2' }` or `{ after_repair_value_filter_from: 100, after_repair_value_filter_to: 500 }`.
   - Build `newFilters`: remove any keys that belong to this column (using `filterApiParams` or `getStringFilterParam` / `getNumberFilterParams` / `getDateFilterParams`), then apply `apiParams`.
   - `setFilters(newFilters)`
   - `loadProjects({ filters: newFilters, page: 1 });`
4. API returns new `data`, `total`, `uniqueValues`, `summary`. Index updates state; table and pill show the new page and options.

So: **one place** (column’s `filterApiParams` + `convertFilterToApiParams`) defines how a column key maps to API param names and shapes. Use the same pattern on other pages.

---

## 9. Sort Flow

1. User clicks header sort on a column. FilteringWrapper’s sort logic calls  
   `onSortChange(sortSpec)`  
   with `sortSpec` like `"after_repair_value:asc"` or `"address:desc"`, or `undefined` when sort is cleared.
2. **Index `handleSortChange`:**
   - `setSort(sortSpec ?? undefined)`
   - `setPage(1)`
   - `loadProjects({ sort: sortSpec ?? undefined, page: 1 })`
3. API uses `sort` to build `p_sort_specs` and returns ordered `data`. Table and pagination stay in sync because `page` is reset and `data`/`total` are updated.

Sort column names in the API/SQL match the **column key** (e.g. `after_repair_value`, `address`). The backend whitelist also allows aliases (e.g. `arv` → `after_repair_value`).

---

## 10. Pagination Flow (API / server pagination)

1. Index passes **`serverPagination`** into ProjectBoardContent → FilteringWrapper:
   - `total` — from last response.
   - `page` — current page.
   - `limit` — `itemsPerPage`.
   - `onPageChange: (p) => { setPage(p); loadProjects({ page: p }); }`
2. FilteringWrapper passes `totalItemCount={serverPagination.total}`, `currentPage={serverPagination.page}`, and the same `onPageChange` into the virtualized table. The table does **not** slice `data`; it shows the current page as received and uses `total` for “Showing X–Y of Z” and total pages.
3. When the user changes page, `onPageChange(p)` runs → Index updates `page` and calls `loadProjects({ page: p })` → new `data` and `total` → table re-renders with the new page.

So pagination is fully server-driven: **only the current page** is in `data`; **total** and **page** come from state updated by the API.

Where **`serverPagination`** is set and used:

- **Defined** in `features/portfolio-project-board/index.tsx`: the object `{ total, page, limit, onPageChange }` is built and passed to `ProjectBoardContent`.
- **Passed through** in `features/portfolio-project-board/projectboard-content.tsx`: received as a prop and forwarded to `FilteringWrapper`.
- **Consumed** in `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`: used for `displayData` (no client slice), `totalItemCount`, `currentPage`, and the table's page-change handler.

Client-side filtering and client-side pagination depend on the **absence** of `serverPagination`. In the wrapper (filtering-wrapper.tsx), `displayData = serverPagination ? data : sortedData` and `displayFilteredData = serverPagination ? data : filteredData`; `currentPage`, `handlePageChange`, and `totalItemCount` likewise switch on whether `serverPagination` is passed. When `serverPagination` is set, the table shows `data` as-is and uses server-driven page/total/onPageChange; when it is not set, the table uses the client pipeline (filtered/sorted data and client pagination). So both client-side filtering and client-side pagination are used only when `serverPagination` is **not** provided; providing it turns them off for the table.

---

## 11. Summary Cards

- Values come from **`summary`** in the API response, not from `data`.
- API (and SQL) compute `total_arv`, `total_equity`, `total_investor_capital` over the **filtered** set, **before** pagination.
- Index builds `scoreData` from `summary` with fallbacks:  
  `value: summary?.total_arv ?? 0`, etc.
- ProjectBoardContent renders `ScoreCards` with `scoreData`.

---

## 12. Repeating This on Other Pages (Checklist)

1. **Config (e.g. `config/table-config.ts`)**
   - Define `allColumns` with `key`, `name`, `sortable`, `formatter` / `cellRenderer`.
   - For each filterable column set `filterApiParams` (and `uniqueValues` or `getDropdownItems` where needed), plus `isNumberField` / `isDateField` / `isSearchFilter` as appropriate.
   - Export `tableColumns`, `headerColumns`, `filterConfig`, `tableConfig`.

2. **Page container (e.g. `index.tsx`)**
   - State: `data`, `filters` (API param names → values), `sort`, `page`, `total`, `filterUniqueValues`, `summary` (if you have summary).
   - `loadProjects(override?)`: merge `limit`, `page`, `filters`, `sort`, `override` → call hook (e.g. `getAll(params)`), then update `data`, `total`, `filterUniqueValues`, `summary`, and `page` when `override.page != null`.
   - On mount: `loadProjects()`.
   - `handleFilterApply`: convert with `convertFilterToApiParams(key, items, type, columnConfig)`, merge into `newFilters`, `setPage(1)`, `loadProjects({ ...newFilters, page: 1 })`.
   - `handleSortChange`: `setSort(spec)`, `setPage(1)`, `loadProjects({ sort: spec, page: 1 })`.
   - `serverPagination`: `{ total, page, limit: itemsPerPage, onPageChange: (p) => { setPage(p); loadProjects({ page: p }); } }`.
   - Pass into the content component: `data`, `onFilterApply`, `onSortChange`, `serverPagination`, `filterUniqueValues`, and any summary-based props.

3. **Content wrapper (e.g. `projectboard-content.tsx`)**
   - Receives those props and passes them to `FilteringWrapper` along with `columns`, `filterConfig`, `tableConfig`, and optionally `viewToggleConfig` / `kanbanConfig`.

4. **API + backend**
   - Accept the same param names your columns map to via `filterApiParams`.
   - Return `data`, `total`, `uniqueValues` (and `summary` if needed).
   - Support `page`, `limit`, and `sort` in the same format if you use server pagination and header sort.

5. **Hook (e.g. `useProjects`)**
   - `getAll(params)` builds query string from `params` (including `page`, `limit`, `sort`, and all filter param names).
   - Response type includes `data`, `total`, `uniqueValues`, and optionally `summary`.

Using this flow and the projects implementation as the reference keeps columns, filters, sort, pagination, and summary consistent across pages.

---

## 13. Independent Faceted Filtering (Advanced Faceting)

The filter system implements an "Independent Facet" (or "Faceted Search") pattern, allowing users to multi-select within a category while seeing how many items are available based on selections in *other* categories.

### 13.1 Filtering Logic (AND-between, OR-within)
- **Within a category** (e.g. Status): Selecting multiple statuses (Active, Sold) uses **OR** logic.
- **Between categories** (e.g. Status vs Owner): Selections are combined with **AND** logic.
- **Independent Facets**: When calculating available counts for a specific category (e.g. "Status"), the filter for "Status" itself is **ignored**. This allows users to see that other status options exist and are selectable, even if they've already filtered for one.

### 13.2 SQL Implementation (RPC)
The PostgreSQL function (`get_projects_with_facets`) calculates these counts in a single pass:
1. **Filter Flags**: Every row is evaluated against every filter condition (Search, Status, Owner, Lender, Ranges), resulting in a set of boolean flags (`f_status`, `f_owner`, etc.).
2. **Main Data**: The final result set applies all flags: `WHERE f_status AND f_owner AND f_lender AND ...`.
3. **Facet Counts**:
   - `total`: The count of unique values before any filters are applied (only organizational visibility).
   - `available`: Calculated using `COUNT(*) FILTER (WHERE [all flags EXCEPT the current category])`.
   - *Example for Status facet*: `COUNT(*) FILTER (WHERE f_owner AND f_lender AND f_global_search AND ...)` (omitting `f_status`).

### 13.3 Frontend Display and Interaction
- **Badges**: Displayed as `(available/total)` next to each option.
  - **Selectable**: Items with `available > 0` have a **green** badge (`bg-green-500/10 text-green-500`).
  - **Disabled**: Items with `available === 0` are greyed out and unselectable, but remain visible to show they exist in the broader dataset.
- **Active Pills**: Active filters in the pill bar and dropdown headers also show their `(available/total)` counts.
- **Data Mapping**:
  - API `UniqueValueItem` → Frontend `DropdownOptionFromFacet`.
  - Frontend `FilterOption` includes `hasCount: true` to trigger badge rendering.
  - `columnIndependentCount` maps to `available`.
  - `totalCount` maps to `total`.
