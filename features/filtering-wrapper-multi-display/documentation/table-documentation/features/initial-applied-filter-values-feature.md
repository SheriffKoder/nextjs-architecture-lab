# initialSortDirection apply on initialSortKey only

pass to useTableSorting the initialSortDirection

and change the initialization in useTableSorting

// Initialize sort configuration with provided key and direction
// If initialSortDirection is provided, use it; otherwise default to "ascending" if initialSortKey exists
const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
if (initialSortKey) {
    return {
    key: initialSortKey,
    direction: initialSortDirection || "ascending"
    };
}
return {
    key: "",
    direction: "none"
};
});



# Initial Applied Filter Values Feature

## Overview
This feature allows table columns to define initial filter values that are automatically applied when the table loads. This is useful for setting default filters (e.g., showing only "active" status items by default).

## Feature Description
Columns can now specify `initialAppliedFilterValues` which will be automatically applied to the filter state when the table component mounts. The feature supports all filter types:
- String arrays (multi-select filters)
- Number range filters
- Date range filters

## Files Modified/Created

### 1. Type Definition
**File:** `components/virtualized-table/types/table-column.ts`

**Changes:**
- Added `initialAppliedFilterValues?: FilterValue` property to `TableColumn` interface
- Imported `FilterValue` type from `./filter-types`

**Code Added:**
```typescript
import { FilterValue } from "./filter-types";

export interface TableColumn<T = any> {
  // ... existing properties
  // Initial filter values to apply automatically when table loads
  // Supports string arrays (multi-select), number ranges, and date ranges
  initialAppliedFilterValues?: FilterValue;
}
```

---

### 2. Helper Function (NEW FILE)
**File:** `components/virtualized-table/hooks/filtering/get-initial-filters.ts`

**Purpose:** Extracts initial filter values from column definitions and validates them.

---

### 3. Initial Filters Hook (NEW FILE)
**File:** `components/virtualized-table/hooks/filtering/use-initial-filters.ts`

**Purpose:** Manages initial filter state initialization from column definitions. Handles both synchronous and asynchronous column loading.

**Key Functions:**
- `useInitialFilters<T>(params: UseInitialFiltersParams<T>): [Record<string, FilterValue>, React.Dispatch<...>]`
  - Returns filter state and setter (similar to useState)
  - Initializes filters with values from columns on mount
  - Handles async column loading with useEffect fallback
  - Prevents re-applying initial filters after user changes

**Usage:**
```typescript
import { useInitialFilters } from "./use-initial-filters";

const [filters, setFilters] = useInitialFilters({ columns });
```

---

### 4. Filtering Hook

**Key Functions:**
- `getInitialFiltersFromColumns<T>(params: GetInitialFiltersParams<T>): Record<string, FilterValue>`
  - Iterates through columns to find `initialAppliedFilterValues`
  - Validates and skips empty filter values:
    - Empty arrays (`[]`)
    - Empty range filters (`{ min: null, max: null }`)
    - Empty date range filters (`{ start: null, end: null }`)
  - Returns a record of initial filters keyed by column key

**Usage:**
```typescript
import { getInitialFiltersFromColumns } from "./get-initial-filters";

const initialFilters = getInitialFiltersFromColumns({ columns });
// Returns: { status: ['active'], created_at: { start: Date, end: Date } }
```

---

### 4. Filtering Hook
**File:** `components/virtualized-table/hooks/filtering/use-table-filtering.ts`

**Changes:**
- Imported `useInitialFilters` hook
- Replaced inline initial filter logic with `useInitialFilters` hook call
- Simplified state management by delegating initial filter logic to dedicated hook

**Code Changes:**
```typescript
import { useInitialFilters } from "./use-initial-filters";

// Initialize filters state with initial values from columns
const [filters, setFilters] = useInitialFilters({ columns });
```

---

### 5. Filter Application Utility (Earlier Enhancement)
**File:** `components/virtualized-table/utils/filtering/apply-filters.ts`

**Note:** This file was enhanced earlier to better handle empty filters, which is important for the initial filter feature to work correctly.

**Key Improvements:**
- Added validation to skip empty range filters (both min and max are null)
- Added validation to skip empty date range filters (both start and end are null)
- Improved null/undefined handling for different filter types

---

### 6. Filter Dropdown Component Fix
**File:** `components/virtualized-table/components/TableFilters/TableFilterDropdownOrchestrator.tsx`

**Purpose:** Fixed an issue where `autoApplyDropdown: true` was clearing initial filters on mount.

**Problem:**
When `autoApplyDropdown: true`, the auto-apply effect was running on initial mount with `pendingSelections = []`, which cleared the initial filters that were just applied.

**Changes Made:**

1. **Line 154-155:** Added ref to track initial mount
   ```typescript
   // Track if this is the initial mount to prevent auto-apply from clearing initial filters
   const isInitialMountRef = useRef(true);
   ```

2. **Line 160-162:** Initialize `pendingSelections` from `activeFilters` instead of empty array
   ```typescript
   // Pending selections before applying filters
   // Initialize from activeFilters to prevent autoApplyDropdown from clearing initial filters
   const [pendingSelections, setPendingSelections] = useState<string[]>(activeFilters || []);
   ```

3. **Lines 226-235:** Added sync effect to keep `pendingSelections` in sync with `activeFilters`
   ```typescript
   // Sync pendingSelections with activeFilters when they change
   // This ensures pendingSelections stays in sync with external filter changes (e.g., initial filters)
   useEffect(() => {
     // Only update if activeFilters actually changed and doesn't match pendingSelections
     // This prevents unnecessary updates and potential loops
     const currentActiveFilters = activeFilters || [];
     if (JSON.stringify(currentActiveFilters.sort()) !== JSON.stringify(pendingSelections.sort())) {
       setPendingSelections(currentActiveFilters);
     }
   }, [activeFilters]);
   ```

