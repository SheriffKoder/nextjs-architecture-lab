# demo-hybrid-cars

Rental car domain for the hybrid demo page (mock data + TanStack Query).

## Mutation transport

Mutations use **Route Handlers** under `/api/demo-hybrid-page/cars` (POST / PATCH / DELETE),
not Next server actions. Client `mutationFn`s live in `client/mutate-rental-cars.ts`;
hooks in `mutations/` own optimistic cache updates + `invalidateQueries` (no `revalidatePath`).

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/cars` | Create (persists to mock store) |
| PATCH | `/cars/:id` | Edit fields **or** `{ status }` activity toggle |
| DELETE | `/cars/:id` | Remove from mock store |

## Layer map

| Layer | Responsibility | Key files |
|-------|----------------|-----------|
| `model/` | Row + list query types | `rental-car-table-item.ts`, `rental-car-list-query.ts` |
| `schema/` | Zod create / edit contracts | `rental-car-form-schema.ts`, `rental-car-edit-form-schema.ts` |
| `transform/` | URL ↔ `RentalCarListQuery` | `build-rental-car-list-query.ts` |
| `repository/` | Mock seed + CRUD + filters | `data-source.ts`, `create|update|delete|patch-*-status.ts` |
| `server/` | Use-cases for API + prefetch | `get-rental-cars-data.ts`, `create|update|delete-rental-car.ts` |
| `client/` | Browser fetch wrappers | `fetch-*.ts`, `mutate-rental-cars.ts` |
| `cache/` | Keys + invalidate helpers | `rental-car-keys.ts`, `invalidate-rental-car-caches.ts` |
| `queries/` | Read hooks | `use-rental-cars.ts`, `use-infinite-rental-cars.ts`, `use-rental-car-detail.ts` |
| `mutations/` | Write hooks | `use-create|update|delete|toggle-*-activity.ts` |
| `hydration/` | RSC prefetch + dehydrate | `prefetch-rental-car-page.ts` |
| `providers/` | `QueryClientProvider` | `query-provider.tsx` |

Public entry: `@/entities/demo-hybrid-cars`.
