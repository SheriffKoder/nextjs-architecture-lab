# Demo Client Page — Implementation Guide

## Purpose

This feature is a **template** for building a **client-rendered** list or dashboard page that:

- Reads filter, sort, pagination, and view state from the **URL** (same UX patterns as other filter demos in the repo).
- Loads **rows and filter facets** over **HTTP** using **TanStack Query**.
- Renders data through **`FilteringWrapper`** and the shared filters UI packages.

Use this folder as a checklist: when starting a similar page in another codebase, create the same categories of files (config, server-side handlers for routes, TanStack glue, client shell, app route) and swap domain types, mock data, and API paths.

---

## Architecture (high level)

1. **`app/(root)/demo-client-page/page.tsx`** — **`QueryProvider`** + **`Suspense`** only (thin route entry).
2. **`features/demo-client-page/demo-client-index.tsx`** — `PageHeader`, `FiltersHeader`, TanStack wiring, **`PaginationFooter`**, and the filtering content child.
3. **`features/demo-client-page/demo-client-filtering-content.tsx`** — **`FilteringWrapper`** only (receives `data`, `filters`, `carsLoading` from the index).
4. **`features/demo-client-page/tanstack/`** — Query key factory, `fetch` helpers, and hooks.
5. **`app/api/demo-client-page/`** — Route handlers that run filtering, sorting, and pagination on the server and return JSON.
6. **`features/demo-client-page/config/`** — Display configs, columns, filter definitions, minimal controls, and **local mock data** under `config/lib/` so the feature stays self-contained.

No other “demo” feature folder needs to be imported; everything required for this template should live under **`features/demo-client-page`** and **`app/api/demo-client-page`** (plus shared libraries such as `@/features/filters` and `@/features/filtering-wrapper-multi-display-clean`).

---

## Target file layout

After implementation, the feature should resemble:

```
features/demo-client-page/
├── README.md                      # This guide
├── types/
│   └── rental-car-table-item.ts # Domain row type for mock data + configs + server sim
├── config/
│   ├── lib/
│   │   └── data-source.ts         # Mock entities (template: replace with your domain)
│   ├── columns.ts
│   ├── header-filters-config.ts
│   ├── minimal-controls-config.ts
│   ├── accordion-config.ts
│   └── displays/                  # table, list, kanban, map, calendar, etc.
├── lib/
│   └── server/                    # In-memory pipeline for API routes (keeps handlers thin)
│       ├── index.ts             # Re-exports for routes
│       ├── get-rental-cars-data.ts
│       ├── get-filter-options-server.ts
│       └── backend-simulate/
│           ├── filter-rental-cars.ts
│           ├── filter-by-search.ts
│           └── get-filter-options.ts
├── tanstack/
│   ├── query-provider.tsx         # Local provider if the app has no global one
│   ├── key-factory.ts             # Stable query keys from filter/sort/page state
│   ├── handler.ts                 # fetch() to page-client + options routes
│   ├── use-rental-cars.ts         # useQuery for rows (rename to match your domain)
│   ├── use-rental-car-filter-options.ts  # useQuery for FilterConfig[] facets
│   └── index.ts                   # Barrel exports
├── demo-client-index.tsx          # URL hooks + PageHeader, FiltersHeader, TanStack, PaginationFooter
└── demo-client-filtering-content.tsx     # FilteringWrapper only

app/api/demo-client-page/
├── page-client/route.ts           # GET: filtered, sorted, paginated payload
└── options/route.ts               # GET: FilterConfig[] with populated options

app/(root)/demo-client-page/
├── page.tsx                       # QueryProvider + Suspense → index
└── loading.tsx                    # Route / Suspense fallback skeleton
```

Adjust names (`rental`, `cars`, `employees`) to match the template you are building.

---

## Implementation steps

### Step 1 — Create the feature package skeleton

- Add `features/demo-client-page/` with `config/`, `config/lib/`, `config/displays/`, `lib/server/` (and `tanstack/` in later steps).
- Add `README.md` (this file) so the template stays documented when moved to another repo.

### Step 2 — Define types and display config

- **Create** `types/rental-car-table-item.ts` with your row interface (e.g. `RentalCarTableItem`).
- **Create** `config/displays/table-config.ts` (and other display configs) with `tableConfig`, list/kanban/map settings as needed (import the row type from `types/rental-car-table-item`).
- **Create** `config/columns.ts` using `TableColumn<YourRowType>` from the filtering wrapper types.
- **Create** `config/accordion-config.ts` if the table uses grouped columns.

### Step 3 — Create mock data and filter configuration

