# Grouping Implementation Plan - Unified

## Overview

This document outlines the complete implementation plan for adding grouping functionality to the `VirtualizedTableComponent`. The implementation will allow data to be organized into collapsible groups and sub-groups, with group headers rendered as table rows within the table structure.

## Implementation Steps

### Step 1: Update TableConfig Interface

**File:** `types/table-config.ts`

Add grouping configuration to `TableConfig`:

```typescript
export interface TableConfig<T = any> {
  // ... existing props
  
  // Grouping configuration
  groupBy?: string; // Primary group key (e.g., "category")
  subGroupBy?: string; // Secondary group key for nested grouping (e.g., "status")
  groupKeyFormatter?: (value: any) => string; // Custom formatter for group keys
  subGroupKeyFormatter?: (value: any) => string; // Custom formatter for sub-group keys
  groupSpacing?: number; // Spacing between groups in pixels (default: 0)
}
```

### Step 2: Copy Grouping Utilities from virtualized-list

**Files to copy:**
- `utils/grouping-utils.ts` - Copy from `virtualized-list/utils/grouping-utils.ts`
- `utils/flatten-grouped-rows.ts` - Copy from `virtualized-list/utils/flatten-grouped-rows.ts`
- `utils/sort-grouped-data.ts` - Copy from `virtualized-list/utils/sort-grouped-data.ts`

These utilities provide:
- `groupData<T>()` - Groups data by specified keys
- `flattenGroupedRows<T>()` - Flattens hierarchical structure for virtualization
- `sortGroupedData<T>()` - Per-group sorting functionality
- Types: `GroupConfig`, `GroupedData<T>`, `FlattenedRow<T>`

### Step 3: Copy Group State Hooks from virtualized-list

**Files to copy:**
- `hooks/useGroupState.ts` - Copy from `virtualized-list/hooks/useGroupState.ts`
- `hooks/useGroupSortState.ts` - Copy from `virtualized-list/hooks/useGroupSortState.ts`

These hooks provide:
- `useGroupState()` - Manages expanded/collapsed state for groups and sub-groups
- `useGroupSortState()` - Manages per-group sort configurations
- Functions: `isGroupExpanded`, `isSubGroupExpanded`, `toggleGroup`, `toggleSubGroup`, etc.

### Step 4: Create GroupHeaderRow Component

**File:** `components/group-header-row.tsx` (NEW)

Create a new component that renders group headers as **table rows**:

**Key Requirements:**
- Renders as a table row with the **same cell structure** as `VirtualizedTableRow`
- Props: `groupKey`, `groupValue`, `isExpanded`, `onToggle`, `level`, `itemCount`, `fieldName`, `columns`, `style`
- **First cell** contains: chevron + badge + title + count
- **All other cells** are empty/blank
- Uses same width calculations and column structure as data rows
- Styling: `text-lg font-semibold` for title, badge with `text-xs`
- Indentation: `paddingLeft: level * 30px` applied to first cell for nested groups
- Same row height and borders as data rows
- **Important**: Do NOT spread `style` prop - only use `height` and `width` from it

### Step 5: Update VirtualizedTableComponent Props

**File:** `virtualized-table-container.tsx`

#### 5.1: Add Grouping Props to Interface

```typescript
interface VirtualizedTableComponentProps<T = any> {
  // ... existing props
  
  // Grouping props (extracted from tableConfig)
  groupBy?: string;
  subGroupBy?: string;
  groupKeyFormatter?: (value: any) => string;
  subGroupKeyFormatter?: (value: any) => string;
  groupSpacing?: number;
}
```

#### 5.2: Extract Grouping Config from tableConfig

```typescript
const {
  // ... existing extractions
  groupBy,
  subGroupBy,
  groupKeyFormatter,
  subGroupKeyFormatter,
  groupSpacing = 0,
} = tableConfig || {};
```

### Step 6: Implement Grouping Logic in VirtualizedTableComponent

**File:** `virtualized-table-container.tsx`

#### 6.1: Import Required Utilities and Hooks

```typescript
import { groupData, GroupConfig } from './utils/grouping-utils';
import { flattenGroupedRows, FlattenedRow } from './utils/flatten-grouped-rows';
import { sortGroupedData } from './utils/sort-grouped-data';
import { useGroupState } from './hooks/useGroupState';
import { useGroupSortState } from './hooks/useGroupSortState';
import { GroupHeaderRow } from './components/group-header-row';
```

#### 6.2: Initialize Group State and Sort State

```typescript
const groupSortState = useGroupSortState();
const groupState = useGroupState();
```

#### 6.3: Group Data When Config Provided

```typescript
const groupedData = useMemo(() => {
  if (!groupBy) return null;
  const config: GroupConfig = {
    groupBy,
    subGroupBy,
    groupKeyFormatter,
    subGroupKeyFormatter,
    groupSpacing,
  };
  const grouped = groupData(filteredData as Record<string, any>[], config);
  // Apply per-group sorting
  const sortConfigs = groupSortState.getSortConfigs();
  return sortGroupedData(grouped, sortConfigs, columns);
}, [filteredData, groupBy, subGroupBy, groupKeyFormatter, subGroupKeyFormatter, groupSpacing, groupSortState, columns]);
```

