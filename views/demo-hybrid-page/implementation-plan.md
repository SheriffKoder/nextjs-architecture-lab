# Demo Hybrid Page — Implementation Plan

## Overview

Create a **hybrid** rental cars page: RSC cold-load prefetch into TanStack Query, client shell for all interactive reads/writes after hydration. Same visual chrome as the RSC demo (filters, pagination, multi-view, URL drawer) without `router.replace` remount cost on filter/sort/page changes.

**Architecture contract:**

```text
Server (RSC)      → first paint: prefetch list + options → dehydrate
Client (TanStack) → filters, sort, pagination, infinite All, drawer detail, mutations
API routes        → queryFn + mutation transport (mock repository today)
URL               → shareable source of truth; shallow commit on hybrid (no document flight)
```

**Related docs:**

- Engineering story (Steps 0–5): [`docs/index.md`](docs/index.md)
- RSC → hybrid shifts: [`docs/architecture/rsc-to-hybrid-shifts.md`](docs/architecture/rsc-to-hybrid-shifts.md)
- Backlog: [`docs/reflections/next-steps.md`](docs/reflections/next-steps.md)

**Self-contained:** no runtime imports from `demo-rsc-page`, `demo-client-page`, or `entities/cars-rsc`.

---

## File Structure

Reference shape for a **URL-driven hybrid list page**. Concrete names are rental cars; roles below are the reusable pattern.

**Dependency direction:** `app/` (route) → `views/` → `entities/` → `shared/` / `platform/`.

---

### 1. Route — `app/(root)/<route>/`

Next.js routing shell only. Await/normalize `searchParams`, prefetch TanStack cache, pass dehydrated state to view.

```text
app/(root)/demo-hybrid-page/
├── page.tsx                           # searchParams → prefetch → DemoHybridPage
├── error.tsx                          # Route-level error UI
└── _loading.tsx                       # Inactive (renamed from loading.tsx — see docs/to-implement/revisit-route-loading.md)
```

---

### 2. API — `app/api/demo-hybrid-page/`

Route handlers for client queryFns and mutations (replaces server actions for this demo).

```text
app/api/demo-hybrid-page/
├── cars/
│   ├── route.ts                       # GET list, POST create
│   └── [id]/route.ts                  # GET by id, PATCH edit/status, DELETE
├── options/route.ts                   # GET facet options
└── demo-api-delay.ts                  # Optional simulate latency
```

---

### 3. View — `views/demo-hybrid-page/`

Route composition: providers, layout sections, client multi-view, drawer, view-local config.

```text
views/demo-hybrid-page/
├── index.ts                           # Public barrel → DemoHybridPage, DemoHybridContent
├── implementation-plan.md             # Bootstrap plan + config reference (this file)
├── README.md                          # View overview
├── hooks/
│   ├── use-list-query-from-url.ts     # effectiveParams → RentalCarListQuery
│   └── use-query-error-toast.ts       # List/filters error toasts + retry
├── lib/
│   └── search-params-to-snapshot.ts   # Server snapshot for ShallowUrlProvider hydration
├── ui/
│   ├── demo-hybrid-page.tsx           # ShallowUrlProvider + QueryProvider + HydrationBoundary
│   ├── demo-hybrid-page-client.tsx    # List/infinite queries + layout sections
│   ├── demo-hybrid-page-header.tsx    # Page header + Add car
│   ├── demo-hybrid-content.tsx        # ViewOrchestrator + row actions + column actions
│   ├── fetch-pending-dimmer.tsx       # Client fetch pending UI (replaces navigation dimmer)
│   ├── infinite-load-more.tsx         # Last-row load-more (table/list/cards All mode)
│   ├── add-car-button.tsx             # openCreate via url-drawer
│   ├── layout-sections/
│   │   ├── filters-section.tsx        # FiltersHeader, FilterToolbar, NL assistant, …
│   │   └── table-and-pagination-section.tsx  # Content + PaginationFooter / infinite row
│   └── drawer/                        # url-drawer: layer, modes, forms, delete modal
├── config/                            # View-local config — mirrors demo-rsc-page shape
│   ├── contract/                      # Field map, data vs UI URL params
│   ├── data/                          # Base filters, search, pagination, views, grouping
│   ├── ui/                            # Columns, displays/*, FiltersHeader, cells
│   └── mocks/                         # Form/timeline stand-ins
└── docs/                              # Architecture story + to-implement backlog
    ├── index.md
    ├── architecture/                  # Steps 0, 2, 2.5, rsc-to-hybrid-shifts
    ├── ui/                            # Steps 1, 4, 5
    ├── drawers/                       # Step 3
    ├── reflections/
    └── to-implement/
```

