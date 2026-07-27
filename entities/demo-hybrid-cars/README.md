# demo-hybrid-cars

Rental car domain for the hybrid demo page (mock data + TanStack Query).

## Layer map

| Layer | Responsibility | Key files |
|-------|----------------|-----------|
| `model/` | Row + list query types | `rental-car-table-item.ts`, `rental-car-list-query.ts` |
| `transform/` | URL ↔ `RentalCarListQuery` | `build-rental-car-list-query.ts` |
| `repository/` | Mock seed + filter/sort helpers | `data-source.ts`, `filter-rental-cars.ts` |
| `server/` | Use-cases for API + prefetch | `get-rental-cars-data.ts`, `get-filter-options-server.ts` |
| `client/` | Browser fetch wrappers | `fetch-rental-cars.ts`, `fetch-filter-options.ts` |
| `cache/` | TanStack query keys | `rental-car-keys.ts` |
| `queries/` | Read hooks | `use-rental-cars.ts`, `use-rental-car-filter-options.ts` |
| `hydration/` | RSC prefetch + dehydrate | `prefetch-rental-car-page.ts` |
| `providers/` | `QueryClientProvider` | `query-provider.tsx` |

Public entry: `@/entities/demo-hybrid-cars`.