#### 6.4: Flatten Rows for Virtualization

```typescript
const flattenedRows = useMemo(() => {
  if (!groupedData) return null;
  return flattenGroupedRows(groupedData, groupState, {
    groupBy,
    subGroupBy,
    groupKeyFormatter,
    subGroupKeyFormatter,
    groupSpacing,
  });
}, [groupedData, groupState, groupBy, subGroupBy, groupKeyFormatter, subGroupKeyFormatter, groupSpacing]);
```

#### 6.5: Reset List When Structure Changes

```typescript
useEffect(() => {
  if (flattenedRows && listRef.current && 'resetAfterIndex' in listRef.current) {
    (listRef.current as VariableSizeList).resetAfterIndex(0);
  }
}, [flattenedRows]);
```

#### 6.6: Update Display Data Logic

```typescript
const displayData = useMemo(() => {
  // If grouping is enabled, use flattened rows (they will be handled differently in rowRenderer)
  if (flattenedRows) {
    return flattenedRows as any[];
  }
  
  // Normal pagination logic
  if (!usePagination) return sortedData;
  if (totalItemCount != null) return sortedData; // API pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const actualPage = (currentPage > totalPages && totalPages > 0) ? 1 : currentPage;
  const startIndex = (actualPage - 1) * itemsPerPage;
  return sortedData.slice(startIndex, startIndex + itemsPerPage);
}, [sortedData, usePagination, currentPage, itemsPerPage, totalItemCount, flattenedRows]);
```

#### 6.7: Update Row Height Calculation

```typescript
const calculateRowHeight = useCallback((index: number): number => {
  // If grouping is enabled, check row type
  if (flattenedRows && flattenedRows[index]) {
    const flattenedRow = flattenedRows[index];
    
    switch (flattenedRow.type) {
      case 'spacer':
        return groupSpacing || 0;
      
      case 'group-header':
      case 'sub-group-header':
        return 40; // Fixed height for group headers
      
      case 'data-row':
        // Use existing row height calculation
        const baseHeight = calculatedRowHeight;
        
        // If row expansion is enabled, check if this row is expanded
        if (rowExpansionEnabled && flattenedRow.data) {
          const rowId = (flattenedRow.data as any)?.id;
          if (rowId && isRowExpanded(rowId)) {
            const children = getChildren(rowId);
            const childrenCount = children.length;
            if (childrenCount === 0) {
              return baseHeight + 20;
            }
            const heightPerChild = 40;
            const expandedHeight = childrenCount * heightPerChild;
            return baseHeight + expandedHeight;
          }
        }
        
        return baseHeight;
    }
  }
  
  // Default behavior (no grouping)
  // ... existing row height calculation
}, [flattenedRows, calculatedRowHeight, groupSpacing, rowExpansionEnabled, isRowExpanded, getChildren]);
```

#### 6.8: Update Row Renderer

**Critical Fix**: Do NOT pass full `style` prop to inner components - only pass `height` and `width`.

