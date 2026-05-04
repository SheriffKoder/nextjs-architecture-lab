# Demo RSC page — architecture cleanup

## Step 1 — Extract query builder (critical)

Today the TanStack demo client builds `RentalCarListQuery` in the client from URL hooks. For parity with RSC, that encoding must live in **one pure module** under this feature.

* **Implemented** — `features/demo-rsc-page/lib/build-rental-car-list-query.ts` — `buildRentalCarListQuery` + `rentalCarListQueryToSearchParams` (mirrors `demo-client-index.tsx` listQuery; used by `getRentalCarsPageData`).

* **Signature** — take the same shape Next passes after you `await searchParams` (not `URLSearchParams`):

```ts
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import type { RentalCarListQuery } from '@/features/demo-rsc-page/types/rental-car-list-query'

export function buildRentalCarListQuery(
  params: DemoRscPageSearchParams
): RentalCarListQuery {
  // mirror demo-client URL → listQuery mapping (status, make, ranges, sort, page, limit, …)
}
```

* **Use everywhere** — RSC loaders and any future client code call the same function so **RSC fetch === client fetch** for the same URL.

### Why it matters

Without a shared builder: RSC and client can disagree on filters → subtle bugs, harder debugging, painful future hybrid.

---

## Step 2 — Server fetch layer (payload aligned with `/page-client`)

Goal is **not** “TanStack inside RSC” for this route today — it is **the same DTO** as `GET /api/demo-client-page/page-client` (cars + pagination + same query object) so a later hybrid (RSC shell + TanStack hydration) is straightforward.

* **Implemented** — `features/demo-rsc-page/utils/server/get-rental-cars-page-data.ts` (`getRentalCarsPageData`).

* **Implement** `getRentalCarsPageData(params)` — **cars + pagination only** (wrapped in `react` `cache()`). Filter facets load in `FiltersSection` via `getFilterOptionsServer` (separate Suspense).

  * (Future) `const query = buildRentalCarListQuery(params)` before HTTP list fetch.
  * Return `{ carsPayload }` where `carsPayload` matches the handler response used by TanStack list queries.

* **Reuse** existing fetch helpers where they already match the API (`fetchRentalCars`, `fetchRentalCarFilterOptions` from demo-client-page, or thin wrappers that call the same routes).

---

## Step 3 — Suspense boundaries (filters / table / pagination)

**Implemented** — three async sections in `demo-rsc-index.tsx`:

* `FiltersSection` — `getFilterOptionsServer` only.
* `TableSection` / `PaginationSection` — both `await getRentalCarsPageData(params)`; **deduped** via `cache()` in `get-rental-cars-page-data.ts` so list work runs once per URL per request.

---

## Step 4 — `page.tsx` / param wiring (Next App Router)

* In `app/(root)/demo-rsc-page/page.tsx`, **`await searchParams`** (per your Next version) and pass the resolved object down.

* Type that object as **`DemoRscPageSearchParams`** (exported from `app/(root)/demo-rsc-page/page.tsx` next to `normalizeParams`) — do **not** assume `URLSearchParams` unless you explicitly convert.

```tsx
// page.tsx (sketch)
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<DemoRscPageSearchParams>
}) {
  const params = await searchParams
  return <DemoRscIndex params={params} />
}
```

* **`DemoRscIndex`** — sync shell + three `<Suspense>` regions (`filters-section.tsx`, `table-section.tsx`, `pagination-section.tsx`).

---

## Summary checklist

* [x] `getRentalCarsPageData` in `features/demo-rsc-page/utils/server/get-rental-cars-page-data.ts` (mock path; swap for HTTP when aligning with `/page-client`).
* [x] Split RSC sections + `cache()` on `getRentalCarsPageData` for table + pagination.
* [x] `buildRentalCarListQuery` / `rentalCarListQueryToSearchParams` — wired; swap mock `getRentalCarsData` for HTTP when aligning with `/page-client`.
* [x] **`DemoRscPageSearchParams`** on `page.tsx` + `demo-rsc-index.tsx` + section components.
