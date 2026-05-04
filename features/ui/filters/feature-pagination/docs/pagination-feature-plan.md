# Pagination Feature Plan

## Overview

Implement URL-based pagination with reusable components, hooks, and utilities. Follows the same architecture pattern as the sorting feature for consistency and reusability.

## File Structure

```
app/development/filters/pagination-feature/
├── hooks/
│   ├── useUrlPagination.ts      # Main hook for URL-based pagination state
│   ├── useInitialPagination.ts  # Optional: Apply initial page size
│   └── index.ts                 # Hook exports
├── components/
│   ├── pagination-buttons.tsx   # Page number buttons with prev/next
│   ├── pagination-info.tsx      # "Showing 1-10 of 100" display
│   ├── pagination.tsx           # Combined component (optional)
│   └── index.ts                 # Component exports
├── utils/
│   ├── parse-pagination.ts     # Parse page/limit from URL
│   ├── calculate-pagination.ts # Calculate derived values (totalPages, startItem, etc.)
│   └── index.ts                 # Utility exports
├── types.ts                     # TypeScript interfaces
└── docs/
    └── pagination-feature-plan.md
```

---

## 1. Types (`pagination-feature/types.ts`)

```typescript
/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /**
   * Default items per page
   */
  defaultPageSize?: number
  
  /**
   * Available page size options (e.g., [10, 20, 50, 100])
   */
  pageSizeOptions?: number[]
  
  /**
   * Whether page size is configurable by user
   */
  allowPageSizeChange?: boolean
}

/**
 * Pagination state from URL
 */
export interface PaginationState {
  /**
   * Current page number (1-indexed)
   */
  page: number
  
  /**
   * Items per page
   */
  limit: number
}

/**
 * Calculated pagination values
 */
export interface PaginationCalculated {
  /**
   * Total number of pages
   */
  totalPages: number
  
  /**
   * Whether on first page
   */
  isFirst: boolean
  
  /**
   * Whether on last page
   */
  isLast: boolean
  
  /**
   * Whether there's a next page
   */
  hasNext: boolean
  
  /**
   * Whether there's a previous page
   */
  hasPrevious: boolean
  
  /**
   * First item number on current page (1-indexed)
   */
  startItem: number
  
  /**
   * Last item number on current page (1-indexed)
   */
  endItem: number
}

/**
 * Complete pagination info (state + calculated + totalItems)
 */
export interface PaginationInfo extends PaginationState, PaginationCalculated {
  /**
   * Total number of items
   */
  totalItems: number
}

/**
 * Props for PaginationButtons component
 */
export interface PaginationButtonsProps {
  /**
   * Current page number
   */
  currentPage: number
  
  /**
   * Total number of pages
   */
  totalPages: number
  
  /**
   * Handler for page changes
   */
  onPageChange: (page: number) => void
  
  /**
   * Optional CSS classes
   */
  className?: string
  
  /**
   * Maximum number of page buttons to show (default: 5)
   */
  maxPagesToShow?: number
}

/**
 * Props for PaginationInfo component
 */
export interface PaginationInfoProps {
  /**
   * Start item number (1-indexed)
   */
  startItem: number
  
  /**
   * End item number (1-indexed)
   */
  endItem: number
  
  /**
   * Total number of items
   */
  totalItems: number
  
  /**
   * Optional CSS classes
   */
  className?: string
}

/**
 * Props for combined Pagination component
 */
export interface PaginationProps {
  /**
   * Total number of items
   */
  totalItems: number
  
  /**
   * Optional CSS classes
   */
  className?: string
  
  /**
   * Show info text (default: true)
   */
  showInfo?: boolean
  
  /**
   * Show page size selector (default: false)
   */
  showPageSizeSelector?: boolean
}
```

---

## 2. URL Pagination Hook (`pagination-feature/hooks/useUrlPagination.ts`)

**Purpose**: Manage pagination state in URL parameters (`page`, `limit`)

**Functions**:
- `getPage()` - Get current page number (default: 1)
- `getLimit()` - Get current page size (default: config default or 20)
- `setPage(page: number)` - Set page number
- `setLimit(limit: number)` - Set page size
- `setPagination(page: number, limit: number)` - Set both at once
- `resetPage()` - Reset to page 1
- `goToFirst()` - Navigate to first page
- `goToLast()` - Navigate to last page
- `goToNext()` - Navigate to next page
- `goToPrevious()` - Navigate to previous page
- `calculatePagination(totalItems: number)` - Calculate derived values

**URL Format**:
- `?page=2&limit=20`
- Defaults: `page=1`, `limit=20` (or config default)

**Implementation Pattern**:
- Similar to `useUrlSorting` structure
- Uses `useRouter`, `useSearchParams`, `usePathname`
- `router.replace()` with `scroll: false`
- Memoized callbacks for performance

---

## 3. Utility Functions

#### `utils/parse-pagination.ts`
```typescript
/**
 * Parse pagination from URL search params
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit: number = 20
): PaginationState
```

#### `utils/calculate-pagination.ts`
```typescript
/**
 * Calculate derived pagination values
 */
export function calculatePagination(
  page: number,
  limit: number,
  totalItems: number
): PaginationCalculated
```

---

## 4. Components