```typescript
const rowRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
  // If grouping is enabled, handle different row types
  if (flattenedRows && flattenedRows[index]) {
    const flattenedRow = flattenedRows[index];
    
    switch (flattenedRow.type) {
      case 'spacer':
        return <div style={style} />;
      
      case 'group-header':
        return (
          <div style={style}>
            <GroupHeaderRow
              groupKey={flattenedRow.groupKey!}
              groupValue={flattenedRow.groupData!.groupValue}
              isExpanded={groupState.isGroupExpanded(flattenedRow.groupKey!)}
              onToggle={() => groupState.toggleGroup(flattenedRow.groupKey!)}
              level={0}
              itemCount={flattenedRow.groupData!.items.length + (flattenedRow.groupData!.subGroups?.reduce((sum, sg) => sum + sg.items.length, 0) || 0)}
              fieldName={groupBy?.split('.').pop()}
              columns={visibleColumns}
              style={{ height: style.height, width: '100%' }} // Only height/width
            />
          </div>
        );
      
      case 'sub-group-header':
        return (
          <div style={style}>
            <GroupHeaderRow
              groupKey={flattenedRow.subGroupKey!}
              groupValue={flattenedRow.subGroupData!.groupValue}
              isExpanded={groupState.isSubGroupExpanded(flattenedRow.groupKey!, flattenedRow.subGroupKey!)}
              onToggle={() => groupState.toggleSubGroup(flattenedRow.groupKey!, flattenedRow.subGroupKey!)}
              level={1}
              itemCount={flattenedRow.subGroupData!.items.length}
              fieldName={subGroupBy?.split('.').pop()}
              columns={visibleColumns}
              style={{ height: style.height, width: '100%' }} // Only height/width
            />
          </div>
        );
      
      case 'data-row':
        const item = flattenedRow.data!;
        const isSelected = selectedItemId && (item as any).id && (item as any).id.toString() === selectedItemId.toString();
        const rowId = (item as any)?.id;
        
        // Create toggle handler that resets list after index
        const handleToggleRow = rowId ? async () => {
          await toggleRow(rowId, item as T);
          setTimeout(() => {
            resetAfterIndex(index);
          }, 0);
        } : undefined;
        
        // Calculate indentation based on level
        const indentLevel = flattenedRow.level || 0;
        
        return (
          <div style={style}>
            <VirtualizedTableRow
              item={item as T}
              columns={visibleColumns}
              onRowClick={onRowClick}
              style={{ height: style.height, width: '100%' }} // Only height/width
              isLastRow={index === flattenedRows.length - 1}
              onActionClick={onActionClick}
              actionMode={actionMode}
              actionClickConfigs={actionConfigs?.(item as T)}
              globalSearchText={effectiveSearchText}
              truncateText={!dynamicRowHeight}
              isSelected={!!isSelected}
              editableColumns={editableColumns}
              onCellValueChange={onCellValueChange}
              rowIndex={index}
              calculatedRowHeight={calculatedRowHeight}
              groupStylerConfig={groupStylerConfig}
              rowStyler={rowStyler}
              searchHighlightStyle={searchHighlightStyle}
              rowExpansionEnabled={rowExpansionEnabled}
              isRowExpanded={rowId ? isRowExpanded(rowId) : false}
              onToggleRow={handleToggleRow}
              expandedChildren={rowId && rowExpansionEnabled ? getChildren(rowId) : []}
              isLoadingChildren={rowId && rowExpansionEnabled ? isLoadingChildren(rowId) : false}
              renderExpandedContent={rowExpansion?.renderExpandedContent}
              expandedContentHeight={rowExpansion?.expandedContentHeight}
              columnActions={columnActions}
              indentLevel={indentLevel} // Pass indentation level
            />
          </div>
        );
    }
  }
  
  // Default behavior (no grouping)
  // ... existing row renderer logic
}, [/* all dependencies */]);
```

#### 6.9: Update Item Count for Virtualization

```typescript
const itemCount = flattenedRows 
  ? flattenedRows.length 
  : displayData.length;
```

### Step 7: Update VirtualizedTableRow to Support Indentation

**File:** `components/rows/table-row.tsx`

Add `indentLevel` prop and apply indentation to first visible cell:

```typescript
interface VirtualizedTableRowProps<T = any> {
  // ... existing props
  indentLevel?: number; // Indentation level for grouped rows (0 = no indent, 1 = 30px, 2 = 60px)
}

// In the component, apply indentation to first visible cell:
const firstVisibleColumn = visibleColumns[0];
const indentPx = (indentLevel || 0) * 30;

// When rendering first cell, add:
style={{ 
  ...existingStyles,
  paddingLeft: `${indentPx}px`
}}
```

### Step 8: Update FilteringWrapper

**File:** `filtering-wrapper.tsx`

Pass grouping config from `tableConfig` to `VirtualizedTableComponent`:

```typescript
<VirtualizedTableComponent
  // ... existing props
  groupBy={tableConfig?.groupBy}
  subGroupBy={tableConfig?.subGroupBy}
  groupKeyFormatter={tableConfig?.groupKeyFormatter}
  subGroupKeyFormatter={tableConfig?.subGroupKeyFormatter}
  groupSpacing={tableConfig?.groupSpacing}
/>
```

## Key Implementation Notes

### Fix for Overlapping Rows

**Critical**: When passing `style` from `react-window`:
- ✅ Wrapper `<div>` receives full `style` prop (with `position: absolute` and `top`)
- ✅ Inner components (`GroupHeaderRow`, `VirtualizedTableRow`) receive ONLY `{ height: style.height, width: '100%' }`
- ❌ Do NOT spread `style` prop to inner components

### Spacer Rows

- Spacer rows are automatically added between first-level groups when `groupSpacing > 0`
- Spacer rows have type `'spacer'` and height equal to `groupSpacing`
- Spacer rows render as empty `<div>` elements

### Group Header Row Structure

- Group headers are **table rows** with same cell structure as data rows
- First cell contains: chevron + badge + title + count
- All other cells are empty/blank
- Uses same column widths and structure as data rows

### Indentation

- Group headers: `paddingLeft: level * 30px` on first cell
- Data rows: `paddingLeft: indentLevel * 30px` on first visible cell
- Level 0 = no indent, Level 1 = 30px, Level 2 = 60px

## Testing Checklist

- [ ] Groups expand/collapse correctly
- [ ] Nested groups work properly
- [ ] Rows don't overlap when groups expand/collapse
- [ ] Spacer rows appear between groups when `groupSpacing > 0`
- [ ] Indentation is correct for nested groups
- [ ] Sorting works within groups
- [ ] Filtering works with grouping
- [ ] Row expansion works within grouped rows
- [ ] Virtualization works correctly with grouped data
- [ ] Pagination works with grouping (if enabled)
