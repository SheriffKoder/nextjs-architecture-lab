# Filter System Introduction

## Phase 1: Filtering While Fetching Data

### Flow: Setting Params Based on Config

We have a filters bar that maps over the filters in the config to display `FilterRenderer`, which based on each filter's type will render a suitable filter.

Each filter calls `useUrlFilters`, which allows reading/writing params via `get` (for display) and `set` and `clear`.

### RSC: Server Pages

As `app/development/filters/page.tsx` is a server component, changes in the params trigger a server refresh, i.e., send new data if the backend/server function will process the new received params.

Uses the `filters/rsc` which will filter based on params.

**Important:** Make sure to await search params:

```typescript
const params = await searchParams
const tasks = await getMockTasks(params)
```

### Client Pages with TanStack Query

Page uses:

```typescript
const { getList, get } = useUrlFilters()
```

These will be the filters passed to the query hook. That simple.

```typescript
queryKey: employeeKeys.lists(filters)
```

`useEmployees` receives the filters object. Filters are included in the query key (via `key-factory.ts`). When the URL changes → filters change → query key changes → TanStack Query refetches and sends the params to the conditional API, and the API will handle the filtering returning data.

#### handler.ts - Real API Version

```typescript
export async function fetchEmployees(
  filters?: EmployeeFilters
): Promise<Employee[]> {
  // Build query string from filters
  const params = new URLSearchParams()
  if (filters?.status) {
    params.append('status', filters.status.join(','))
  }
  if (filters?.role) {
    params.append('role', filters.role)
  }
  
  // Conditional API route
  // API does the filtering on the backend
  const response = await fetch(`/api/employees?${params.toString()}`)
  return response.json() // ← Already filtered by API
}
```

#### /api/employees/route.ts

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')?.split(',')
  const role = searchParams.get('role')
  
  // Database query with WHERE clauses (filtering happens here)
  const employees = await db.employees.findMany({
    where: {
      status: status ? { in: status } : undefined,
      role: role || undefined,
    }
  })
  
  return NextResponse.json(employees) // ← Filtered by database
}
```

---

## Phase 2: Getting Unique Items

The filter bar on the frontend will wait for options. Options are called from a backend (Client) or server function (RSC). These will receive the filter configs, have access to data, and return unique items in an object with `totalCount`, `initialCount`, etc.

### RSC Page

```
getFilterOptionsServer > takes filter config/params
  passes to getFilterOptions configs, data, map etc.
    getFilterOptions > returns options
```

### Client Page

```
useFilterOptions on page calls the API
  API has access to data, imports the configs > returns options to page
```

### How to Setup Options

Create a config, pass data for each page to these places. `useFilterOptions` is dumb.

```typescript
const filters = await getFilterOptions({
  filterConfigs: employeeBaseFilters,
  dataSource: employees,
  fieldMap: employeeFieldMap,
})
```

So for each feature:
- **Client** → options API
- **Server** → `getFilterOptionsServer`
- **Filter Config**

---

## Search

Update the filter config for search config:

```typescript
<SearchBar config={employeeSearchConfig} />
```

- **RSC**: When filtering, look for `const searchQuery = parseSingle(searchParams, 'q')` to do filter upon
- **Client**: Add `q` to the filters

---

## Sorting

so the hook works on the components to read/write sorting params

- RSC in get-page-data should handle the sort, for now it sorts with parseSorts/applySorts utils
- Client: get sorts and pass to the filters > passed to the query hook useEmployees
add sort to the params appended while calling the API

The sorting feature uses `useUrlSorting` hook that works on components to read/write sorting params.

### RSC: Server Pages

In `get-page-data.ts`, sorting is handled using `parseSorts` and `applySorts` utils:

```typescript
import { parseSorts, applySorts } from "../../sorting-feature/utils"

// Apply sorting if sort parameter exists
const sortString = typeof searchParams.sort === 'string' ? searchParams.sort : ''
const sorts = parseSorts(sortString)

if (sorts.length > 0) {
  return applySorts(filtered, sorts)
}
```

The sort parameter format is: `sort=status:asc,department:desc` (comma-separated, order matters).

### Client: TanStack Query Pages

Get sorts from URL and pass to filters, which are then passed to the query hook:

```typescript
import { useUrlSorting } from "../sorting-feature/hooks/useUrlSorting"

