Step 1 — Extract Query Builder (CRITICAL)
Right now you build this in client:
const listQuery: RentalCarListQuery = { ... }
👉 This MUST move to a shared layer.

Create:
features/demo-rsc-page/lib/buildListQuery.ts
export function buildRentalCarListQuery(params: URLSearchParams): RentalCarListQuery {
  // same logic you wrote in client
}

///
Then:
In RSC:
const query = buildRentalCarListQuery(params)
In Client:
const query = buildRentalCarListQuery(searchParams)
⚠️ Why This Matters

Without this:

RSC fetch ≠ Client fetch ❌

→ hydration issues
→ inconsistent filters
→ bugs that are hard to trace
///

✅ Step 2 — RSC Must Return TanStack-Ready Shape
{
  cars,
  pagination
}

Create Server Fetch Layer
features/rental-cars/server/getRentalCarsPageData.ts
export async function getRentalCarsPageData(params: URLSearchParams) {
  const query = buildRentalCarListQuery(params)

  const [carsPayload, filters] = await Promise.all([
    fetchRentalCars(query),
    fetchRentalCarFilterOptions(query),
  ])

  return {
    carsPayload,
    filters,
  }
}


✅ Step 3 — RSC Structure (TanStack-ready)

Now your RSC becomes:

page.tsx
export default async function Page({ searchParams }) {
  const params = normalizeParams(searchParams)

  return <DemoRscIndex params={params} />
}
index.tsx
export default function DemoRscIndex({ params }) {
  return (
    <>
      <PageHeader />

      <ActionButtons />

      <Suspense fallback={<FiltersLoading />}>
        <FiltersSection params={params} />
      </Suspense>

      <Suspense fallback={<TableLoading />}>
        <TableSection params={params} />
      </Suspense>

      <Suspense fallback={<PaginationLoading />}>
        <PaginationSection params={params} />
      </Suspense>
    </>
  )
}


✅ Step 4 — Sections Return RAW Data (Not UI Logic)
TableSection.tsx
export default async function TableSection({ params }) {
  const { carsPayload } = await getRentalCarsPageData(params)

  return (
    <DemoRscContent
      cars={carsPayload.cars}
    />
  )
}
FiltersSection.tsx
export default async function FiltersSection({ params }) {
  const { filters } = await getRentalCarsPageData(params)

  return <FiltersHeader filters={filters} ... />
}
PaginationSection.tsx
export default async function PaginationSection({ params }) {
  const { carsPayload } = await getRentalCarsPageData(params)

  return (
    <PaginationFooter
      totalItems={carsPayload.pagination.totalItems}
    />
  )
}
