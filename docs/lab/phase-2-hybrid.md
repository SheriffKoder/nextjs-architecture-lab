# Phase 2 — Hybrid RSC + TanStack

**Status:** Current · **Goal:** Keep server-first cold load while moving interactive reads/writes to TanStack — same list contract, same url-kit chrome, no `router.replace` remount on every filter click.

**Demo:** [`/demo-hybrid-page`](../../app/(root)/demo-hybrid-page/page.tsx) · [`views/demo-hybrid-page`](../../views/demo-hybrid-page/) · [`entities/demo-hybrid-cars`](../../entities/demo-hybrid-cars/)

**References:** [`views/demo-hybrid-page/implementation-plan.md`](../../views/demo-hybrid-page/implementation-plan.md) · [`views/demo-hybrid-page/docs/index.md`](../../views/demo-hybrid-page/docs/index.md)

---

## What we built

A self-contained hybrid rental cars page that:

- Prefetches list + facet options on the server → `HydrationBoundary` for first paint
- Uses **shallow URL** for list state (shareable address bar, TanStack `queryKey` triggers fetch)
- Reuses the same `@/platform/url-kit/*` chrome as the RSC demo (transport adapter is the only fork)
- Keeps drawer open/mode/id in the URL; drawer **body** is client + TanStack
- Mutates via route handlers + optimistic cache (no `revalidatePath` refresh cycle)
- Supports infinite scroll on `all=1` for table/list/cards; paginated footer by default

```text
RSC page.tsx     → prefetch + dehydrate (cold load only)
Client shell     → useRentalCars / useInfiniteRentalCars / useRentalCarDetail / mutations
API routes       → GET list, options, by-id; POST / PATCH / DELETE
ShallowUrlProvider → history.replaceState, not router.replace
```

## Patterns explored

- RSC prefetch + TanStack hydration (`prefetchRentalCarPage` → `HydrationBoundary`)
- Shallow URL transport (`platform/url-kit/url-params/` — shallow adapter vs router fallback)
- Shared `parseListQueryFromSearchParams` for server prefetch and client hooks
- `keepPreviousData` + `FetchPendingDimmer` (client fetch pending, not navigation pending)
- Detail prefetch + list seed → shared `rentalCarKeys.detail(id)`; fetch on miss
- URL drawer + client view body (Zustand considered; URL kept for production deep links)
- Route handler mutations + optimistic `setQueryData` + invalidate lists + infinites
- `useInfiniteQuery` on All mode; one-way cache bridge (`infinite → list`)
- Section-level skeletons, error toasts with retry, offline detection

## Practiced points (what the docs worked through)

Learning-curve docs → `views/demo-hybrid-page/docs/` (index: [`docs/index.md`](../../views/demo-hybrid-page/docs/index.md)).

**Scaffold + hydration** — [`architecture/0-hybrid-scaffold.md`](../../views/demo-hybrid-page/docs/architecture/0-hybrid-scaffold.md)

- Self-contained entity (`demo-hybrid-cars`); no runtime imports from RSC demo
- Layer map: `repository` → `server` → `client` / `queries` / `mutations` / `hydration`

**Shallow URL + list queries** — [`architecture/2-shallow-url-and-queries.md`](../../views/demo-hybrid-page/docs/architecture/2-shallow-url-and-queries.md)

- URL updates without RSC document flight; TanStack keys are the fetch trigger
- UI-only params (`drawer`, `mode`, `id`) excluded from list query identity

**url-params transport** — [`architecture/2.5-url-kit-transport-and-sections.md`](../../views/demo-hybrid-page/docs/architecture/2.5-url-kit-transport-and-sections.md)

- One chrome surface for RSC and hybrid; `ShallowUrlProvider` vs router fallback
- nuqs deferred — adapter slot reserved, not required for v1

**Detail cache** — [`ui/1-detail-prefetch.md`](../../views/demo-hybrid-page/docs/ui/1-detail-prefetch.md)

- Hover prefetch and drawer open share one client key
- List/infinite row seeds detail; server `unstable_cache` alone does not make open instant

**URL drawer + client body** — [`drawers/3-url-drawer-client-content.md`](../../views/demo-hybrid-page/docs/drawers/3-url-drawer-client-content.md)

- Instant drawer = shallow URL + warm detail cache — not “remove drawer from URL”

**Optimistic mutations** — [`ui/4-optimistic-mutations.md`](../../views/demo-hybrid-page/docs/ui/4-optimistic-mutations.md)

- Route handlers under `/api/demo-hybrid-page/cars`; invalidate `lists()` + `infinites()`

