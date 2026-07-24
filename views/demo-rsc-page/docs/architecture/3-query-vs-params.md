📐 Params vs Query — Architecture Decision


🧠 Context
In this project, we deal with:

URL-driven state (filters, sorting, pagination)
Server Components (RSC)
Future integration with TanStack Query (client-side)
A reusable backend API layer

We needed a consistent way to:

Read user intent from the URL
Transform it into a backend-friendly format
Keep both RSC and client flows aligned


🧱 Final Architecture
URL params (source of truth)
        ↓
buildQuery(params)
        ↓
Data Fetcher (API layer)
        ↓
Backend (DB / external API)
🔑 Definitions
✅ Params (URL Layer)


type Params = Record<string, string | string[] | undefined>

Represents:

"What the user asked for"

Examples:

?status=active&make=toyota&page=2&sort=price_desc


✅ Query (Data Contract)
type RentalCarListQuery = {
  status?: string[]
  make?: string[]
  page?: number
  limit?: number
  sort?: { field: string; order: 'asc' | 'desc' }[]
}

Represents:

"How the backend understands the request"

///////////////////////////////////////////////////////////////
❌ Previous Approach (Problematic)
Flow
params → query → searchParams → fetch
Issues

1. 🔁 Conversion Loop
params → query → params again

👉 Redundant and confusing

2. 🧩 Mixed Responsibilities
UI layer handled query + params
API layer expected params again

👉 No clear boundary

3. 🔗 Component Coupling
<TableSection query={query} />

👉 Components depend on derived state instead of source of truth

4. 🚫 Harder TanStack Migration
Query logic scattered
No single reusable contract


✅ Current Approach (Clean)
Flow
params → query → fetch

///////////////////////////////////////////////////////////////

🧠 Responsibilities by Layer
1. UI Layer (RSC / Client)
const query = buildRentalCarListQuery(params)

✔ Reads URL
✔ Builds query
❌ Does NOT handle transport (URLSearchParams, fetch)

2. Data Layer (Fetcher)
const searchParams = queryToSearchParams(query)
fetch(`/api/cars?${searchParams}`)

✔ Converts query → transport format
✔ Calls API
❌ Does NOT know about UI or URL

3. Backend

✔ Parses request
✔ Executes DB query

///////////////////////////////////////////////////////////////


🔥 Benefits of Current Approach

1. 🧼 Clean Separation of Concerns
params = UI concern
query  = data contract
transport = API concern

2. 🔁 No More Conversion Loops
params → query → fetch

👉 Simple, predictable flow


3. 🧩 Decoupled Components
<TableSection params={params} />

👉 Each component derives what it needs
👉 No prop-drilling of query


4. 🚀 TanStack Ready
useQuery({
  queryKey: ['cars', query],
  queryFn: () => getRentalCarsData(query),
})

✔ Same query builder
✔ Same API function
✔ Zero rewrite

5. 🔄 Transport Agnostic
You can switch from:
GET /api/cars?status=active
to:
POST /api/cars
body: { status: "active" }

👉 Only change the fetcher layer

6. 🧠 Strong Backend Contract
Everything is typed around:
RentalCarListQuery
NOT:
string-based params ❌

7. 🧪 Easier Testing
You can test:
buildRentalCarListQuery(params)
and
getRentalCarsData(query)
independently

///////////////////////////////////////////////////////////////

⚖️ Tradeoffs
Tradeoff 1: Recomputing Query

Each component may do:

buildQuery(params)

✔ Acceptable (cheap operation)
✔ Better than shared mutable state

Tradeoff 2: Duplicate Fetch Calls in RSC

Multiple sections call:

getRentalCarsPageData(params)

✔ Handled by React cache() + fetch deduplication
✔ No real performance issue

Tradeoff 3: More Explicit Layers

You now maintain:

params
query
transport conversion

✔ Slightly more code
✔ Much better scalability


///////////////////////////////////////////////////////////////

🧠 Key Principles
1. Single Source of Truth
URL params drive everything
2. Derive, Don’t Pass
Build query where data is fetched
3. Isolate Transport Logic
Only API layer knows about URLSearchParams
4. Think in Contracts
query = stable contract between frontend and backend
🚀 Final Takeaway
We didn’t just “clean up params vs query”

We established a layered data architecture:

UI → Intent (params)
Data → Contract (query)
API → Transport
Backend → Execution

This is:
- correctly layered
- scalable
- ready for DSL filters
- ready for TanStack
- ready for performance optimization


👉 we can extend this into your Filter DSL system, so query becomes a full query language (AND/OR/groups) instead of simple key-value filters — and it will plug into this exact architecture cleanly.

👉 refactor your current getRentalCarsPageData + getFilterOptionsServer into a single “data kernel” architecture that eliminates duplication for calling filter server from filters and getRentalCarsPageData separately.