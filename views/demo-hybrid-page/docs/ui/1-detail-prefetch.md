# Step 1 — Detail prefetch

## What this step introduced

- `useRentalCarDetail(id)` with `enabled` + `staleTime: 5m`, same `queryKey` / `queryFn` as hover prefetch.
- Row `onPointerEnter` → `queryClient.prefetchQuery` via `fetchRentalCarById`.
- Detail path is API + TanStack only — no `unstable_cache` / `getRentalCarByIdAction` on hybrid.
- Shared key: `rentalCarKeys.detail(id)` ties prefetch and drawer open together.

## What bottleneck it fixed

- **Drawer-open latency when detail wasn't already in client cache.** On pure RSC, hover prefetch warmed the server (`unstable_cache`) but hover → open on the client still paid a network round-trip unless the payload was already client-side.
- **Duplicate by-id fetches** when prefetch and open used different code paths (RSC bottleneck 6-2 on the RSC page).

## Findings during implementation

- Server `unstable_cache` alone is not enough for instant client open — it warms the **server** for a later RSC render, not the browser cache.
- Best result: **seed from list/infinite cache first, fetch on miss.** If the row is already visible, detail can render immediately without a GET.
- Prefetch and open must share one client key; otherwise hover work is wasted at click time.

## Fixes applied during the step

- List row data used as `initialData` for detail when available (extended in Step 3 drawer body).
- Detail query disabled until an id is present; staleTime avoids refetch churn on repeated opens.

## Trade-offs and remaining edges

- Deep link to an id not on the current list page still requires one by-id GET — acceptable.
- Drawer UI landed in Step 3; this step wired state and cache only.

### Network waterfall (verify in DevTools)

1. **Cold page load** — list + options from RSC dehydration. No detail requests.
2. **Hover a row** — one `GET /api/demo-hybrid-page/cars/:id` (fire-and-forget).
3. **Click that row** — cache hit when warm; opens URL drawer in Step 3.
4. **Click without hover** — one detail GET, then cached.

Next: [3-url-drawer-client-content.md](../drawers/3-url-drawer-client-content.md).
