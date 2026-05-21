# Grouping in Virtualized Table

## Overview

Add grouping functionality to the `VirtualizedTableComponent` to organize data into collapsible groups and sub-groups. Each group displays a header row with chevron, badge, title, and count, followed by the data rows belonging to that group.

## Visual Structure

### ASCII Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GROUPED TABLE VIEW                        │
└─────────────────────────────────────────────────────────────┘

DEFAULT VIEW (No Grouping):
┌─────────────────────────────────────────────────────────────┐
│ [Table Header Row]                                           │
│ ┌──────────┬──────────┬──────────┬──────────┐               │
│ │ Col 1    │ Col 2    │ Col 3    │ Col 4    │               │
│ └──────────┴──────────┴──────────┴──────────┘               │
├─────────────────────────────────────────────────────────────┤
│ [Data Row 1]                                                 │
│ [Data Row 2]                                                 │
│ [Data Row 3]                                                 │
└─────────────────────────────────────────────────────────────┘

SINGLE LEVEL GROUPING (Group by Project Name):
┌─────────────────────────────────────────────────────────────┐
│ [Main Table Header Row]                                      │
│ ┌──────────────┬────────────┬───────────┬───────────┐       │
│ │ Project Name │ Description│ Start Date│ End Date  │       │
│ └──────────────┴────────────┴───────────┴───────────┘       │
├─────────────────────────────────────────────────────────────┤
│ ▼ [PROJECT NAME] Annual Report Preparation (1)              │
│ │              │            │           │           │       │
│ │              │            │           │           │       │
│ ├──────────────┼────────────┼───────────┼───────────┤       │
│ │ Annual Report│ Compiling  │ 2024-03-01│ 2024-04-15│       │
│ │ Preparation  │ and design │           │           │       │
│ │              │ ...        │           │           │       │
├─────────────────────────────────────────────────────────────┤
│ ▼ [PROJECT NAME] Cloud Migration (1)                        │
│ │              │            │           │           │       │
│ │              │            │           │           │       │
│ ├──────────────┼────────────┼───────────┼───────────┤       │
│ │ Cloud        │ Migrating  │ 2024-02-05│ 2024-04-20│       │
│ │ Migration    │ company... │           │           │       │
└─────────────────────────────────────────────────────────────┘

COLLAPSED GROUP:
┌─────────────────────────────────────────────────────────────┐
│ [Main Table Header Row]                                      │
│ ┌──────────────┬────────────┬───────────┬───────────┐       │
│ │ Project Name │ Description│ Start Date│ End Date  │       │
│ └──────────────┴────────────┴───────────┴───────────┘       │
├─────────────────────────────────────────────────────────────┤
│ ▶ [PROJECT NAME] Annual Report Preparation (1)              │
│ │              │            │           │           │       │
│ │              │            │           │           │       │
│ │              │ (Data rows hidden)     │           │       │
├─────────────────────────────────────────────────────────────┤
│ ▼ [PROJECT NAME] Cloud Migration (1)                        │
│ │              │            │           │           │       │
│ │              │            │           │           │       │
│ ├──────────────┼────────────┼───────────┼───────────┤       │
│ │ Cloud        │ Migrating  │ 2024-02-05│ 2024-04-20│       │
│ │ Migration    │ company... │           │           │       │
└─────────────────────────────────────────────────────────────┘

