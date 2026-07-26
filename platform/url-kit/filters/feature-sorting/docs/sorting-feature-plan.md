# Sorting Feature Architecture Plan

## Overview

A reusable sorting system that supports single and multi-level sorting with URL-based state management. Designed for clean separation from filtering logic and maximum flexibility.

**Architecture**: Sorting lives under `platform/url-kit/filters/feature-sorting/` (URL state via `useUrlSorting`, `SortButton` / `SortButtons`, and in-dropdown controls).

**Related:** [Dropdown sort controls — how to use & plan](./DROPDOWN_SORT_CONTROLS_PLAN.md) (`sortPlacement: 'dropdown'` inside header filter menus).

## 1. Hook: `useUrlSorting`

**Location**: `app/development/filters/sorting-feature/hooks/useUrlSorting.ts`

**URL Format for Multi-Level Sorting**:
```
sort=status:asc,department:desc,createdAt:asc
```
- Comma-separated list
- Order matters (first = primary, second = secondary, etc.)
- Format: `key:direction`

**Hook API**:
```typescript
export function useUrlSorting() {
  // Get all sorts in priority order (primary first)
  getSorts(): Array<{ key: string; direction: 'asc' | 'desc' }>
  
  // Get sort direction for a specific key (returns null if not sorted)
  getSort(key: string): 'asc' | 'desc' | null
  
  // Get the priority/level of a sort (0 = primary, 1 = secondary, etc.)
  getSortLevel(key: string): number | null
  
  // Toggle sort for a key: none → asc → desc → none
  // If key already exists, cycles through states
  // If key doesn't exist, adds as primary (first in list)
  toggleSort(key: string): void
  
  // Set sort explicitly (for custom logic)
  // If direction is null, removes the sort
  setSort(key: string, direction: 'asc' | 'desc' | null): void
  
  // Add sort at specific priority level
  // If level is not provided, adds at end (maintains click order)
  addSort(key: string, direction: 'asc' | 'desc', level?: number): void
  
  // Remove sort by key
  removeSort(key: string): void
  
  // Clear all sorts
  clearSorts(): void
  
  // Reorder sorts (for drag-and-drop or programmatic reordering)
  reorderSorts(keys: string[]): void
}
```

## 2. Component Structure

**Location**: `app/development/filters/sorting-feature/components/`

**Files**:
- `sort-button.tsx` - Single button with toggle
- `sort-buttons.tsx` - Maps over config (simple use case)
- `index.ts` - Component exports

**Component Props**:
```typescript
// SortButton - Simple toggle button
interface SortButtonProps {
  sortKey: string
  label?: string // For accessibility/tooltip
  className?: string
  showPriority?: boolean // Show priority badge if multi-level
}

// SortButtons - Simple row of buttons
interface SortButtonsProps {
  sortConfig: SortConfig[]
  className?: string
}

// SortPriorityList - Shows active sorts with priority (for advanced UI)
interface SortPriorityListProps {
  sortConfig: SortConfig[]
  className?: string
  showRemove?: boolean // Show remove buttons
}
```

## 3. Multi-Level Sorting Behavior

**Toggle Logic**:
1. First click (key not in sort): Add as primary → `sort=status:asc`
2. Second click (key is asc): Change to desc → `sort=status:desc`
3. Third click (key is desc): Remove → `sort=` (empty or removed)
4. If other sorts exist: `sort=status:asc,department:desc` → clicking status cycles through states, department stays

**Priority Management**:
- When adding a new sort, it is appended to the end (maintains click order)
- First clicked sort becomes primary, second becomes secondary, etc.
- When removing a sort, remaining sorts maintain their order
- Can explicitly set priority with `addSort(key, direction, level)`

**Example Flow**:
```
Initial: sort=
Click status → sort=status:asc (status is primary)
Click department → sort=status:asc,department:asc (status primary, department secondary)
Click status (asc) → sort=status:desc,department:asc (status changed to desc)
Click status (desc) → sort=department:asc (status removed)
Click role → sort=department:asc,role:asc (department primary, role secondary)
```

## 4. Config Structure

**Type**:
```typescript
export interface SortConfig {
  key: string
  label: string // For accessibility/tooltip
}
```

**Example**:
```typescript
export const employeeSortConfig: SortConfig[] = [
  { key: 'status', label: 'Status' },
  { key: 'role', label: 'Role' },
  { key: 'department', label: 'Department' },
  { key: 'salary', label: 'Salary' },
  { key: 'createdAt', label: 'Created Date' },
]
```

## 5. Page Integration

