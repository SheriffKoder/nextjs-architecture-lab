# Shallow URL + client list/facet queries

## What changed

- List URL state updates without `router.replace` (no RSC remount on filter/sort/page).
- Shared parser: `parseListQueryFromSearchParams` used by RSC prefetch and the client hook.
- `useRentalCars` / `useRentalCarFilterOptions` driven by `listQuery`, with `placeholderData: keepPreviousData`.
- No `NavigationTransitionRoot` / navigation dimmer on the filter path — `FetchPendingDimmer` instead.

### Superseded note (Phase 2 → 2.5)

Phase 2 started with a page-local shallow list hook. That was replaced by **`platform/url-kit/url-params`** + `<ShallowUrlProvider>` so the same FilterToolbar / PaginationFooter chrome works on RSC (router fallback) and hybrid (shallow). See [2.5-url-kit-transport-and-sections.md](./2.5-url-kit-transport-and-sections.md). Cross-cutting shifts: [rsc-to-hybrid-shifts.md](./rsc-to-hybrid-shifts.md).

## Network waterfall (verify in DevTools)

1. **Cold load** — document request once; list + options hydrated from RSC (or client refill if miss).
2. **Change filter / page / sort** — address bar updates immediately; **no** Next.js RSC document/flight refetch for the page. Only `GET /api/demo-hybrid-page/cars` and `…/options`.
3. **While fetching** — previous rows stay visible; table dims after 150ms (`FetchPendingDimmer`, same as RSC `NavigationPendingDimmer`).
4. **Back/forward** — `popstate` re-parses URL → same TanStack keys → cache hit or refetch.

## Why this replaces RSC URL transitions

Phase 1 drove list state through `searchParams` + `router.replace`, so every filter click remounted the RSC tree. Shallow URL keeps the shareable query string; TanStack `queryKey` is the fetch trigger.

## Intentional scope notes (historical Phase 2)

Early Phase 2 used a thin controlled filter strip before full url-kit chrome. Phases 2.5–2.6 restored RSC-parity toolbar / pagination / optional chrome via transport. Drawer URL + client body landed in Phase 3.

## No data-only cache key

Hybrid never copied `demoRscDataParamsToCacheKey` / `unstable_cache` for list. TanStack keys already exclude UI-only params because those keys are not part of `RentalCarListQuery`.