#### `components/pagination-buttons.tsx`
- Page number buttons with ellipsis
- Previous/Next buttons
- First/Last buttons (optional)
- Disabled states for boundaries
- Accessible (aria-labels, aria-current)
- Configurable max pages to show

**Features**:
- Smart page number display (show current ± 2 pages, with ellipsis)
- Responsive (mobile vs desktop)
- Matches existing button styling

#### `components/pagination-info.tsx`
- Displays "Showing 1-10 of 100"
- Simple text component
- Optional styling props

#### `components/pagination.tsx` (Optional)
- Combined component that uses `useUrlPagination` hook
- Renders both buttons and info
- Accepts `totalItems` and `PaginationConfig`
- Can include page size selector

---

## 5. Configuration Objects

#### Server Config (`page-server/feature-config-server/employee-filter-config.ts`)
```typescript
export const employeePaginationConfig: PaginationConfig = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  allowPageSizeChange: true
}
```

#### Client Config (`page-client/feature-config/employee-filter-config.ts`)
```typescript
export const employeePaginationConfig: PaginationConfig = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  allowPageSizeChange: true
}
```

---

## 6. RSC Page Integration

#### Update `page-server/utils/get-page-data.ts`
```typescript
import { parsePagination } from "../../pagination-feature/utils"

export async function getPageData(
  searchParams: { [key: string]: string | string[] | undefined } = {}
): Promise<{
  employees: Employee[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}> {
  // ... existing filtering and sorting ...
  
  // Parse pagination
  const params = new URLSearchParams(
    Object.entries(searchParams)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
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
}
```

#### Update `page-server/page.tsx`
```typescript
import { PaginationButtons, PaginationInfo } from "../pagination-feature/components"
import { useUrlPagination } from "../pagination-feature/hooks"

// In component:
const { page, limit, calculatePagination } = useUrlPagination()
const paginationInfo = calculatePagination(page, limit, data.pagination.totalItems)

<PaginationInfo {...paginationInfo} totalItems={data.pagination.totalItems} />
<PaginationButtons
  currentPage={page}
  totalPages={paginationInfo.totalPages}
  onPageChange={(newPage) => setPage(newPage)}
/>
```

---

## 7. Client Page Integration

#### Update `page-client/tanstack/key-factory.ts`
```typescript
export interface EmployeeFilters {
  // ... existing filters ...
  page?: number
  limit?: number
}
```

#### Update `page-client/tanstack/handler.ts`
```typescript
export async function fetchEmployees(
  filters?: EmployeeFilters
): Promise<{
  employees: Employee[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}> {
  const params = new URLSearchParams()
  
  // ... existing filter params ...
  
  // Add pagination params
  if (filters?.page) {
    params.append("page", filters.page.toString())
  }
  if (filters?.limit) {
    params.append("limit", filters.limit.toString())
  }
  
  // ... fetch and return with pagination metadata ...
}
```

#### Update `page-client/page.tsx`
```typescript
import { PaginationButtons, PaginationInfo } from "../pagination-feature/components"
import { useUrlPagination } from "../pagination-feature/hooks"

// In component:
const { page, limit, setPage, calculatePagination } = useUrlPagination()
const { data } = useEmployees({ ...filters, page, limit })

const paginationInfo = calculatePagination(
  page,
  limit,
  data?.pagination?.totalItems || 0
)

<PaginationInfo {...paginationInfo} totalItems={data?.pagination?.totalItems || 0} />
<PaginationButtons
  currentPage={page}
  totalPages={paginationInfo.totalPages}
  onPageChange={setPage}
/>
```

---

## 8. API Route Integration

#### Update `app/api/filters/page-client/route.ts`
```typescript
import { parsePagination, calculatePagination } from "@/app/development/filters/pagination-feature/utils"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // ... existing filtering and sorting ...
  
  // Parse pagination
  const { page, limit } = parsePagination(searchParams, 20)
  
  // Apply pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedEmployees = filteredAndSorted.slice(startIndex, endIndex)
  
  return Response.json({
    employees: paginatedEmployees,
    pagination: {
      totalItems: filteredAndSorted.length,
      page,
      limit,
      ...calculatePagination(page, limit, filteredAndSorted.length)
    }
  })
}
```

---

## 9. Documentation

#### Update `INTRODUCTION.md`
Add pagination section explaining:
- How `useUrlPagination` works
- Component usage
- RSC vs Client page patterns
- API integration

---

## Implementation Order

1. Types (`types.ts`)
2. Utilities (`parse-pagination.ts`, `calculate-pagination.ts`)
3. Hook (`useUrlPagination.ts`)
4. Components (`pagination-buttons.tsx`, `pagination-info.tsx`)
5. Configuration (add to config files)
6. RSC integration (`get-page-data.ts`, `page.tsx`)
7. Client integration (`handler.ts`, `key-factory.ts`, `page.tsx`)
8. API integration (`route.ts`)
9. Documentation

---

## Key Design Decisions

1. **URL params**: `page` and `limit` (not `offset`/`skip`)
2. **Default page size**: 20 (configurable)
3. **Page numbers**: 1-indexed (not 0-indexed)
4. **Reset on filter change**: Option to reset to page 1 when filters change
5. **Scroll behavior**: `scroll: false` on page changes
6. **Separation**: Pagination feature is self-contained like sorting
7. **Reusability**: Components work standalone or with hook
