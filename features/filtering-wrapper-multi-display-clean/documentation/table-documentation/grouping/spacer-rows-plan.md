# Plan: Add Spacer Rows Between First-Level Groups

## Status: ✅ COMPLETED

## Overview

Add empty spacer rows between first-level groups in the grouped table view to provide visual separation between groups. This improves readability and makes it easier to distinguish between different groups.

## Implementation Steps

### 1. Update `GroupConfig` Interface
- Add `groupSpacing?: number` to `GroupConfig` interface in `utils/grouping-utils.ts`
- This allows configuration of spacing between groups (in pixels)

### 2. Update `FlattenedRowType`
- Add `'spacer'` to the `FlattenedRowType` union type in `utils/flatten-grouped-rows.ts`
- This adds a new row type for spacer rows

### 3. Update `flattenGroupedRows` Function
- Modify the function to add spacer rows before each group (except the first)
- Check if `groupSpacing > 0` before adding spacer rows
- Insert spacer row with `type: 'spacer'` and `level: 0`

### 4. Update `TableConfig` Interface
- Add `groupSpacing?: number` to `TableConfig` interface in `types/table-config.ts`
- This allows users to configure spacing via tableConfig

### 5. Update `calculateRowHeight` Function
- Add case for `'spacer'` type in the switch statement
- Return the `groupSpacing` value (or 0 if not set) for spacer rows
- Ensure `tableConfig` is in dependencies to access `groupSpacing`

### 6. Update `rowRenderer` Function
- Add case for `'spacer'` type in the switch statement
- Render an empty `<div>` with the style prop from react-window
- This creates the visual spacing between groups

### 7. Pass `groupSpacing` to `groupConfig`
- When creating `groupConfig` in `virtualized-table-container.tsx`, include `groupSpacing` from `tableConfig`
- Ensure `tableConfig` is in the dependency array of the `flattenedRows` useMemo

## Expected Behavior

- When `groupSpacing` is set (e.g., `groupSpacing: 16`), empty spacer rows will appear between first-level groups
- Spacer rows will have the height specified by `groupSpacing` (in pixels)
- Spacer rows will not appear before the first group
- Spacer rows will appear even if groups are collapsed
- The spacing provides visual separation without affecting functionality

## Example Usage

```typescript
const tableConfig: TableConfig = {
  groupBy: 'category',
  groupSpacing: 16, // 16px spacing between groups
  // ... other config
};
```

## Files to Modify

1. `utils/grouping-utils.ts` - Add `groupSpacing` to `GroupConfig`
2. `utils/flatten-grouped-rows.ts` - Add `'spacer'` type and logic
3. `types/table-config.ts` - Add `groupSpacing` to `TableConfig`
4. `virtualized-table-container.tsx` - Update `calculateRowHeight`, `rowRenderer`, and pass `groupSpacing`
