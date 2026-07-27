# Major shifts — RSC demo → hybrid

Cross-cutting decisions and learnings from Phases 0–5. Phase-by-phase how-tos live in sibling docs; migration playbook and full ADRs live under `app/development/hybrid-migration/`.

This page answers: **what changed architecturally vs pure RSC, and why we chose it.**

---

## 1. Who owns interactive data?

| | Pure RSC (`demo-rsc-page`) | Hybrid (`demo-hybrid-page`) |
|--|---------------------------|-----------------------------|
| First paint | Server loaders + Suspense | Same idea: RSC **prefetch + dehydrate** into TanStack |
| After first paint | Every filter/sort/page/drawer URL write can remount the RSC tree | Client owns reads/writes via TanStack; URL updates are **shallow** |
| List/facet cache | `unstable_cache` / request identity | TanStack `queryKey` (`list` / `options` / `detail` / `infinite`) |
| Mutations | Server actions + `revalidatePath` / `router.refresh` | Route Handlers + optimistic `setQueryData` / `invalidateQueries` |

**Shift:** RSC is cold-load + hydration only. Interactive truth is the client cache, not a refreshed server tree.

---

## 2. Self-contained copy (no runtime RSC imports)

Hybrid copies reference shapes from RSC/client demos, then evolves independently.

- No runtime imports from `demo-rsc-page`, `demo-client-page`, or `entities/cars-rsc`.
- Shared platform chrome stays `@/platform/url-kit/*` (one kit).
- Entity lives in `entities/demo-hybrid-cars/` with explicit layers: `repository/` → `server/` → `client/` / `queries` / `mutations`.

**Why layers:** repository = mock persistence; server = use-cases for API + prefetch; client = browser transport; mutations = TanStack write + cache policy. Same stack as reads — not “three CRUD folders for fun.”

See: [0-hybrid-scaffold.md](./0-hybrid-scaffold.md), `entities/demo-hybrid-cars/README.md`.

---

## 3. URL writes — shallow transport, not `router.replace`

**RSC bottleneck:** list state in `searchParams` + `router.replace` → soft navigation → RSC remount → pending dimmer workarounds.

**Hybrid path:**

1. Phase 2 — page-local shallow list params (learning prototype).
2. Phase 2.5+ — unified **`platform/url-kit/url-params/`**: router adapter (RSC fallback) vs shallow adapter (`ShallowUrlProvider` on hybrid). Same chrome hooks; provider picks transport.
3. nuqs deferred — reserved adapter slot only ([url-state.md](../../../../app/development/hybrid-migration/decisions/url-state.md), [url-kit-transport.md](../../../../app/development/hybrid-migration/decisions/url-kit-transport.md)).

**Learning:** Shareable URL ≠ App Router navigation. Shallow commit keeps the address bar; TanStack keys trigger fetch.

See: [2-shallow-url-and-queries.md](./2-shallow-url-and-queries.md), [2.5-url-kit-transport-and-sections.md](./2.5-url-kit-transport-and-sections.md), [2.6-url-kit-chrome-transport.md](./2.6-url-kit-chrome-transport.md).

---

## 4. URL keys — data vs UI-only

| Category | Examples | Triggers list/options fetch? |
|----------|----------|------------------------------|
| List data | `page`, `limit`, `sort`, `q`, filters | Yes — part of `RentalCarListQuery` |
| View chrome | `view`, `groupBy`, … | Only if view mode changes data path (paginated / infinite / showAll) |
| Drawer | `drawer`, `mode`, `id` | No list refetch — detail query only |
| Confirm | `action=delete` (today) | No — Phase 6 moves off URL |

Hybrid never needed a separate `demoRscDataParamsToCacheKey` for list: TanStack keys are built from the typed list query, which already omits UI-only params.

---

## 5. Detail — client cache, not server `unstable_cache`

**RSC:** `unstable_cache` / server action by id warms the **server**. Hover → open on the client still paid a round-trip unless the payload was already client-side.

**Hybrid:**

- Hover / row enter → seed or prefetch `rentalCarKeys.detail(id)`.
- Prefer **list (or infinite) row in cache** → `initialData` / seed; **fetch only on miss**.
- Drawer view body subscribes to the same detail key.

**Learning:** Prefetch and open must share one client key. Server cache alone does not make drawer open instant on the client.

