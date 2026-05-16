# Reset page to 1 on filter or sort change

When the user changes **filters**, **search**, or **sort**, the result set changes. If the URL still has `page=5`, the server often returns an empty slice. Pagination should restart at **page 1**.

This package owns the shared helper and documents how other filter features use it.

---

## Helper

**File:** `features/ui/filters/feature-pagination/utils/reset-page-in-params.ts`

```ts
resetPageInSearchParams(params, pageParamKey = 'page')
```

- **Deletes** the `page` query param (default key `page`).
- **`parsePagination`** then defaults to page `1` (see `parse-pagination.ts`).
- Same idea as NL filter apply: `resetNlApplyPaginationPage` in `features/ui/ai-filter/lib/nl-filter-clear-helpers.ts`.

Export: `@/features/ui/filters/feature-pagination/utils` → `resetPageInSearchParams`.

---

## Where it runs automatically

| Hook / API | When page resets |
|------------|------------------|
| **`useUrlFilters`** | `set`, `setList`, `toggleListValue`, `setRange`, `setNumberRange`, `remove`, `setSearch`, legacy `setSort` (`sort` + `order`) — via internal `updateUrlAfterDataChange` |
| **`useUrlFilters.setPage`** | **No** — only changes `page` (pagination footer / buttons) |
| **`useUrlFilters.clearAll`** | **N/A** — strips entire query string (page gone → default 1) |
| **`useUrlSorting`** (`feature-sorting` + `feature-sorting-builder-control`) | Every sort URL update (`toggleSort`, `setSorts`, `clearSorts`, etc.) — inside `updateUrl` |
| **`useUrlPagination.setLimit`** | Sets `page=1` explicitly when page size changes (unchanged) |
| **`useUrlPagination.setPage`** | **No** — user navigation only |

### UI paths covered

- Dropdown filter **Apply** and **auto-apply**
- Pill / multi-select / range filters
- Search bar (`setSearch`)
- Sort buttons and **SortingControl** builder
- Removing a single filter (`remove`)

---

## RSC / server

Server loaders should read pagination with **`parsePagination(searchParams, defaultLimit)`** (or your page’s `buildRentalCarListQuery`). No extra server change is required when the client deletes `page` from the URL.

---

## Custom URL writers

If you build `URLSearchParams` yourself (e.g. AI filter, a one-off action), call **`resetPageInSearchParams(params)`** before `router.replace` whenever the change affects **which rows** are returned — not when only changing `page` or `limit` for navigation.

Example:

```ts
const params = new URLSearchParams(searchParams.toString())
params.set('status', 'available')
resetPageInSearchParams(params)
router.replace(`${pathname}?${params}`)
```

---

## Custom page param name

Pass the key if your app uses something other than `page`:

```ts
resetPageInSearchParams(params, 'p')
```

Align with `PaginationConfig` / `assistantConfig.paginationPageParamKey` on NL filter pages.

---

## Related docs

- `pagination-feature-plan.md` — pagination URL format and `useUrlPagination`
- `features/ui/filters/feature-filtering/hooks/useUrlFilters.ts` — `updateUrlAfterDataChange`
- `features/ui/ai-filter/README.md` — NL apply also clears `page`


# Consideration

Each filter/search/sort action still ends in one router.replace, with the page param removed in the same URLSearchParams batch before navigation.

resetPageInSearchParams only mutates the in-memory params object (params.delete('page')). It does not call the router. So you get one soft navigation per user action → one RSC payload fetch for the new URL 

If you had implemented reset as “update filter” then setPage(1)” as two hook calls, that would cause two RSC fetches. 

Bottom line: One filter/sort/search apply → one URL → one RSC refetch. The reset is not a second navigation.