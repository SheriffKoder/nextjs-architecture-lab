# Pagination “Show All” Mode

You’re right to avoid abusing `limit` (e.g. `limit=999999`) — that’s misleading in the URL, breaks cache keys, and still pretends you’re paginating. Use a separate “show all” mode with its own URL signal and server branch.

## Recommended pattern: `all=1` (not `limit`)

### URL contract

| Mode       | URL example                                      |
| ---------- | ------------------------------------------------ |
| Paginated  | `?page=2&limit=20&status=...`                    |
| Show all   | `?all=1&status=...` (no `page`, no `limit`)      |

- **Toggling All** should `delete('page')` and `delete('limit')` and `set all=1`.
- **Choosing 10 / 20 / 50 / 100** should `delete('all')` and set `limit` + `page=1` (same as today’s `setLimit`).

That keeps the URL honest and RSC/cache keys clear.

---

## 1. Types & query builder

### `RentalCarListQuery`

`features/cars-rsc/types/rental-car-list-query.ts`:

```ts
/** When true, return full filtered+sorted list; ignore page/limit. */
showAll?: boolean
```

### `build-rental-car-list-query.ts`

Read `all` from params before `parsePagination`:

```ts
const showAll = getSingle(params, 'all') === '1'
if (showAll) {
  return { ...listQueryFields, showAll: true }
  // omit page / limit
}
const { page, limit } = parsePagination(sp, defaultLimit)
return { ...listQueryFields, page, limit }
```

### `rentalCarListQueryToSearchParams` — round-trip

```ts
if (query.showAll) {
  out.all = '1'
  // do not emit page / limit
} else {
  if (query.page !== undefined) out.page = String(query.page)
  if (query.limit !== undefined) out.limit = String(query.limit)
}
```

### Cache key

Add `'all'` to `DEMO_RSC_LIST_DATA_SEARCH_PARAM_KEYS` in `demo-rsc-url-data-params.ts`. When `all=1`, `page`/`limit` should not be present (so cache identity is correct).

---

## 2. Server trick in `get-rental-cars-data.ts`

Branch before slice, using `query` (or `searchParams.all`):

```ts
const showAll =
  query.showAll === true ||
  (typeof searchParams.all === 'string' && searchParams.all === '1')
const filteredAndSorted = /* filter + sort as now */
if (showAll) {
  const total = filteredAndSorted.length
  return {
    cars: filteredAndSorted,
    pagination: {
      totalItems: total,
      page: 1,
      limit: total, // optional: same as total for “one page”
      showAll: true, // optional explicit flag for UI
    },
  }
}
const { page, limit } = parsePagination(params, defaultLimit)
const paginatedCars = filteredAndSorted.slice((page - 1) * limit, (page - 1) * limit + limit)
// ...
```

You do not need `limit` to be a union type on the wire; `showAll` is the semantic switch. `limit` stays `number` for normal pagination only.

**Optional:** extend the return type with `showAll?: boolean` so the footer doesn’t infer mode from `limit === totalItems`.

---

## 3. UI button (pagination kit)

Extend `PaginationConfig` with something like:

```ts
allowShowAll?: boolean
showAllLabel?: 'All'
```

In `PaginationPageSizeButtons` (or beside it), add an “All” button that calls a new hook method, e.g. `setShowAll()` in `useUrlPagination`:

```ts
const setShowAll = () => {
  const params = buildParams()
  params.delete('page')
  params.delete('limit')
  params.set('all', '1')
  updateUrl(params)
}
// In setLimit / setPage — params.delete('all')
```

`PaginationWrapper` when `searchParams.get('all') === '1'` (or hook reads `showAll`):

- Highlight **All**
- Hide or disable page controls (`PaginationButtons`)
- `PaginationInfo`: e.g. “Showing all 42 items” (`startItem=1`, `endItem=totalItems`)

Wire `rentalCarPaginationConfig` with `allowShowAll: true`.

---

## 4. Filter/sort reset

Filter/sort hooks must not reintroduce `page` while `all=1` is set; they should strip `page` and `limit` on every data-affecting URL update in that mode.

---

## File checklist

### Data / server (cars-rsc + demo RSC cache)