NESTED GROUPING (Group by Category, then by Status):
┌─────────────────────────────────────────────────────────────┐
│ [Main Table Header Row]                                      │
│ ┌──────────────┬────────────┬───────────┬───────────┐       │
│ │ Category     │ Status     │ Start Date│ End Date  │       │
│ └──────────────┴────────────┴───────────┴───────────┘       │
├─────────────────────────────────────────────────────────────┤
│ ▼ [CATEGORY] Analytics (3)                                   │
│ │              │            │           │           │       │
│ │              │            │           │           │       │
│ │   ▼ [STATUS] Active (2)                                   │
│ │   │          │            │           │           │       │
│ │   │          │            │           │           │       │
│ │   ├──────────┼────────────┼───────────┼───────────┤       │
│ │   │ Analytics│ Active     │ 2024-01-01│ 2024-02-01│       │
│ │   │ Analytics│ Active     │ 2024-01-15│ 2024-02-15│       │
│ │   ├──────────┼────────────┼───────────┼───────────┤       │
│ │   ▼ [STATUS] Completed (1)                                 │
│ │   │          │            │           │           │       │
│ │   ├──────────┼────────────┼───────────┼───────────┤       │
│ │   │ Analytics│ Completed  │ 2024-03-01│ 2024-03-15│       │
├─────────────────────────────────────────────────────────────┤
│ ▼ [CATEGORY] Development (7)                                 │
│ │              │            │           │           │       │
│ │   ▼ [STATUS] Active (5)                                   │
│ │   │          │            │           │           │       │
│ │   ├──────────┼────────────┼───────────┼───────────┤       │
│ │   │ Development│ Active   │ 2024-02-01│ 2024-03-01│       │
│ │   │ ...       │ ...       │ ...       │ ...       │       │
└─────────────────────────────────────────────────────────────┘
```

## Group Header Structure

Group headers are **table rows** that appear within the table structure. Each group/subgroup header row:

- Has the **same cell structure** as normal data rows (same number of cells, same column widths)
- **First cell** contains: Chevron + Badge + Title + Count
  - **Chevron**: Expand/collapse indicator (▼ when expanded, ▶ when collapsed)
  - **Badge**: Field name in uppercase (e.g., "PROJECT NAME", "CATEGORY", "STATUS")
  - **Title**: Group value (e.g., "Annual Report Preparation", "Analytics")
  - **Count**: Number of items in the group (e.g., "(1)", "(3)")
- **All other cells** are empty/blank

**Format**: `▼ [FIELD NAME] Group Value (count)` (in first cell)

**Important Details**:
- Group headers are rendered as **table rows** with the same cell structure as `VirtualizedTableRow`
- The group header content always appears in the **first cell** (first column), regardless of which column is used for grouping
- All other cells are **empty/blank** for group header rows
- **No filters, sort buttons, or other controls** in group header rows
- Data rows appear below group headers with full data in all columns
- Uses same column widths and cell structure as data rows for proper alignment

## Implementation Plan

### Phase 1: Update TableConfig Interface

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
}
```

### Phase 2: Create Grouping Utilities

**File:** `utils/grouping-utils.ts` (NEW)

Reuse or adapt from `virtualized-list/utils/grouping-utils.ts`:

- `groupData<T>(data: T[], groupBy: string, subGroupBy?: string): GroupedData<T>[]`
- `getNestedValue<T>(item: T, path: string): any`
- Types: `GroupConfig`, `GroupedData<T>`

### Phase 3: Create Group Header Row Component

**File:** `components/group-header-row.tsx` (NEW)

Create a new component that renders group headers as **table rows**:

- Renders as a table row with the **same cell structure** as `VirtualizedTableRow`
- Props: `groupKey`, `groupValue`, `isExpanded`, `onToggle`, `level`, `itemCount`, `fieldName`, `columns`
- **First cell** contains: chevron + badge + title + count
- **All other cells** are empty/blank
- Uses same width calculations and column structure as data rows
- Styling: `text-lg font-semibold` for title, badge with `text-xs`
- Indentation: `paddingLeft: level * 30px` applied to first cell for nested groups
- Same row height and borders as data rows

### Phase 4: Create Group State Hook

**File:** `hooks/useGroupState.ts` (NEW)

Reuse or adapt from `virtualized-list/hooks/useGroupState.ts`:

- Manages expanded/collapsed state for groups and sub-groups
- Functions: `isGroupExpanded`, `isSubGroupExpanded`, `toggleGroup`, `toggleSubGroup`, `expandAll`, `collapseAll`

### Phase 5: Create Flattening Utility

**File:** `utils/flatten-grouped-rows.ts` (NEW)

Reuse or adapt from `virtualized-list/utils/flatten-grouped-rows.ts`:

- Flattens hierarchical `GroupedData` into flat array for virtualization
- Row types: `'group-header' | 'sub-group-header' | 'data-row'`
- Only includes expanded groups/sub-groups

### Phase 6: Update VirtualizedTableComponent

**File:** `virtualized-table-container.tsx`

#### 6.1: Add Grouping Props

