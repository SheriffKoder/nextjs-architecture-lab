# Plan: Dynamic Grouping Control via Button

## Overview

Add a button/control that allows users to dynamically select grouping keys at runtime. When `minimalControlsEnabled` is `true`, the button becomes the single source of truth, ignoring config-based grouping. When `false` or not provided, configs remain as fallback when no selection is made.

## Goals

1. Add state management for selected grouping keys in `FilteringWrapper`
2. Create a grouping control button component
3. Add UI row in `FilteringWrapper` to display the control
4. Add `minimalControlsEnabled` prop to make button the single source of truth when enabled
5. Update List, Table, SubHeadings, and Timeline views to use selected state with config fallback (or ignore config when `minimalControlsEnabled` is true)
6. Ensure configs work as before when no selection is made and `minimalControlsEnabled` is false

## Implementation Steps

### Phase 1: State Management in FilteringWrapper

**File:** `filtering-wrapper.tsx`

1. Add state for selected grouping keys:
   ```typescript
   const [selectedGroupBy, setSelectedGroupBy] = useState<string | null>(null);
   const [selectedSubGroupBy, setSelectedSubGroupBy] = useState<string | null>(null);
   ```

2. Add props to `FilteringWrapperProps`:
   ```typescript
   // When true, ignore config-based grouping and use only button state (selectedGroupBy) as source of truth
   minimalControlsEnabled?: boolean;
   ```

### Phase 2: Create Grouping Control Component

**File:** `components/filtering-wrapper-multi-display/components/minimals/grouping-control.tsx`

**Features:**
- Button/dropdown to select grouping key from available columns
- Option to clear selection (reset to config-based)
- Visual indicator when grouping is active
- Support for sub-grouping selection (optional)

**Props:**
```typescript
interface GroupingControlProps<T = any> {
  columns: TableColumn<T>[];
  selectedGroupBy: string | null;
  selectedSubGroupBy?: string | null;
  onGroupByChange: (groupBy: string | null) => void;
  onSubGroupByChange?: (subGroupBy: string | null) => void;
  availableViews?: string[]; // Only show for views that support grouping
  currentView?: string;
}
```

### Phase 3: Add UI Row in FilteringWrapper

**File:** `filtering-wrapper.tsx`

Add new row around line 429-432:
```typescript
<div className="w-full flex items-center justify-between px-2 py-2">
  <GroupingControl
    columns={columns}
    selectedGroupBy={selectedGroupBy}
    selectedSubGroupBy={selectedSubGroupBy}
    onGroupByChange={setSelectedGroupBy}
    onSubGroupByChange={setSelectedSubGroupBy}
    availableViews={availableViews}
    currentView={currentView}
  />
</div>
```

### Phase 4: Update List Component

**File:** `features/virtualized-list/virtualized-list-container.tsx`

1. Add props:
   ```typescript
   selectedGroupBy?: string | null;
   selectedSubGroupBy?: string | null;
   minimalControlsEnabled?: boolean;
   ```

2. Use effective grouping (respects `minimalControlsEnabled`):
   ```typescript
   const effectiveGroupBy = minimalControlsEnabled 
     ? selectedGroupBy || null 
     : selectedGroupBy || listViewConfig?.groupBy;
   const effectiveSubGroupBy = minimalControlsEnabled 
     ? selectedSubGroupBy || null 
     : selectedSubGroupBy || listViewConfig?.subGroupBy;
   ```

3. Update `groupedData` useMemo to use effective values

### Phase 5: Update Table Component

**File:** `features/virtualized-table/virtualized-table-container.tsx`

1. Add props:
   ```typescript
   selectedGroupBy?: string | null;
   selectedSubGroupBy?: string | null;
   minimalControlsEnabled?: boolean;
   ```

2. Extract effective grouping (respects `minimalControlsEnabled`):
   ```typescript
   const effectiveGroupBy = minimalControlsEnabled 
     ? selectedGroupBy || null 
     : selectedGroupBy || groupBy;
   const effectiveSubGroupBy = minimalControlsEnabled 
     ? selectedSubGroupBy || null 
     : selectedSubGroupBy || subGroupBy;
   ```

3. Update `groupedData` useMemo to use effective values

### Phase 6: Update SubHeadings Component

**File:** `features/subheadings/subheadings-container.tsx`

1. Add props:
   ```typescript
   selectedGroupBy?: string | null;
   minimalControlsEnabled?: boolean;
   ```