| File | Change |
| ---- | ------ |
| `features/cars-rsc/types/rental-car-list-query.ts` | Add `showAll?: boolean` |
| `features/cars-rsc/lib/build-rental-car-list-query.ts` | Read `all=1`, set `showAll`, omit `page`/`limit`; round-trip in `rentalCarListQueryToSearchParams` |
| `features/cars-rsc/server/get-rental-cars-data.ts` | Branch: no slice when show-all; return metadata (`showAll`, etc.) |
| `screens/demo-rsc-page/config/demo-rsc-url-data-params.ts` | Add `'all'` to `DEMO_RSC_LIST_DATA_SEARCH_PARAM_KEYS` |

No change required in `demo-rsc-cached-loaders.ts` if it only parses the cache key and calls `buildRentalCarListQuery` / `getRentalCarsData`.

### Pagination kit (url-kit — what demo RSC uses)

| File | Change |
| ---- | ------ |
| `features/url-kit/filters/feature-pagination/types.ts` | `allowShowAll?`, optional `showAll` on calculated/return types if needed |
| `features/url-kit/filters/feature-pagination/utils/reset-page-in-params.ts` | Extend or replace with `normalizePaginationParams` (if `all=1` → strip `page` + `limit`; else strip `page` only) |
| `features/url-kit/filters/feature-pagination/utils/index.ts` | Export new helper |
| `features/url-kit/filters/feature-pagination/hooks/useUrlPagination.ts` | `isShowAll`, `setShowAll`, `delete('all')` in `setLimit` / `setPage` |
| `features/url-kit/filters/feature-pagination/hooks/index.ts` | Re-export if needed |
| `features/url-kit/filters/feature-pagination/components/pagination-page-size-buttons.tsx` | Optional All button (or sibling component) |
| `features/url-kit/filters/feature-pagination/components/pagination-wrapper.tsx` | Wire All, hide page controls when `all=1`, pass `setShowAll` |
| `features/url-kit/filters/feature-pagination/components/pagination-info.tsx` | Optional copy: “Showing all N items” |
| `parse-pagination.ts` | Only if you add a shared `isShowAll(searchParams)` helper (optional) |

### Filter / sort / NL (keep `all=1`, no `page`/`limit` on data changes)

| File | Change |
| ---- | ------ |
| `features/url-kit/filters/feature-filtering/hooks/useUrlFilters.ts` | `updateUrlAfterDataChange` → use `normalizePaginationParams` |
| `features/url-kit/filters/feature-sorting/hooks/useUrlSorting.ts` | Same |
| `features/url-kit/filters/feature-sorting-builder-control/hooks/useUrlSorting.ts` | Same |
| `features/url-kit/ai-filter/lib/nl-filter-clear-helpers.ts` | `resetNlApplyPaginationPage` respects `all=1` (strip `page`/`limit`, keep `all`) |
| `features/url-kit/ai-filter/components/nl-filter-assistant.tsx` | Only if helper signature/behavior changes |

### Demo RSC config (enable the button)

| File | Change |
| ---- | ------ |
| `screens/demo-rsc-page/config/header-filters-config.ts` | `allowShowAll: true` on `rentalCarPaginationConfig` |
| `screens/demo-rsc-page/components/layout-sections/table-and-pagination-section.tsx` | No change if it already passes `rentalCarPaginationConfig` into `PaginationFooter` |

### Docs

| File | Change |
| ---- | ------ |
| `screens/demo-rsc-page/docs/9-pagination-all.md` | Finish §4 (filter/sort + `normalizePaginationParams`) |
| `features/url-kit/filters/feature-pagination/docs/reset-page-on-filter-sort.md` | Note `all=1` behavior (optional) |

### Optional parity (not required for demo RSC only)

| File | Why |
| ---- | --- |
| `features/demo-client-page/config/header-filters-config.ts` | Same `allowShowAll` |
| `features/demo-client-page/demo-client-index.tsx` | Client list + pagination hook |
| `features/demo-client-page/lib/server/get-rental-cars-data.ts` | If it duplicates cars-rsc loader logic |
| `features/ui/filters/feature-pagination/**` | Mirror of url-kit — only if you still maintain both trees |

---

## Triggering from view switchers etc.

```
FilteringWrapper (useAllItems prop)
  → NewSwitcherWrapper
    → useViewSwitcher({ useAllItems, defaultPageSize })
      → setView: view param + applyShowAllToSearchParams / restorePaginatedSearchParams
        → single router.push

Pagination footer (unchanged API)
  → useUrlPagination.setShowAll
    → applyShowAllToSearchParams (shared util)
```