### RSC Page
```typescript
import { parseSorts, applySorts } from '../sorting-feature/utils'

const params = await searchParams
const sortParam = params.get('sort') || ''
// Parse: "status:asc,department:desc" → [{ key: 'status', direction: 'asc' }, ...]
const sorts = parseSorts(sortParam)
const sortedData = applySorts(data, sorts)
```

### Client TanStack Page
```typescript
import { useUrlSorting } from '../sorting-feature/hooks/useUrlSorting'

const { getSorts } = useUrlSorting()
const sorts = getSorts()
// Include in query key
queryKey: employeeKeys.lists(filters, sorts)
// Pass to API
fetchEmployees(filters, sorts)
```

## 6. Server/API Integration

**Helper Functions** (in `app/development/filters/sorting-feature/utils/`):
```typescript
// Parse sort string from URL
export function parseSorts(sortString: string): Array<{ key: string; direction: 'asc' | 'desc' }> {
  if (!sortString) return []
  return sortString.split(',').map(sort => {
    const [key, direction] = sort.split(':')
    return { key, direction: direction as 'asc' | 'desc' }
  })
}

// Apply sorts to data (primary first, then secondary, etc.)
export function applySorts<T>(data: T[], sorts: Array<{ key: string; direction: 'asc' | 'desc' }>): T[] {
  if (sorts.length === 0) return data
  
  return [...data].sort((a, b) => {
    for (const { key, direction } of sorts) {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal === bVal) continue // Equal values, check next sort level
      
      const comparison = aVal < bVal ? -1 : 1
      return direction === 'asc' ? comparison : -comparison
    }
    return 0 // All sort levels equal
  })
}
```

## 7. Implementation Steps

1. **Create `useUrlSorting` hook**
   - Parse `sort` param (comma-separated)
   - Implement toggle, add, remove, reorder functions
   - Handle priority/level management

2. **Create sort components**
   - `SortButton` - single button with toggle
   - `SortButtons` - simple row
   - `SortPriorityList` - advanced UI with priority (optional)

3. **Add sort configs**
   - Add to feature config files
   - Export `employeeSortConfig`

4. **Create utility functions**
   - `parseSorts()` - parse URL string
   - `applySorts()` - apply to data
   - Located in `sorting-feature/utils/`

5. **Update pages**
   - RSC: Read and parse sort params
   - Client: Include in query key and API call

6. **Update server/API functions**
   - Accept sort params
   - Apply multi-level sorting

## 8. File Structure

```
app/development/filters/
└── sorting-feature/
    ├── components/
    │   ├── sort-button.tsx
    │   ├── sort-buttons.tsx
    │   └── index.ts
    ├── hooks/
    │   └── useUrlSorting.ts
    ├── types.ts
    └── utils/
        ├── parse-sorts.ts
        ├── apply-sorts.ts
        └── index.ts
```

**Note**: All sorting-related files are self-contained in the `sorting-feature` directory for clear separation and easy reuse.

## 9. Benefits

1. **Clear Separation**: Sorting logic in its own hook, separate from filtering
2. **Multi-Level Support**: Primary, secondary, tertiary sorts
3. **Flexible**: Toggle for simple use, explicit API for advanced
4. **Reusable**: Drop `SortButton` anywhere with just a key
5. **URL-Friendly**: Single param, easy to parse
6. **Priority-Aware**: Can query and manage sort levels

## 10. Example Usage

### Simple (Toggle)
```tsx
import { SortButton } from '../sorting-feature/components'

<SortButton sortKey="status" label="Status" />
```

### Config-based
```tsx
import { SortButtons } from '../sorting-feature/components'

<SortButtons sortConfig={employeeSortConfig} />
```

### Advanced (Multi-level with Priority)
```tsx
import { useUrlSorting } from '../sorting-feature/hooks/useUrlSorting'

const { getSorts, toggleSort } = useUrlSorting()
const sorts = getSorts() // [{ key: 'status', direction: 'asc' }, { key: 'department', direction: 'desc' }]
// Priority badges (1, 2, 3, etc.) show automatically on sort buttons
```

## 11. Styling Reference

Match the styling from `features/filtering-wrapper-multi-display/components/filtering-table-header.tsx`:
- Two arrows (MoveUp/MoveDown) side by side
- Active state highlights with `text-primary`
- Inactive state uses `text-tertiary`
- Hover effects with `hover:bg-foreground/10`
- Size: `size={12}`, `strokeWidth={2.5}`

## 12. Priority Badges

Sort buttons automatically show priority badges (1, 2, 3, etc.) when a sort is active:
- Badge styling matches dropdown filter icon badges: `bg-tertiary text-background`
- Positioned at `-top-0.5 -right-0.5`
- Shows the sort level (1 = primary, 2 = secondary, 3 = tertiary, etc.)
- Enabled by default (`showPriority = true`)