```typescript
interface VirtualizedTableComponentProps<T = any> {
  // ... existing props
  
  // Grouping props
  groupBy?: string;
  subGroupBy?: string;
  groupKeyFormatter?: (value: any) => string;
  subGroupKeyFormatter?: (value: any) => string;
}
```

#### 6.2: Extract Grouping Config from tableConfig

```typescript
const groupBy = tableConfig?.groupBy;
const subGroupBy = tableConfig?.subGroupBy;
const groupKeyFormatter = tableConfig?.groupKeyFormatter;
const subGroupKeyFormatter = tableConfig?.subGroupKeyFormatter;
```

#### 6.3: Group Data When Config Provided

```typescript
const groupedData = useMemo(() => {
  if (!groupBy) return null;
  return groupData(filteredData, groupBy, subGroupBy);
}, [filteredData, groupBy, subGroupBy]);
```

#### 6.4: Initialize Group State

```typescript
const groupState = useGroupState();
```

#### 6.5: Flatten Rows for Virtualization

```typescript
const flattenedRows = useMemo(() => {
  if (!groupedData) return null;
  return flattenGroupedRows(groupedData, groupState, {
    groupBy,
    subGroupBy,
    groupKeyFormatter,
    subGroupKeyFormatter,
  });
}, [groupedData, groupState, groupBy, subGroupBy, groupKeyFormatter, subGroupKeyFormatter]);
```

#### 6.6: Update Row Height Calculation

```typescript
const calculateRowHeight = useCallback((index: number): number => {
  if (flattenedRows && flattenedRows[index]) {
    const row = flattenedRows[index];
    switch (row.type) {
      case 'group-header':
      case 'sub-group-header':
        return 40; // Fixed height for group headers
      case 'data-row':
        return calculatedRowHeight; // Use existing row height
    }
  }
  // Default behavior for non-grouped view
  return calculatedRowHeight;
}, [flattenedRows, calculatedRowHeight]);
```

#### 6.7: Update Row Renderer

Group headers must be rendered as **table rows** with the same column structure. Create a special group header row component:

```typescript
const rowRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
  if (flattenedRows && flattenedRows[index]) {
    const row = flattenedRows[index];
    
    switch (row.type) {
      case 'group-header':
        // Render as table row with group header content in first cell
        return (
          <div style={style}>
            <GroupHeaderRow
              groupKey={row.groupKey!}
              groupValue={row.groupData!.groupValue}
              isExpanded={groupState.isGroupExpanded(row.groupKey!)}
              onToggle={() => groupState.toggleGroup(row.groupKey!)}
              level={0}
              itemCount={row.groupData!.items.length + (row.groupData!.subGroups?.reduce((sum, sg) => sum + sg.items.length, 0) || 0)}
              fieldName={groupBy?.split('.').pop()}
              columns={visibleColumns}
            />
          </div>
        );
      
      case 'sub-group-header':
        // Render as table row with sub-group header content in first cell
        return (
          <div style={style}>
            <GroupHeaderRow
              groupKey={row.subGroupKey!}
              groupValue={row.subGroupData!.groupValue}
              isExpanded={groupState.isSubGroupExpanded(row.groupKey!, row.subGroupKey!)}
              onToggle={() => groupState.toggleSubGroup(row.groupKey!, row.subGroupKey!)}
              level={1}
              itemCount={row.subGroupData!.items.length}
              fieldName={subGroupBy?.split('.').pop()}
              columns={visibleColumns}
            />
          </div>
        );
      
      case 'data-row':
        // Render normal data row with indentation based on level
        return (
          <div style={style}>
            <VirtualizedTableRow
              item={row.data!}
              columns={visibleColumns}
              onRowClick={onRowClick}
              indentLevel={row.level || 0} // Pass level for indentation
              // ... other props
            />
          </div>
        );
    }
  }
  
  // Default behavior for non-grouped view
  const item = displayData[index];
  return (
    <div style={style}>
      <VirtualizedTableRow
        item={item}
        columns={visibleColumns}
        onRowClick={onRowClick}
        // ... other props
      />
    </div>
  );
}, [flattenedRows, groupState, displayData, visibleColumns, onRowClick, groupBy, subGroupBy]);
```

