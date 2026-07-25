# 📐 Params vs Query — Architecture Decision

## 🧠 Context

In this project, we deal with:

- URL-driven state (filters, sorting, pagination)
- Server Components (RSC)
- Future integration with TanStack Query (client-side)
- A reusable backend API layer

We needed a consistent way to:

- Read user intent from the URL
- Transform it into a backend-friendly format
- Keep both RSC and client flows aligned

## 🧱 Final Architecture

```text
URL params (source of truth)
        ↓
normalizeParams (page.tsx)
        ↓
RSC sections (params)
        ↓
data-only cache key
        ↓
getFilters(params)  |  getCars → buildRentalCarListQuery → getRentalCarsData(query)
```

## 🔑 Definitions

### ✅ Params (URL Layer)

```ts
type Params = Record<string, string | string[] | undefined>
```

Represents:

"What the user asked for"

Examples:

```text
?status=active&make=toyota&page=2&sort=price_desc
```

### ✅ Query (Data Contract)

```ts
type RentalCarListQuery = {
  status?: string[]
  make?: string[]
  page?: number
  limit?: number
  sort?: { field: string; order: 'asc' | 'desc' }[]
}
```

Represents:

"How the backend understands the request"

👉 Used for the **list** path. Facets (`getFilters` / `getFilterOptionsServer`) still operate on params.

---

## ❌ Previous Approach (Problematic)

### Flow

```text
params → query → searchParams → fetch
```

### Issues

#### 1. 🔁 Conversion Loop

```text
params → query → params again
```

👉 Redundant and confusing

#### 2. 🧩 Mixed Responsibilities

- UI layer handled query + params
- API layer expected params again

👉 No clear boundary

#### 3. 🔗 Component Coupling

```tsx
<TableSection query={query} />
```

👉 Components depend on derived state instead of source of truth

#### 4. 🚫 Harder TanStack Migration

- Query logic scattered
- No single reusable contract

## ✅ Current Approach (Clean)

### Flow

```text
params → sections → cache key → getCars / getFilters
getCars: params → buildRentalCarListQuery → getRentalCarsData(query)
```

---

## 🧠 Responsibilities by Layer

### 1. UI Layer (RSC / Client)

```tsx
<FiltersSection params={params} />
<TableAndPaginationSection params={params} />
```

- ✔ Reads URL (via normalized params from `page.tsx`)
- ✔ Passes params into sections
- ❌ Does NOT build query at the page/layout layer
- ❌ Does NOT handle transport

### 2. Cached loaders (entity layer)

```ts
// facets — params stay params
getFilters(dataParamsKey) → getFilterOptionsServer(baseFilters, params)

// list — params → query → data
getCars(dataParamsKey) → buildRentalCarListQuery(params) → getRentalCarsData(query)
```

- ✔ Owns params → query conversion for the list
- ✔ Owns caching / data-only cache keys
- ❌ Does NOT know about drawer chrome or layout UI

### 3. Data contract (`getRentalCarsData`)

```ts
getRentalCarsData(query: RentalCarListQuery)
```

- ✔ Accepts the typed query contract
- ✔ May convert query → flat params internally for filter/sort helpers
- ❌ Does NOT know about UI or URL chrome

### 4. Backend / simulate layer

- ✔ Parses request shape (or mock pipeline)
- ✔ Executes filter / sort / paginate

---

## 🔥 Benefits of Current Approach

### 1. 🧼 Clean Separation of Concerns

```text
params     = UI / URL concern (section surface)
query      = list data contract (inside getCars)
facets     = params-driven (getFilters)
transport  = internal to data helpers when needed
```

### 2. 🔁 No More Conversion Loops at the UI Layer

```text
params → getCars → query → getRentalCarsData
```

👉 Simple, predictable flow for the list

### 3. 🧩 Decoupled Components

```tsx
<TableAndPaginationSection params={params} />
```

👉 Each section derives what it needs

👉 No prop-drilling of query

### 4. 🚀 TanStack Ready

```ts
useQuery({
  queryKey: ['cars', query],
  queryFn: () => getRentalCarsData(query),
})
```

- ✔ Same query builder
- ✔ Same API function
- ✔ Zero rewrite of the list contract

### 5. 🔄 Transport Agnostic

Switch from:

```text
GET /api/cars?status=active
```

to:

```text
POST /api/cars
body: { status: "active" }
```

👉 Only change how the list is transported; `RentalCarListQuery` stays stable

### 6. 🧠 Strong List Contract

List data is typed around:

`RentalCarListQuery`

NOT:

string-based params at the list boundary ❌

### 7. 🧪 Easier Testing

Test:

`buildRentalCarListQuery(params)`

and

`getRentalCarsData(query)`

independently

---

## ⚖️ Tradeoffs

### Tradeoff 1: Query Built in the Loader

Query is built inside `getCars`, not recomputed in every section:

```ts
buildRentalCarListQuery(params)
```

- ✔ Single conversion point for the list
- ✔ Sections stay on the source of truth (params)

### Tradeoff 2: Duplicate Loader Calls in RSC

Multiple sections may call:

```ts
getFilters(dataKey)
getCars(dataKey)
```

- ✔ Handled by shared data-only cache keys + `unstable_cache` / dedupe
- ✔ No real performance issue when the data key matches

### Tradeoff 3: More Explicit Layers

This maintains:

- params (section surface)
- data-only cache key
- query (list contract)
- optional internal transport conversion

- ✔ Slightly more code
- ✔ Much better scalability

---

## 🧠 Key Principles

### 1. Single Source of Truth

URL params drive everything

### 2. Derive, Don’t Pass

Build query where list data is fetched (`getCars`), not in the page tree

### 3. Isolate Transport Logic

Only the data layer converts query ↔ flat params when helpers need that shape

### 4. Think in Contracts

query = stable contract between list consumers and `getRentalCarsData`

## 🚀 Final Takeaway

We didn’t just “clean up params vs query”

We established a layered data architecture:

```text
UI → Intent (params)
Loaders → Facets (params) | List (query)
Data → Contract (getRentalCarsData)
Backend → Execution
```

This is:

- correctly layered
- scalable
- ready for DSL filters
- ready for TanStack
- ready for performance optimization

👉 This can extend into a Filter DSL system, so query becomes a full query language (AND/OR/groups) instead of simple key-value filters — and it will plug into this exact architecture cleanly.

👉 Facets and list stay on separate loaders (`getFilters` + `getCars`) with a shared data-only cache key so drawer/UI chrome does not split cache identity.

---

## Key Learnings

- **Params ≠ query** — Params are URL intent (“what the user asked for”). Query is the typed list contract (“how the backend understands the request”).
- **URL is the source of truth** — Drive UI and data from params; don’t pass derived query around as shared state.
- **One-way list flow** — `params → getCars → buildRentalCarListQuery → getRentalCarsData`. Avoid UI-level conversion loops.
- **Layers own one job** — Sections pass params; `getCars` builds query; `getRentalCarsData` owns the list contract; facets stay on params.
- **Same contract for RSC and TanStack** — One `buildRentalCarListQuery` + one `getRentalCarsData` works for both; no rewrite when moving client-side.
- **Shared cache key is fine** — Duplicate `getFilters` / `getCars` calls across sections are fine when keyed by data-only params; explicit layers cost a bit more code but scale better.