4. **Lines 237-242:** Updated dropdown open effect to only sync when dropdown opens (removed `activeFilters` dependency)
   ```typescript
   // Initialize pendingSelections when the dropdown opens (fallback for when dropdown wasn't open during activeFilters change)
   useEffect(() => {
     if (isOpen) {
       setPendingSelections(activeFilters || []);
     }
   }, [isOpen]);
   ```

5. **Lines 610-625:** Modified auto-apply effect to skip on initial mount
   ```typescript
   /**
    * Auto-apply effect: Apply filters when pendingSelections change and autoApplyDropdown is enabled
    * Skips on initial mount to prevent clearing initial filters
    */
   useEffect(() => {
     // Skip on initial mount - initial filters are already set, don't override them
     if (isInitialMountRef.current) {
       isInitialMountRef.current = false;
       return;
     }
     
     if (autoApplyDropdown) {
       setSelectedOptions(pendingSelections);
       onFilterChangeRef.current(columnKey, pendingSelections);
     }
   }, [pendingSelections, autoApplyDropdown, columnKey]);
   ```

**Why These Changes Were Necessary:**
- Without initializing `pendingSelections` from `activeFilters`, it would start as `[]` and trigger the auto-apply effect, clearing initial filters
- The sync effect ensures `pendingSelections` stays in sync when `activeFilters` changes externally (e.g., from initial filters)
- Skipping the auto-apply effect on initial mount prevents it from overriding initial filters that were just set

---

### 7. Example Configuration
**File:** `components/virtualized-table/page-configs/projects.ts`

**Changes:**
- Added example usage in the `status` column definition

**Example:**
```typescript
status: {
  key: "status",
  name: "Status",
  // ... other properties
  // Initial filter values to apply automatically when table loads
  // This will filter to show only 'active' status projects by default
  initialAppliedFilterValues: ['active'],
}
```

---

## Usage Examples

### String Array Filter (Multi-select)
```typescript
status: {
  key: "status",
  name: "Status",
  initialAppliedFilterValues: ['active', 'pending'],
}
```

### Number Range Filter
```typescript
amount: {
  key: "amount",
  name: "Amount",
  isNumberField: true,
  initialAppliedFilterValues: {
    min: 100,
    max: 1000
  }
}
```

### Date Range Filter
```typescript
created: {
  key: "created_at",
  name: "Created",
  isDateField: true,
  initialAppliedFilterValues: {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31')
  }
}
```

---

## Implementation Details

### Initialization Flow
1. When `useTableFiltering` hook is called, it uses a lazy initializer in `useState` to extract initial filters from columns
2. The `getInitialFiltersFromColumns` helper function processes all columns and extracts valid initial filter values
3. If columns are not available during initial render (async loading), a `useEffect` hook handles applying filters once columns are loaded
4. A ref (`initialFiltersAppliedRef`) ensures initial filters are only applied once, preventing re-application on re-renders

### Validation Rules
- Empty arrays (`[]`) are skipped
- Empty range filters (`{ min: null, max: null }`) are skipped
- Empty date range filters (`{ start: null, end: null }`) are skipped
- Only valid, non-empty filter values are applied

### Edge Cases Handled
- Columns loaded asynchronously (useEffect fallback)
- Empty columns array
- User changes filters before initial filters are applied (won't override)
- Multiple columns with initial filters (all are applied)
- `autoApplyDropdown: true` compatibility (fixed in TableFilterDropdownOrchestrator)

---

## Testing
To test the feature:
1. Add `initialAppliedFilterValues` to a column definition
2. Reload the page
3. Check browser console for logs:
   - `[useTableFiltering] Initializing with filters: ...`
   - `[useTableFiltering] Applying initial filters from async columns: ...`
4. Verify that the table shows only filtered results

---

## Notes
- Initial filters are applied only once on mount
- If a user manually changes filters, initial filters won't be re-applied
- The feature works with all existing filter types
- Console logs are included for debugging (can be removed in production)

---

## Re-application Instructions
If you need to re-apply this feature:

1. **Type Definition:** Add `initialAppliedFilterValues?: FilterValue` to `TableColumn` interface
2. **Helper Function:** Create `get-initial-filters.ts` with the helper function
3. **Initial Filters Hook:** Create `use-initial-filters.ts` hook that manages initial filter state
4. **Filtering Hook Update:** Import and use `useInitialFilters` hook in `use-table-filtering.ts`
5. **Filter Utility:** Ensure empty filter validation is in place (already enhanced)
6. **Filter Dropdown Fix:** Update `TableFilterDropdownOrchestrator.tsx` with the fixes for `autoApplyDropdown` compatibility:
   - Initialize `pendingSelections` from `activeFilters`
   - Add `isInitialMountRef` to skip auto-apply on initial mount
   - Add sync effect to keep `pendingSelections` in sync with `activeFilters`
   - Modify auto-apply effect to skip on initial mount
7. **Example:** Add `initialAppliedFilterValues` to column configs as needed

---

## Related Files
- `components/virtualized-table/types/filter-types.ts` - Filter value type definitions
- `components/virtualized-table/components/virtualized-table.tsx` - Main table component (uses the hook)
- `components/virtualized-table/utils/filtering/apply-filters.ts` - Filter application logic
- `components/virtualized-table/components/TableFilters/TableFilterDropdownOrchestrator.tsx` - Filter dropdown component (fixed for autoApplyDropdown compatibility)