---

### 4. Entity — `entities/demo-hybrid-cars/`

Domain unit: types, repository, server use-cases, client transport, TanStack hooks.

```text
entities/demo-hybrid-cars/
├── model/                             # Row + list query types
├── schema/                            # Zod create / edit
├── transform/                         # URL ↔ RentalCarListQuery (shared RSC + client)
├── repository/                        # Mock seed + filter + CRUD
├── server/                            # Use-cases for API + prefetch queryFns
├── client/                            # fetch-* + mutate-rental-cars
├── cache/                             # rentalCarKeys, invalidate, seed, find-in-cache
├── queries/                           # useRentalCars, useInfiniteRentalCars, useDetail, useOptions
├── mutations/                         # create, update, delete, toggle activity
├── hydration/                         # prefetchRentalCarPage → dehydrate
├── providers/                         # QueryClientProvider (per-page today)
└── README.md                          # Layer map + mutation transport
```

---

### 5. Platform — shared chrome (not duplicated per view)

```text
platform/url-kit/
├── url-params/                        # ShallowUrlProvider + router fallback transport
├── filters/                           # FiltersHeader, PaginationFooter, filter hooks
└── url-drawer/                        # DrawerWrapper, useDrawerActions (transport-aware)
```

Hybrid and RSC import the **same** `@/platform/url-kit/*` paths; provider picks shallow vs router.

---

## Implementation Steps

### Step 0: Hybrid scaffold — Done

**Purpose:** Self-contained route + entity + API + hydration boundary.

**Actions:**

- Thin `app/(root)/demo-hybrid-page/page.tsx`: `searchParams` → `parseListQueryFromSearchParams` → `prefetchRentalCarPage` → `HydrationBoundary`
- Entity layers: `model/`, `repository/`, `server/`, `transform/`, `cache/`, `client/`, `queries/`, `hydration/`, `providers/`
- API: `GET /api/demo-hybrid-page/cars`, `cars/[id]`, `options`
- No runtime imports from RSC/client demo entities

**Doc:** [`docs/architecture/0-hybrid-scaffold.md`](docs/architecture/0-hybrid-scaffold.md)

---

### Step 1: Detail prefetch — Done

**Purpose:** Shared detail query key for hover prefetch and drawer open.

**Actions:**

- `useRentalCarDetail(id)` — `enabled`, `staleTime: 5m`, same key as prefetch
- Row `onPointerEnter` → `queryClient.prefetchQuery(rentalCarKeys.detail(id))`
- Seed from list/infinite cache first; fetch by id on miss
- No `unstable_cache` / server action by id on hybrid

**Doc:** [`docs/ui/1-detail-prefetch.md`](docs/ui/1-detail-prefetch.md)

---

### Step 2: Shallow URL + TanStack list/facets — Done

**Purpose:** Filter/sort/page changes without RSC remount.

**Actions:**

- Shallow URL writes (later unified in Step 2.5 transport)
- `useRentalCars` / `useRentalCarFilterOptions` keyed on `listQuery`
- `placeholderData: keepPreviousData` + `FetchPendingDimmer`
- Shared parser: `parseListQueryFromSearchParams` for RSC prefetch and client

**Doc:** [`docs/architecture/2-shallow-url-and-queries.md`](docs/architecture/2-shallow-url-and-queries.md)

---

### Step 2.5: url-kit transport — Done

**Purpose:** One chrome surface for RSC (router) and hybrid (shallow).

**Actions:**

- `platform/url-kit/url-params/` — pluggable transport
- `ShallowUrlProvider` on hybrid; router fallback on RSC
- Layout sections mirror RSC composition (`filters-section`, `table-and-pagination-section`)
- `use-list-query-from-url.ts` derives TanStack keys from `effectiveParams`

