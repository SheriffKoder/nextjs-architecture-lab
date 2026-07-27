# Phase 0 — Hybrid scaffold (implemented)

Self-contained `demo-hybrid-page` + `demo-hybrid-cars` with:

- Thin `app/` route: `searchParams` → `buildRentalCarListQuery` → `prefetchRentalCarPage` → `HydrationBoundary`
- Entity layers: `model/`, `repository/`, `server/`, `transform/`, `cache/`, `client/`, `queries/`, `hydration/`, `providers/`
- API routes: `GET /api/demo-hybrid-page/cars`, `cars/[id]`, `options`
- Client shell shows hydrated list + facet counts (placeholder UI until Phase 2)

No runtime imports from `demo-rsc-page`, `demo-client-page`, or `entities/cars-rsc`.
