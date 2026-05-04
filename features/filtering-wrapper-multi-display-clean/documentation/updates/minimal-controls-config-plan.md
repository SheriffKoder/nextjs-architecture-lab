# Plan: Replace minimalControlsEnabled with minimalControlsConfig

## Overview

Replace the boolean `minimalControlsEnabled` prop with a more flexible `minimalControlsConfig` object that allows specifying which columns are available for grouping. This provides better control over which columns users can group by.

## Current Implementation

Currently, `minimalControlsEnabled` is a boolean that:
- When `true`: Shows grouping control and makes it the single source of truth
- When `false` or undefined: Uses config-based grouping as fallback
- Shows all available columns in the grouping dropdown (except hidden/action columns)

## Proposed Implementation

Replace `minimalControlsEnabled?: boolean` with:

```typescript
minimalControlsConfig?: {
  availableColumns?: string[]; // Array of column keys available for grouping
};
```

### Behavior:
- If `minimalControlsConfig` is present: Minimal controls are enabled (replaces `minimalControlsEnabled = true`)
- If `minimalControlsConfig.availableColumns` is provided: Only those columns appear in the grouping dropdown
- If `minimalControlsConfig.availableColumns` is not provided: Show all eligible columns (backward compatible)
- If `minimalControlsConfig` is undefined: Minimal controls are disabled (replaces `minimalControlsEnabled = false`)

## Use Cases

### Use Case 1: Projects Page - Limited Grouping Options
**Scenario**: On the projects page, we only want users to be able to group by `name`, `company`, and `status` columns.

**Current Solution**: All columns are available, which can be overwhelming and confusing.

**New Solution**:
```typescript
<FilteringWrapper
  data={projects}
  columns={tableColumns}
  minimalControlsConfig={{
    availableColumns: ['name', 'company', 'status']
  }}
  // ... other props
/>
```

**Benefits**:
- Cleaner UI with only relevant grouping options
- Prevents grouping by columns that don't make sense (e.g., dates, descriptions)
- Better UX for end users

### Use Case 2: Tasks Page - All Columns Available
**Scenario**: On the tasks page, we want all columns available for grouping.

**Solution**:
```typescript
<FilteringWrapper
  data={tasks}
  columns={tableColumns}
  minimalControlsConfig={{}}
  // ... other props
/>
```

**Benefits**:
- Maximum flexibility for users
- No need to specify all columns explicitly

### Use Case 3: Disable Minimal Controls
**Scenario**: Use traditional config-based grouping without minimal controls.

**Solution**:
```typescript
<FilteringWrapper
  data={items}
  columns={tableColumns}
  // minimalControlsConfig not provided
  // ... other props
/>
```

**Benefits**:
- Maintains backward compatibility
- Uses existing config-based grouping

## Implementation Steps

### Phase 1: Update Type Definitions

1. **FilteringWrapperProps** (`filtering-wrapper.tsx`)
   - Replace `minimalControlsEnabled?: boolean` with `minimalControlsConfig?: { availableColumns?: string[] }`

2. **GroupingControlProps** (`components/minimals/grouping-control.tsx`)
   - Add `availableColumns?: string[]` prop

3. **All View Component Props** (list, table, subheadings, timeline)
   - Replace `minimalControlsEnabled?: boolean` with `minimalControlsConfig?: { availableColumns?: string[] }`

### Phase 2: Update FilteringWrapper Component

1. Calculate enabled state from config presence
2. Pass `availableColumns` to `GroupingControl`
3. Pass `minimalControlsConfig` to all view components
4. Update conditional rendering logic

### Phase 3: Update GroupingControl Component

1. Accept `availableColumns` prop
2. Filter columns based on `availableColumns` if provided
3. Fallback to all eligible columns if not provided

### Phase 4: Update All View Components

1. Accept `minimalControlsConfig` instead of `minimalControlsEnabled`
2. Calculate `isMinimalControlsEnabled = minimalControlsConfig !== undefined`
3. Use calculated value in effective grouping logic

### Phase 5: Update Projects Page

1. Replace `minimalControlsEnabled={true}` with `minimalControlsConfig={{ availableColumns: ['name', 'company', 'status'] }}`

## Files to Modify

1. `filtering-wrapper.tsx` - Update props, logic, and prop passing
2. `components/minimals/grouping-control.tsx` - Add availableColumns filtering
3. `features/virtualized-list/virtualized-list-container.tsx` - Update props and logic
4. `features/virtualized-table/virtualized-table-container.tsx` - Update props and logic
5. `features/subheadings/subheadings-container.tsx` - Update props and logic
6. `features/timeline-3/timeline-wrapper.tsx` - Update props and logic
7. `app/(root)/projects/page.tsx` - Update to use new config

## Migration Guide

### Before:
```typescript
<FilteringWrapper
  minimalControlsEnabled={true}
  // ...
/>
```

### After:
```typescript
// Option 1: Enable with all columns
<FilteringWrapper
  minimalControlsConfig={{}}
  // ...
/>

// Option 2: Enable with specific columns
<FilteringWrapper
  minimalControlsConfig={{
    availableColumns: ['name', 'company', 'status']
  }}
  // ...
/>

// Option 3: Disable (same as before)
<FilteringWrapper
  // minimalControlsConfig not provided
  // ...
/>
```

## Implementation Status

- [x] Phase 1: Update type definitions
- [x] Phase 2: Update FilteringWrapper component
- [x] Phase 3: Update GroupingControl component
- [x] Phase 4: Update all view components
- [x] Phase 5: Update projects page

## Notes

- Maintains backward compatibility (undefined config = disabled)
- More flexible than boolean flag
- Allows fine-grained control over grouping options
- Easy to extend in the future (can add more config options)
