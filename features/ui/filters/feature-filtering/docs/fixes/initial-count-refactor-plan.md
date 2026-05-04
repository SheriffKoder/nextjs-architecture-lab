# Initial Count Refactor Plan

## Overview
Rename `columnIndependentCount` to `initialCount` and add `showInitialCount` prop to all filter components to display count format: `count / initialCount`.

## Terminology
- **`count`**: Remaining count after filtering (future: hierarchical filtering support)
- **`initialCount`**: Original count of the option regardless of filtering (renamed from `columnIndependentCount`)

## Display Format
- When `showInitialCount={true}`: Display `count / initialCount` (e.g., "5 / 12")
- When `showInitialCount={false}`: Display only `count` (e.g., "5")
- Default: `showInitialCount={false}` (backward compatible)

## Implementation Steps

### Phase 1: Rename `columnIndependentCount` to `initialCount`

#### 1.1 Type Definitions
**File**: `app/development/filters/components/filter-types.ts`
- Rename `columnIndependentCount?: number` to `initialCount?: number` in `FilterOption` interface
- Update documentation comments

#### 1.2 Utility Functions
**File**: `app/development/filters/utils/get-filter-options.ts`
- Rename all `columnIndependentCount` references to `initialCount`
- Update `getUniqueValuesForField` function:
  - Rename `columnIndependentCount` in Map structure
  - Rename return property
  - Update comments

#### 1.3 API Route
**File**: `app/api/filters/options/route.ts`
- Update to use `initialCount` terminology in comments
- Ensure both `count` and `initialCount` are returned (currently same value)

#### 1.4 Server Function
**File**: `app/development/filters/utils/rsc-page/get-filter-options-server.ts`
- Update to accept `searchParams` and calculate filtered data
- Pass `filteredDataSource` to `getFilterOptions` for proper `initialCount` calculation
- Update comments

#### 1.5 Filter Employees Utility
**File**: `app/development/filters/utils/rsc-page/filter-employees.ts`
- Rename `filterEmployeesExcludingColumn` comments to reference `initialCount`
- Update function documentation

#### 1.6 Dropdown Filter Types
**File**: `app/development/filters/components/dropdown-filter/types.ts`
- Rename `columnIndependentCount` to `initialCount` in `DropdownFilterOption` interface

### Phase 2: Update All Filter Components

#### 2.1 Core Filter Components

**File**: `app/development/filters/components/filter-items/multi-select-filter.tsx`
- Add `showInitialCount?: boolean` prop
- Update count display logic:
  ```typescript
  {option.count !== undefined && (
    <span>
      {showInitialCount && option.initialCount !== undefined
        ? `${option.count} / ${option.initialCount}`
        : option.count}
    </span>
  )}
  ```

**File**: `app/development/filters/components/filter-items/single-select-filter.tsx`
- Add `showInitialCount?: boolean` prop
- Update count display (same pattern as above)

**File**: `app/development/filters/components/filter-items/date-quick-select.tsx`
- Add `showInitialCount?: boolean` prop
- Update count display

**File**: `app/development/filters/components/filter-items/number-quick-select.tsx`
- Add `showInitialCount?: boolean` prop
- Update count display

#### 2.2 PillFilter Components

**File**: `app/development/filters/components/PillFilter/filter-list-items/multi-select-filter-list.tsx`
- Add `showInitialCount?: boolean` prop
- Update count badge display

**File**: `app/development/filters/components/PillFilter/filter-list-items/single-select-filter-list.tsx`
- Add `showInitialCount?: boolean` prop
- Update count badge display

**File**: `app/development/filters/components/PillFilter/filter-list-items/date-range-filter-list.tsx`
- Add `showInitialCount?: boolean` prop
- Update count badge display

**File**: `app/development/filters/components/PillFilter/filter-list-items/number-range-filter-list.tsx`
- Add `showInitialCount?: boolean` prop
- Update count badge display

**File**: `app/development/filters/components/PillFilter/pill-filter.tsx`
- Add `showInitialCount?: boolean` prop
- Pass down to filter list components

#### 2.3 Single Key Component

**File**: `app/development/filters/components/single-key/filter-options-buttons.tsx`
- Add `showInitialCount?: boolean` prop
- Update count display in both button mode and dropdown mode

#### 2.4 Dropdown Filter Components

**File**: `app/development/filters/components/dropdown-filter/dropdown-filter.tsx`
- Add `showInitialCount?: boolean` prop
- Pass to child components
- Update all `columnIndependentCount` references to `initialCount`

**File**: `app/development/filters/components/dropdown-filter/components/filter-options-list.tsx`
- Update to use `initialCount` instead of `columnIndependentCount`
- Update display format to show `count / initialCount` when `showInitialCount={true}`
- Update selectability logic to use `initialCount`

