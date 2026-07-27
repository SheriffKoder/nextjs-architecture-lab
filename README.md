# Next.js Architecture Lab

A practical exploration of modern Next.js App router architecture:
RSC, Client boundaries, URL state, Suspense streaming,
server actions, TanStack integration, and feature-based design.

This repository documents practical architectural decisions around:

- Server Components (RSC)
- Suspense streaming
- URL-driven state
- Server Actions
- Drawer systems
- Server-side filtering & pagination
- TanStack Query hydration
- Client-side optimistic mutations
- Feature-based folder design

The goal is not to showcase a finished product.

The goal is to understand tradeoffs.

## Architectural Philosophy

Prefer server rendering when:

- data is mostly read-only
- URL should be source of truth
- SEO/shareability matters
- security is important

Introduce client systems when:

- UI interactions become highly local
- optimistic updates improve UX
- infinite scroll or drag/drop are needed
- avoiding unnecessary server navigations

## Project Layers

```text
app/ → views/ → entities/ → shared/
                 ↘ widgets/
platform/   # cross-cutting systems (URL kit, filters chrome)
```

| Layer | Role |
|---|---|
| **`app/`** | Next.js routing only — `page`, `layout`, `loading`, `error`. Thin shells that await/normalize `searchParams` and render a view. |
| **`views/`** | Route composition — page shell, Suspense islands, view-local config/UI/hooks. Assembles entities + widgets; no domain persistence. |
| **`entities/`** | Domain units — types, loaders, server actions, validation. Reusable across views. |
| **`widgets/`** | Composed reusable UI sections (multi-view table, side-nav, maps, score cards). |
| **`shared/`** | Cross-domain primitives — UI kit pieces, formatters, skeletons. No business rules. |
| **`platform/`** | Product-agnostic systems — e.g. `url-kit` (URL filters, pagination, url-drawer). Not a business feature. |
| **`components/`** | Low-level design-system / shadcn primitives used by `shared` and demos. |

**Rules of thumb**

- Views compose; entities own data; platform owns URL/state systems; shared stays dumb.
- Dependency never goes upward (`entities` must not import `views`).
- Reference shape for a list page: `views/demo-rsc-page/implementation-plan.md` and `views/demo-rsc-page/docs/filters-integration.md`.

## Evolution Roadmap

This repository evolves through architectural phases,
each introducing new tradeoffs and patterns.

The demo RSC docs under `views/demo-rsc-page/docs/` are the **learning curve** for Phase 1
(except `implementation-plan.md` / `filters-integration.md`, which are how-to references).

---

## Phase 1 — Pure RSC (current)

**Goal:** Understand how far server-first architecture can go — and where it stops feeling worth it.

### What we built

A server-first, scalable page architecture that:

- Uses URL as the source of truth
- Separates UI concerns (`params`) from data concerns (`query`)
- Supports progressive enhancement to TanStack (same list contract)
- Enables independent UI sections with Suspense streaming
- Keeps code modular, testable, and reusable

Primary demo: `views/demo-rsc-page` + `entities/cars-rsc` + `platform/url-kit`.

### Patterns explored

- URL-driven filters, sort, pagination (`params` → loaders)
- Params vs query (list contract for RSC and future TanStack)
- Suspense streaming islands (filters vs table + pagination)
- `useTransition` / `wrapNavigation` for non-blocking URL writes
- Data-only cache keys (UI params must not bust list/facet cache)
- URL-driven drawers (`url-drawer`: `drawer` / `mode` / `id` / `action`)
- Drawer detail by id (independent of list) + hover prefetch + `unstable_cache`
- Server Actions + Zod (create form, row status toggle)
- Client form UX (RHF) with server as source of truth
- Optimistic cell updates (`useOptimistic` → action → `revalidatePath` / `router.refresh`)
- Route-level + island loading/error boundaries

### Practiced points (what the docs worked through)

Learning-curve docs → `views/demo-rsc-page/docs/` (index: `docs/index.md`).

**Params → query → fetch** — [`architecture/3-query-vs-params.md`](views/demo-rsc-page/docs/architecture/3-query-vs-params.md)

- Convert `params` → `query` in one place (inside the list loader, not in `page.tsx`)
- Flow: `params` → sections → data-only cache key → `getCars` / `getFilters`
- `getCars`: `params` → `buildRentalCarListQuery` → `getRentalCarsData(query)`
- Facets (`getFilters`) stay on params; they do not need to “understand” the list query

**URL transitions without blocking the shell** — [`bottlenecks/4-rsc-bottleneck-url-transitions.md`](views/demo-rsc-page/docs/bottlenecks/4-rsc-bottleneck-url-transitions.md)

- Wrap the view in `NavigationTransitionRoot` (shared `useTransition` + `isNavigationPending`)
- Suspense islands by bottleneck — filters (facets) separate from table + pagination (list payload)
- Wrap every data-affecting URL write with `wrapNavigation` — never bare `router.replace`
- Dim the slow island with `NavigationPendingDimmer`

