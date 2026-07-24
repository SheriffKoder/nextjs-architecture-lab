# Reusable Filter Component System

Reusable Filter Component System that works with the `useUrlFilters()` hook you now have.

## The Goal

- Define filters using configuration
- Automatically render the correct UI
- Connect to URL filters
- Work for any page (tasks, users, invoices, trailers)

This is how many enterprise dashboards work.

## Final Developer Experience

You should be able to define filters like this:

```typescript
const filters: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "multi-select",
    options: [
      { label: "Open", value: "open" },
      { label: "In Progress", value: "in-progress" },
      { label: "Done", value: "done" }
    ]
  },
  {
    key: "assignee",
    label: "Assignee",
    type: "single-select",
    options: employees
  },
  {
    key: "date",
    label: "Task Date",
    type: "date-range"
  },
  {
    key: "amount",
    label: "Amount",
    type: "number-range"
  }
]
```

Then simply render:

```tsx
<FiltersBar filters={filters} />
```

And everything works automatically.

## Folder Structure

Inside shared components:

```
components/
  filters/
    FiltersBar.tsx
    FilterRenderer.tsx
    MultiSelectFilter.tsx
    SingleSelectFilter.tsx
    DateRangeFilter.tsx
    NumberRangeFilter.tsx
    filter-types.ts
```

Reusable across the entire app.

## Filter Types

**filter-types.ts**

```typescript
export type FilterType =
  | "multi-select"
  | "single-select"
  | "date-range"
  | "number-range"

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  key: string
  label: string
  type: FilterType
  options?: FilterOption[]
}
```

## FiltersBar Component

Responsible for rendering all filters.

```tsx
import { FilterConfig } from "./filter-types"
import { FilterRenderer } from "./FilterRenderer"

interface Props {
  filters: FilterConfig[]
}

export function FiltersBar({ filters }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map(filter => (
        <FilterRenderer key={filter.key} filter={filter} />
      ))}
    </div>
  )
}
```

## FilterRenderer

Chooses the correct filter component.

```tsx
import { FilterConfig } from "./filter-types"
import { MultiSelectFilter } from "./MultiSelectFilter"
import { SingleSelectFilter } from "./SingleSelectFilter"
import { DateRangeFilter } from "./DateRangeFilter"
import { NumberRangeFilter } from "./NumberRangeFilter"

export function FilterRenderer({ filter }: { filter: FilterConfig }) {
  switch (filter.type) {
    case "multi-select":
      return <MultiSelectFilter filter={filter} />

    case "single-select":
      return <SingleSelectFilter filter={filter} />

    case "date-range":
      return <DateRangeFilter filter={filter} />

    case "number-range":
      return <NumberRangeFilter filter={filter} />

    default:
      return null
  }
}
```

## Multi Select Filter Example

```tsx
import { useUrlFilters } from "@/lib/hooks/useUrlFilters"
import { FilterConfig } from "./filter-types"

export function MultiSelectFilter({ filter }: { filter: FilterConfig }) {
  const { getList, toggleListValue } = useUrlFilters()

  const selected = getList(filter.key)

  return (
    <div>
      <span>{filter.label}</span>

      <div>
        {filter.options?.map(option => {
          const active = selected.includes(option.value)

          return (
            <button
              key={option.value}
              onClick={() => toggleListValue(filter.key, option.value)}
            >
              {active ? "✓ " : ""}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

## Date Range Filter Example

```tsx
import { useUrlFilters } from "@/lib/hooks/useUrlFilters"

export function DateRangeFilter({ filter }) {
  const { getRange, setRange } = useUrlFilters()

  const range = getRange(filter.key)

  const handleChange = (start, end) => {
    setRange(filter.key, start, end)
  }

  return (
    <DatePicker
      startDate={range?.start}
      endDate={range?.end}
      onChange={handleChange}
    />
  )
}
```

You said you already have a date picker, so you just wire it here.

## Number Range Filter

```typescript
const { getNumberRange, setNumberRange } = useUrlFilters()

const range = getNumberRange(filter.key)

setNumberRange(filter.key, min, max)
```

## Example Real Page

```tsx
const filters = [
  {
    key: "status",
    label: "Status",
    type: "multi-select",
    options: statusOptions
  },
  {
    key: "role",
    label: "Role",
    type: "single-select",
    options: roleOptions
  },
  {
    key: "date",
    label: "Created Date",
    type: "date-range"
  }
]

return (
  <>
    <FiltersBar filters={filters} />

    <UsersTable />
  </>
)
```

## What Happens When User Clicks

**Example click:**

Status → Open

**URL becomes:**
```
/tasks?status=open
```

**Add another:**
```
/tasks?status=open,in-progress
```

Server page automatically re-renders.

## UX Improvement (Important)

Wrap data content in Suspense:

```tsx
<FiltersBar filters={filters} />

<Suspense fallback={<TableSkeleton />}>
  <TasksTable />
</Suspense>
```

**Result:**

- Filters stay interactive
- Only table reloads
- No page flicker

## Optional Future Features

Your system now supports:

Easy additions like:

- Filter chips display
- Clear filters button
- Save filter presets
- Analytics tracking
- Global search
👉 A schema-driven filter system using Zod, which allows your server to automatically validate and parse all filters safely.

All using the same filter architecture.

## Final Architecture Summary

```
URL params
     ↓
useUrlFilters()
     ↓
Reusable Filter Components
     ↓
FiltersBar
     ↓
Server Page reads searchParams
     ↓
Backend filtering
     ↓
Table / charts refresh
```

**Clean. Scalable. Reusable.**
