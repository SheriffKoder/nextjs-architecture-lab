# Step 4 — Optimistic mutations

Mirror: [RSC cell optimistic doc](../../demo-rsc-page/docs/ui/8-cell-optimistic-server-action.md).

## What this step introduced

- CRUD + activity toggle via **Route Handlers** under `/api/demo-hybrid-page/cars` (`POST`, `PATCH`, `DELETE`).
- Mutation hooks in `entities/demo-hybrid-cars/mutations/` with optimistic `setQueryData` + targeted `invalidateQueries`.
- Drawer forms wired: create, edit, delete confirm → close drawer on success.
- Activity column → `useToggleRentalCarActivity` (no `useOptimistic` / `router.refresh()`).

## What bottleneck it fixed

- **Reliance on `revalidatePath` / `router.refresh()` refresh cycles** for mutation feedback on pure RSC. Every toggle or save re-ran server loaders and remounted Suspense islands.
- **Optimistic UI tied to URL-driven RSC trees** — `useOptimistic` on server-refreshed data is fragile when the tree re-renders from navigation.

## Findings during implementation

- Mutations target TanStack cache; RSC prefetch is cold-load only.
- Invalidate **both** `lists()` and `infinites()` — otherwise infinite mode diverges from paginated mode after a mutation (prep for Step 5).
- Optimistic updates live in mutation hooks, not React `useOptimistic` on URL-driven trees.
- Status-only PATCH shares the same `[id]` route as edit; body shape selects the path.
- Shared in-memory mock store (`repository/`) so list GETs after invalidate include creates/updates/deletes.

## Fixes applied during the step

- `cache/invalidate-rental-car-caches.ts` centralizes list + infinite invalidation.
- Demo failure rate on activity toggle (~50% + 1.5s delay) exercises rollback + toast error path.

## Trade-offs and remaining edges

- After mutation, infinite may refetch from page 1 — accepted for v1.
- Real production would add conflict resolution, idempotency keys, and optimistic rollback UX polish.

### Verify

1. Toggle activity — UI updates immediately; ~half the time toast error + revert.
2. Create car — row appears; drawer closes; no full page remount.
3. Edit + save — list + open detail stay in sync.
4. Delete confirm — row disappears; cache rolls back if DELETE fails.
5. Network tab — API mutations only; no RSC refresh POST for list.

Entity docs: `entities/demo-hybrid-cars/README.md`.
