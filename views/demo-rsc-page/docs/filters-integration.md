# How to Add URL Filters + Pagination on an RSC Page

A repeatable checklist for wiring **URL-driven filters**, **facet options**, and **pagination** onto a server page — same pattern as the demo RSC rental-cars page.

Companion docs:

- Params vs query: `architecture/3-query-vs-params.md`
- URL transitions / Suspense islands: `bottlenecks/4-rsc-bottleneck-url-transitions.md`
- Drawer keys must not bust list cache: `bottlenecks/6-1-rsc-bottleneck-drawer-cache.md`

Platform UI already exists: `FiltersHeader`, `PaginationFooter`, filter/sort/pagination utils under `platform/url-kit/filters`.

---

## 🎯 Goal

```text
page.tsx (await searchParams → normalize → params)
  → view index
      → Suspense [FiltersSection]     → getFilters(dataKey)
      → Suspense [Table + Pagination] → getCars(dataKey) + getFilters(dataKey)
```

Layout target:

```text
[FiltersHeader]
[Content data={rows} filters={filters}]
[PaginationFooter]
```

URL is the source of truth for filter / sort / page state.

---

## 🧱 Pieces to Build

| Layer | Responsibility | Demo location |
|---|---|---|
| Route shell | Await + normalize `searchParams`; pass plain `params` | `app/(root)/demo-rsc-page/page.tsx` |
| Base filters | Facet keys + types (no options yet) | `views/.../config/data/rental-car-base-filters.ts` |
| Field map | URL key → row field | `views/.../config/contract/rental-car-field-map.ts` |
| Search / pagination / header UI | Search fields, page size, which filter rows show | `config/data/*`, `config/ui/rental-car-filters-header-config.ts` |
| Data-only URL keys | Which params affect list/facets vs UI chrome | `config/contract/url-param-keys.ts` |
| Filter + list loaders | Facets + filtered/sorted/paginated rows | `entities/cars-rsc/server/get-filter-options-server.ts`, `get-rental-cars-data.ts` |
| Cached entry points | `unstable_cache` wrappers | `entities/cars-rsc/server/demo-rsc-cached-loaders.ts` (`getFilters`, `getCars`) |
| Sections | Async RSC islands + Suspense | `filters-section.tsx`, `table-and-pagination-section.tsx` |

---

## Checklist

### 1. Route — normalize params once

```ts
// app/(root)/<route>/page.tsx
export type PageSearchParams = Record<string, string | string[] | undefined>

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>
}) {
  const params = { ...(await searchParams) }
  return <ViewIndex params={params} />
}
```

- [ ] Await `searchParams` in the route file only
- [ ] Pass a plain object into the view (no `Promise` in children)

---

### 2. View configs — describe the domain

- [ ] **Base filters** — `FilterConfig[]` with `key`, `label`, `type` (`multi-select`, `number-range`, `date-range`, …)
- [ ] **Field map** — map each filter key to the row property used by the simulate/filter layer
- [ ] **Search config** — which fields `q` searches
- [ ] **Pagination config** — default `limit`, options for `PaginationFooter`
- [ ] **FiltersHeader config** — layout chrome (`filterType`, `showSearch`, `enabledFilterKeys`, …)
- [ ] **List data URL keys** — whitelist params that affect list + facets; exclude drawer / view chrome

Demo references:

| Config | Path |
|--------|------|
| Base filters | `views/demo-rsc-page/config/data/rental-car-base-filters.ts` |
| Field map | `views/demo-rsc-page/config/contract/rental-car-field-map.ts` |
| Search | `views/demo-rsc-page/config/data/rental-car-search-config.ts` |
| Pagination | `views/demo-rsc-page/config/data/rental-car-pagination-config.ts` |
| Header layout | `views/demo-rsc-page/config/ui/rental-car-filters-header-config.ts` |
| Data vs UI keys | `views/demo-rsc-page/config/contract/url-param-keys.ts` |

---

### 3. Entity — server filter + list pipeline

