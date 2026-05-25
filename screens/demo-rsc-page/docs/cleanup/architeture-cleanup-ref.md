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

////////////////////////////////////////////////////////////////////
✅ How RSC Actually Works (Important)

In Next.js App Router:

Same request + same function + same params
= automatically deduped ✅

So this:

await getRentalCarsPageData(params)

called in:

TableSection
PaginationSection

👉 will NOT trigger two backend calls (if implemented correctly)

⚠️ BUT — Only If You Do This Right
Your server function must be cacheable
export async function getRentalCarsPageData(params) {
  // ❌ BAD
  // random logic / non-deterministic / no caching

  // ✅ GOOD
  return await fetch(..., {
    cache: 'force-cache' // or default in RSC
  })
}

OR if using DB (Supabase etc.):

👉 Next.js still dedupes within the same request

✅ So Yes, You can safely do:
// TableSection
const { carsPayload } = await getRentalCarsPageData(params)

// PaginationSection
const { carsPayload } = await getRentalCarsPageData(params)

👉 and it behaves like:

ONE fetch
MULTIPLE consumers
🧠 Why I Suggested Splitting

Not for performance.

👉 For architecture flexibility.

////////////////////////////////////////////////////////////////

lib/build-rental-car-list-query.ts
features/demo-rsc-page/lib/… is already a good fit: it’s pure, reusable logic (URL → list query, query → flat params), not a React component and not a route file.

features/demo-rsc-page/utils/domain is less ideal as a name because:

utils often becomes a junk drawer.
domain usually means types + rules + invariants, not “misc helpers.”