**File**: `app/development/filters/components/dropdown-filter/components/range-quick-select-list.tsx`
- Add `showInitialCount?: boolean` prop
- Update count display

**File**: `app/development/filters/components/dropdown-filter/types.ts`
- Update `DropdownFilterProps` to include `showInitialCount?: boolean`

### Phase 3: Update Master Components

**File**: `app/development/filters/components/master/filter-renderer.tsx`
- Add `showInitialCount?: boolean` prop
- Pass to all filter item components

**File**: `app/development/filters/components/master/filters-bar.tsx`
- Add `showInitialCount?: boolean` prop
- Pass to `FilterRenderer`

### Phase 4: Update Pages

**File**: `app/development/filters/page.tsx`
- Add `showInitialCount` prop to filter components (default: `false` for now)
- Can be set to `true` for testing

**File**: `app/development/filters/employees-client/page.tsx`
- Add `showInitialCount` prop to filter components (default: `false` for now)

### Phase 5: Update Documentation

**File**: `app/development/filters/components/dropdown-filter/implementation-plan.md`
- Update all `columnIndependentCount` references to `initialCount`
- Update display format documentation

## Files to Update

### Type Definitions (1 file)
- [ ] `components/filter-types.ts`

### Utility Functions (3 files)
- [ ] `utils/get-filter-options.ts`
- [ ] `utils/rsc-page/get-filter-options-server.ts`
- [ ] `utils/rsc-page/filter-employees.ts`

### API Routes (1 file)
- [ ] `api/filters/options/route.ts`

### Core Filter Components (4 files)
- [ ] `components/filter-items/multi-select-filter.tsx`
- [ ] `components/filter-items/single-select-filter.tsx`
- [ ] `components/filter-items/date-quick-select.tsx`
- [ ] `components/filter-items/number-quick-select.tsx`

### PillFilter Components (5 files)
- [ ] `components/PillFilter/pill-filter.tsx`
- [ ] `components/PillFilter/filter-list-items/multi-select-filter-list.tsx`
- [ ] `components/PillFilter/filter-list-items/single-select-filter-list.tsx`
- [ ] `components/PillFilter/filter-list-items/date-range-filter-list.tsx`
- [ ] `components/PillFilter/filter-list-items/number-range-filter-list.tsx`

### Single Key Component (1 file)
- [ ] `components/single-key/filter-options-buttons.tsx`

### Dropdown Filter Components (4 files)
- [ ] `components/dropdown-filter/dropdown-filter.tsx`
- [ ] `components/dropdown-filter/components/filter-options-list.tsx`
- [ ] `components/dropdown-filter/components/range-quick-select-list.tsx`
- [ ] `components/dropdown-filter/types.ts`

### Master Components (2 files)
- [ ] `components/master/filter-renderer.tsx`
- [ ] `components/master/filters-bar.tsx`

### Pages (2 files)
- [ ] `page.tsx`
- [ ] `employees-client/page.tsx`

### Documentation (1 file)
- [ ] `components/dropdown-filter/implementation-plan.md`

**Total: 24 files**

## Display Format Examples

### Example 1: showInitialCount={false} (default)
```
Engineering (5)
Marketing (8)
```

### Example 2: showInitialCount={true}
```
Engineering (5 / 12)
Marketing (8 / 15)
```

### Example 3: Dropdown Filter (with selectability logic)
- Selected: `5` (just count)
- Unselected with other filters: `5 / 12` (count / initialCount)
- Unselected without other filters: `12` (just initialCount)

## Testing Checklist

- [ ] All type definitions updated
- [ ] API returns both `count` and `initialCount` (currently same value)
- [ ] Server function returns both `count` and `initialCount` (currently same value)
- [ ] All filter components accept `showInitialCount` prop
- [ ] Count display shows correct format based on `showInitialCount`
- [ ] Default behavior (showInitialCount={false}) shows only count
- [ ] When showInitialCount={true}, shows `count / initialCount`
- [ ] Dropdown filter selectability logic still works
- [ ] All pages updated with prop
- [ ] No TypeScript errors
- [ ] No runtime errors

## Migration Notes

1. **Backward Compatibility**: Default `showInitialCount={false}` ensures existing code continues to work
2. **Gradual Adoption**: Pages can opt-in to showing initial count by setting `showInitialCount={true}`
3. **Future Enhancement**: When hierarchical filtering is implemented, `count` will differ from `initialCount`

## Future Considerations

- When hierarchical filtering is implemented, `count` will represent filtered results
- `initialCount` will always represent the original count before any filtering
- This allows users to see how filtering affects available options
