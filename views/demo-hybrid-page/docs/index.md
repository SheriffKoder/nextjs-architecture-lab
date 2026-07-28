# Demo Hybrid Page — docs index

Paths are relative to `views/demo-hybrid-page/docs/`.

**Root docs hub:** [`docs/lab/`](../../../docs/lab/README.md) · [`docs/guides/`](../../../docs/guides/README.md)

This folder documents the hybrid migration as an **engineering story**: what each step introduced, what RSC bottleneck it fixed, and what we learned (or fixed) while building it.

---

## Numbered series (read in order)

**[0-hybrid-scaffold](architecture/0-hybrid-scaffold.md)**  
Self-contained route + entity stack + API + hydration boundary. RSC for first paint; TanStack owns interaction after hydration.

**[1-detail-prefetch](ui/1-detail-prefetch.md)**  
Hover prefetch + shared detail query key. Seed from list/infinite cache first; fetch on miss.

**[2-shallow-url-and-queries](architecture/2-shallow-url-and-queries.md)**  
Shallow URL writes replace `router.replace` remount cost. Query keys become the data trigger boundary.

**[2.5-url-kit-transport-and-sections](architecture/2.5-url-kit-transport-and-sections.md)**  
`url-params` transport seam — one chrome surface for RSC (router fallback) and hybrid (shallow adapter).

**[3-url-drawer-client-content](drawers/3-url-drawer-client-content.md)**  
Drawer state stays URL-driven; body is TanStack client-side. Store was valid; URL chosen for production parity.

**[4-optimistic-mutations](ui/4-optimistic-mutations.md)**  
Route handlers + optimistic cache writes. No `revalidatePath` refresh cycle for routine CRUD.

**[5-infinite-scroll](ui/5-infinite-scroll.md)**  
Infinite on `all=1` only; paginated default. TanStack made this practical; one-way cache bridge to paginated list.

---

## Cross-cutting

**[rsc-to-hybrid-shifts](architecture/rsc-to-hybrid-shifts.md)**  
Major architectural shifts and decision index across all steps.

---

## Reflections

**[model-evolution](reflections/model-evolution.md)**  
What the earlier hybrid model got wrong; why the current model changed.

**[first-review](reflections/first-review.md)**  
Mid-course observations while building the hybrid page.

**[hybrid-conclusion](reflections/hybrid-conclusion.md)**  
Final outcomes: where hybrid wins, what stays URL-first, what remains deferred.

**[production-notes](reflections/production-notes.md)**  
What is stable now vs postponed.

**[next-steps](reflections/next-steps.md)**  
Prioritized implementation backlog and recommended order.

**[implementation-plan.md](../implementation-plan.md)** (view root)  
Bootstrap file tree, Steps 0–5 checklist, config reference, testing checklist.

---

## to-implement — not done

**[confirmation-modal-off-url](to-implement/confirmation-modal-off-url.md)**  
Move delete confirm off `?action=delete` to local client state; drawer URL unchanged.

**[revisit-route-loading](to-implement/revisit-route-loading.md)**  
Sidebar revisit UX — partial fix (no route loading); server prefetch + cache lifecycle remain.

**[layout-query-provider](to-implement/layout-query-provider.md)**  
Persistent TanStack cache across navigations; optional thin `page.tsx` on revisit.

**[nuqs-adapter](to-implement/nuqs-adapter.md)**  
Optional third url-params transport adapter when parse/serialize maintenance grows.

**[cursor-pagination](to-implement/cursor-pagination.md)**  
Keyset pagination for infinite + optimistic toggles at DB scale.

## to-implement — shared with RSC (platform)

Implement once in url-kit / multi-view; both demos benefit:

- [dropdown-placeholders](../../demo-rsc-page/docs/to-implement/dropdown-placeholders.md)
- [filter-labels-url-ids](../../demo-rsc-page/docs/to-implement/filter-labels-url-ids.md)
- [table-cell-overlay-z-index-scroll](../../demo-rsc-page/docs/to-implement/table-cell-overlay-z-index-scroll.md)
