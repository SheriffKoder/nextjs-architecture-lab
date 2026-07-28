# Production notes — stable now vs postponed

What is production-ready in the hybrid demo vs what remains follow-up work.

---

## Stable now

| Area | Status | Notes |
|------|--------|-------|
| Cold load + hydration | ✅ | RSC prefetch → `HydrationBoundary`; keys match server snapshot |
| Shallow URL list state | ✅ | Filter/sort/page/view without RSC remount |
| url-kit chrome parity | ✅ | Same imports as RSC; transport picks adapter |
| URL drawer + client body | ✅ | Deep links, list seed, fetch on miss |
| CRUD + optimistic toggle | ✅ | Route handlers; invalidate lists + infinites |
| Paginated default | ✅ | table/list/cards use footer pagination |
| Infinite on All | ✅ | `all=1` → load-more; one-way cache bridge |
| Error toasts + retry | ✅ | Query error hook + offline detection |
| Skeletons + fetch dimmer | ✅ | Section-level loading; placeholder data |

---

## Postponed / Phase 6+

| Area | Status | Plan |
|------|--------|------|
| Confirm modal off URL | 🔜 Next | [confirmation-modal-off-url.md](../to-implement/confirmation-modal-off-url.md) |
| nuqs adapter | 🔜 Reserved | [nuqs-adapter.md](../to-implement/nuqs-adapter.md) |
| Cursor pagination | 🔜 Later | [cursor-pagination.md](../to-implement/cursor-pagination.md) |
| Route loading / revisit | 🔜 Partial | [revisit-route-loading.md](../to-implement/revisit-route-loading.md) |
| Reverse list → infinite bridge | ❌ Out of scope | Sequential vs random-access mismatch |
| Real DB / auth | ❌ Demo scope | Repository layer swappable |

---

## Production checklist (when moving beyond demo)

1. Replace in-memory repository with real persistence + auth on API routes.
2. Add idempotency and conflict handling on mutations.
3. Evaluate cursor pagination before large datasets.
4. Move confirm modal to local state — [confirmation-modal-off-url.md](../to-implement/confirmation-modal-off-url.md).
5. Consider nuqs if typed URL parsers become maintenance burden — [nuqs-adapter.md](../to-implement/nuqs-adapter.md).
6. Tune TanStack `staleTime` / `gcTime` per entity and view mode.
7. Audit UI-only URL keys when adding new drawer types or modal flows.
8. Layout-level QueryProvider for revisit performance — [layout-query-provider.md](../to-implement/layout-query-provider.md).

Prioritized backlog: [next-steps.md](./next-steps.md).

Conclusion: [hybrid-conclusion.md](./hybrid-conclusion.md).
