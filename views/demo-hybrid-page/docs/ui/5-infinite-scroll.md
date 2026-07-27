# Phase 5 — Infinite scroll

## What changed

- `useInfiniteRentalCars` — same offset `GET /api/demo-hybrid-page/cars`, page in `pageParam` only.
- **Paginated by default** for `table` / `list` / `cards` (footer `page` / `limit`).
- **`all=1` (All)** on those views → infinite load-more instead of one giant `showAll` fetch.
- Board views (`kanban`, …) still use a single `showAll` fetch (`DEMO_RSC_USE_ALL_ITEMS_VIEWS`).
- `InfiniteLoadMore` — `loadTrigger`: `'automatic'` (IntersectionObserver) or `'button'`.
- **Table / list / cards**: load-more is the last virtualized row (`listEndRow` via `ViewOrchestrator`).
- Each infinite page success seeds `rentalCarKeys.list({ …, page, limit })` (one-way bridge).
- Entering All bootstraps infinite from cached list page 1 when present (`initialData`).
- `findRentalCarInListCache` also scans infinite `pages[]`.

## Data path

| Condition | Hook | Chrome |
|-----------|------|--------|
| Default (`table` / `list` / `cards`) | `useRentalCars` | `PaginationFooter` |
| `all=1` on table/list/cards | `useInfiniteRentalCars` | Last-row `InfiniteLoadMore` + footer |
| Board views + `all=1` | `useRentalCars` + `showAll` | Footer hidden |

Helpers: `isHybridInfiniteAllMode`, `DEMO_HYBRID_INFINITE_LOAD_TRIGGER` in `config/data/demo-rsc-views-config.ts`.

## `loadTrigger`

| Value | Behavior |
|-------|----------|
| `automatic` (default) | IO sentinel at 10% visibility → `fetchNextPage` |
| `button` | Manual **Load more** only |

## Seed bridge (list ← infinite)

```ts
queryClient.setQueryData(
  rentalCarKeys.list({ ...filters, page: pageParam, limit }), // no showAll
  pageResponse,
)
```

Key must match `buildRentalCarListQuery` paginated shape (`page` + `limit`, omit `showAll`).
While `all=1`, URL parse drops `limit` — infinite pins `defaultPageSize` so seeds hit after leaving All.

Scroll All-mode pages 1–3 → switch back to limit 10 + page 2 → cache hit (within `staleTime`).

### Bug fix — key mismatch dimmed page 2

Seeded keys used `showAll: false` and often **no `limit`**. Paginated URL parse uses `{ page, limit }` with **no `showAll`**. TanStack treated them as different entries → miss → `keepPreviousData` + `FetchPendingDimmer`.

**Fix:** seed/fetch with exact paginated shape; pin `limit` on the infinite query object.

### Bug fix — All mode table skeleton

Entering All disabled `useRentalCars` and cold-started infinite with empty `cars` → full `TableSkeleton`, plus dim on any `infiniteFetching`.

**Fix:**

1. `initialData` from `list({ page: 1, limit })` when cached (`readRentalCarListPage`).
2. Hold last non-empty rows in the page client while page 1 loads.
3. Dim only for placeholder key swaps / held rows — not every infinite fetch / load-more.

**Out of scope:** full contiguous `list` pages → rebuild `InfiniteData` (page-1 bootstrap only).

## Mutations

`invalidateRentalCarListCaches` invalidates `lists()` + `infinites()`. After mutation, infinite may refetch from page 1 — accepted for v1.

## Cursor upgrade (later)

See [pagination.md](../../../../app/development/hybrid-migration/decisions/pagination.md).

## Verify

1. `/demo-hybrid-page` or `?view=list` — paginated footer; no infinite.
2. Click **All** in footer — no full-page skeleton if page 1 was cached; load-more appends.
3. After scrolling All pages, pick page size 10 → page 2 — **no dim** (seed hit).
4. `view=kanban` — still full `showAll` fetch, not infinite.
5. Toggle `DEMO_HYBRID_INFINITE_LOAD_TRIGGER` to `'button'` — manual Load more only.

## Key learnings

- Infinite replaces **All**, not a specific view.
- Separate `list` / `infinite` keys; seed is write-through — **key shape must match exactly** (`limit` present, `showAll` absent).
- Board layouts still need the full set in one response.
- Opposite bridge (multi-page list → infinite) is optional; page-1 `initialData` covers the All-entry flash.

Decision findings: [pagination.md](../../../../app/development/hybrid-migration/decisions/pagination.md#findings--list-cache-vs-infinite-cache).
