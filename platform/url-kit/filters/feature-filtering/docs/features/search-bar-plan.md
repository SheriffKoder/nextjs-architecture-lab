# Search Bar Implementation Plan

## Overview
Add a search bar component that allows users to search across multiple fields with case-insensitive matching. The search query is stored in URL as `q` parameter and filters data on both server and client.

## Goals
1. Create reusable search bar component
2. Add search query management to useUrlFilters hook
3. Create generic search filter function
4. Integrate search into server and API filtering
5. Add search config to entity configs

## Implementation Steps

### Phase 1: Types and Configuration
- [x] Create `search-types.ts` with `SearchConfig<T>` interface
- [x] Add `employeeSearchConfig` to employee-filter-config.ts

### Phase 2: URL Management
- [x] Add `getSearch()` to useUrlFilters hook
- [x] Add `setSearch(query: string)` to useUrlFilters hook

### Phase 3: Search Component
- [x] Create `SearchBar` component with debouncing
- [x] Add search icon and styling
- [x] Integrate with useUrlFilters

### Phase 4: Search Logic
- [x] Create `filter-by-search.ts` utility
- [x] Implement case-insensitive OR logic across fields
- [x] Handle null/undefined values

### Phase 5: Server Integration
- [x] Update `filter-employees.ts` to use search filter
- [x] Parse `q` parameter from searchParams

### Phase 6: API Integration
- [x] Update `/api/filters/tanstack-example` to use search filter (via filterEmployees)
- [x] Update TanStack handler to include search query
- [x] Update EmployeeFilters interface to include `q`

### Phase 7: UI Integration
- [x] Add SearchBar to RSC page
- [x] Add SearchBar to client page
- [x] Export SearchBar from components/index.ts

## Architecture Principles
- **Separation of Concerns**: UI, logic, config separate
- **Reusability**: Generic functions work with any entity
- **Type Safety**: TypeScript enforces field references
- **Performance**: Debouncing on client, efficient server-side
- **Consistency**: Same logic for RSC and API

## File Structure
```
components/
├── search-bar.tsx          # Search UI component
└── search-types.ts          # SearchConfig interface
hooks/
└── useUrlFilters.ts        # Add getSearch/setSearch
utils/
├── filter-by-search.ts     # Generic search logic
└── config/
    └── employee-filter-config.ts  # Add employeeSearchConfig
rsc/
└── filter-employees.ts     # Add search filtering
api/
└── filters/tanstack-example/route.ts  # Add search filtering
```

## Bug Fixes

### Issue 1: Infinite Re-render Loop
**Problem**: Search bar caused server to continuously re-render due to infinite loop between URL updates and state sync.

**Root Cause**: 
- `getSearch()` function was recreated on every render
- Sync effect had `getSearch` in dependency array, causing it to run on every render
- Sync effect updated local state, which triggered debounced URL update
- URL update caused re-render, recreating `getSearch`, repeating the cycle

**Solution**:
- Use `useSearchParams()` directly instead of `getSearch()` for stable reference
- Remove `localValue` from sync effect dependencies
- Only sync when URL value actually changes (compare with previous URL value using ref)
- Track previous URL value with `useRef` to detect external changes only

**Code Changes**:
```typescript
// Before: Used getSearch() which was recreated on every render
const { getSearch, setSearch } = useUrlFilters()
const [localValue, setLocalValue] = useState<string>(getSearch())

useEffect(() => {
  const urlValue = getSearch()
  setLocalValue(urlValue)
}, [getSearch]) // ❌ Runs on every render

// After: Use searchParams directly with ref tracking
const searchParams = useSearchParams()
const urlSearchValue = searchParams.get('q') || ''
const [localValue, setLocalValue] = useState<string>(urlSearchValue)
const prevUrlValueRef = useRef<string>(urlSearchValue)

useEffect(() => {
  if (urlSearchValue !== prevUrlValueRef.current) {
    setLocalValue(urlSearchValue)
    prevUrlValueRef.current = urlSearchValue
  }
}, [urlSearchValue]) // ✅ Only runs when URL actually changes
```

### Issue 2: Input Not Typable
**Problem**: User couldn't type into the search input field.

**Root Cause**: 
- Sync effect had `localValue` in dependency array
- Every keystroke triggered sync effect
- Sync effect compared URL (not updated yet due to debouncing) with new local value
- Sync effect reset `localValue` back to old URL value, preventing typing

**Solution**:
- Remove `localValue` from sync effect dependencies
- Only sync when URL value changes externally (not from our own debounced updates)
- Use ref to track previous URL value to distinguish external changes

**Code Changes**:
```typescript
// Before: Sync effect depended on localValue
useEffect(() => {
  const urlValue = getCurrentSearch()
  if (urlValue !== localValue) {
    setLocalValue(urlValue) // ❌ Resets input while typing
  }
}, [searchParams, localValue]) // ❌ Runs on every keystroke

// After: Only sync on external URL changes
useEffect(() => {
  if (urlSearchValue !== prevUrlValueRef.current) {
    setLocalValue(urlSearchValue)
    prevUrlValueRef.current = urlSearchValue
  }
}, [urlSearchValue]) // ✅ Only runs when URL changes externally
```

### Key Learnings
1. **Avoid function dependencies in useEffect**: Use stable references (like `searchParams`) instead of functions that are recreated
2. **Track previous values with refs**: Use `useRef` to detect actual changes vs. re-renders
3. **Separate user input from URL sync**: Don't sync state during user input, only on external URL changes
4. **Debounce URL updates**: Prevent excessive navigation while maintaining responsive UI
