# To implement — cursor / keyset pagination

**Prerequisite:** [5-infinite-scroll.md](../ui/5-infinite-scroll.md)

**Goal:** Replace offset-only pagination with stable cursor pagination before real DB scale — so infinite scroll + optimistic toggles don't produce dupes/skips under concurrent writes.

**Status:** Deferred — offset v1 sufficient for mock demo

---

## Why offset breaks at scale

| Scenario | Offset problem |
|----------|----------------|
| User scrolls infinite All mode | Page N keyed by offset; row inserted above cursor shifts indices |
| Optimistic activity toggle | Row may move sort bucket while next page fetch uses stale offset |
| Jump to page 7 | Works with `useQuery` list — fine for footer pagination |
| Infinite append | Sequential — needs stable "after this cursor" not "skip 140" |

Hybrid already uses **separate** `list` (random access) and `infinite` (sequential) caches with one-way bridge. Cursor upgrade primarily affects **infinite `getNextPageParam`** and **list jump** semantics.

---

## Step P.1 — API contract

### Reference files

| File | Why |
|------|-----|
| `app/api/demo-hybrid-page/cars/route.ts` | GET list handler |
| `entities/demo-hybrid-cars/server/get-rental-cars-data.ts` | Filter → sort → paginate |
| `entities/demo-hybrid-cars/model/rental-car-list-query.ts` | Query type |

### Actions

- Add cursor param: `after=<sortKey>:<id>` or encoded opaque token.
- Response: `{ cars, pagination: { nextCursor, hasMore, total? } }` — keep `page` optional for footer mode during transition.
- Repository: keyset query on sort column + tie-breaker id.

### Expected outcome

- Infinite `getNextPageParam` reads `nextCursor` not `page + 1`.

### Solves

- Dupes/skips when list mutates during infinite scroll.

---

## Step P.2 — TanStack keys

### Reference files

| File | Why |
|------|-----|
| `entities/demo-hybrid-cars/cache/rental-car-keys.ts` | Key factory |
| `entities/demo-hybrid-cars/queries/use-infinite-rental-cars.ts` | Infinite hook |

### Actions

- Infinite key: `{ …filters, cursor: undefined }` — pages stored with cursor in `pageParam`.
- List footer mode: either keep offset for jump-to-page **or** map page N → cursor lookup table (heavier).
- Revisit one-way bridge: seed `list({ page })` only when offset mode active; cursor mode may drop reverse bridge entirely.

### Expected outcome

- Infinite and optimistic mutations compose without row jump artifacts.

### Solves

- Production-scale "All mode" scrolling with live toggles.

---

## Step P.3 — Offset coexistence (migration path)

### Actions

- v1: cursor for infinite only; footer keeps offset.
- v2: cursor everywhere; footer "page 7" becomes cursor stack or "seek" API.

Document trade-off in story doc when implemented.

---

## Checklist

- [ ] API accepts cursor + returns `nextCursor`
- [ ] `useInfiniteRentalCars` uses cursor `pageParam`
- [ ] Mutations invalidate infinite from first cursor (accepted v1 behavior)
- [ ] Update [5-infinite-scroll.md](../ui/5-infinite-scroll.md) or add `ui/7-cursor-pagination.md`
- [ ] Repository supports keyset on target sort columns

---

## Out of scope for demo

- Full footer random-access on cursor without offset — can defer until product requires "page 7" at DB scale.