**Doc:** [`docs/architecture/2.5-url-kit-transport-and-sections.md`](docs/architecture/2.5-url-kit-transport-and-sections.md)

---

### Step 3: URL drawer + client content — Done

**Purpose:** Drawer open/mode/id in URL; body from TanStack.

**Actions:**

- `url-drawer` reads/writes via `useUrlParamsTransport()`
- View mode: `useRentalCarDetail` + list `initialData`
- Create / edit / delete chrome wired (mutations in Step 4)
- URL contract: `?drawer=car&mode=view|edit|create&id=…`

**Doc:** [`docs/drawers/3-url-drawer-client-content.md`](docs/drawers/3-url-drawer-client-content.md)

---

### Step 4: Optimistic mutations — Done

**Purpose:** CRUD + activity toggle via route handlers + TanStack cache.

**Actions:**

- `POST` / `PATCH` / `DELETE` under `/api/demo-hybrid-page/cars`
- Hooks: `useCreateRentalCar`, `useUpdateRentalCar`, `useDeleteRentalCar`, `useToggleRentalCarActivity`
- Optimistic `setQueryData` + `invalidateRentalCarListCaches` (lists + infinites)
- Drawer forms + delete modal wired

**Doc:** [`docs/ui/4-optimistic-mutations.md`](docs/ui/4-optimistic-mutations.md)

---

### Step 5: Infinite scroll on All mode — Done

**Purpose:** `all=1` → infinite append; paginated default for table/list/cards.

**Actions:**

- `useInfiniteRentalCars` — offset API, page in `pageParam`
- `InfiniteLoadMore` as last virtualized row (`listEndRow` via ViewOrchestrator)
- One-way cache bridge: infinite page success → `setQueryData` on `list({ page, limit })`
- Board views still use single `showAll` fetch

**Doc:** [`docs/ui/5-infinite-scroll.md`](docs/ui/5-infinite-scroll.md)

---

## Loading & Pending UI Structure

Hybrid uses **client fetch pending**, not navigation pending:

| Layer | Component | When |
|-------|-----------|------|
| Route | `_loading.tsx` (inactive) | Removed to avoid revisit skeleton flash |
| Layout | `MainAreaFallback` in root layout | Generic pulse if RSC segment suspends |
| Page client | `FetchPendingDimmer` | TanStack `isFetching` + placeholder previous data |
| Sections | `FilterToolbarSkeleton`, `TableSkeleton` | Query `isLoading` on first fetch |
| Infinite | `InfiniteLoadMore` | Append fetch at list/table/cards end row |

Inactive route skeleton reference (`_loading.tsx`):

1. PageHeaderSkeleton
2. FiltersSkeleton
3. TableSkeleton (9 cols × 10 rows)
4. PaginationSkeleton

---

## Data Path Summary

| User action | Transport | Data hook | Network |
|-------------|-----------|-----------|---------|
| Cold load | RSC prefetch | HydrationBoundary | Server prefetch → dehydrate |
| Filter / sort / page | Shallow URL | `useRentalCars` + `useRentalCarFilterOptions` | `GET /cars`, `GET /options` |
| Open drawer (warm row) | Shallow URL | `useRentalCarDetail` + list seed | Often no GET |
| Toggle activity | — | `useToggleRentalCarActivity` | `PATCH /cars/:id` |
| All mode (table/list/cards) | Shallow URL `all=1` | `useInfiniteRentalCars` | Paginated GETs via `pageParam` |
| Board + All | Shallow URL | `useRentalCars` + `showAll` | Single large GET |

---

## Configuration Options Reference

Types and platform paths match the RSC demo. Hybrid wires the same configs from `views/demo-hybrid-page/config/`.

