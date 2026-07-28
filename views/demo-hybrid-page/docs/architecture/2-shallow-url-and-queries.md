# Step 2 — Shallow URL + TanStack list/facets

## What this step introduced

- Shallow URL writes — list state updates without `router.replace` (no RSC remount on filter/sort/page).
- Shared parser: `parseListQueryFromSearchParams` used by RSC prefetch and the client hook.
- `useRentalCars` / `useRentalCarFilterOptions` driven by `listQuery`, with `placeholderData: keepPreviousData`.
- `FetchPendingDimmer` instead of `NavigationTransitionRoot` / navigation dimmer on the filter path.

## What bottleneck it fixed

- **`router.replace`-driven RSC remount on filter/sort/page changes** (RSC bottleneck 4). Every URL write re-ran the RSC tree and triggered Suspense islands + transition dimming workarounds.
- **Perceived blocking latency** on soft navigations — the whole page felt frozen while the server re-rendered.

## Findings during implementation

- Shareable URL ≠ App Router navigation. Shallow commit keeps the address bar; TanStack `queryKey` is the fetch trigger.
- Previous-data + dimmer gives smoother UX than navigation pending for this model — rows stay visible while new data loads.
- Hybrid never needed a separate `demoRscDataParamsToCacheKey` for list: TanStack keys are built from the typed `RentalCarListQuery`, which already omits UI-only params.
- Early Phase 2 used a page-local shallow hook and a thin filter strip; Step 2.5 replaced that with unified `url-params` transport + full RSC-mirror sections.

## Fixes applied during the step

- `FetchPendingDimmer` (150ms delay) mirrors RSC `NavigationPendingDimmer` visual language but signals client fetch, not navigation pending.
- `popstate` re-parses URL → same TanStack keys → cache hit or refetch on back/forward.

## Trade-offs and remaining edges

- Requires `ShallowUrlProvider` on hybrid (Step 2.5) for full chrome parity — page-local hook was a learning prototype.
- Drawer and confirm params remain UI-only and do not trigger list refetch — documented in Step 3.

### Network waterfall (verify in DevTools)

1. **Cold load** — document request once; list + options hydrated from RSC.
2. **Change filter / page / sort** — address bar updates immediately; **no** RSC document/flight refetch. Only API GETs.
3. **While fetching** — previous rows stay visible; table dims after 150ms.
4. **Back/forward** — `popstate` → cache hit or refetch.

Superseded by transport layer: [2.5-url-kit-transport-and-sections.md](./2.5-url-kit-transport-and-sections.md).
