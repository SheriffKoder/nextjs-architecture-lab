# URL Filters Hook Documentation

`useUrlFilters()` is a custom hook that centralizes all URL filter logic so your filter components don't each re-implement:

- Acts as a single source of truth for filter state in the URL.

## Responsibilities

- Read filters from URL
- Parse them into usable values
- Update a specific filter
- Remove a filter
- Reset all filters
- Preserve unrelated params (page, sort, etc.)

## Example Usage

Inside any filter component:

```typescript
const { getFilter, setFilter, removeFilter } = useUrlFilters()
const selectedStatuses = getFilter('status')
setFilter('status', ['open', 'in-progress'])
```

**Resulting URL:**
```
/tasks?status=open,in-progress
```

## Final URL Format We Will Support

**Example real URL:**
```
/tasks?
status=open,in-progress         // multi-select
&assignee=12,18
&role=admin                     // single select             
&date=2025-01-01_2025-01-31     // date range
&amount=100_500                 // number range
&q=server                       // text search
&page=2                         // pagination
&sort=createdAt                 // sorting
&order=desc
```

## Full Hook Implementation

```typescript
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function useUrlFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const buildParams = () => new URLSearchParams(searchParams.toString())

  const updateUrl = (params: URLSearchParams) => {
    router.replace(`${pathname}?${params.toString()}`)
  }

  // ---------- GETTERS ----------

  const get = (key: string): string | null => {
    return searchParams.get(key)
  }

  const getList = (key: string): string[] => {
    const value = searchParams.get(key)
    return value ? value.split(',') : []
  }

  const getRange = (key: string) => {
    const value = searchParams.get(key)
    if (!value) return null

    const [start, end] = value.split('_')
    return { start, end }
  }

  const getNumberRange = (key: string) => {
    const value = searchParams.get(key)
    if (!value) return null

    const [min, max] = value.split('_')
    return {
      min: min ? Number(min) : undefined,
      max: max ? Number(max) : undefined
    }
  }

  // ---------- SETTERS ----------

  const set = (key: string, value: string | number) => {
    const params = buildParams()
    params.set(key, String(value))
    updateUrl(params)
  }

  const setList = (key: string, values: string[]) => {
    const params = buildParams()

    if (values.length === 0) {
      params.delete(key)
    } else {
      params.set(key, values.join(','))
    }

    updateUrl(params)
  }

  const toggleListValue = (key: string, value: string) => {
    const current = getList(key)

    if (current.includes(value)) {
      setList(
        key,
        current.filter(v => v !== value)
      )
    } else {
      setList(key, [...current, value])
    }
  }

  const setRange = (key: string, start?: string, end?: string) => {
    const params = buildParams()

    if (!start && !end) {
      params.delete(key)
    } else {
      params.set(key, `${start ?? ''}_${end ?? ''}`)
    }

    updateUrl(params)
  }

  const setNumberRange = (key: string, min?: number, max?: number) => {
    const params = buildParams()

    if (!min && !max) {
      params.delete(key)
    } else {
      params.set(key, `${min ?? ''}_${max ?? ''}`)
    }

    updateUrl(params)
  }

  const remove = (key: string) => {
    const params = buildParams()
    params.delete(key)
    updateUrl(params)
  }

  const clearAll = () => {
    router.replace(pathname)
  }

  // ---------- PAGINATION ----------

  const setPage = (page: number) => {
    set('page', page)
  }

  // ---------- SORTING ----------

  const setSort = (field: string, order: 'asc' | 'desc') => {
    const params = buildParams()
    params.set('sort', field)
    params.set('order', order)
    updateUrl(params)
  }

  return {
    get,
    getList,
    getRange,
    getNumberRange,

    set,
    setList,
    toggleListValue,
    setRange,
    setNumberRange,

    remove,
    clearAll,

    setPage,
    setSort
  }
}
```

## Example Usage — Multi Select Filter

### Example Status Filter

```typescript
const { getList, toggleListValue } = useUrlFilters()

const selected = getList('status')

const toggle = (status: string) => {
  toggleListValue('status', status)
}
```

## Example Usage — Date Range

```typescript
const { getRange, setRange } = useUrlFilters()

const range = getRange('date')

setRange('date', '2025-01-01', '2025-01-31')
```

**URL becomes:**
```
?date=2025-01-01_2025-01-31
```

## Example Usage — Number Range

```typescript
const { setNumberRange } = useUrlFilters()

setNumberRange('amount', 100, 500)
```

**URL:**
```
?amount=100_500
```

## Example Usage — Pagination

```typescript
const { setPage } = useUrlFilters()

setPage(2)
```

**URL:**
```
?page=2
```

## Example Usage — Sorting

```typescript
const { setSort } = useUrlFilters()

setSort('createdAt', 'desc')
```

**URL:**
```
?sort=createdAt&order=desc
```

## Example Usage — Clear Filters

```typescript
const { clearAll } = useUrlFilters()

clearAll()
```

**Result:**
```
/tasks
```

## Why This Pattern Scales

With this hook:

- All filter components become tiny.

**Example reusable filter:**
```tsx
<MultiSelectFilter
  paramKey="status"
  options={statusOptions}
/>
```

**Inside component:**
```typescript
useUrlFilters()
```

- No router logic duplicated.

## UX Performance Tip (Important)

Always use:

```typescript
router.replace()
```

instead of `push()`.

Because filters change frequently.

**This prevents history spam.**
