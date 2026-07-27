# demo-hybrid-cars — responsibilities

| Layer | Files |
|-------|-------|
| `model/` | `rental-car-table-item.ts`, `rental-car-status.ts`, `rental-car-list-query.ts` |
| `transform/` | `build-rental-car-list-query.ts` |
| `lib/` | `rental-car-activity-status.ts` |
| `repository/` | `data-source.ts`, `filter-rental-cars.ts`, `filter-by-search.ts`, `get-filter-options.ts` |
| `server/` | `get-rental-cars-data.ts`, `get-filter-options-server.ts`, `get-rental-car-by-id.ts`, `simulate-server-delay.ts` |
| `client/` | `fetch-rental-cars.ts`, `fetch-rental-car-by-id.ts`, `fetch-filter-options.ts`, `build-rental-car-api-url.ts` |
| `cache/` | `rental-car-keys.ts` |
| `queries/` | `use-rental-cars.ts`, `use-rental-car-filter-options.ts`, `use-rental-car-detail.ts` |
| `hydration/` | `prefetch-rental-car-page.ts` |
| `providers/` | `query-provider.tsx` |

Mutations and infinite scroll layers are reserved for Phases 4–5.
