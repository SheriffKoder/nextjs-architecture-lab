# Phase 1 — Detail fetch + hover prefetch

## What changed

- `useRentalCarDetail(id)` uses `enabled` + `staleTime: 5m`, same `queryKey` / `queryFn` as hover.
- Row `onPointerEnter` → `queryClient.prefetchQuery` via `fetchRentalCarById`.
- Row click → local `selectedId` only (no drawer panel until Phase 3).
- Detail path is API + TanStack only — no `unstable_cache` / `getRentalCarByIdAction` on hybrid.

## Network waterfall (verify in DevTools)

1. **Cold page load** — list + options from RSC dehydration (or client refetch). No detail requests.
2. **Hover a row** — one `GET /api/demo-hybrid-page/cars/:id` (fire-and-forget). UI stays interactive.
3. **Click that row** — `useRentalCarDetail(selectedId)` reports **cache ready** / `isFetching: false` (same key).
4. **Click without hover** — one detail GET, then cached for later opens of the same id.

## Why this replaces RSC `unstable_cache` by id

Server `unstable_cache` warmed the **server** for a later RSC render. Hover→open on the client still paid a network round-trip (or a server action) unless the client already had the payload.

TanStack in-memory cache ties both triggers together: prefetch and open share `rentalCarKeys.detail(id)` + `fetchRentalCarById`.

## Deferred to Phase 3

- Drawer open/close/mode UI and Zustand store.
- URL drawer params.
- Rendering full view/edit drawer content from `useRentalCarDetail`.

Until then, the status line above the row list only shows `selectedId` + detail query status so the cache hit is observable.