**Infinite on All** — [`ui/5-infinite-scroll.md`](../../views/demo-hybrid-page/docs/ui/5-infinite-scroll.md)

- Separate list / infinite cache shapes; one-way bridge only (sequential vs random-access)

**Cross-phase shifts** — [`architecture/rsc-to-hybrid-shifts.md`](../../views/demo-hybrid-page/docs/architecture/rsc-to-hybrid-shifts.md)

## Findings

Hybrid gives:

- smooth filter/sort/page UX without RSC remount
- instant drawer open when list row is warm
- optimistic CRUD without full-page refresh
- practical infinite append on All mode (hard to do cleanly in pure RSC)

Hybrid adds:

- two cache products for pagination (list + infinite) with intentional one-way bridge
- shallow transport layer to maintain (or nuqs later)
- route handlers + client cache policy alongside RSC prefetch

RSC workarounds that **signalled** the hybrid shift (and mostly went away):

- `NavigationTransitionRoot` / navigation dimmer for filter clicks
- `unstable_cache` by id for hover → open on the client
- `revalidatePath` + `router.refresh()` for routine mutations
- giant `showAll` fetch or repeated navigations for load-more

## What felt comfortable

- RSC for cold load + dehydration only
- URL as source of truth for list filters and drawer navigation state
- Same url-kit imports on RSC and hybrid (transport seam)
- `FetchPendingDimmer` on client fetch — clearer signal than route pending
- Mutation hooks owning optimistic updates (not `useOptimistic` on URL-driven trees)
- Self-contained entity copy that evolves independently of the RSC demo

## What felt unnecessary (or revised)

- Moving drawer open state off URL (valid for demos; URL kept for production parity once shallow transport removed nav cost)
- Page-local shallow hooks without platform transport (Step 2 prototype → Step 2.5 unified)
- Route-level `loading.tsx` on every revisit (removed — see [`to-implement/revisit-route-loading.md`](../../views/demo-hybrid-page/docs/to-implement/revisit-route-loading.md))
- Reverse list → infinite cache bridge (sequential infinite vs page-addressed list)
- `action=delete` in URL for confirm modals (next: local client state)

## Questions — answered

**Which state should remain in URL?**

| Stay in URL | Why |
|-------------|-----|
| Filters, sort, pagination, view, `groupBy` | Shareable list intent; cold-load parseable on server |
| `drawer`, `mode`, `id` | Shareable record navigation; back/forward and deep links |
| `all=1`, `page`, `limit` | Pagination mode is part of shareable list state |

**Which state should move to client?**

| Client-only (or moving off URL) | Why |
|----------------------------------|-----|
| TanStack cache (list, options, detail, infinite) | Interactive truth after first paint |
| Confirm modal open (`action=delete` today → local store next) | Transient UI phase — bad refresh/share semantics |
| Toast, fetch pending, drawer form dirty state | Ephemeral chrome |
| Hover prefetch warm-up | In-memory cache; not navigation state |

**Can hybrid reduce complexity?**

Yes — for the interaction loops Phase 1 patched with RSC workarounds:

- Filter/sort/page no longer remounts the server tree → no navigation dimmer for that path
- Detail hover + open share one TanStack key → no cross-request `unstable_cache` plumbing for client open
- Mutations patch cache directly → no `revalidatePath` refresh dance for toggles and CRUD
- Infinite All mode is native `useInfiniteQuery` → no faking append in server pagination

It adds complexity in **defined places**: transport adapter, query key design, mutation invalidation policy, and two pagination cache shapes. Net simpler for interactive dashboards; not simpler if the page is read-only.

**Revised vs Phase 1 conclusion:** Phase 1 suggested drawer-off-URL and TanStack only for detail/mutations. Hybrid kept drawer on URL and extended TanStack to list/options after hydration — because shallow transport removed the original reason to drop drawer params.

Detail: [`views/demo-hybrid-page/docs/reflections/hybrid-conclusion.md`](../../views/demo-hybrid-page/docs/reflections/hybrid-conclusion.md).

## Conclusion

**RSC owns cold load.** **TanStack owns everything that repeats after first paint.** **URL owns shareable intent** (list + drawer navigation). **Local client state owns transient UI** (confirm modals, toasts).

Backlog: [`views/demo-hybrid-page/docs/reflections/next-steps.md`](../../views/demo-hybrid-page/docs/reflections/next-steps.md) · [`views/demo-hybrid-page/docs/to-implement/`](../../views/demo-hybrid-page/docs/to-implement/).

**Previous:** [Phase 1 — Pure RSC](./phase-1-rsc.md) · **Next:** [Phase 3 — Client-first](./phase-3-client-first.md) (planned)
