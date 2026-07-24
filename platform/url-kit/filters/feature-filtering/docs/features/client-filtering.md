# Client Filtering with TanStack Query

Same URL params filter system to work with client pages that use TanStack Query. The good news: it works very well if you follow one rule.

**URL params must become part of the query key.**

That's the core idea.

Let's walk through the correct architecture.

## Flow for Client Pages Using TanStack

For a client page:

```
URL params
   ↓
useUrlFilters()
   ↓
build filters object
   ↓
pass filters to TanStack query
   ↓
filters become part of queryKey
   ↓
TanStack automatically refetches
```

So changing the URL automatically triggers refetch.

## Example Page

**Example page:**

```
/users?status=active&role=admin
```

**Page Component:**

```tsx
'use client'

const { getList, get } = useUrlFilters()

const filters = {
  status: getList('status'),
  role: get('role')
}

const { data, isLoading } = useUsers(filters)
```

Now the query depends on filters.

## TanStack Query Hook

```typescript
export function useUsers(filters: UsersFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters)
  })
}
```

This is the key line:

```typescript
queryKey: ['users', filters]
```

When filters change:

```typescript
['users', { status: ['active'] }]
```

→ TanStack refetches automatically.

## API Request

Your fetch function:

```typescript
async function fetchUsers(filters: UsersFilters) {
  const params = new URLSearchParams()

  if (filters.status?.length) {
    params.set('status', filters.status.join(','))
  }

  if (filters.role) {
    params.set('role', filters.role)
  }

  const res = await fetch(`/api/users?${params.toString()}`)

  return res.json()
}
```

Your backend already knows how to parse this.

## Why This Works Well

Because:

- **URL = single source of truth**

Not React state.

**Benefits:**

- Shareable URLs
- Refresh safe
- Back button works
- TanStack cache works

## Important Optimization

Never pass the raw filters object directly.

**Bad:**

```typescript
queryKey: ['users', filters]
```

If filters object changes reference each render, it refetches unnecessarily.

**Better:**

```typescript
queryKey: ['users', JSON.stringify(filters)]
```

Or build stable object:

```typescript
queryKey: ['users', filters.status, filters.role]
```

## Example Real Client Page

```tsx
'use client'

import { useUrlFilters } from '@/lib/hooks/useUrlFilters'
import { useUsers } from '@/lib/tanstack/users/useUsers'

export default function UsersPage() {
  const { getList, get } = useUrlFilters()

  const filters = {
    status: getList('status'),
    role: get('role')
  }

  const { data, isLoading } = useUsers(filters)

  return (
    <>
      <FiltersBar filters={userFiltersConfig} />

      <UsersTable users={data?.data ?? []} />
    </>
  )
}
```

Now:

```
FiltersBar → updates URL
URL → changes filters
filters → change queryKey
queryKey → TanStack refetch
```

No extra state needed.

## Pagination Works the Same Way

**Example:**

```
/users?page=2
```

**Hook:**

```typescript
const page = Number(get('page') ?? 1)

const { data } = useUsers({
  page,
  status: getList('status')
})
```

**Query key:**

```typescript
['users', page, status]
```

## Sorting Also Works

```
/users?sort=createdAt&order=desc
```

**Hook:**

```typescript
const sort = get('sort')
const order = get('order')
```

**Query key:**

```typescript
['users', filters, sort, order]
```

## RSC vs Client Difference

**Server Page:**
```
URL change → server rerender
```

**Client Page (TanStack):**
```
URL change → queryKey change → refetch
```

Different mechanism, same URL system.

## Final Architecture

```
Filters UI
   ↓
useUrlFilters()
   ↓
URL params
   ↓
build filters object
   ↓
TanStack queryKey
   ↓
API request
   ↓
table refresh
```

One filter system works everywhere.

## Big Advantage

Because filters live in the URL:

You get free features:

- Share link with filters
- Browser history navigation
- Bookmark filtered pages
- Deep linking

All without writing extra logic.

## Conclusion

For client pages:

```
URL params → filters object → TanStack queryKey → refetch
```

No React state required.
