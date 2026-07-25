# 🧱 RSC Page Architecture — Data-Driven UI with URL State

## 🎯 Goal

Build a server-first, scalable page architecture that:

- Uses URL as the source of truth
- Separates UI concerns (params) from data concerns (query)
- Supports progressive enhancement to TanStack (client-side)
- Enables independent UI sections with Suspense streaming
- Keeps code modular, testable, and reusable

## 🧠 Core Architectural Principles

### 1. URL is the Single Source of Truth

All state that affects data must live in the URL:

Filters, search, sorting, pagination → URL params

Why:

- Shareable links
- Back/forward navigation
- Server re-fetching
- SEO compatibility

### 2. Separate params from query

```text
params → UI layer (raw URL shape)
query  → Data layer (typed, structured)
```

#### Example

```ts
// params (from Next.js)
{
  status: 'active',
  page: '2',
  sort: 'createdAt:desc'
}

// query (internal)
{
  status: ['active'],
  page: 2,
  sort: [{ key: 'createdAt', order: 'desc' }]
}
```

### 3. Normalize Params Once (Top-Level Only)

#### ❌ Avoid

```ts
// inside components
const params = await searchParams
```

#### ✅ Do

```ts
// page.tsx
const params = normalizeParams(searchParams)
```

Why:

- ✔ Prevent repeated parsing
- ✔ Ensure consistent types
- ✔ Simplify downstream components
- ✔ Enable testing

### 4. Query Builder Layer (Critical)

Convert params → query in a single place (inside the list loader, not in `page.tsx`):

```ts
const query = buildRentalCarListQuery(params)
```

Responsibilities:

- Type conversion (string → number)
- Mapping URL keys → domain keys
- Handling defaults
- Structuring filters (ranges, lists, search, sorting)

Why this matters (beyond TanStack):

- ✔ Decouples backend from URL format
- ✔ Enables reuse across RSC + client
- ✔ Prevents UI-driven data logic leaks
- ✔ Makes backend contracts stable

## 🧩 Layered Architecture

```text
[ URL (searchParams) ]
        ↓
[ normalizeParams ]          // page.tsx
        ↓
[ RSC Layout / Sections ]    // receive params
        ↓
[ data-only cache key ]      // strip drawer / UI chrome
        ↓
[ Cached loaders ]           // getFilters / getCars
        ↓
[ buildRentalCarListQuery ]  // inside getCars only
        ↓
[ getRentalCarsData(query) ] // typed list contract
```

## 🧱 Component Structure

### Page Entry

```text
page.tsx
  → normalize params
  → render layout (DemoRscIndex params={params})
```

### Layout Structure

```text
PageHeader
ActionButtons
```

```tsx
<Suspense fallback={<FiltersSkeleton />}>
  <FiltersSection params={params} />
</Suspense>

<TablePaginationErrorBoundary>
  <Suspense fallback={<TableSkeleton />}>
    <TableAndPaginationSection params={params} />
  </Suspense>
</TablePaginationErrorBoundary>
```

## 🔀 Params vs Query — Final Decision

### Both sections receive params

```tsx
<FiltersSection params={params} />
<TableAndPaginationSection params={params} />
```

Sections stay on the URL shape. Query is not built or passed at the page/layout layer.

### Filters path → params

```ts
const filters = await getFilters(demoRscDataParamsToCacheKey(params))
// → getFilterOptionsServer(baseFilters, params)
```

Why:

- Existing system built on URL shape
- Faceting helpers depend on flat params
- UI-driven logic (not data-driven)

### List path → query (inside the loader)

```ts
// inside getCars(dataParamsKey)
const params = JSON.parse(dataParamsKey)
const query = buildRentalCarListQuery(params)
return getRentalCarsData(query)
```

Why:

- Typed and structured
- Matches backend expectations
- Aligns with future TanStack usage

## 🧠 Key Insight

```text
Filters = UI system (URL-driven params)
Table   = Data system (query built inside getCars)
```

👉 Sections share params; the list contract is query. They are intentionally decoupled at the data boundary, not at the section prop surface.

## 🧠 Server Data Layer Design

### Cached entry points (demo RSC)

```ts
getFilters(dataParamsKey)  // facets — params in
getCars(dataParamsKey)     // list — params → query → getRentalCarsData
```

Rules:

- ✔ Sections pass a data-only cache key (UI chrome stripped)
- ✔ `getCars` builds `RentalCarListQuery` once, then calls `getRentalCarsData(query)`
- ✔ `getFilters` stays on params for faceting
- ✔ `unstable_cache` / request dedupe share work across sections when the data key matches

### Typed list contract

```ts
getRentalCarsData(query: RentalCarListQuery)
```

👉 This is the stable data contract for the list (RSC today, TanStack later) — not a single “page data” wrapper used by every section.

