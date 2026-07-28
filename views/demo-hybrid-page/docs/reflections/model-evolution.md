# How the hybrid model evolved

What the **earlier hybrid model** got wrong, and what the current model fixes. Phase 1 (pure RSC) and Phase 2 (this page) are documented elsewhere — this is only the gap between them.

Outcomes: [hybrid-conclusion](./hybrid-conclusion.md) · Decisions: [rsc-to-hybrid-shifts](../architecture/rsc-to-hybrid-shifts.md)

---

## Earlier hybrid model

The first attempt at “URL + TanStack for a dashboard” looked like hybrid on paper:

- URL drives filters, sort, pagination, view mode
- TanStack owns list and facet fetches
- Route handlers run filtering on the server; the browser refetches on URL change
- Same config-driven multi-view and drawer patterns

### Why it was wrong

| Problem | Effect |
|---------|--------|
| **All client, no cold-load seed** | First paint = bundle → hydrate → two fetches. Repeat interactions were fine; landing was slow. |
| **No shared URL → query parser** | List query built ad hoc in the page shell — server and client could not share one contract for prefetch. |
| **URL writes via router navigation** | Filter clicks were coupled to App Router navigation — the same coupling that made pure RSC painful, without RSC’s first-paint win. |
| **No shallow transport** | Shareable URL and “don’t remount the document” were treated as one problem; they are not. |
| **Thin interaction layer** | No detail seed from list, no optimistic mutation policy, no infinite All mode — features added later as one-offs. |

The pipeline was right (`URL intent → typed query → TanStack key → handler`). The **boundaries** were wrong: no RSC prefetch, no hydration bridge, no separation between address-bar updates and data fetch.

---

## Current hybrid model (what changed)

One sentence: **RSC prefetches and dehydrates once; TanStack owns everything after; URL updates are shallow.**

| Earlier gap | Fix |
|-------------|-----|
| Client waterfall on load | Server `prefetchRentalCarPage` → `HydrationBoundary` |
| Ad hoc query building | Shared `parseListQueryFromSearchParams` (RSC + client) |
| Router remount on filter change | `ShallowUrlProvider` — shareable URL without document flight |
| Server cache ≠ client drawer open | List seed + shared detail key; prefetch on hover |
| Refresh after mutations | Route handlers + optimistic cache, not `revalidatePath` |
| All / load-more | `useInfiniteQuery` when product needs append semantics |

Two assumptions from the [RSC conclusion](../../demo-rsc-page/docs/reflections/9-rsc-conclusion.md) were revised once shallow transport existed: drawer **stays on URL** (deep links kept; nav cost removed), and TanStack owns **list + options** after hydration — not only detail and mutations.

---

## Related

- [Hybrid conclusion](./hybrid-conclusion.md)
- [Phase 2 lab write-up](../../../../docs/lab/phase-2-hybrid.md)
- [Implementation plan](../../implementation-plan.md)
