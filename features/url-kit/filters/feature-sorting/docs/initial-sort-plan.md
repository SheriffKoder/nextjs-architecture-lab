# Initial Sort Feature Plan

## Overview

Extend the sorting feature to support initial/default sorts that are automatically applied when no sort parameters exist in the URL. This provides a better user experience by having sensible default sorting on page load.

## Changes Required

### 1. Extend SortConfig Interface

**File**: `app/development/filters/sorting-feature/types.ts`

Add two optional properties:
- `initial?: boolean` - Whether this sort should be applied initially
- `initialOrder?: 'asc' | 'desc'` - Initial sort direction (defaults to 'asc')

### 2. Create useInitialSorts Hook

**File**: `app/development/filters/sorting-feature/hooks/useInitialSorts.ts`

New hook that:
- Takes `sortConfig` array as parameter
- Uses `useUrlSorting` hook to access sort state
- Checks if any sorts exist in URL
- If no sorts exist, finds configs with `initial: true`
- Converts them to `SortSpec` array
- Applies all initial sorts in a single batch operation using `setSorts` (prevents multiple URL updates)
- Only runs on mount (empty dependency array)

**Why it's a hook:**
- Must use `useUrlSorting()` hook (Rules of Hooks)
- Uses `useEffect` for mount lifecycle
- Accesses React context for URL state management
- Keeps component logic clean (no logic in components)

### 3. Update SortButtons Component

**File**: `app/development/filters/sorting-feature/components/sort-buttons.tsx`

- Import and call `useInitialSorts(sortConfig)`
- No other logic changes needed

### 4. Update Config Files

**Files**: 
- `app/development/filters/page-server/feature-config-server/employee-filter-config.ts`
- `app/development/filters/page-client/feature-config/employee-filter-config.ts`

Add `initial: true` and `initialOrder` to desired sort configs.

### 5. Export Hook

**File**: Create or update `app/development/filters/sorting-feature/hooks/index.ts`

Export `useInitialSorts` hook.

## Behavior

- **On Mount**: If no sort params exist, initial sorts are applied
- **Multiple Initial Sorts**: Applied in config order (first = primary, second = secondary, etc.)
- **Batch Operation**: All initial sorts are applied in a single URL update using `setSorts` (not multiple `setSort` calls)
- **URL Updates**: Initial sorts update URL in one operation, triggering data refetch/re-render
- **Works on Both Pages**: Same hook works for RSC and client pages
- **No Override**: Won't apply if sorts already exist in URL

## Implementation Details

### Batch Operation

The hook uses `setSorts` (batch function) instead of calling `setSort` multiple times:
- **Problem**: Multiple `setSort` calls would trigger multiple URL updates, and later calls might read stale state
- **Solution**: Build all initial sorts into an array, then call `setSorts` once with all sorts
- **Result**: Single URL update with all initial sorts: `sort=status:asc,role:desc`

### Hook Structure

The hook must remain a hook because:
1. It uses `useUrlSorting()` hook (Rules of Hooks violation if called from regular function)
2. It uses `useEffect` for mount lifecycle
3. It accesses React context for URL state
4. Keeps components clean (no logic in components)

## Example Config

```typescript
export const employeeSortConfig: SortConfig[] = [
  { key: "status", label: "Status", initial: true, initialOrder: "asc" },
  { key: "role", label: "Role" },
  { key: "department", label: "Department", initial: true, initialOrder: "desc" },
  { key: "salary", label: "Salary" },
  { key: "createdAt", label: "Created Date" },
]
```

In this example, on page load with no sort param:
- `status:asc` is applied as primary sort
- `department:desc` is applied as secondary sort
- URL becomes: `sort=status:asc,department:desc`