2. Use effective grouping (respects `minimalControlsEnabled`):
   ```typescript
   const effectiveGroupByKey = minimalControlsEnabled 
     ? selectedGroupBy || undefined 
     : selectedGroupBy || groupByKey;
   ```

3. Update `groupedData` useMemo to use effective value

### Phase 7: Update Timeline Component

**File:** `features/timeline-3/timeline-wrapper.tsx`

1. Add props:
   ```typescript
   selectedGroupBy?: string | null;
   minimalControlsEnabled?: boolean;
   ```

2. Use effective grouping (respects `minimalControlsEnabled`):
   ```typescript
   const effectiveGroupByKey = minimalControlsEnabled 
     ? selectedGroupBy || undefined 
     : selectedGroupBy || groupByKey;
   ```

3. Pass to `TimelineContainer`

### Phase 8: Pass Props from FilteringWrapper

**File:** `filtering-wrapper.tsx`

Update component rendering to pass `selectedGroupBy`, `selectedSubGroupBy`, and `minimalControlsEnabled`:
- List View: Pass to `VirtualizedListComponent`
- Table View: Pass to `VirtualizedTableComponent`
- SubHeadings View: Pass to `SubHeadingsContainer`
- Timeline View: Pass to `TimelineWrapper`

## Expected Behavior

### When `minimalControlsEnabled={true}` (Button is Single Source of Truth):

- **When button is clicked and grouping key selected:**
  - Selected state is used for grouping
  - Config-based grouping is **completely ignored**
  - View updates to show grouped data by selected key

- **When selection is cleared (button state is null):**
  - **No grouping is applied** (even if config has grouping)
  - Data is displayed ungrouped
  - Button state is the only source of truth

### When `minimalControlsEnabled={false}` or not provided (Config Fallback Mode):

- **When button is clicked and grouping key selected:**
  - Selected state overrides config-based grouping
  - View updates to show grouped data by selected key
  - Configs are ignored for grouping (but other config options still apply)

- **When selection is cleared:**
  - Falls back to config-based grouping
  - If no config, no grouping is applied

- **Configs remain as fallback:**
  - If `selectedGroupBy` is null, use `config.groupBy`
  - Maintains backward compatibility

## Files to Modify

1. `filtering-wrapper.tsx` - Add state, UI row, pass props including `minimalControlsEnabled`
2. `components/minimals/grouping-control.tsx` - NEW component
3. `features/virtualized-list/virtualized-list-container.tsx` - Use effective grouping with `minimalControlsEnabled` support
4. `features/virtualized-table/virtualized-table-container.tsx` - Use effective grouping with `minimalControlsEnabled` support
5. `features/subheadings/subheadings-container.tsx` - Use effective grouping with `minimalControlsEnabled` support
6. `features/timeline-3/timeline-wrapper.tsx` - Use effective grouping with `minimalControlsEnabled` support
7. `features/timeline-3/timeline-container.tsx` - Accept and use effective grouping

## Implementation Status

✅ **All phases completed:**
- State management added to `FilteringWrapper`
- `GroupingControl` component created
- UI row added to `FilteringWrapper`
- All view components (List, Table, SubHeadings, Timeline) updated with:
  - `selectedGroupBy` and `selectedSubGroupBy` props
  - `minimalControlsEnabled` prop
  - Effective grouping logic that respects `minimalControlsEnabled`
- Props passed from `FilteringWrapper` to all view components

## UI Design Considerations

- Button should show current selection (if any)
- Dropdown/select to choose from available column keys
- Clear button behavior:
  - When `minimalControlsEnabled={true}`: Clears grouping (no grouping applied)
  - When `minimalControlsEnabled={false}`: Resets to config-based grouping
- Only show for views that support grouping (table, list, subheadings, timeline)
- Visual indicator when dynamic grouping is active vs config-based

## Summary

All views (List, Table, SubHeadings, Timeline) now support:
- ✅ `selectedGroupBy` and `selectedSubGroupBy` props
- ✅ `minimalControlsEnabled` prop
- ✅ Effective grouping logic that respects `minimalControlsEnabled`
- ✅ Props passed from `FilteringWrapper`

When `minimalControlsEnabled={true}`, the button becomes the single source of truth for grouping, completely ignoring config-based grouping. When `false` or not provided, configs serve as fallback.