const { getSorts } = useUrlSorting()
const sorts = getSorts()

const filters = {
  status: getList("status"),
  role: getList("role"),
  sort: sorts.length > 0 ? sorts : undefined, // Sort specifications
}

// Pass to query hook
const { data: employees } = useEmployees(filters)
```

The sort is added to the params appended while calling the API in `handler.ts`:

```typescript
// Add sort if provided (format: key:direction,key:direction)
if (filters?.sort && filters.sort.length > 0) {
  const sortString = filters.sort.map(s => `${s.key}:${s.direction}`).join(',')
  params.append("sort", sortString)
}
```

---

## Pagination

RSC, calls getPageData with params
Client does the same thing in API like the getPageData
both will parse pagination to return page/limit/filteredAndSorted.length
which gets current page/limit from url

the useUrlPagination gets back to UI
getters and setters for the params
where it also returns a calculate-pagination for first, last etc.

the parsePagination is used in both client (API) and server (function)

The pagination feature uses `useUrlPagination` hook that works on components to read/write pagination params (`page` and `limit`).

### RSC: Server Pages

In `get-page-data.ts`, pagination is handled using `parsePagination` utility:

```typescript
import { parsePagination } from "../../pagination-feature/utils"

// Parse pagination from search params
const params = new URLSearchParams(
  Object.entries(searchParams)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => [k, Array.isArray(v) ? v[0] : v as string])
)
const { page, limit } = parsePagination(params, 20)

// Calculate pagination slice
const startIndex = (page - 1) * limit
const endIndex = startIndex + limit
const paginatedEmployees = filteredAndSorted.slice(startIndex, endIndex)

return {
  employees: paginatedEmployees,
  pagination: {
    totalItems: filteredAndSorted.length,
    page,
    limit
  }
}
```

The pagination parameters format is: `?page=2&limit=20` (defaults: `page=1`, `limit=20`).

### Client: TanStack Query Pages

Get pagination from URL and pass to filters, which are then passed to the query hook:

```typescript
import { useUrlPagination } from "../pagination-feature/hooks"
import { employeePaginationConfig } from "./feature-config/employee-filter-config"

const { page, limit } = useUrlPagination(employeePaginationConfig)

const filters = {
  status: getList("status"),
  role: getList("role"),
  page, // Current page number
  limit, // Items per page
}

// Pass to query hook
const { data } = useEmployees(filters)
const employees = data?.employees
const pagination = data?.pagination
```

The pagination is added to the params appended while calling the API in `handler.ts`:

```typescript
// Add pagination params if provided
if (filters?.page) {
  params.append("page", filters.page.toString())
}
if (filters?.limit) {
  params.append("limit", filters.limit.toString())
}
```

The API route (`/api/filters/page-client/route.ts`) handles pagination and returns both employees and pagination metadata:

```typescript
import { parsePagination } from "@/app/development/filters/pagination-feature/utils"

const { page, limit } = parsePagination(searchParams, 20)

// Apply pagination
const startIndex = (page - 1) * limit
const endIndex = startIndex + limit
const paginatedEmployees = filteredAndSorted.slice(startIndex, endIndex)

return NextResponse.json({
  employees: paginatedEmployees,
  pagination: {
    totalItems: filteredAndSorted.length,
    page,
    limit
  }
})
```

### Components

Use `PaginationWrapper` component for complete pagination UI:

```typescript
import { PaginationWrapper } from "../pagination-feature/components"
import { employeePaginationConfig } from "./feature-config/employee-filter-config"

<PaginationWrapper
  totalItems={pagination.totalItems}
  config={employeePaginationConfig}
/>
```

The `PaginationWrapper` uses `useUrlPagination` hook internally and renders both `PaginationInfo` (showing "Showing 1-10 of 100") and `PaginationButtons` (page navigation).

---

## How filtering components work? do they have any logic?
= PillFilter
= dropdown-filter (HeaderFiltersWrapper) (buttons)
= search-bar
= single-key
= single-key (row or dropdown buttons)

How will they cause data to change?
- RSC, page uses data from server function, these buttons will re-fetch and re-run of the function
- in client, filters update params, the hook calls a conditional fetch function based on current params

How they receive data (options)?