See: [1-detail-prefetch.md](../ui/1-detail-prefetch.md).

---

## 6. Drawer — keep URL open state (not Zustand)

Early hybrid draft considered Zustand-only drawer open/mode/id to avoid RSC remount cost. That cost is already gone on hybrid (shallow URL + UI-only keys).

**Chosen:** same URL contract as RSC (`drawer`, `mode`, `id`); body is client + TanStack. Confirm dialogs are ephemeral (Phase 6 off URL).

**Learning:** Instant drawer = shallow URL + warm detail cache — not “strip drawer from the URL.” Record drawers are shareable navigation state.

See: [drawer-url-state.md](../../../../app/development/hybrid-migration/decisions/drawer-url-state.md), [3-url-drawer-client-content.md](../drawers/3-url-drawer-client-content.md).

---

## 7. Mutations — Route Handlers + cache, not `revalidatePath`

| | RSC | Hybrid |
|--|-----|--------|
| Transport | Server actions | `POST` / `PATCH` / `DELETE` under `/api/demo-hybrid-page/cars` |
| UI update | `revalidatePath` + refresh | Optimistic `setQueryData` + `invalidateQueries` |
| Activity toggle | Often `useOptimistic` + refresh | `useToggleRentalCarActivity` patches list + detail |

Invalidate **both** `lists()` and `infinites()` so Phase 5 scroll views stay coherent.

See: [4-optimistic-mutations.md](../ui/4-optimistic-mutations.md).

---

## 8. Pagination — two TanStack products, one offset API

Same GET handler (`page` + `limit`). Different cache shapes:

| Product | Hook | Key | UX |
|---------|------|-----|-----|
| Footer pages | `useQuery` | `list({ …, page })` | Jump to page N |
| Infinite | `useInfiniteQuery` | `infinite({ …, page: undefined })` | Append via `pageParam` |
| Board views | `useQuery` + `showAll` | `list({ …, showAll })` | Full filtered set |

**Not a TanStack mandate to have two caches** — a **shape + UX** choice:

- Page-keyed `useQuery` **replaces** the page entry; it does not append. Faking infinite in React state reinvents `useInfiniteQuery` outside the cache.
- Infinite-only as the main list **can** work, but “go to page 7” becomes sequential fetch, holes in `pages`, or a reset — footer wants **random access**; infinite wants **sequential append**.

**Chosen:** keep `list` / `infinite` separate. Paths:

| Condition | Path |
|-----------|------|
| `table` / `list` / `cards` | Paginated `useRentalCars` + footer |
| `all=1` on those views | `useInfiniteRentalCars` + load-more (`automatic` \| `button`) |
| Board views | `showAll` full fetch (not infinite) |

**Bridge (Phase 5):** each infinite page success also `setQueryData` into `list({ …, page })` so exiting All / jumping pages can reuse work. Reverse (list → rebuild `InfiniteData`) stays out of scope.

Full findings: [pagination.md](../../../../app/development/hybrid-migration/decisions/pagination.md). Plan: [phase-5-infinite-scroll.md](../../../../app/development/hybrid-migration/phase-5-infinite-scroll.md).

---

## 9. Pending UI — fetch dimmer, not navigation dimmer

| RSC | Hybrid |
|-----|--------|
| `NavigationPendingDimmer` around `router.replace` transitions | `FetchPendingDimmer` when TanStack `isFetching` + placeholder previous data |

Same visual idea (delayed dim); different signal (client fetch vs navigation pending).

---

## 10. What we deliberately did *not* change

- URL as source of truth for **list filters** and **drawer open state**.
- Offset pagination for v1 (cursor = later DB-scale upgrade).
- One `platform/url-kit` chrome surface for RSC and hybrid.
- Mock repository shared by GET and mutation routes (creates survive invalidate).

---

## Decision index

| Topic | Doc |
|-------|-----|
| Shallow URL vs nuqs (v1) | [url-state.md](../../../../app/development/hybrid-migration/decisions/url-state.md) |
| `url-params` transport | [url-kit-transport.md](../../../../app/development/hybrid-migration/decisions/url-kit-transport.md) |
| Drawer stays on URL | [drawer-url-state.md](../../../../app/development/hybrid-migration/decisions/drawer-url-state.md) |
| List vs infinite cache | [pagination.md](../../../../app/development/hybrid-migration/decisions/pagination.md) |