- **Create** `config/lib/data-source.ts`: export the in-memory array used by API routes (and any small helpers used only for mock generation).
- **Create** `config/header-filters-config.ts`: base filters, field map, search config, pagination config, filters header config. Import mock rows **only** from `config/lib/data-source` (or from `lib/server` if you colocate fixtures there).
- **Create** `config/minimal-controls-config.ts`: sort fields, query-builder fields, search config for the minimal controls bar.

### Step 4 — Create server-side simulation for the API

- **Create** `lib/server/backend-simulate/` with small utilities: URL-style filtering on the mock list, search across fields, and building `FilterConfig` options from data.
- **Create** `lib/server/get-rental-cars-data.ts`: run filter → sort → paginate and return `{ cars, pagination }` (rename to match your domain).
- **Create** `lib/server/get-filter-options-server.ts`: for each base filter config, compute facet counts and attach `options`.
- **Create** `lib/server/index.ts`: export the functions your Route Handlers will call.

Keep imports under `features/demo-client-page` plus shared `@/features/filters/*` utilities (sort/pagination) where you already rely on them elsewhere in the app.

### Step 5 — Create API routes

- **Create** `app/api/demo-client-page/page-client/route.ts`:
  - `GET`: read query string, call server simulation, return JSON (rows + pagination, and any extra metadata you need).
  - Mirror the parameter conventions your URL hooks already write (`status`, `make`, `sort`, `page`, `limit`, `q`, `filter`, etc.).
- **Create** `app/api/demo-client-page/options/route.ts`:
  - `GET`: return enriched filter configs for the filters bar and header filters (optionally accept the same query params for facet narrowing).

### Step 6 — Create TanStack Query integration

- **Create** `tanstack/key-factory.ts`: build a stable `queryKey` from the same object your `fetch` function sends (so cache invalidates when URL state changes).
- **Create** `tanstack/handler.ts`: build `URLSearchParams` or full URL and `fetch` the `page-client` route; throw on non-OK responses.
- **Create** `tanstack/use-rental-cars.ts` (rename per domain): `useQuery` with `queryKey` + `queryFn`, sensible `staleTime`.
- **Create** a second `useQuery` hook (or combine carefully) for filter **options** if they are fetched separately from rows.
- **Create** `tanstack/query-provider.tsx` if the app does not already wrap TanStack Query at the root.
- **Create** `tanstack/index.ts` to re-export hooks and provider.

### Step 7 — Create the client UI layers

- **Create** `demo-client-index.tsx` (`'use client'`): same URL hooks as `features/filters/page-client/page.tsx` — `useUrlFilters`, `useUrlSorting`, `useUrlPagination` — then build `RentalCarListQuery` and pass it to `useRentalCars` / `useRentalCarFilterOptions`. Also `PageHeader`, `FiltersHeader`, `PaginationFooter`, and the filtering content child.
- **Create** `demo-client-filtering-content.tsx` (`'use client'`): **`FilteringWrapper` only** — props: `data`, `filters`, `carsLoading` (index passes query results and configs stay local to this file).

### Step 8 — Create the app route

- **Create** `app/(root)/demo-client-page/page.tsx`: **`QueryProvider`** + **`Suspense`** wrapping **`demo-client-index`** (keep this file minimal).
- **Create** `loading.tsx` as the `Suspense` fallback (optional but recommended).

### Step 9 — Wire navigation and verify behavior

- Add a link from your dev navigation or home page to `/demo-client-page`.
- Manually verify: changing filters / sort / page updates the URL, refetches via TanStack, and the table (and other views) stay in sync.

### Step 10 — Harden the template for reuse

- Document in this README (or a short `docs/` note) the **exact JSON** shape returned by `page-client` and `options`.
- List which URL query keys the API understands so the next project can rename them consistently.
- Keep environment-specific concerns (real backend URLs, auth headers) out of the feature folder; inject them in `handler.ts` when promoting the template to production code.

---

## Relationship to other demos in this repo

- **RSC demo pages** fetch in the server component and pass props into a small client island.
- **This client demo** keeps the same **config + FilteringWrapper** idea but moves **data loading** to **TanStack Query + route handlers**, which matches how many production apps integrate tables with a BFF or REST API.

Treat the two demos as **alternate templates**, not as two halves of one module.

---

## Checklist before considering the template “done”

- [ ] `page-client` returns filtered, sorted, paginated data from mock (or stub) sources defined under this feature.
- [ ] `options` returns `FilterConfig[]` compatible with `FiltersHeader` / header filters.
- [ ] Client hooks derive request parameters from the URL and match the API contract.
- [ ] `FilteringWrapper` renders with loading and error states acceptable for a template.
- [ ] No imports from other **demo-only** feature folders; only shared libraries and this feature’s paths.

When reusing in another project, rename routes, query keys, and types first—then replace mock modules with real API clients while keeping the same folder roles.