## ⚡ RSC Data Fetching Strategy

### Distributed Fetching (Recommended)

Each section owns its loaders:

```ts
// FiltersSection
await getFilters(dataKey)

// TableAndPaginationSection
await Promise.all([getCars(dataKey), getFilters(dataKey)])
```

Why this works:

- ✔ Identical `dataKey` shares cached facet work across sections
- ✔ Enables independent Suspense boundaries
- ✔ Keeps components decoupled
- ✔ Supports partial client migration

## ⏳ Suspense Strategy

Filters stream separately; table and pagination share one island:

```tsx
<Suspense fallback={<FiltersSkeleton />}>
  <FiltersSection params={params} />
</Suspense>

<Suspense fallback={<TableSkeleton />}>
  <TableAndPaginationSection params={params} />
</Suspense>
```

Benefits:

- ✔ Streaming UI
- ✔ Better perceived performance
- ✔ Independent loading states
- ✔ Future-ready for partial hydration

👉 Table + pagination are grouped because they share the same list payload (`cars` + `pagination`).

## 📁 Folder Structure

```text
app/(root)/demo-rsc-page/
  page.tsx                         # await searchParams, normalizeParams

views/demo-rsc-page/
  demo-rsc-index.tsx               # layout + Suspense islands
  demo-rsc-content.tsx             # table / multi-view client surface
  ui/layout-sections/
    filters-section.tsx
    table-and-pagination-section.tsx
  lib/
    demo-rsc-search-params-cache-key.ts
  config/
    demo-rsc-url-data-params.ts    # which URL keys affect list/facets

entities/cars-rsc/
  lib/
    build-rental-car-list-query.ts
  types/
    rental-car-list-query.ts
  server/
    demo-rsc-cached-loaders.ts     # getFilters, getCars
    get-rental-cars-data.ts
    get-filter-options-server.ts
```

## 🧠 Key Design Decisions

### 1. Normalize Early

Never pass raw `searchParams` deep into the tree

### 2. Query is the List Contract

Everything list-data-related uses `RentalCarListQuery` inside the entity layer

### 3. Params Stay on the Section Surface

Filters, table/pagination, and drawer receive params; query is derived where list data is loaded

### 4. One Query Builder

No duplicated transformation logic — `buildRentalCarListQuery` lives in `entities/cars-rsc`

### 5. Split Cached Loaders, Shared Data Key

`getFilters` + `getCars` with the same data-only cache key; not one mega `getRentalCarsPageData` for every section

### 6. Sections Are Independent

Each section owns its data dependency and Suspense boundary

## 🚀 Ready for TanStack Upgrade

This architecture allows seamless transition:

```text
RSC TableAndPaginationSection → ClientTable (useQuery)
```

### Example Migration

```tsx
// before (RSC — params in, query inside loader)
<TableAndPaginationSection params={params} />

// after (client — same query contract)
<HydrationBoundary>
  <ClientTable query={buildRentalCarListQuery(params)} />
</HydrationBoundary>
```

Why it works:

- ✔ Same query object
- ✔ Same data contract (`getRentalCarsData`)
- ✔ No rewrite of the list contract

## ⚠️ Anti-Patterns Avoided

- ❌ Awaiting `searchParams` inside nested sections
- ❌ Mixing UI chrome keys into list/facet cache identity
- ❌ Rebuilding query in multiple places
- ❌ Passing a derived query object through the whole tree as shared state
- ❌ Tight coupling between filter UI and `getRentalCarsData`

## 🧠 Final Mental Model

```text
URL → UI State (params)
Sections → params + data-only cache key
getCars → Query → List Data
getFilters → Facets (params)
RSC → Execution Engine
```

## 🔚 Summary

This architecture gives:

- ✔ Clean separation of concerns
- ✔ Strong typing and consistency
- ✔ Scalable page structure
- ✔ Independent UI sections
- ✔ Smooth client upgrade path
- ✔ Maintainable codebase

---

## Key Learnings

- **URL is the single source of truth** — Filters, search, sorting, and pagination live in the URL for shareable links, navigation, and server re-fetching.
- **Params ≠ query** — Sections receive params; `RentalCarListQuery` is built inside `getCars` for the typed list contract.
- **Normalize once at the top** — Normalize `searchParams` in `page.tsx`, not inside nested components.
- **One query builder, split loaders** — `buildRentalCarListQuery` is singular; sections call `getFilters` / `getCars` with a shared data-only cache key.
- **Filters and list are decoupled at the data boundary** — Facets stay params-driven; the list path converts params → query → `getRentalCarsData`.
- **Distributed fetch + Suspense** — Filters stream alone; table + pagination share one island and `Promise.all` the loaders they need.
- **TanStack-ready** — The same `RentalCarListQuery` + `getRentalCarsData` contract migrates to client `useQuery` without a rewrite.
