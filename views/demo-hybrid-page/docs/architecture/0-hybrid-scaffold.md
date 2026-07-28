# Step 0 — Hybrid scaffold

## What this step introduced

- Self-contained `demo-hybrid-page` route + `entities/demo-hybrid-cars` entity stack.
- Thin `app/` shell: `searchParams` → `buildRentalCarListQuery` → `prefetchRentalCarPage` → `HydrationBoundary`.
- Entity layers: `model/`, `repository/`, `server/`, `transform/`, `cache/`, `client/`, `queries/`, `hydration/`, `providers/`.
- API routes: `GET /api/demo-hybrid-page/cars`, `cars/[id]`, `options`.
- Client shell showing hydrated list + facet counts.

No runtime imports from `demo-rsc-page`, `demo-client-page`, or `entities/cars-rsc`.

## What bottleneck it fixed

- **Dependency on RSC runtime pieces for interactive iteration.** The hybrid page could evolve independently without coupling to the pure-RSC demo's server actions, cache keys, or view internals.
- **No clear ownership split between server cold-load and client interaction.** This step established: RSC prefetches and dehydrates; TanStack owns reads/writes after hydration.

## Findings during implementation

- Copying reference shapes from RSC/client demos, then renaming and evolving, is safer than importing at runtime — old demos can be deleted later without breaking hybrid.
- Layering early (`repository → server → client/queries/mutations`) prevents later coupling and makes each phase additive rather than retrofit.
- Shared platform chrome (`@/platform/url-kit/*`) stays shared; only the entity and view are self-contained.

## Fixes applied during the step

- Explicit entity README documenting layer responsibilities.
- Hydration keys built on the server so client `queryKey` matches RSC prefetch on first paint.

## Trade-offs and remaining edges

- Placeholder UI until list/filter chrome landed in Step 2.
- Mock repository shared by GET and future mutation routes — acceptable for demo; real DB would swap repository only.

Cross-phase shifts: [rsc-to-hybrid-shifts.md](./rsc-to-hybrid-shifts.md).