**Drawer open must not refetch the list** — [`bottlenecks/6-1-rsc-bottleneck-drawer-cache.md`](views/demo-rsc-page/docs/bottlenecks/6-1-rsc-bottleneck-drawer-cache.md)

- Classify URL keys: list/facet data vs UI chrome (`drawer`, `mode`, `id`, `view`, …)
- Cache identity from data-only params only

**Hover prefetch vs drawer open** — [`bottlenecks/6-2-rsc-bottleneck-by-id-prefetch.md`](views/demo-rsc-page/docs/bottlenecks/6-2-rsc-bottleneck-by-id-prefetch.md), [`ui/6-row-fetch.md`](views/demo-rsc-page/docs/ui/6-row-fetch.md)

- One by-id entry for prefetch and drawer (`getRentalCarByIdAction`)
- Cross-request cache by stable `id` (`unstable_cache`); React `cache()` alone is not enough across requests

**URL drawer system** — [`drawers/2-drawer-system.md`](views/demo-rsc-page/docs/drawers/2-drawer-system.md)

- Contract: `drawer` / `mode` / `id` / optional `action` (secondary UI)
- Type-safe parsing (Zod); shell client, body can stay RSC

**Drawer forms** — [`forms/5-server-forms.md`](views/demo-rsc-page/docs/forms/5-server-forms.md), [`forms/5-1-create-drawer.md`](views/demo-rsc-page/docs/forms/5-1-create-drawer.md)

- Layers: schema → action → URL open → shell → header/form — not one mega component
- Server Action owns truth; client Zod is optional UX
- Sticky Save via `form={formId}`; close via URL (`close()`)
- Revalidate on persist or RSC list islands stay stale
- Optimistic UI still needs a server refresh path at the end

**Optimistic cell mutation** — [`ui/8-cell-optimistic-server-action.md`](views/demo-rsc-page/docs/ui/8-cell-optimistic-server-action.md)

- Dumb cell → `columnActions` → `useOptimistic` → server action → toast + `router.refresh()` / revert

**Where RSC ends** — [`reflections/9-rsc-conclusion.md`](views/demo-rsc-page/docs/reflections/9-rsc-conclusion.md)

### Findings

RSC gives:

- great initial load
- clean architecture
- server as source of truth
- shareable URLs / secure defaults

RSC struggles with:

- interactive filtering UX (every change is a navigation)
- perceived latency on soft navigations
- multi-stream responsiveness when many URL writes compete

A client layer starts to earn its place for:

- filter / sort / pagination updates
- loading transitions that feel local
- mutations and detail queries that should not remount the page

👉 Phase 2: TanStack improves interactive UX while keeping the same list contract (`RentalCarListQuery` / `getRentalCarsData`).

### What felt comfortable

- URL as the single source of truth for shareable list state
- Thin `app/` + `views/` islands + `entities/` loaders
- Params vs query split (one builder, RSC and TanStack can share it)
- Suspense islands + pending dimmer for read-heavy dashboards
- url-drawer contract (Zod + `useDrawerActions`)
- Server Actions + Zod as the mutation boundary
- Layered create drawer (schema / action / shell / form)

### What felt unnecessary (or ready to drop / move)

- Pushing every interaction through URL navigation (drawers, dense filter clicks)
- Pure-RSC cleverness once UX needs optimistic multi-step flows
- Expecting React `cache()` alone to warm hover → open across requests
- Putting list `query` construction in `page.tsx` (belongs in the list loader)
- Treating facet loaders as if they must speak the list `query` type
- One mega drawer/form component instead of layered pieces

### Phase 1 conclusion

Keep RSC for initial list load and URL-driven read models.

Add a client layer when interactivity becomes the product — filters, transitions, detail queries, mutations — without throwing away the list contract already built for the server.

Detail: [`docs/reflections/9-rsc-conclusion.md`](views/demo-rsc-page/docs/reflections/9-rsc-conclusion.md).

---

## Phase 2 — Hybrid RSC + TanStack (planned)

**Implementation playbook:** [app/development/hybrid-migration/README.md](app/development/hybrid-migration/README.md) — phased steps, decisions (URL state, pagination), reference files per step.

Goal:
Keep server-first rendering while improving interactivity.

Patterns to explore:

- initialData hydration
- drawer detail queries
- client-side optimistic mutations
- client drawer state
- selective cache invalidation

Questions:

- Which state should remain in URL?
- Which state should move to client?
- Can hybrid reduce complexity?

---

## Phase 3 — Client-first interactive systems

Goal:
Support richer UX patterns.

Patterns:

- infinite queries
- drag & drop persistence
- local editing drafts
- complex optimistic updates

Tradeoff:

- more client complexity
- less server simplicity

---

## Phase 4 — Architecture comparison

Compare:

- Pure RSC
- Hybrid
- Client-first

Across:

- performance
- complexity
- UX
- maintainability
