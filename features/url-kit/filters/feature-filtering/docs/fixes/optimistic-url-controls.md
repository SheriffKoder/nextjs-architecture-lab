# Optimistic URL controls (filters & sort)

Filter and sort chrome can feel laggy when controls read only from `useSearchParams()`, which updates after soft navigation and the RSC payload. This change makes **selection state** update immediately on click while the table still loads from the server.

# Smaller / complementary options
Pending styling on the filter bar — use isNavigationPending from NavigationTransitionRoot for a subtle opacity or aria-busy on the filter region. Improves “something is happening” but does not fix stale checkboxes alone.

Prefetch / faster RSC — shortens delay but does not remove it; still worth doing for the table.

Client data layer (TanStack Query, etc.) — filters update client cache immediately, URL syncs in background. Bigger architectural shift; only if you move away from URL-as-single-source for list data.

nuqs / similar — some libraries maintain a client param cache ahead of the router; similar tradeoffs to a custom optimistic hook.

---

## How it works

1. **`useOptimisticUrlSearchParams`** (`features/ui/filters/lib/use-optimistic-url-search-params.ts`) wraps the committed query string in React `useOptimistic`.
2. **Getters** in `useUrlFilters` / `useUrlSorting` read `effectiveParams` (optimistic).
3. **Setters** call `applyPendingSnapshot(next)` then `router.replace` when `next !== committedSnapshot`.
4. When navigation finishes, `useSearchParams()` updates → optimistic state reconciles.

Still **one** `router.replace` per action (no double RSC fetch). Table rows and option **counts** stay server-driven until RSC returns.

---

## Files touched

| File | Change |
|------|--------|
| `features/ui/filters/lib/use-optimistic-url-search-params.ts` | Shared optimistic snapshot helper |
| `features/ui/filters/feature-filtering/hooks/useUrlFilters.ts` | Getters/setters use optimistic params |
| `features/ui/filters/feature-sorting/hooks/useUrlSorting.ts` | Same for sort getters/setters |
| `features/ui/filters/feature-sorting-builder-control/hooks/useUrlSorting.ts` | Mirror of sorting hook (SortingControl) |

No filter/sort **UI components** were edited.

---

## Files benefited (automatic)

Any client component that uses `useUrlFilters` or `useUrlSorting` for **selected/checked/active** UI:

| Area | Examples |
|------|----------|
| Single-key buttons | `components/single-key/filter-options-buttons.tsx` |
| Pill filter | `PillFilter/filter-list-items/multi-select-filter-list.tsx`, `single-select-filter-list.tsx`, range lists |
| Filter items | `multi-select-filter.tsx`, `single-select-filter.tsx`, search bars, date/number filters |
| Sort | `feature-sorting/components/sort-button.tsx`, `sort-buttons.tsx` |
| Sorting builder | `feature-sorting-builder-control/components/sorting-control.tsx` |
| Dropdown filter | URL reads via hook when syncing applied state (panel still uses `pendingSelections` while open) |

Demo/client pages that import these hooks benefit without changes.

---

## What stays server-driven

- Table body rows and pagination totals
- Filter option **counts** (`option.count`) from RSC props
- `NavigationPendingDimmer` on the table (unchanged; no pending styling on filter chrome in this pass)

---

## Optional follow-up files

| File | Why |
|------|-----|
| `features/ui/filters/feature-sorting/hooks/use-initial-sorts.ts` | Separate `router.replace` on mount; only if that path feels laggy |
| `features/ui/filters/feature-pagination/hooks/useUrlPagination.ts` | Optimistic page/limit footer buttons |
| `features/ui/filters/feature-query-builder-filter/hooks/use-url-query-filter.ts` | Custom URL writer; not on `useUrlFilters` |
| Filter chrome wrapper on demo pages | Optional `isNavigationPending` styling (deferred) |

---

## Related docs

- `features/ui/filters/feature-pagination/docs/reset-page-on-filter-sort.md` — page reset on filter/sort (included in optimistic snapshot)
- `features/demo-rsc-page/docs/8-cell-optimistic-server-action.md` — optimistic **row data** (different layer)