See [`views/demo-rsc-page/implementation-plan.md`](../demo-rsc-page/implementation-plan.md#configuration-options-reference) for full type locations. Key configs on this page:

| Config | Path |
|--------|------|
| Base filters | `config/data/rental-car-base-filters.ts` |
| Field map | `config/contract/rental-car-field-map.ts` |
| Data vs UI URL keys | `config/contract/url-param-keys.ts` |
| Search | `config/data/rental-car-search-config.ts` |
| Pagination | `config/data/rental-car-pagination-config.ts` |
| Views / All / infinite | `config/data/demo-rsc-views-config.ts` |
| FiltersHeader layout | `config/ui/rental-car-filters-header-config.ts` |
| Filter toolbar | `config/ui/demo-rsc-filter-toolbar-config.ts` |
| Table columns + displays | `config/ui/columns.ts`, `config/ui/displays/*` |
| Activity cell | `config/ui/cells/rental-car-set-activity-cell.tsx` |

**Hybrid-specific helpers:**

- `isHybridInfiniteAllMode`, `DEMO_HYBRID_INFINITE_LOAD_TRIGGER` in `demo-rsc-views-config.ts`
- `search-params-to-snapshot.ts` — server `initialSnapshot` for shallow transport hydration

---

## Next Steps (not done)

Prioritized backlog — detail in [`docs/reflections/next-steps.md`](docs/reflections/next-steps.md):

| # | Item | Plan |
|---|------|------|
| 1 | Confirmation modal off URL | [`docs/to-implement/confirmation-modal-off-url.md`](docs/to-implement/confirmation-modal-off-url.md) |
| 2 | Revisit navigation (finish) | [`docs/to-implement/revisit-route-loading.md`](docs/to-implement/revisit-route-loading.md) |
| 3 | Layout QueryProvider | [`docs/to-implement/layout-query-provider.md`](docs/to-implement/layout-query-provider.md) |
| 4 | nuqs adapter | [`docs/to-implement/nuqs-adapter.md`](docs/to-implement/nuqs-adapter.md) |
| 5 | Cursor pagination | [`docs/to-implement/cursor-pagination.md`](docs/to-implement/cursor-pagination.md) |

**Shared platform (RSC + hybrid):**

- [`dropdown-placeholders`](../demo-rsc-page/docs/to-implement/dropdown-placeholders.md)
- [`filter-labels-url-ids`](../demo-rsc-page/docs/to-implement/filter-labels-url-ids.md)
- [`table-cell-overlay-z-index-scroll`](../demo-rsc-page/docs/to-implement/table-cell-overlay-z-index-scroll.md)

**Explicitly out of scope:**

- Reverse list → infinite cache bridge
- Moving drawer open state off URL
- Real DB / auth (repository swappable)

---

## Testing Checklist

### Core (Steps 0–5)

- [x] Page renders without errors on cold load
- [x] List + options hydrated from RSC prefetch
- [x] Filter / sort / page change — URL updates, no full document navigation
- [x] Previous rows visible while fetching (`keepPreviousData` + dimmer)
- [x] Hover row → prefetch detail; open drawer → cache hit when warm
- [x] Deep link with drawer + filters — both apply; list key ignores drawer params
- [x] Create / edit / delete / activity toggle — optimistic UI + API mutations
- [x] Paginated footer default on table/list/cards
- [x] `all=1` → infinite load-more; switch back to page 2 without spurious dim (seed bridge)
- [x] Kanban/calendar All → single `showAll` fetch, not infinite
- [x] Error toasts with retry on list/filters failure
- [x] Offline toast when network unavailable

### Backlog (to-implement)

- [ ] Delete confirm without `?action=delete` in URL
- [ ] TanStack cache survives sidebar navigation (layout provider)
- [ ] Cold load skeleton strategy finalized (route vs section vs none)
- [ ] Empty state when no data matches filters
- [ ] CSV export (if added — mirrors RSC action button stub)

---

## Key Learnings

- **RSC for cold load only** after Step 2 — interactive truth is TanStack cache.
- **Shareable URL ≠ App Router navigation** — shallow transport separates them.
- **Drawer URL stays** for production deep links; confirm modal moves to local state (next).
- **Separate list / infinite caches** — one-way bridge only (`infinite → list`).
- **Same url-kit chrome** as RSC — transport adapter is the only fork.

Full narrative: [`docs/reflections/hybrid-conclusion.md`](docs/reflections/hybrid-conclusion.md).
