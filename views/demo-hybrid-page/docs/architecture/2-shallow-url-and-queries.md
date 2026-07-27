# Shallow URL + client list/facet queries

## What changed

- `useShallowListParams` owns list URL state via `history.replaceState` + `popstate` (no `router.replace`).
- Shared parser: `parseListQueryFromSearchParams` used by RSC prefetch and the client hook.
- `useRentalCars` / `useRentalCarFilterOptions` driven by `listQuery`, with `placeholderData: keepPreviousData`.
- Client filter strip + pagination footer call shallow setters only (platform FilterToolbar / PaginationFooter still use `router.replace`, so hybrid uses controlled wrappers).
- No `NavigationTransitionRoot` / dimmer on the filter path.

## Network waterfall (verify in DevTools)

1. **Cold load** — document request once; list + options hydrated from RSC (or client refill if miss).
2. **Change filter / page / sort** — address bar updates immediately; **no** Next.js RSC document/flight refetch for the page. Only `GET /api/demo-hybrid-page/cars` and `…/options`.
3. **While fetching** — previous rows stay visible; table dims after 150ms (`FetchPendingDimmer`, same as RSC `NavigationPendingDimmer`).
4. **Back/forward** — `popstate` re-parses URL → same TanStack keys → cache hit or refetch.

## Why this replaces RSC URL transitions

Phase 1 drove list state through `searchParams` + `router.replace`, so every filter click remounted the RSC tree. Shallow URL keeps the shareable query string; TanStack `queryKey` is the fetch trigger.

## Intentional scope notes

- Filter UI is a hybrid-controlled strip (status / make / location + search + sort), not a fork of the full platform FilterToolbar.
- Pagination uses presentational platform pieces (`PaginationButtons`, `PaginationInfo`, page-size buttons) with shallow setters.
- Table is `availableViews={['table']}` + `externalUrlControls` so view chrome does not call `router.replace`.
- Drawer UI still deferred; `selectedId` + detail prefetch remain from the prior detail work.

## No data-only cache key

Hybrid never copied `demoRscDataParamsToCacheKey` / `unstable_cache` for list. TanStack keys already exclude UI-only params because those keys are not part of `RentalCarListQuery`.