- [ ] **Filter simulate** — apply URL params to the dataset (adapt `filter-rental-cars.ts` / exclude-column helper for facets)
- [ ] **`getFilterOptionsServer`** — for each base filter, exclude that column’s param, then populate `options` with `totalCount` / `initialCount`
- [ ] **`getRentalCarsData(query)`** — filter → sort → paginate → `{ rows, pagination }`
- [ ] **Params → query** (list path) — build a typed list query from params inside the list loader entry (`buildRentalCarListQuery` pattern)

Demo references:

| Piece | Path |
|--------|------|
| Facets | `entities/cars-rsc/server/get-filter-options-server.ts` |
| List | `entities/cars-rsc/server/get-rental-cars-data.ts` |
| Filter simulate | `entities/cars-rsc/server/backend-simulate/filter-rental-cars.ts` |
| Query builder | `entities/cars-rsc/lib/build-rental-car-list-query.ts` |

---

### 4. Cached loaders (recommended)

- [ ] Wrap facets in `getFilters(cacheKey)` (`unstable_cache`)
- [ ] Wrap list in `getCars(cacheKey)` (`unstable_cache`)
- [ ] Build `cacheKey` from **data-only** params (`demoRscDataParamsToCacheKey`) so drawer/view URL keys do not split the cache

```ts
const dataKey = demoRscDataParamsToCacheKey(params)
const filters = await getFilters(dataKey)
const { cars, pagination } = await getCars(dataKey)
```

See `entities/cars-rsc/server/demo-rsc-cached-loaders.ts` and `views/demo-rsc-page/lib/demo-rsc-search-params-cache-key.ts`.

---

### 5. View sections — Suspense islands

- [ ] **`FiltersSection`** — `await getFilters(dataKey)` → `<FiltersHeader filters={...} searchConfig={...} config={...} />`
- [ ] **`TableAndPaginationSection`** — `Promise.all([getCars, getFilters])` → content + `<PaginationFooter totalItems={...} config={...} />`
- [ ] Wrap each section in `<Suspense>` with a matching skeleton from the index
- [ ] Wrap the page client navigation in `NavigationTransitionRoot` (pending UI for URL changes)

Demo references:

| Piece | Path |
|--------|------|
| Index composition | `views/demo-rsc-page/demo-rsc-index.tsx` |
| Filters island | `views/demo-rsc-page/ui/layout-sections/filters-section.tsx` |
| Table + pagination island | `views/demo-rsc-page/ui/layout-sections/table-and-pagination-section.tsx` |
| Platform header | `platform/url-kit/filters/components/filters-header.tsx` |
| Platform footer | `platform/url-kit/filters/components/pagination-footer.tsx` |

Expected shape:

```tsx
<NavigationTransitionRoot>
  <Suspense fallback={<FiltersSkeleton />}>
    <FiltersSection params={params} />
  </Suspense>
  <Suspense fallback={<TableSkeleton />}>
    <TableAndPaginationSection params={params} />
  </Suspense>
</NavigationTransitionRoot>
```

---

### 6. Optional extras

- [ ] **NL / AI filter assistant** — catalog from serialized filters (`NlFilterAssistant` in `filters-section.tsx`)
- [ ] **Error boundary** around the table island (`TablePaginationErrorBoundary`)
- [ ] **Hide pagination** for “show all” views (`hideWhenShowAllForViews`)

---

## Minimal end-to-end check

1. Open the page with no query → filters show options; table shows default page.
2. Set a filter in the URL (e.g. `?status=available`) → facet counts and list update; other filters’ `initialCount` reflect remaining rows.
3. Change `page` / `limit` / `sort` → list and footer update; filter island can stream separately.
4. Open a drawer (`?drawer=...&id=...`) → list/facet cache identity unchanged (data-only key).
5. Soft-navigate filters → pending UI via navigation transition, not a full blank page.

---

## Key Learnings

- **Reuse platform chrome** — Build domain configs + loaders; do not reimplement `FiltersHeader` / `PaginationFooter`.
- **Params in, query inside list loaders** — Sections receive URL `params`; the list path builds a typed query for the backend contract.
- **Facets need exclude-column filtering** — Counts stay honest when editing one filter while others stay applied.
- **Suspense islands beat one blocking fetch** — Filters and table can stream independently; dedupe shared `getFilters` via cache.
- **Strip UI keys from cache identity** — Drawer / view params must not invalidate list or facet caches.
