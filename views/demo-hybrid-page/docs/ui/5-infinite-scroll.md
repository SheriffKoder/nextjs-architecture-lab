# Step 5 — Infinite scroll on All mode

## What this step introduced

- `useInfiniteRentalCars` — same offset GET, page in `pageParam` only.
- **Paginated by default** for `table` / `list` / `cards` (footer `page` / `limit`).
- **`all=1` (All)** on those views → infinite load-more instead of one giant `showAll` fetch.
- Board views (`kanban`, …) still use single `showAll` fetch.
- `InfiniteLoadMore` as last virtualized row (`listEndRow` via `ViewOrchestrator`) — table, list, cards.
- One-way cache bridge: each infinite page success seeds `rentalCarKeys.list({ …, page, limit })`.

## What bottleneck it fixed

- **Huge one-shot All fetch** on paginated views — slow initial response and poor UX when user only wants to scroll further.
- **Mode-switch UX inconsistencies** when leaving All mode — dim/reload artifacts if caches didn't align.
- **Hard to implement smoothly in pure RSC** — infinite append requires client-side accumulation, IntersectionObserver, and append semantics that fight RSC's page-keyed server renders. TanStack `useInfiniteQuery` made this practical.

## Findings during implementation

### Why TanStack vs RSC here

On pure RSC, "load more" meant either:

- one giant `showAll` fetch (bad for large sets), or
- repeated soft navigations that remount the tree (bad for perceived performance).

TanStack `useInfiniteQuery` owns append semantics, page params, and cache shape natively.

### Why one-way cache bridge only

We considered bridging caches in both directions:

| Direction | Feasibility |
|-----------|-------------|
| `infinite → list` | Practical — each fetched page maps 1:1 to a paginated list key |
| `list → infinite` | Hard — infinite is **sequential** (pages append in order); paginated list is **random-access** (jump to page 7). Rebuilding `InfiniteData` from scattered list pages means holes, ordering gaps, or a full refetch |

**Chosen:** write-through seed on each infinite page success. Reverse bridge stays out of scope; page-1 `initialData` covers the All-entry flash.

### Separate cache shapes

- `useQuery` list key: `{ cars, pagination }` per page — random access.
- `useInfiniteQuery` key: `{ pages, pageParams }` — sequential append.

Not a TanStack mandate — a **shape + UX** choice. Footer pagination wants jump-to-page-N; infinite wants append.

## Fixes applied during the step

### Key mismatch dimmed page 2

Seeded keys used `showAll: false` and often **no `limit`**. Paginated parse uses `{ page, limit }` with **no `showAll`**. TanStack treated them as different entries → miss → `keepPreviousData` + dim.

**Fix:** seed/fetch with exact paginated shape; pin `limit` on infinite query object.

### All mode table skeleton

Entering All disabled `useRentalCars` and cold-started infinite with empty `cars` → full skeleton + dim on every fetch.

**Fix:**

1. `initialData` from cached `list({ page: 1, limit })`.
2. Hold last non-empty rows while page 1 loads.
3. Dim only for placeholder key swaps — not every load-more fetch.

## Trade-offs and remaining edges

- Infinite replaces **All**, not a specific view mode.
- Board layouts still need full set in one response.
- Cursor/keyset pagination deferred — offset v1 sufficient for demo.
- Mutations invalidate both families; infinite may refetch from page 1 — accepted for v1.

### Data path

| Condition | Hook | Chrome |
|-----------|------|--------|
| Default (`table` / `list` / `cards`) | `useRentalCars` | `PaginationFooter` |
| `all=1` on table/list/cards | `useInfiniteRentalCars` | Last-row `InfiniteLoadMore` + footer |
| Board views + `all=1` | `useRentalCars` + `showAll` | Footer hidden |

Cross-phase summary: [rsc-to-hybrid-shifts.md](../architecture/rsc-to-hybrid-shifts.md#8-pagination--two-tanstack-products-one-offset-api).
