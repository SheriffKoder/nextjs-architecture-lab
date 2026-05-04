🧱 RSC Page Architecture — Data-Driven UI with URL State
🎯 Goal

Build a server-first, scalable page architecture that:

Uses URL as the source of truth
Separates UI concerns (params) from data concerns (query)
Supports progressive enhancement to TanStack (client-side)
Enables independent UI sections with Suspense streaming
Keeps code modular, testable, and reusable
🧠 Core Architectural Principles
1. URL is the Single Source of Truth

All state that affects data must live in the URL:

Filters, search, sorting, pagination → URL params
Why:
Shareable links
Back/forward navigation
Server re-fetching
SEO compatibility
2. Separate params from query
params → UI layer (raw URL shape)
query  → Data layer (typed, structured)
Example
// params (from Next.js)
{
  status: 'active',
  page: '2',
  sort: 'createdAt:desc'
}

// query (internal)
{
  status: ['active'],
  page: 2,
  sort: [{ key: 'createdAt', order: 'desc' }]
}
3. Normalize Params Once (Top-Level Only)
❌ Avoid
// inside components
const params = await searchParams
✅ Do
// page.tsx
const params = normalizeParams(searchParams)
Why:
✔ Prevent repeated parsing
✔ Ensure consistent types
✔ Simplify downstream components
✔ Enable testing
4. Query Builder Layer (Critical)

Convert params → query in a single place:

const query = buildRentalCarListQuery(params)
Responsibilities:
Type conversion (string → number)
Mapping URL keys → domain keys
Handling defaults
Structuring filters (ranges, lists, search, sorting)
Why this matters (beyond TanStack):
✔ Decouples backend from URL format
✔ Enables reuse across RSC + client
✔ Prevents UI-driven data logic leaks
✔ Makes backend contracts stable
🧩 Layered Architecture
[ URL (searchParams) ]
        ↓
[ normalizeParams ]
        ↓
[ Query Builder ]
        ↓
[ RSC Layout / Sections ]
        ↓
[ Server Data Functions ]
🧱 Component Structure
Page Entry
page.tsx
  → normalize params
  → build query
  → render layout
Layout Structure
PageHeader
ActionButtons

<Suspense>
  <FiltersSection />
</Suspense>

<Suspense>
  <TableSection />
</Suspense>

<Suspense>
  <PaginationSection />
</Suspense>
🔀 Params vs Query — Final Decision
FiltersSection → uses params
<FiltersSection params={params} />
Why:
Existing system built on URL shape
Faceting helpers depend on flat params
UI-driven logic (not data-driven)
Table / Pagination → use query
<TableSection query={query} />
<PaginationSection query={query} />
Why:
Typed and structured
Matches backend expectations
Aligns with future TanStack usage
🧠 Key Insight
Filters = UI system (URL-driven)
Table   = Data system (query-driven)

👉 They are intentionally decoupled

🧠 Server Data Layer Design
Single Source of Truth
getRentalCarsPageData(query)
Rules:
✔ One function per entity/page
✔ Accepts query (NOT params)
✔ Returns structured payload
✔ Used by ALL sections
⚠️ Avoid
/getCars
/getPagination
/getFilters

👉 Leads to fragmentation and inconsistency

⚡ RSC Data Fetching Strategy
Distributed Fetching (Recommended)

Each section calls the same server function:

const { carsPayload } = await getRentalCarsPageData(query)
Why this works:
✔ Next.js deduplicates identical requests
✔ Enables independent Suspense boundaries
✔ Keeps components decoupled
✔ Supports partial client migration
⏳ Suspense Strategy

Each section wrapped independently:

<Suspense fallback={<FiltersLoading />}>
  <FiltersSection />
</Suspense>
Benefits:
✔ Streaming UI
✔ Better perceived performance
✔ Independent loading states
✔ Future-ready for partial hydration
Optional Optimization

Group dependent sections:

<Suspense fallback={<TableLoading />}>
  <Table + Pagination />
</Suspense>
📁 Folder Structure
features/
  rental-cars/
    index.tsx                # page layout

    sections/
      filters-section.tsx
      table-section.tsx
      pagination-section.tsx

    components/
      demo-rsc-content.tsx
      filters-header.tsx

    utils/
      ui/
        normalize-params.ts
        build-query.ts

      server/
        get-rental-cars-page-data.ts

    types/
      rental-car-list-query.ts
🧠 Key Design Decisions
1. Normalize Early
Never pass raw searchParams deep into the tree
2. Query is the Contract
Everything data-related uses query
3. Params Stay in UI Layer
Only filters (and URL logic) use params
4. One Query Builder
No duplicated transformation logic
5. One Server Data Function
Centralized data access per entity
6. Sections Are Independent
Each section owns its data dependency
🚀 Ready for TanStack Upgrade

This architecture allows seamless transition:

RSC TableSection → ClientTable (useQuery)
Example Migration
// before
<TableSection query={query} />

// after
<HydrationBoundary>
  <ClientTable query={query} />
</HydrationBoundary>
Why it works:
✔ Same query object
✔ Same data contract
✔ No refactor needed
⚠️ Anti-Patterns Avoided
❌ Passing params everywhere
❌ Mixing UI logic with data logic
❌ Multiple API endpoints per section
❌ Rebuilding query in multiple places
❌ Tight coupling between filters and backend
🧠 Final Mental Model
URL → UI State
Query → Data State
RSC → Execution Engine
🔚 Summary

This architecture gives you:

✔ Clean separation of concerns
✔ Strong typing and consistency
✔ Scalable page structure
✔ Independent UI sections
✔ Smooth client upgrade path
✔ Maintainable codebase

If you want next step, we can extend this into: