# Demo RSC page — architecture cleanup

## Step 1 — Extract query builder (critical)

Today the TanStack demo client builds `RentalCarListQuery` in the client from URL hooks. For parity with RSC, that encoding must live in **one pure module** under this feature.

* **Scaffold** `features/demo-rsc-page/lib/build-rental-car-list-query.ts` — implementation is **commented out** until RSC uses the same `RentalCarListQuery` + `/page-client` path as TanStack; see file header NOTE.

* **Signature** — take the same shape Next passes after you `await searchParams` (not `URLSearchParams`):

```ts
import type { DemoRscPageSearchParams } from '@/features/demo-rsc-page/utils/ui/demo-rsc-page-url'
import type { RentalCarListQuery } from '@/features/demo-client-page/tanstack'

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

* **Implement** `getRentalCarsPageData(params: DemoRscPageSearchParams)`:

  * `const query = buildRentalCarListQuery(params)`
  * `Promise.all` — list + filter options (same pairing as the client page).
  * Return `{ carsPayload, filters }` where `carsPayload` matches the handler response used by TanStack list queries.

* **Reuse** existing fetch helpers where they already match the API (`fetchRentalCars`, `fetchRentalCarFilterOptions` from demo-client-page, or thin wrappers that call the same routes).

---

## Step 3 — Single parent async: fetch once, pass down

Avoid calling `getRentalCarsPageData` inside **three** separate `Suspense` children (filters / table / pagination) — that repeats work unless every path is wrapped in `react` `cache()` with identical args.

**Preferred pattern:** one async RSC parent awaits `getRentalCarsPageData` once, then passes props to presentational children (client or server).

**Implemented** — `features/demo-rsc-page/components/demo-rsc-data-shell.tsx`: awaits `searchParams`, calls `getRentalCarsPageData` once, renders `FiltersHeader` + `DemoRscContent` + `PaginationFooter`.

* **Optional** — wrap only `<DemoRscDataShell searchParams={…} />` in one `<Suspense fallback={…}>` so the shell streams as a unit; split inner fallbacks only if you introduce secondary async work.

* **Naming** — `DataSection` is fine as an alias; you can also **use `DemoRscContent` directly** in this shell once data is lifted (no extra wrapper required).

---

## Step 4 — `page.tsx` / param wiring (Next App Router)

* In `app/(root)/demo-rsc-page/page.tsx`, **`await searchParams`** (per your Next version) and pass the resolved object down.

* Type that object as **`DemoRscPageSearchParams`** (or a dedicated `NormalizedSearchParams` alias in `utils/ui/demo-rsc-page-url.ts`) — do **not** assume `URLSearchParams` unless you explicitly convert.

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

* **`DemoRscIndex`** — sync shell + `<Suspense><DemoRscDataShell searchParams={searchParams} /></Suspense>` (`features/demo-rsc-page/demo-rsc-index.tsx`).

---

## Summary checklist

* [x] `getRentalCarsPageData` in `features/demo-rsc-page/utils/server/get-rental-cars-page-data.ts` (mock path; swap for HTTP when aligning with `/page-client`).
* [x] Single async parent `DemoRscDataShell` awaits `getRentalCarsPageData` once.
* [ ] `buildRentalCarListQuery` — uncomment `lib/build-rental-car-list-query.ts` when wiring TanStack/API parity.
* [x] **`DemoRscPageSearchParams`** on `page.tsx` + `demo-rsc-index.tsx` + data shell.