**GroupHeaderRow Component** (NEW):
- Renders as a table row with the **same cell structure** as `VirtualizedTableRow`
- **First cell** contains: chevron + badge + title + count
- **All other cells** are empty/blank
- Uses same width calculations, column structure, and styling as data rows
- Indentation applied to first cell for nested groups

#### 6.8: Update Display Data Logic

```typescript
const displayData = useMemo(() => {
  if (flattenedRows) {
    // Extract only data rows from flattened structure
    return flattenedRows
      .filter(row => row.type === 'data-row')
      .map(row => row.data!);
  }
  // Default behavior for non-grouped view
  return sortedData;
}, [flattenedRows, sortedData]);
```

#### 6.9: Update List Item Count

```typescript
const itemCount = flattenedRows 
  ? flattenedRows.length 
  : displayData.length;
```

### Phase 7: Update FilteringWrapper

**File:** `filtering-wrapper.tsx`

Pass grouping config from `tableConfig` to `VirtualizedTableComponent`:

```typescript
<VirtualizedTableComponent
  // ... existing props
  groupBy={tableConfig?.groupBy}
  subGroupBy={tableConfig?.subGroupBy}
  groupKeyFormatter={tableConfig?.groupKeyFormatter}
  subGroupKeyFormatter={tableConfig?.subGroupKeyFormatter}
/>
```

## Usage Example

```typescript
const tableConfig: TableConfig<ProjectItem> = {
  // ... other config
  groupBy: 'category',
  subGroupBy: 'status',
  groupKeyFormatter: (value) => value ? String(value) : 'Uncategorized',
  subGroupKeyFormatter: (value) => value ? String(value) : 'No Status',
};

<FilteringWrapper
  data={projects}
  columns={columns}
  tableConfig={tableConfig}
  // ... other props
/>
```

## Key Differences from VirtualizedListComponent

1. **Group Headers as Table Rows**: Group headers are rendered as **table rows** within the table structure, not as separate header rows above the table.

2. **Same Cell Structure**: Group header rows have the **same cell structure** as data rows (same number of cells, same column widths).

3. **Content in First Cell**: Group header content (chevron + badge + title + count) always appears in the **first cell** (first column), regardless of which column is used for grouping. All other cells are empty.

4. **Single Table Header**: Only the main table header is shown at the top. Table headers are NOT repeated within groups.

5. **Direct Data Rows**: Data rows appear directly below group headers with full data in all columns.

6. **Indented Data Rows**: Data rows are indented based on their nesting level:
   - Level 1 rows (direct group items): 30px indent
   - Level 2 rows (sub-group items): 60px indent
   - Indentation is applied only to the first visible cell
   - Uses same indentation spacing as group headers (30px per level)

7. **Reuses Existing Table**: The grouped view uses the same `VirtualizedTableRow` component for data rows, maintaining consistency with the non-grouped view.

## Styling

### Group Header Row
- **Container**: Same as `VirtualizedTableRow` - uses table row structure with same cell structure
- **First Cell**: Contains chevron + badge + title + count
  - **Chevron**: `w-4 h-4 text-foreground`
  - **Badge**: `text-xs` (using Badge component with `variant="outline"`)
  - **Title**: `text-lg font-semibold text-foreground`
  - **Count**: `text-sm text-foreground/60`
  - **Indentation**: `paddingLeft: level * 30px` for nested groups
- **Other Cells**: Empty/blank cells with same width as data rows
- **Row Height**: Same as data rows (uses `calculatedRowHeight`)
- **Cell Structure**: Same number of cells and column widths as data rows

### Data Rows
- **Indentation**: Data rows are indented based on their nesting level
  - Level 1 (direct group items): 30px indent on first cell
  - Level 2 (sub-group items): 60px indent on first cell
  - Indentation is applied via `paddingLeft` style on the first visible cell
  - Uses `indentLevel` prop passed to `VirtualizedTableRow`
  - Same indentation spacing as group headers (30px per level)

### Borders
- Group header rows: `border-b border-gray-200` (same as data rows)
- Data rows: `border-b border-gray-200`

## Notes

- Grouping is optional - if `groupBy` is not provided, table works as before
- Sorting and filtering work on the data before grouping
- Group state (expanded/collapsed) is managed independently per group
- Virtualization works correctly with grouped data through flattened structure
- Row expansion (if enabled) works within grouped rows
